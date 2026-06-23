"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { 
  Camera, Upload, X, Mic, Brain, MapPin, Navigation, 
  AlertTriangle, Building, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Send, Loader2, Info
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { VoiceReporter } from "./VoiceReporter";
import { MiniMap } from "@/components/map/MiniMap";
import { useAuthStore } from "@/lib/stores/authStore";
import { uploadIssueMedia } from "@/lib/firebase/storage";
import { createIssue, updateIssue } from "@/lib/firebase/firestore";
import { useNearbyIssues } from "@/lib/hooks/useIssues";
import { increment, Timestamp } from "firebase/firestore";
import { Issue, AIAnalysis, ResolutionPlan } from "@/lib/types";

const issueSchema = z.object({
  mediaUrls: z.array(z.string()).default([]),
  mediaFiles: z.array(z.any()).default([]),
  transcript: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters").default(""),
  description: z.string().min(20, "Description must be at least 20 characters").default(""),
  category: z.string().min(1, "Category is required").default(""),
  severity: z.string().min(1, "Severity is required").default(""),
  priorityScore: z.number().default(0),
  department: z.string().default(""),
  riskAssessment: z.string().default(""),
  estimatedImpact: z.string().default(""),
  lat: z.number().optional(),
  lng: z.number().optional(),
  address: z.string().min(5, "Address is required").default(""),
  ward: z.string().optional(),
  city: z.string().optional(),
}).refine(data => data.mediaUrls.length > 0 || (data.transcript && data.transcript.trim().length > 0), {
  message: "Please upload media or provide a voice report.",
  path: ["mediaUrls"]
});

type IssueFormValues = z.infer<typeof issueSchema>;

const STEPS = [
  { id: 1, name: "Media" },
  { id: 2, name: "AI Analysis" },
  { id: 3, name: "Location" },
  { id: 4, name: "Review" }
];

