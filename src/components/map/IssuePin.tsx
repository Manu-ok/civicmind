"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Issue } from "@/lib/types";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface IssuePinProps {
  issue: Issue;
  onClick: () => void;
  isActive: boolean;
  setMarkerRef?: (marker: google.maps.marker.AdvancedMarkerElement | null, key: string) => void;
}

export function IssuePin({ issue, onClick, isActive, setMarkerRef }: IssuePinProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 shadow-red-500/50";
      case "high": return "bg-orange-500 shadow-orange-500/50";
      case "medium": return "bg-yellow-500 shadow-yellow-500/50";
      case "low": return "bg-green-500 shadow-green-500/50";
      default: return "bg-zinc-500 shadow-zinc-500/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return <Check className="w-3 h-3 text-white" />;
      case "in_progress": return <Loader2 className="w-3 h-3 text-white animate-spin" />;
      case "resolved": return <Check className="w-3 h-3 text-white" />;
      default: return null;
    }
  };

  const isResolved = issue.status === "resolved";
  const pinClass = isResolved ? "bg-zinc-600 shadow-none opacity-60" : getSeverityColor(issue.severity);

  return (
    <AdvancedMarker
      ref={(marker) => setMarkerRef?.(marker as any, issue.id)}
      position={{ lat: issue.location.lat, lng: issue.location.lng }}
      onClick={onClick}
      zIndex={isActive ? 50 : 0}
      title={issue.title}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, bounce: 0.5 }}
        className="relative"
      >
        {/* Pulse ring for critical */}
        {issue.severity === "critical" && !isResolved && (
          <motion.div 
            animate={{ scale: [1, 2], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-red-500 z-0" 
          />
        )}
        
        <motion.div 
          animate={isActive ? { scale: 1.25 } : { scale: 1 }}
          whileHover={{ scale: 1.1 }}
          className={cn(
            "w-8 h-8 rounded-full border-2 border-zinc-950 flex items-center justify-center cursor-pointer transition-colors duration-300 relative z-10",
            pinClass,
            isActive ? "shadow-lg" : "shadow-md",
            !isResolved && "shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          )}
        >
          {isResolved ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          ) : (
            getStatusIcon(issue.status)
          )}
        </motion.div>
      </motion.div>
    </AdvancedMarker>
  );
}
