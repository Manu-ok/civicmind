"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Issue } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface MobileMapPanelProps {
  issue: Issue | null;
  onClose: () => void;
}

export function MobileMapPanel({ issue, onClose }: MobileMapPanelProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {issue && (
        <>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[80] rounded-t-3xl border-t border-white/[0.08] bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-xl md:absolute md:bottom-4 md:right-4 md:left-auto md:w-[400px] md:rounded-2xl md:border md:pb-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) onClose();
            }}
          >
            {/* Drag Handle for Mobile */}
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-zinc-800 md:hidden" />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-zinc-400 transition-colors hidden md:block"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4">
              {issue.mediaUrls?.[0] ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={issue.mediaUrls[0]} alt="Issue" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <MapIcon className="w-8 h-8 text-zinc-600" />
                </div>
              )}
              
              <div className="flex flex-col flex-1 min-w-0 pt-1">
                <h3 className="font-semibold text-lg leading-tight truncate text-white">{issue.title}</h3>
                <p className="text-sm text-zinc-400 truncate mt-1">{issue.location.address}</p>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <span className={cn(
                    "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                    issue.severity === "critical" ? "bg-red-500/20 text-red-400" :
                    issue.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                    issue.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-green-500/20 text-green-400"
                  )}>
                    {issue.severity}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">
                    {formatDistanceToNow(issue.reportedAt as Date, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <Button 
                className="flex-1 bg-white text-black hover:bg-zinc-200" 
                onClick={() => router.push(`/issues/${issue.id}`)}
              >
                View Details
              </Button>
              {issue.status === "pending" && (
                <Button 
                  variant="default"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => router.push(`/verify?id=${issue.id}`)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Verify
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