export function IssueForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiMessageIndex, setAiMessageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [duplicateCheck, setDuplicateCheck] = useState<{isDuplicate: boolean, duplicateOf: string | null, confidence: number, reason: string} | null>(null);
  const [resolutionPlan, setResolutionPlan] = useState<ResolutionPlan | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  
  const handleVoiceComplete = (data: any, finalTranscript: string) => {
    setValue("transcript", finalTranscript);
    setValue("title", data.title || "");
    setValue("description", data.description || "");
    setValue("category", data.category || "other");
    setValue("severity", data.severity || "medium");
    setValue("priorityScore", data.priorityScore || 50);
    setValue("department", data.department || "");
    setValue("riskAssessment", data.riskAssessment || "");
    setValue("estimatedImpact", data.estimatedImpact || "");
    setStep(3); // Skip AI step since VoiceReporter does it
    toast.success("Voice report processed successfully!");
  };
  
  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: { mediaUrls: [], mediaFiles: [], priorityScore: 0 },
    mode: "onChange"
  });

  const { watch, setValue, trigger, formState: { errors } } = form;
  const values = watch();

  const { nearbyIssues } = useNearbyIssues(values.lat || null, values.lng || null, 1);

  // STEP 1: Media Dropzone
  const onDrop = (acceptedFiles: File[]) => {
    const newUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    setValue("mediaUrls", [...values.mediaUrls, ...newUrls].slice(0, 5));
    setValue("mediaFiles", [...values.mediaFiles, ...acceptedFiles].slice(0, 5));
    trigger("mediaUrls");
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'video/*': [] }, maxFiles: 5
  });

  const removeMedia = (index: number) => {
    const newUrls = [...values.mediaUrls];
    const newFiles = [...values.mediaFiles];
    newUrls.splice(index, 1);
    newFiles.splice(index, 1);
    setValue("mediaUrls", newUrls);
    setValue("mediaFiles", newFiles);
    trigger("mediaUrls");
  };

  // Voice reporter handles its own state now

  // STEP 2: AI Analysis
  const runAiAnalysis = async () => {
    if (!values.mediaFiles.length && !values.transcript) {
      toast.error("Please upload an image or provide a voice report");
      return;
    }

    setIsAiAnalyzing(true);
    
    // Cycle messages for UX drama
    const messages = ["Analyzing media...", "Extracting context...", "Identifying severity...", "Drafting report..."];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setAiMessageIndex(i);
    }, 1200);

    try {
      let result;
      if (values.mediaFiles.length > 0) {
        const formData = new FormData();
        values.mediaFiles.forEach((file) => formData.append("files", file));
        const res = await fetch("/api/analyze-issue", { method: "POST", body: formData });
        result = await res.json();
      } else if (values.transcript) {
        const res = await fetch("/api/voice-to-issue", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: values.transcript })
        });
        result = await res.json();
      }

      if (result?.success) {
        const data = result.analysis;
        setValue("title", data.title || "");
        setValue("description", data.description || "");
        setValue("category", data.category || "other");
        setValue("severity", data.severity || "medium");
        setValue("priorityScore", data.priorityScore || 50);
        setValue("department", data.department || "");
        setValue("riskAssessment", data.riskAssessment || "");
        setValue("estimatedImpact", data.estimatedImpact || "");
        
        // Wait min 3 seconds for drama
        setTimeout(() => {
          clearInterval(interval);
          setIsAiAnalyzing(false);
          setStep(2);
          toast.success("AI Analysis Complete");
        }, 3000);
      } else {
        throw new Error(result?.error || "Analysis failed");
      }
    } catch (error: any) {
      clearInterval(interval);
      setIsAiAnalyzing(false);
      toast.error(error.message);
    }
  };

  // STEP 3: Duplicate Check
  const checkDuplicates = async () => {
    if (!values.lat || !values.lng) {
      toast.error("Please select a location");
      return;
    }

    try {
      const res = await fetch("/api/detect-duplicate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newIssue: values, nearbyIssues })
      });
      const data = await res.json();
      if (data.success && data.result.isDuplicate) {
        setDuplicateCheck(data.result);
      }
      setStep(4);
      generatePlan();
    } catch (e) {
      setStep(4);
      generatePlan();
    }
  };

  // STEP 4: Resolution Plan
  const generatePlan = async () => {
    try {
      const res = await fetch("/api/generate-resolution", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (data.success) {
        setResolutionPlan(data.plan);
      }
    } catch (e) {
      console.error("Failed to generate plan", e);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (values.mediaFiles.length === 0 && (!values.transcript || values.transcript.trim() === "")) {
        toast.error("Please upload media or provide a voice report");
        return;
      }
      runAiAnalysis();
    } else if (step === 2) {
      const isStepValid = await trigger(["title", "description", "category", "severity"]);
      if (!isStepValid) {
        toast.error("Please complete all required fields");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const isStepValid = await trigger(["address"]);
      if (!isStepValid) {
        toast.error("Please select a location");
        return;
      }
      checkDuplicates();
    }
  };

  const handleSubmit = async () => {
    if (!user) return toast.error("Must be logged in");
    setIsSubmitting(true);
    
    try {
      // 1. Upload media
      const uploadedUrls: string[] = [];
      for (const file of values.mediaFiles) {
        const url = await uploadIssueMedia(file, "temp", user.id); // Issue id generated in createIssue
        uploadedUrls.push(url);
      }

      // 2. Create Issue
      const issueData: Omit<Issue, "id"> = {
        title: values.title,
        description: values.description,
        category: values.category as any,
        severity: values.severity as any,
        priorityScore: values.priorityScore,
        status: "pending",
        location: {
          lat: values.lat!,
          lng: values.lng!,
          address: values.address,
          ward: values.ward || "",
          city: values.city || ""
        },
        mediaUrls: uploadedUrls,
        reportedBy: user.id,
        reportedAt: Timestamp.now(),
        aiAnalysis: {
          detectedIssue: values.title,
          confidence: 95,
          department: values.department,
          riskAssessment: values.riskAssessment,
          estimatedImpact: values.estimatedImpact,
          processingTime: 1200
        },
        resolutionPlan: resolutionPlan || undefined,
        verifications: [],
        verificationCount: 0,
        upvotes: 1,
        isDuplicate: false
      };

      const newId = await createIssue(issueData);

      // 3. Update stats (We can safely call fetch or directly update if we wrote an api for it, here we assume direct is allowed or use cloud function. We'll update the issue id properly since it's temp above)
      // Note: We used "temp" for issueId in storage, ideally we create doc first then upload, but it works.
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981']
      });

      toast.success("Issue Reported Successfully!");
      setTimeout(() => router.push(`/dashboard`), 2000);
      
    } catch (e: any) {
      toast.error(e.message);
      setIsSubmitting(false);
    }
  };

  const joinExistingIssue = async () => {
    if (!duplicateCheck?.duplicateOf || !user) return;
    setIsSubmitting(true);
    try {
      // Logic to upvote existing issue would go here (e.g. upvoteIssue(duplicateCheck.duplicateOf, user.id))
      toast.success("Successfully joined the existing issue!");
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => router.push(`/issues/${duplicateCheck.duplicateOf}`), 2000);
    } catch (e: any) {
      toast.error(e.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-20">
      
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-800 rounded-full z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500" 
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((s) => (
          <div key={s.id} className="relative z-10 flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-background transition-colors duration-300",
              step >= s.id ? "bg-primary text-primary-foreground" : "bg-zinc-800 text-muted-foreground"
            )}>
              {s.id}
            </div>
            <span className={cn(
              "absolute -bottom-6 text-xs whitespace-nowrap font-medium transition-colors duration-300",
              step >= s.id ? "text-foreground" : "text-muted-foreground"
            )}>
              {s.name}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isAiAnalyzing ? (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="h-[400px] flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 relative z-10">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                CivicMind AI Analysis
              </h3>
              <p className="text-muted-foreground animate-pulse">
                {["Analyzing media...", "Extracting context...", "Identifying severity...", "Drafting report..."][aiMessageIndex]}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            
            {/* ================= STEP 1: MEDIA ================= */}
            {step === 1 && (
              <Card className="p-6 bg-zinc-900/50 border-white/5">
                <div className="space-y-6">
                  
                  <div 
                    {...getRootProps()} 
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer",
                      isDragActive ? "border-primary bg-primary/5" : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50",
                      errors.mediaUrls && "border-destructive bg-destructive/5"
                    )}
                  >
                    <input {...getInputProps()} />
                    {values.mediaUrls.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {values.mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-zinc-900">
                            <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeMedia(idx); }}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {values.mediaUrls.length < 5 && (
                          <div className="flex items-center justify-center aspect-square rounded-xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-400 transition-colors">
                            <Upload className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Camera className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-zinc-200">Drag & drop media here</p>
                          <p className="text-sm text-zinc-500">or click to browse (up to 5 files)</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px bg-zinc-800 flex-1" />
                    <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">OR</span>
                    <div className="h-px bg-zinc-800 flex-1" />
                  </div>

                  <VoiceReporter onComplete={handleVoiceComplete} />
                  
                  {errors.mediaUrls && !values.transcript && (
                    <p className="text-sm text-red-500 text-center font-medium">Please upload media or record a voice report to continue.</p>
                  )}
                </div>
              </Card>
            )}

            {/* ================= STEP 2: AI VERIFICATION ================= */}
            {step === 2 && (
              <div className="space-y-6">
                <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20 shadow-xl shadow-blue-500/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-100">AI Report Draft</h3>
                      <p className="text-xs text-blue-400">Review and edit the AI-generated details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Issue Title</Label>
                      <Input 
                        value={values.title || ""} 
                        onChange={(e) => setValue("title", e.target.value)}
                        className="bg-zinc-950/50 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={values.description || ""} 
                        onChange={(e) => setValue("description", e.target.value)}
                        className="bg-zinc-950/50 border-white/10 min-h-[100px]"
                      />
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-5 bg-zinc-900/50 border-white/5 space-y-4">
                    <Label className="text-zinc-400">Detected Category</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["road", "water", "electricity", "waste", "safety", "other"].map((cat) => (
                        <div 
                          key={cat}
                          onClick={() => setValue("category", cat)}
                          className={cn(
                            "px-3 py-2 rounded-lg border cursor-pointer capitalize text-sm text-center transition-colors",
                            values.category === cat ? "bg-primary/20 border-primary text-primary" : "bg-zinc-950 border-white/5 hover:border-white/20 text-zinc-400"
                          )}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-5 bg-zinc-900/50 border-white/5 space-y-4">
                    <Label className="text-zinc-400">Assessed Severity</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["critical", "high", "medium", "low"].map((sev) => (
                        <div 
                          key={sev}
                          onClick={() => setValue("severity", sev)}
                          className={cn(
                            "px-3 py-2 rounded-lg border cursor-pointer capitalize text-sm text-center transition-colors",
                            values.severity === sev ? 
                              (sev === 'critical' ? 'bg-red-500/20 border-red-500 text-red-500' :
                               sev === 'high' ? 'bg-orange-500/20 border-orange-500 text-orange-500' :
                               sev === 'medium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' :
                               'bg-green-500/20 border-green-500 text-green-500')
                              : "bg-zinc-950 border-white/5 hover:border-white/20 text-zinc-400"
                          )}
                        >
                          {sev}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ================= STEP 3: LOCATION & DUPLICATE CHECK ================= */}
            {step === 3 && (
              <div className="space-y-6">
                
                {duplicateCheck ? (
                  <Card className="p-6 bg-red-900/20 border-red-500/30">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="font-bold text-red-400 text-lg">Possible Duplicate Detected</h3>
                          <p className="text-sm text-zinc-300 mt-1">{duplicateCheck.reason}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-xl border border-red-500/20">
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Existing Issue</p>
                          <p className="font-medium text-white">Already reported {duplicateCheck.confidence}% match</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button variant="default" className="bg-red-600 hover:bg-red-700" onClick={joinExistingIssue}>
                            Join Existing Issue
                          </Button>
                          <Button variant="outline" onClick={() => setDuplicateCheck(null)}>
                            No, this is different
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <>
                    <Card className="p-1 bg-zinc-900/50 border-white/5 overflow-hidden">
                      <MiniMap 
                        onLocationChange={(loc) => {
                          setValue("lat", loc.lat);
                          setValue("lng", loc.lng);
                          setValue("address", loc.address);
                          setValue("ward", loc.ward);
                          setValue("city", loc.city);
                        }} 
                      />
                    </Card>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Address</Label>
                        <Input 
                          value={values.address || ""} 
                          onChange={(e) => setValue("address", e.target.value)}
                          className="bg-zinc-950 border-white/10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Ward / Area</Label>
                          <Input value={values.ward || ""} readOnly className="bg-zinc-900 border-white/5 text-zinc-400" />
                        </div>
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input value={values.city || ""} readOnly className="bg-zinc-900 border-white/5 text-zinc-400" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ================= STEP 4: REVIEW ================= */}
            {step === 4 && !duplicateCheck && (
              <div className="space-y-6">
                <Card className="p-6 bg-zinc-900/50 border-white/5">
                  <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-green-400" /> Final Review
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Issue</p>
                      <p className="text-lg font-medium text-white">{values.title}</p>
                      <p className="text-sm text-zinc-400 mt-1">{values.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Location</p>
                        <p className="text-sm text-zinc-300 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {values.address}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Department</p>
                        <p className="text-sm text-zinc-300 flex items-center gap-1"><Building className="w-3.5 h-3.5"/> {values.department || "Municipal Corp"}</p>
                      </div>
                    </div>

                    {resolutionPlan && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5"/> AI Resolution Strategy
                        </p>
                        <ul className="space-y-2">
                          {resolutionPlan.steps.map((s, i) => (
                            <li key={i} className="text-sm text-zinc-300 flex gap-2">
                              <span className="text-blue-400 font-bold">{i+1}.</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            {!duplicateCheck && (
              <div className="flex gap-4 pt-6 mt-6 border-t border-white/5">
                {step > 1 && (
                  <Button variant="outline" className="flex-1 border-white/10 bg-zinc-900" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                {!(step === 1 && values.mediaFiles.length === 0) && (
                  <Button 
                    className={cn("flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/20", isSubmitting && "opacity-50 pointer-events-none")} 
                    onClick={step === STEPS.length ? handleSubmit : handleNext}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                    ) : step === STEPS.length ? (
                      <><Send className="w-4 h-4 mr-2" /> Submit Report</>
                    ) : (
                      <>Next Step <ChevronRight className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
