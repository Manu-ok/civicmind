"use client";

import { Issue } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MapPin, ArrowUpCircle, CheckCircle2, Loader2, MapIcon, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { SeverityBadge } from "./SeverityBadge";
import { cn } from "@/lib/utils";

export function IssueCard({ issue, index = 0 }: { issue: Issue; index?: number }) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="flex items-center gap-1 text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md"><Loader2 className="w-3 h-3" /> Pending</span>;
      case "verified":
        return <span className="flex items-center gap-1 text-xs font-medium text-blue-400 bg-blue-500/20 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3" /> Verified</span>;
      case "in_progress":
        return <span className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/20 px-2 py-1 rounded-md"><Loader2 className="w-3 h-3 animate-spin" /> In Progress</span>;
      case "resolved":
        return <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
      default:
        return null;
    }
  };

  const dragX = useMotionValue(0);
  const bgOpacity = useTransform(dragX, [-100, 0], [1, 0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative rounded-2xl overflow-hidden bg-zinc-800"
    >
      {/* Swipe Actions Background */}
      <motion.div 
        className="absolute inset-y-0 right-0 w-[120px] bg-gradient-to-l from-blue-600/40 to-transparent flex items-center justify-end pr-4 gap-3"
        style={{ opacity: bgOpacity }}
      >
        <button 
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
          onClick={(e) => { e.stopPropagation(); router.push(`/verify?id=${issue.id}`); }}
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
        <button 
          className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg"
          onClick={(e) => { e.stopPropagation(); /* TODO: upvote logic */ }}
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Draggable Card Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        style={{ x: dragX }}
        onClick={() => router.push(`/issues/${issue.id}`)}
        className="group relative flex flex-col bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden cursor-pointer active:cursor-grabbing transition-shadow hover:shadow-2xl hover:shadow-primary/20"
      >
      {/* Thumbnail */}
      <div className="relative h-48 w-full bg-zinc-800 overflow-hidden">
        {issue.mediaUrls && issue.mediaUrls.length > 0 ? (
          <img 
            src={issue.mediaUrls[0]} 
            alt={issue.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/50">
            <MapIcon className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-xs uppercase tracking-widest font-bold opacity-50">No Image</span>
          </div>
        )}

        {/* Category Overlay */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10">
            {issue.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-5 flex-1">
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="font-bold text-lg text-zinc-100 leading-tight line-clamp-2">{issue.title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4 mt-auto">
          <SeverityBadge severity={issue.severity} size="sm" />
          {getStatusBadge(issue.status)}
        </div>

        <div className="flex items-center text-sm text-zinc-400 mb-4 line-clamp-1">
          <MapPin className="w-4 h-4 mr-1.5 text-zinc-500 shrink-0" />
          <span className="truncate">{issue.location.address}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
          <span className="text-xs text-zinc-500 font-medium">
            {formatDistanceToNow(issue.reportedAt as Date, { addSuffix: true })}
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-zinc-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-semibold">{issue.verificationCount || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <ArrowUpCircle className="w-4 h-4" />
              <span className="text-sm font-bold">{issue.upvotes || 0}</span>
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
}
