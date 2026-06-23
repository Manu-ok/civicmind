"use client";

import { Issue } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MapPin, ArrowUpCircle, CheckCircle2, Loader2, MapIcon, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlowCard } from "../shared/GlowCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function IssueCard({ issue, index = 0 }: { issue: Issue; index?: number }) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const variant = status === "in_progress" ? "in-progress" : status;
    switch (status) {
      case "pending":
        return <Badge variant="pending" className="gap-1 uppercase"><Loader2 className="size-3" /> Pending</Badge>;
      case "verified":
        return <Badge variant="verified" className="gap-1 uppercase"><CheckCircle2 className="size-3" /> Verified</Badge>;
      case "in_progress":
        return <Badge variant="in-progress" className="gap-1 uppercase"><Loader2 className="size-3 animate-spin" /> In Progress</Badge>;
      case "resolved":
        return <Badge variant="resolved" className="gap-1 uppercase"><CheckCircle2 className="size-3" /> Resolved</Badge>;
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
      className="relative rounded-xl overflow-hidden bg-zinc-800"
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
        className="group relative flex flex-col bg-zinc-900 border border-white/10 rounded-xl overflow-hidden cursor-pointer active:cursor-grabbing transition-all duration-300 hover:shadow-glow"
      >
      <GlowCard className="flex flex-col flex-1">
      {/* Thumbnail */}
      <div className="relative h-48 w-full bg-zinc-800 overflow-hidden">
        {issue.mediaUrls && issue.mediaUrls.length > 0 ? (
          <Image 
            src={issue.mediaUrls[0]} 
            alt={issue.title} 
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/50">
            <MapIcon className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-xs uppercase tracking-widest font-bold opacity-50">No Image</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <Badge variant={(issue.category || "other") as any} className="uppercase backdrop-blur-md shadow-lg">
            {issue.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-6 flex-1">
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="text-h3 text-zinc-100 leading-tight line-clamp-2">{issue.title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4 mt-auto">
          <Badge variant={(issue.severity || "low") as any} className="uppercase">{issue.severity}</Badge>
          {getStatusBadge(issue.status)}
        </div>

        <div className="flex items-center text-caption mb-4 line-clamp-1">
          <MapPin className="size-4 mr-1.5 text-zinc-500 shrink-0" />
          <span className="truncate">{issue.location.address}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
          <span className="text-caption font-medium">
            {formatDistanceToNow(issue.reportedAt as Date, { addSuffix: true })}
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <CheckCircle2 className="size-4" />
              <span className="text-sm font-semibold">{issue.verificationCount || 0}</span>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1.5 text-primary cursor-pointer"
            >
              <ArrowUpCircle className="size-4" />
              <span className="text-sm font-bold">{issue.upvotes || 0}</span>
            </motion.div>
          </div>
        </div>
      </div>
      </GlowCard>
      </motion.div>
    </motion.div>
  );
}
