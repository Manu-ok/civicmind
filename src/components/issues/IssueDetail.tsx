"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { 
  MapPin, Clock, Brain, CheckCircle2, ChevronLeft, ChevronRight, 
  ThumbsUp, User as UserIcon, ShieldCheck, AlertTriangle, Image as ImageIcon,
  Building, Target, ShieldAlert, Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Issue, User } from "@/lib/types";
import { getUserProfile, incrementUpvotes } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/lib/stores/authStore";
import { SeverityBadge } from "./SeverityBadge";
import { MiniMap } from "@/components/map/MiniMap";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { StatusTimeline } from "./StatusTimeline";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20";
      case "verified": return "bg-blue-500/20 text-blue-500 border-blue-500/20";
      case "in_progress": return "bg-purple-500/20 text-purple-500 border-purple-500/20";
      case "resolved": return "bg-green-500/20 text-green-500 border-green-500/20";
      default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/20";
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
                <motion.img
                  key={currentImageIndex}
                  src={issue.mediaUrls[currentImageIndex]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
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
                  <img src={url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="flex flex-col space-y-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border", getStatusColor(issue.status))}>
              {issue.status.replace("_", " ")}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-white/10">
              {issue.category}
            </span>
            <SeverityBadge severity={issue.severity} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{issue.title}</h1>
            <p className="text-zinc-400 text-lg leading-relaxed">{issue.description}</p>
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
                  <img src={reporter.photoURL} alt={reporter.displayName} className="w-full h-full object-cover" />
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
            <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border-blue-500/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-400" />
                AI Assessment
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                  <p className="text-xs text-zinc-500 mb-1">Confidence</p>
                  <p className="text-lg font-bold text-blue-400">{issue.aiAnalysis.confidence}%</p>
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                  <p className="text-xs text-zinc-500 mb-1">Priority</p>
                  <p className="text-lg font-bold text-orange-400">{issue.priorityScore}/100</p>
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 col-span-2">
                  <p className="text-xs text-zinc-500 mb-1">Assigned Dept</p>
                  <p className="text-sm font-bold text-zinc-200 flex items-center gap-1">
                    <Building className="w-4 h-4 text-zinc-400"/> {issue.aiAnalysis.department}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-red-400 flex items-center gap-1 mb-1">
                    <ShieldAlert className="w-4 h-4"/> Risk Assessment
                  </p>
                  <p className="text-sm text-zinc-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {issue.aiAnalysis.riskAssessment}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-400 flex items-center gap-1 mb-1">
                    <Target className="w-4 h-4"/> Estimated Impact
                  </p>
                  <p className="text-sm text-zinc-300 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                    {issue.aiAnalysis.estimatedImpact}
                  </p>
                </div>
              </div>
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
          
          <Card className="p-1 bg-zinc-900/50 border-white/5 overflow-hidden">
             {/* Map view snippet (non-draggable by removing standard map controls if possible, or just rendering MiniMap) */}
             <div className="relative h-48 w-full pointer-events-none">
                {issue.location.lat && issue.location.lng ? (
                  <MiniMap initialLocation={{ lat: issue.location.lat, lng: issue.location.lng, address: issue.location.address }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                    <MapPin className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
             </div>
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
                         <img src={v.mediaUrl} className="w-full h-full object-cover" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Update Issue Status</h3>
                <p className="text-sm text-zinc-400 mt-1">Admin Action</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">New Status</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Admin Note (Optional)</label>
                  <textarea 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Provide an internal or public note regarding this status update..."
                    className="w-full p-3 h-24 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex gap-3 justify-end bg-black/20">
                <Button 
                  onClick={() => setIsAdminModalOpen(false)}
                  variant="ghost" 
                  className="text-zinc-400 hover:text-white"
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateStatus}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
