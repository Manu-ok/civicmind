"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FeedItem as FeedItemType, Issue } from "@/lib/types";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  Heart, MessageCircle, Share2, UserPlus, CheckCircle2, 
  MoreHorizontal, MapPin, Bot, ClipboardList, Shield, AlertTriangle, MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";
import { FollowButton } from "./FollowButton";
import { CommentSection } from "./CommentSection";
import dynamic from "next/dynamic";
const ShareCard = dynamic(() => import('./ShareCard').then(mod => mod.ShareCard), { ssr: false });
import { getUsernameColor } from "@/lib/utils/usernameValidator";

const REACTIONS = [
  { emoji: "❤️", label: "Heart" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👍", label: "Thumbs Up" },
  { emoji: "😢", label: "Sad" },
  { emoji: "👏", label: "Clap" },
  { emoji: "😡", label: "Angry" }
];

export function FeedItem({ item, priority = false }: { item: FeedItemType, priority?: boolean }) {
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExpandedAI, setIsExpandedAI] = useState(false);
  const [isExpandedPlan, setIsExpandedPlan] = useState(false);

  useEffect(() => {
    if (item.issueId && (item.type === "issue_reported" || item.type === "issue_resolved")) {
      getDoc(doc(db, "issues", item.issueId)).then(snap => {
        if (snap.exists()) {
          setIssue({ id: snap.id, ...snap.data() } as Issue);
        }
      });
    }
  }, [item]);

  const timeAgo = item.createdAt 
    ? formatDistanceToNow(new Date((item.createdAt as any).seconds ? (item.createdAt as any).toDate() : item.createdAt), { addSuffix: true })
    : "Just now";

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  const handleReaction = (emoji: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReaction(prev => prev === emoji ? null : emoji);
    setShowReactions(false);
    toast.success(`Reacted with ${emoji}`);
  };

  // --- HEADER COMPONENT ---
  const Header = () => (
    <div className="flex items-center justify-between p-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="relative cursor-pointer group" onClick={(e) => { e.stopPropagation(); router.push(`/profile/${item.actorUsername}`); }}>
          {/* Active story ring could be added here based on a global state or prop */}
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-600 to-violet-600 group-hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-background bg-white dark:bg-zinc-900">
              {item.actorPhotoURL ? (
                <Image src={item.actorPhotoURL} alt="" fill sizes="40px" className="object-cover" priority={priority} />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 dark:text-zinc-500 text-sm">
                  {item.actorDisplayName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 cursor-pointer group" onClick={(e) => { e.stopPropagation(); router.push(`/profile/${item.actorUsername}`); }}>
            <span className="text-white font-semibold text-sm truncate group-hover:underline">{item.actorDisplayName}</span>
            {item.actorIsVerified && <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-500 truncate">
            <span>@{item.actorUsername}</span>
            <span>•</span>
            <span title={new Date((item.createdAt as any).seconds ? (item.createdAt as any).toDate() : item.createdAt).toLocaleString()}>
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
      
      <button className="p-2 text-slate-500 dark:text-zinc-500 hover:text-white hover:bg-slate-100 dark:bg-zinc-800 rounded-full transition-colors duration-200 ease-in-out" onClick={(e) => e.stopPropagation()}>
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  );

  // --- RENDER BY TYPE ---

  if (item.type === "followed_you") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-6 hover:border-slate-300 dark:border-zinc-700 transition-colors duration-200 ease-in-out"
      >
        <Header />
        <div className="p-6 flex flex-col sm:flex-row items-center gap-6 cursor-pointer" onClick={() => router.push(`/profile/${item.actorUsername}`)}>
          <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-800">
            <UserPlus className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-lg font-semibold text-white mb-1">New Follower!</div>
            <div className="text-slate-500 dark:text-zinc-400 text-sm">
              <strong className="text-white">@{item.actorUsername}</strong> started following you. Check out their profile and connect!
            </div>
          </div>
          <div className="shrink-0" onClick={e => e.stopPropagation()}>
            <FollowButton targetUserId={item.actorId} targetUsername={item.actorUsername} size="lg" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (item.type === "mentioned_you" || item.type === "issue_commented") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-6 hover:border-slate-300 dark:border-zinc-700 transition-colors duration-200 ease-in-out cursor-pointer"
        onClick={() => router.push(`/issues/${item.issueId}`)}
      >
        <Header />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-blue-500 font-semibold text-sm">
            <MessageSquare className="w-5 h-5 fill-current" />
            {item.type === "mentioned_you" ? "Mentioned you in a comment" : "Commented on your issue"}
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-slate-600 dark:text-zinc-300 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:bg-blue-500 before:rounded-r-full">
            &quot;{item.commentPreview}...&quot;
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-500 dark:text-zinc-500 flex items-center gap-1.5 hover:text-white transition-colors duration-200 ease-in-out">
            View discussion on: <span className="text-white truncate max-w-[200px]">{item.issueTitle}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // issue_reported, issue_resolved, issue_verified
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden mb-6 transition-all duration-200 ease-in-out hover:shadow-xl cursor-pointer ${
        item.type === "issue_resolved" ? "border-green-500/30 hover:border-green-500/50" : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:border-zinc-700"
      }`}
      onClick={() => router.push(`/issues/${item.issueId}`)}
    >
      <Header />
      
      {item.type === "issue_resolved" && (
        <div className="bg-green-500/10 border-b border-green-500/20 p-3 flex items-center justify-center gap-2 text-green-500 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5" /> ISSUE RESOLVED
        </div>
      )}
      
      {item.type === "issue_verified" && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 p-3 flex items-center justify-center gap-2 text-blue-500 font-bold text-sm">
          <Shield className="w-5 h-5" /> VERIFIED BY COMMUNITY
        </div>
      )}

      {/* Image Area */}
      {item.issueThumbnail ? (
        <div className="w-full aspect-video bg-white dark:bg-zinc-900 relative border-b border-slate-200 dark:border-zinc-800">
          <Image src={item.issueThumbnail} alt="Issue" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" priority={priority} />
        </div>
      ) : (
        <div className="w-full h-32 bg-white dark:bg-zinc-900 relative border-b border-slate-200 dark:border-zinc-800 flex items-center justify-center" style={{ background: getUsernameColor(item.issueCategory || 'general') }}>
          <AlertTriangle className="w-6 h-6 text-white/50" />
        </div>
      )}
      
      <div className="p-6">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          {item.issueSeverity && (
            <span className={`px-2.5 py-1 text-[11px] font-black tracking-wider rounded-md uppercase ${
              item.type === "issue_resolved" ? "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 line-through" :
              item.issueSeverity === "critical" ? "bg-red-500 text-white" :
              item.issueSeverity === "high" ? "bg-orange-500 text-white" :
              "bg-blue-500 text-white"
            }`}>
              {item.issueSeverity} Priority
            </span>
          )}
          {item.issueCategory && (
            <span className="px-2.5 py-1 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 text-xs font-semibold tracking-wider rounded-md uppercase border border-slate-200 dark:border-zinc-800">
              {item.issueCategory.replace('_', ' ')}
            </span>
          )}
        </div>
        
        {/* Title & Location */}
        <h3 className="text-xl sm:text-2xl text-white font-semibold leading-tight mb-2 line-clamp-2">
          {item.issueTitle}
        </h3>
        
        {(issue?.location?.ward || issue?.location?.city) && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" /> 
            {issue.location.ward ? `${issue.location.ward}, ` : ''}{issue.location.city || 'Location unknown'}
          </div>
        )}

        {/* AI Analysis Preview (if fetched) */}
        {issue?.aiAnalysis && (
          <div className="mb-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:bg-zinc-800 transition-colors duration-200 ease-in-out"
              onClick={() => setIsExpandedAI(!isExpandedAI)}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-500">
                <Bot className="w-4 h-4" /> AI Assessment
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-blue-500 px-2 py-1 rounded border border-slate-200 dark:border-zinc-800">Score: {issue.priorityScore}/100</span>
                <span className="text-xs text-slate-500 dark:text-zinc-500">{isExpandedAI ? "Hide" : "Show"}</span>
              </div>
            </div>
            
            <AnimatePresence>
              {isExpandedAI && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-sm text-slate-600 dark:text-zinc-300 border-t border-slate-200 dark:border-zinc-800 mt-2">
                    <p className="mb-2"><strong>Risk:</strong> {issue.aiAnalysis.riskAssessment.split('. ')[0]}.</p>
                    <p><strong>Dept:</strong> <span className="capitalize">{issue.aiAnalysis.department.replace('_', ' ')}</span></p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Resolution Plan Preview */}
        {issue?.resolutionPlan && (
          <div className="mb-6 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:bg-zinc-800 transition-colors duration-200 ease-in-out"
              onClick={() => setIsExpandedPlan(!isExpandedPlan)}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-500">
                <ClipboardList className="w-4 h-4" /> Resolution Plan
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-500">{isExpandedPlan ? "Hide" : "Show"}</div>
            </div>
            
            <AnimatePresence>
              {isExpandedPlan && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-sm text-slate-600 dark:text-zinc-300 border-t border-white/5 mt-2">
                    <ul className="list-disc pl-4 space-y-1">
                      {issue.resolutionPlan.steps.slice(0, 2).map((step: any, i: number) => (
                        <li key={i}>{step.title}</li>
                      ))}
                    </ul>
                    <div className="mt-2 text-emerald-500 text-xs font-semibold cursor-pointer hover:underline" onClick={() => router.push(`/issues/${item.issueId}`)}>See full plan →</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Engagement Bar */}
        <div className="relative pt-4 border-t border-white/5 flex items-center justify-between" onClick={e => e.stopPropagation()}>
          
          {/* Reaction Picker Popup */}
          <AnimatePresence>
            {showReactions && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full left-0 mb-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 flex items-center gap-1 z-10"
              >
                {REACTIONS.map(reaction => (
                  <button 
                    key={reaction.emoji}
                    onClick={(e) => handleReaction(reaction.emoji, e)}
                    className={`w-11 h-11 text-xl flex items-center justify-center rounded-xl hover:bg-slate-100 dark:bg-zinc-800 hover:scale-125 transition-all duration-200 ease-in-out ${
                      selectedReaction === reaction.emoji ? "bg-slate-100 dark:bg-zinc-800 scale-110" : ""
                    }`}
                    title={reaction.label}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              className={`flex items-center gap-1.5 font-semibold transition-colors duration-200 ease-in-out min-h-[44px] ${selectedReaction ? 'text-blue-500' : 'text-slate-500 dark:text-zinc-400 hover:text-white'}`}
              onClick={(e) => { e.stopPropagation(); setShowReactions(!showReactions); }}
              onMouseLeave={() => { setTimeout(() => setShowReactions(false), 2000); }}
            >
              {selectedReaction ? <span className="text-xl -mt-1">{selectedReaction}</span> : <Heart className="w-4 h-4" />} 
              <span className="text-sm">{issue?.upvotes || 0}</span>
            </button>
            
            <button 
              className={`flex items-center gap-1.5 font-semibold transition-colors duration-200 ease-in-out min-h-[44px] ${showComments ? 'text-white' : 'text-slate-500 dark:text-zinc-400 hover:text-white'}`}
              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{issue?.commentCount || 0}</span>
            </button>
            
            <button 
              className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-zinc-400 hover:text-blue-500 transition-colors duration-200 ease-in-out min-h-[44px]"
              onClick={(e) => { e.stopPropagation(); router.push(`/issues/${item.issueId}/verify`); }}
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm">{issue?.verificationCount || 0}</span>
            </button>
          </div>
          
          <button 
            className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-zinc-400 hover:text-white transition-colors duration-200 ease-in-out min-h-[44px] ml-auto"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Comments Section */}
        <AnimatePresence>
          {showComments && item.issueId && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-zinc-800">
                <CommentSection issueId={item.issueId} compact={true} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <ShareCard isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} issue={issue || item} />
    </motion.div>
  );
}
