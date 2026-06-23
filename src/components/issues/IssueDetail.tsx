"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { 
  MapPin, Clock, Brain, CheckCircle2, ChevronLeft, ChevronRight, 
  ThumbsUp, User as UserIcon, ShieldCheck, AlertTriangle, Image as ImageIcon,
  Building, Target, ShieldAlert, Activity, Navigation, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { Issue, User } from "@/lib/types";
import { getUserProfile, incrementUpvotes } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/lib/stores/authStore";
import { Badge } from "@/components/ui/badge";
import { MiniMap } from "@/components/map/MiniMap";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { StatusTimeline } from "./StatusTimeline";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

export function IssueDetail({ issue }: { issue: Issue }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reporter, setReporter] = useState<User | null>(null);
  const [upvotes, setUpvotes] = useState(issue.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(issue.status);
  const [adminNote, setAdminNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);

  useEffect(() => {
    if (issue.reportedBy) {
      getUserProfile(issue.reportedBy).then(setReporter);
    }
  }, [issue.reportedBy]);

  const handleUpdateStatus = async () => {
    if (!user || user.role !== "admin") return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "issues", issue.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success("Status updated successfully");
      setIsAdminModalOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      toast.error("Please login to upvote");
      return;
    }
    if (hasUpvoted) return;

    try {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      await incrementUpvotes(issue.id);
      toast.success("Issue upvoted!");
    } catch (e) {
      setUpvotes(prev => prev - 1);
      setHasUpvoted(false);
    }
  };


  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* HEADER: Gallery & Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group">
            {issue.mediaUrls && issue.mediaUrls.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative"
                >
                  <Image 
                    src={issue.mediaUrls[currentImageIndex]} 
                    alt="Issue media" 
                    fill
                    priority
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <p>No media provided</p>
              </div>
            )}

            {/* Gallery Controls */}
            {issue.mediaUrls && issue.mediaUrls.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? issue.mediaUrls.length - 1 : prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => prev === issue.mediaUrls.length - 1 ? 0 : prev + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnails */}
          {issue.mediaUrls && issue.mediaUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {issue.mediaUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                    currentImageIndex === idx ? "border-primary" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <Image src={url} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="flex flex-col space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Badge variant={(issue.status === "in_progress" ? "in-progress" : issue.status) as any} className="uppercase px-3 py-1 text-xs">
              {issue.status.replace("_", " ")}
            </Badge>
            <Badge variant={(issue.category || "other") as any} className="uppercase px-3 py-1 text-xs">
              {issue.category}
            </Badge>
            <Badge variant={(issue.severity || "low") as any} className="uppercase px-3 py-1 text-xs">
              {issue.severity}
            </Badge>
          </div>

          <div>
            <h1 className="text-h1 text-white mb-2 leading-tight">{issue.title}</h1>
            <p className="text-body leading-relaxed">{issue.description}</p>
          </div>

          <div className="flex flex-col gap-3 py-4 border-y border-white/5">
            <div className="flex items-center gap-3 text-zinc-300">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{issue.location.address} <span className="text-zinc-500">({issue.location.ward})</span></span>
            </div>
            <div className="flex items-center gap-3 text-zinc-300">
              <Clock className="w-5 h-5 text-primary" />
              <span>Reported {formatDistanceToNow(issue.reportedAt as any, { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                {reporter?.photoURL ? (
                  <Image src={reporter.photoURL} alt={reporter.displayName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{reporter?.displayName || "Anonymous Citizen"}</p>
                <p className="text-xs text-zinc-500">Civic Reporter</p>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {user?.role === "admin" && (
                <Button onClick={() => setIsAdminModalOpen(true)} variant="outline" className="bg-zinc-900 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
                  Update Status
                </Button>
              )}
              <Button 
                onClick={handleUpvote} 
                variant={hasUpvoted ? "default" : "outline"}
                className={cn("gap-2", hasUpvoted ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-900 border-white/10")}
              >
                <ThumbsUp className={cn("w-4 h-4", hasUpvoted ? "fill-white" : "")} />
                <span className="font-bold">{upvotes}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        
        {/* LEFT COLUMN: AI & Plan */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Assessment */}
          {issue.aiAnalysis && (
            <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border-blue-500/20 overflow-hidden shadow-glow rounded-xl">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
              >
                <h3 className="text-h3 text-white mb-6 flex items-center gap-2">
                  <Brain className="size-6 text-blue-400" />
                  AI Assessment
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <motion.div 
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } } }}
                    className="p-4 rounded-xl bg-black/20 border border-white/5"
                  >
                    <p className="text-xs text-zinc-500 mb-1">Confidence</p>
                    <p className="text-lg font-bold text-blue-400">{issue.aiAnalysis.confidence}%</p>
                  </motion.div>
                  <motion.div 
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } } }}
                    className="p-4 rounded-xl bg-black/20 border border-white/5"
                  >
                    <p className="text-xs text-zinc-500 mb-1">Priority</p>
                    <p className="text-lg font-bold text-orange-400">
                      <AnimatedCounter value={issue.priorityScore || 0} />/100
                    </p>
                  </motion.div>
                  <motion.div 
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } } }}
                    className="p-4 rounded-xl bg-black/20 border border-white/5 col-span-2"
                  >
                    <p className="text-xs text-zinc-500 mb-1">Assigned Dept</p>
                    <p className="text-sm font-bold text-zinc-200 flex items-center gap-1">
                      <Building className="w-4 h-4 text-zinc-400"/> {issue.aiAnalysis.department}
                    </p>
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.4 } } }}>
                    <p className="text-sm font-bold text-red-400 flex items-center gap-1 mb-1">
                      <ShieldAlert className="w-4 h-4"/> Risk Assessment
                    </p>
                    <p className="text-sm text-zinc-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {issue.aiAnalysis.riskAssessment}
                    </p>
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.4 } } }}>
                    <p className="text-sm font-bold text-purple-400 flex items-center gap-1 mb-1">
                      <Target className="w-4 h-4"/> Estimated Impact
                    </p>
                    <p className="text-sm text-zinc-300 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                      {issue.aiAnalysis.estimatedImpact}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </Card>
          )}

          {/* AI Resolution Plan */}
          {issue.resolutionPlan && (
            <Card className="p-6 bg-zinc-900/50 border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-400" />
                AI Resolution Plan
              </h3>
              
              <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-[21px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                {issue.resolutionPlan.steps.map((step, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-green-500 bg-zinc-950 text-green-500 text-xs font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(34,197,94,0.3)] z-10">
                      {idx + 1}
                    </div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-zinc-900 border border-white/5 shadow-xl">
                      <p className="text-sm text-zinc-300">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-green-500 font-bold uppercase tracking-widest">Expected Completion</p>
                  <p className="text-lg font-bold text-green-400">{issue.resolutionPlan.estimatedDays} Days</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-500 font-bold uppercase tracking-widest">Impact</p>
                  <p className="text-sm text-green-400">{issue.resolutionPlan.estimatedImpact}</p>
                </div>
              </div>
            </Card>
          )}

        </div>

        {/* RIGHT COLUMN: Verifications & Map */}
        <div className="space-y-8">

          <Card className="p-6 bg-zinc-900/50 border-white/5">
            <h3 className="font-bold text-lg text-white mb-2">Status Tracking</h3>
            <StatusTimeline issue={issue} />
          </Card>
          
          <Card className="p-1 bg-zinc-900/50 border-white/5 overflow-hidden group relative">
             <div className="relative h-48 w-full pointer-events-none">
                {issue.location.lat && issue.location.lng ? (
                  <MiniMap initialLocation={{ lat: issue.location.lat, lng: issue.location.lng, address: issue.location.address }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                    <MapPin className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
             </div>
             
             {issue.location.lat && issue.location.lng && (
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-auto">
                 <Button 
                   onClick={() => setShowStreetView(true)}
                   className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-xl"
                 >
                   <Navigation className="w-4 h-4 mr-2" />
                   Street View
                 </Button>
               </div>
             )}
          </Card>

          <Card className="p-6 bg-zinc-900/50 border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Verifications ({issue.verificationCount})
              </h3>
              {issue.reportedBy !== user?.id && (
                <Button variant="outline" size="sm" onClick={() => router.push('/verify')} className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-300">
                  Verify Issue
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {issue.verifications?.length > 0 ? (
                issue.verifications.map((v, i) => (
                  <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                          {v.userDisplayName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-zinc-300">{v.userDisplayName}</span>
                      </div>
                      <span className="text-xs text-zinc-500">{formatDistanceToNow(v.timestamp as any, { addSuffix: true })}</span>
                    </div>
                    {v.mediaUrl && (
                      <div className="w-full h-24 rounded-lg overflow-hidden relative">
                         <Image src={v.mediaUrl} alt="Verification media" fill className="object-cover" />
                         {v.isValid && (
                           <div className="absolute top-1 right-1 px-2 py-0.5 rounded bg-green-500 text-white text-[10px] font-bold">AI VALIDATED</div>
                         )}
                      </div>
                    )}
                    {v.aiValidationNote && (
                      <p className="text-xs text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20">
                        {v.aiValidationNote}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-white/10">
                  <ShieldAlert className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">No verifications yet.</p>
                  <p className="text-xs text-zinc-500 mt-1">Be the first to verify this issue and earn points!</p>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>

      {/* Admin Update Status Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pt-20 px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdminModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Update Issue Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-400 block mb-1">Status</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-400 block mb-1">Admin Note (Internal)</label>
                  <textarea 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                    placeholder="Add notes about this update..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setIsAdminModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdateStatus} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700">
                    {isUpdating ? "Updating..." : "Save Update"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStreetView && issue.location.lat && issue.location.lng && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowStreetView(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-5xl h-[80vh] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white">Street View</h3>
                  <span className="text-sm text-zinc-400 hidden sm:inline-block ml-2">- {issue.location.address}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowStreetView(false)} className="text-zinc-400 hover:text-white rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 w-full bg-zinc-900">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/streetview?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&location=${issue.location.lat},${issue.location.lng}&heading=210&pitch=10&fov=90`}
                ></iframe>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
