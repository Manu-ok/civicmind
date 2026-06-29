"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { getIssues, addVerification, incrementUserPoints } from "@/lib/firebase/firestore";
import { uploadVerificationMedia } from "@/lib/firebase/storage";
import { Issue, Verification } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, ShieldCheck, MapPin, CheckCircle2, AlertCircle, Loader2, X, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useDropzone } from "react-dropzone";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";

export default function VerifyPage() {
  const { user } = useAuthStore();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  // Modal State
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyPreview, setVerifyPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function loadIssues() {
      try {
        const allIssues = await getIssues();
        if (user) {
          // Filter out own issues and sort by unverified first, then severity
          const verifyList = allIssues.filter(i => i.reportedBy !== user.id && i.status !== "resolved");
          
          verifyList.sort((a, b) => {
            // Unverified first
            if (a.verificationCount === 0 && b.verificationCount > 0) return -1;
            if (b.verificationCount === 0 && a.verificationCount > 0) return 1;
            
            // Then by priority score
            return (b.priorityScore || 0) - (a.priorityScore || 0);
          });
          
          setIssues(verifyList);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadIssues();
  }, [user]);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setVerifyFile(file);
      setVerifyPreview(URL.createObjectURL(file));
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1
  });

  const clearFile = () => {
    setVerifyFile(null);
    setVerifyPreview(null);
  };

  const handleVerifySubmit = async () => {
    if (!verifyFile || !selectedIssue || !user) {
      toast.error("Please select an image to verify");
      return;
    }

    setIsVerifying(true);
    try {
      // 1. Get Base64
      const reader = new FileReader();
      reader.readAsDataURL(verifyFile);
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
      });
      const base64 = await base64Promise;

      // 2. Ping AI for Validation
      const aiRes = await fetch("/api/verify-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueTitle: selectedIssue.title,
          issueCategory: selectedIssue.category,
          imageBase64: base64,
          mimeType: verifyFile.type
        })
      });

      const aiData = await aiRes.json();
      
      if (!aiData.success || !aiData.result.isValid) {
        toast.error("AI Validation Failed: " + (aiData.result?.reasoning || "Image does not match issue."));
        setIsVerifying(false);
        return;
      }

      // 3. Upload to Firebase
      const mediaUrl = await uploadVerificationMedia(verifyFile, selectedIssue.id, user.id);

      // 4. Save Verification
      const verification: Verification = {
        userId: user.id,
        userDisplayName: user.displayName,
        mediaUrl: mediaUrl,
        timestamp: Timestamp.now(),
        isValid: true,
        aiValidationNote: aiData.result.reasoning
      };

      await addVerification(selectedIssue.id, verification);
      await incrementUserPoints(user.id, 10);

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success("Verification successful! You earned 10 XP.");
      
      // Remove from list locally
      setIssues(prev => prev.filter(i => i.id !== selectedIssue.id));
      setSelectedIssue(null);
      clearFile();
    } catch (e: any) {
      toast.error(e.message || "Failed to verify issue.");
    } finally {
      setIsVerifying(false);
    }
  };

  const verificationsThisWeek = user?.issuesVerified || 0;
  const xpProgress = Math.min((verificationsThisWeek / 5) * 100, 100);

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-400" /> Community Verification
          </h1>
          <p className="text-slate-500 dark:text-zinc-400">Help validate reported issues in your area to earn Civic XP.</p>
        </div>

        <Card className="p-4 bg-white dark:bg-zinc-900/50 border-white/5 w-full md:w-80">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest">Weekly Goal</p>
              <p className="font-bold text-white"><span className="text-blue-400">{verificationsThisWeek}</span> / 5 Verified</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              +{verificationsThisWeek * 10}
            </div>
          </div>
          <Progress value={xpProgress} className="h-2 bg-slate-100 dark:bg-zinc-800" indicatorClassName="bg-blue-500" />
        </Card>
      </div>

      {/* Issues Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Issues Near You Needing Verification</h2>
        
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
          </div>
        ) : issues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map(issue => (
              <Card key={issue.id} className="bg-white dark:bg-zinc-900 border-white/5 overflow-hidden flex flex-col group">
                <div className="h-40 bg-slate-100 dark:bg-zinc-800 relative">
                  {issue.mediaUrls?.[0] ? (
                    <Image src={issue.mediaUrls[0]} alt="Issue" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={(issue.severity || "low") as any} className="uppercase">{issue.severity}</Badge>
                  </div>
                  {issue.verificationCount === 0 && (
                    <div className="absolute bottom-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                      UNVERIFIED
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-zinc-100 line-clamp-1 mb-1">{issue.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2 mb-4">{issue.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">
                      {formatDistanceToNow(
                        issue.reportedAt?.toDate?.() || new Date(issue.reportedAt || Date.now()), 
                        { addSuffix: true }
                      )}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedIssue(issue)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Verify Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 border-dashed border-white/10 bg-white dark:bg-zinc-900/30 text-center">
            <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">You&apos;re all caught up!</h3>
            <p className="text-slate-500 dark:text-zinc-400">There are no pending issues in your area that need verification right now.</p>
          </Card>
        )}
      </div>

      {/* Verification Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-slate-50 dark:bg-zinc-950 border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white dark:bg-zinc-900/50">
              <h3 className="font-bold text-lg text-white">Verify Issue</h3>
              <button onClick={() => { setSelectedIssue(null); clearFile(); }} className="text-slate-500 dark:text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Target Issue</p>
                <p className="font-bold text-white text-lg">{selectedIssue.title}</p>
                <p className="text-sm text-slate-600 dark:text-zinc-300 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {selectedIssue.location.address}</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600 dark:text-zinc-300">Upload Proof Photo</label>
                <p className="text-xs text-slate-500 dark:text-zinc-500">Take a clear, recent photo of the issue at the location to earn your Civic XP. AI will automatically validate your submission.</p>
                
                {verifyPreview ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-white/10">
                    <Image src={verifyPreview} alt="Preview" fill unoptimized className="object-cover" />
                    <button 
                      onClick={clearFile}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer text-center flex flex-col items-center justify-center aspect-video ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50"}`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3 text-slate-500 dark:text-zinc-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-zinc-300">Tap to capture or upload</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-white dark:bg-zinc-900/50 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setSelectedIssue(null); clearFile(); }}>Cancel</Button>
              <Button 
                onClick={handleVerifySubmit} 
                disabled={!verifyFile || isVerifying}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
              >
                {isVerifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : "Submit Verification"}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
