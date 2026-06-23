"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { 
  Camera, Upload, X, Mic, Brain, MapPin, Navigation, 
  AlertTriangle, Building, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Send, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import "regenerator-runtime/runtime";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const issueSchema = z.object({
  mediaUrls: z.array(z.string()).default([]),
  transcript: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  severity: z.string().min(1, "Severity is required"),
  priorityScore: z.number(),
  department: z.string(),
  riskAssessment: z.string(),
  estimatedImpact: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  address: z.string().min(5, "Address is required"),
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
  const [step, setStep] = useState(1);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiMessageIndex, setAiMessageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [isRecording, setIsRecording] = useState(false);
  
  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      mediaUrls: [],
      title: "",
      description: "",
      category: "",
      severity: "",
      priorityScore: 0,
      department: "",
      riskAssessment: "",
      estimatedImpact: "",
      address: "",
      ward: "",
      city: ""
    },
    mode: "onChange"
  });

  const { watch, setValue, trigger, formState: { errors, isValid } } = form;
  const mediaUrls = watch("mediaUrls");

  // Step 1: Media Dropzone
  const onDrop = (acceptedFiles: File[]) => {
    // Mock upload: create local object URLs
    const newUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    setValue("mediaUrls", [...mediaUrls, ...newUrls].slice(0, 5), { shouldValidate: true });
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxFiles: 5
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["mediaUrls"];
    if (step === 2) fieldsToValidate = ["title", "description", "category", "severity"];
    if (step === 3) fieldsToValidate = ["address"];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    
    if (isStepValid) {
      if (step === 1) {
        setStep(2);
        simulateAiAnalysis();
      } else {
        setStep(s => Math.min(s + 1, 4));
      }
    } else {
      toast.error("Please fill in all required fields to continue.");
    }
  };

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  // Step 2: AI Simulation
  const simulateAiAnalysis = () => {
    setIsAiAnalyzing(true);
    setAiMessageIndex(0);
    
    const messages = ["Analyzing media...", "Identifying issue...", "Assessing severity...", "Generating report..."];
    
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < messages.length) {
        setAiMessageIndex(currentIdx);
      } else {
        clearInterval(interval);
        setIsAiAnalyzing(false);
        // Auto fill mock data
        setValue("title", "Pothole on Main St", { shouldValidate: true });
        setValue("description", "A large pothole approximately 2 feet wide has formed in the right lane, posing a hazard to vehicles and cyclists.", { shouldValidate: true });
        setValue("category", "Infrastructure", { shouldValidate: true });
        setValue("severity", "High", { shouldValidate: true });
        setValue("priorityScore", 85);
        setValue("department", "Department of Transportation");
        setValue("riskAssessment", "High risk of vehicle damage or accidents.");
        setValue("estimatedImpact", "500+ commuters daily");
      }
    }, 1500);
  };

  // Step 3: Location Mock
  const detectLocation = () => {
    const toastId = toast.loading("Detecting location...");
    setTimeout(() => {
      setValue("lat", 40.7128);
      setValue("lng", -74.0060);
      setValue("address", "123 Main St, New York, NY 10001", { shouldValidate: true });
      setValue("ward", "Ward 1");
      setValue("city", "New York");
      toast.success("Location detected!", { id: toastId });
    }, 1500);
  };

  const onSubmit = async (data: IssueFormValues) => {
    setIsSubmitting(true);
    // Mock network request
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    toast.success("Issue reported successfully!");
    router.push("/dashboard");
  };

  const aiMessages = ["Analyzing media...", "Identifying issue...", "Assessing severity...", "Generating report..."];

  return (
    <div className="mx-auto max-w-3xl pb-20">
      {/* Progress Indicator */}
      <div className="mb-8 relative">
        <div className="flex justify-between items-center relative z-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div 
                className={`flex size-10 items-center justify-center rounded-full border-2 transition-all duration-500
                  ${step > s.id ? 'bg-primary border-primary text-primary-foreground' : 
                    step === s.id ? 'border-primary bg-background text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 
                    'border-muted bg-background text-muted-foreground'}
                `}
              >
                {step > s.id ? <CheckCircle2 className="size-5" /> : s.id}
              </div>
              <span className={`text-xs font-medium ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
        {/* Connecting Lines */}
        <div className="absolute top-5 left-[5%] right-[5%] h-[2px] -z-10 bg-muted">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: MEDIA UPLOAD */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-2">Upload Evidence</h2>
                  <p className="text-muted-foreground">Upload photos or a short video of the issue. Our AI will analyze them automatically.</p>
                </div>

                <div 
                  {...getRootProps()} 
                  className={`
                    relative overflow-hidden rounded-xl border-2 border-dashed p-10 transition-all duration-300
                    flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[300px]
                    ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-accent/50'}
                    ${errors.mediaUrls ? 'border-destructive/50 bg-destructive/5' : ''}
                  `}
                >
                  <input {...getInputProps()} />
                  
                  {mediaUrls.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full h-full absolute inset-0 p-4 overflow-y-auto bg-background/80 backdrop-blur-sm z-10">
                      {mediaUrls.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                          <img src={url} alt={`Upload ${i}`} className="object-cover w-full h-full" />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setValue("mediaUrls", mediaUrls.filter((_, idx) => idx !== i));
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                      {mediaUrls.length < 5 && (
                        <div className="flex items-center justify-center aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors">
                          <Upload className="size-6" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <Camera className="size-8" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-lg font-medium">Drag & drop media here</p>
                        <p className="text-sm text-muted-foreground">or click to browse from your device</p>
                      </div>
                      <Badge variant="secondary" className="mt-4">Up to 5 files (Images/Videos)</Badge>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-xs text-muted-foreground uppercase font-semibold">OR</span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="w-full space-y-4">
                  <Button 
                    variant={isRecording ? "destructive" : "outline"} 
                    className={cn("w-full h-14 text-base transition-all", isRecording && "animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]")} 
                    type="button"
                    onClick={() => {
                      if (isRecording) {
                        SpeechRecognition.stopListening();
                        setIsRecording(false);
                        if (transcript) {
                          setValue("transcript", transcript, { shouldValidate: true });
                          toast.success("Voice report saved!");
                        }
                      } else {
                        if (!browserSupportsSpeechRecognition) {
                          toast.error("Browser doesn't support speech recognition.");
                          return;
                        }
                        resetTranscript();
                        SpeechRecognition.startListening({ continuous: true });
                        setIsRecording(true);
                      }
                    }}
                  >
                    <Mic className={cn("size-5 mr-2", isRecording ? "text-white" : "text-primary")} />
                    {isRecording ? "Stop Recording" : "Voice Report"}
                  </Button>
                  
                  {(transcript || watch("transcript")) && (
                    <div className="p-4 rounded-xl bg-accent/30 border border-border">
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Voice Transcript</p>
                      <p className="text-sm italic text-foreground">"{transcript || watch("transcript")}"</p>
                      {!isRecording && (
                        <Button variant="ghost" size="sm" onClick={() => { setValue("transcript", ""); resetTranscript(); }} className="mt-2 text-destructive h-auto py-1 px-2">Clear</Button>
                      )}
                    </div>
                  )}
                </div>

                {errors.mediaUrls && (
                  <p className="text-sm font-medium text-destructive mt-2">{errors.mediaUrls.message}</p>
                )}
              </motion.div>
            )}

            {/* STEP 2: AI ANALYSIS */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {isAiAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-8">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="relative size-32 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center"
                    >
                      <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ animationDuration: '3s' }} />
                      <div className="absolute inset-2 rounded-full border-r-2 border-violet-500 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                      <Brain className="size-12 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                    </motion.div>
                    
                    <div className="h-8 overflow-hidden relative w-full max-w-sm text-center">
                      <AnimatePresence mode="popLayout">
                        <motion.p
                          key={aiMessageIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-lg font-medium text-foreground absolute inset-x-0"
                        >
                          {aiMessages[aiMessageIndex]}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    
                    <Progress value={(aiMessageIndex / (aiMessages.length - 1)) * 100} className="w-full max-w-xs h-1" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight">AI Report Generated</h2>
                        <p className="text-muted-foreground">Review and edit the details generated by our AI agent.</p>
                      </div>
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30 py-1.5 px-3">
                        <Sparkles className="size-3.5 mr-1.5" /> Auto-filled
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Issue Title</Label>
                        <div className="relative">
                          <Input {...form.register("title")} className="pr-10 bg-background/50" />
                          <Sparkles className="absolute right-3 top-2.5 size-4 text-primary/50" />
                        </div>
                        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <div className="relative">
                          <Textarea {...form.register("description")} className="min-h-[100px] resize-none pr-10 bg-background/50" />
                          <Sparkles className="absolute right-3 top-3 size-4 text-primary/50" />
                        </div>
                        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <div className="relative">
                            <Input {...form.register("category")} className="pr-10 bg-background/50" />
                            <Sparkles className="absolute right-3 top-2.5 size-4 text-primary/50" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Severity</Label>
                          <div className="relative">
                            <Input {...form.register("severity")} className="pr-10 bg-background/50" />
                            <Sparkles className="absolute right-3 top-2.5 size-4 text-primary/50" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <Card className="p-4 border-primary/20 bg-primary/5 flex gap-4 items-start">
                          <AlertTriangle className="size-5 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold mb-1">Risk Assessment</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{watch("riskAssessment")}</p>
                          </div>
                        </Card>
                        <Card className="p-4 border-border/50 bg-accent/20 flex gap-4 items-start">
                          <Building className="size-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold mb-1">Assigned Department</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{watch("department")}</p>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Priority Score: <span className="text-primary">{watch("priorityScore")}/100</span></p>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: LOCATION */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-2">Pin Location</h2>
                  <p className="text-muted-foreground">Where did you spot this issue? The more precise, the better.</p>
                </div>

                <div className="relative w-full h-[300px] rounded-xl overflow-hidden border border-border bg-accent/30 flex items-center justify-center">
                  {/* Mock Map until API key is provided */}
                  <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=14&size=800x400&style=feature:all|element:labels|visibility:off&style=feature:road|element:geometry|color:0x222222&style=feature:landscape|element:geometry|color:0x111111&style=feature:water|element:geometry|color:0x000000')] bg-cover bg-center opacity-50 grayscale" />
                  
                  {watch("address") ? (
                    <motion.div 
                      initial={{ scale: 0, y: -20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <MapPin className="size-10 text-primary drop-shadow-lg" fill="currentColor" />
                      <div className="absolute top-full mt-2 bg-background/90 backdrop-blur border border-border px-3 py-1.5 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap">
                        {watch("address").split(',')[0]}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="relative z-10 text-center space-y-4">
                      <p className="text-muted-foreground font-medium">Map View Ready</p>
                      <Button onClick={detectLocation} className="shadow-lg">
                        <Navigation className="size-4 mr-2" /> Auto-detect Location
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Precise Address</Label>
                    <div className="flex gap-2">
                      <Input {...form.register("address")} placeholder="Enter address manually" className="flex-1" />
                      <Button variant="secondary" onClick={detectLocation} type="button">
                        <Navigation className="size-4" />
                      </Button>
                    </div>
                    {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ward / District</Label>
                      <Input {...form.register("ward")} placeholder="e.g. Ward 1" className="bg-muted/50" readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input {...form.register("city")} placeholder="e.g. New York" className="bg-muted/50" readOnly />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-8">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-2">
                    <Send className="size-8 ml-1" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">Ready to Submit</h2>
                  <p className="text-muted-foreground">Review the details before notifying the authorities.</p>
                </div>

                <div className="space-y-4">
                  <Card className="p-5 border-border/50 bg-background/50">
                    <div className="flex items-start gap-4 mb-4 pb-4 border-b border-border/50">
                      {mediaUrls[0] ? (
                        <div className="size-16 rounded-lg overflow-hidden shrink-0 border border-border">
                          <img src={mediaUrls[0]} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="size-16 rounded-lg bg-accent/50 shrink-0 border border-border flex items-center justify-center">
                          <Camera className="size-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{watch("title")}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{watch("category")}</Badge>
                          <Badge variant={watch("severity") === "High" ? "destructive" : "default"} className="text-xs">
                            {watch("severity")} Severity
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex gap-2">
                        <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{watch("address")}</span>
                      </div>
                      <div className="flex gap-2">
                        <Building className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">Routing to: <span className="font-medium text-foreground">{watch("department")}</span></span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5 border-primary/20 bg-primary/5">
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <Sparkles className="size-4 text-primary" /> AI Resolution Timeline
                    </h4>
                    <div className="space-y-3 relative before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-primary/20">
                      {[
                        { title: "Verification", desc: "Community validation within 24hrs" },
                        { title: "Dispatch", desc: "City crews assigned within 3 days" },
                        { title: "Resolution", desc: "Estimated fix in 7-10 days" }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 relative">
                          <div className="size-[22px] rounded-full bg-background border-2 border-primary shrink-0 z-10 flex items-center justify-center">
                            <div className="size-2 rounded-full bg-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Form Controls Footer */}
        <div className="p-6 border-t border-border/50 bg-background/50 flex justify-between items-center backdrop-blur-xl">
          <Button 
            variant="ghost" 
            onClick={prevStep} 
            disabled={step === 1 || isAiAnalyzing || isSubmitting}
            className="text-muted-foreground hover:text-foreground"
          >
            {step > 1 && <ChevronLeft className="size-4 mr-1" />}
            Back
          </Button>

          {step < 4 ? (
            <Button 
              onClick={nextStep} 
              disabled={isAiAnalyzing}
              className="min-w-[120px] transition-all"
            >
              {isAiAnalyzing ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  {step === 1 ? 'Analyze Issue' : 'Continue'}
                  <ChevronRight className="size-4 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSubmitting}
              className="min-w-[140px] bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  Submit Report
                  <Send className="size-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
