"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { Issue } from "@/lib/types";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IssuePinProps {
  issue: Issue;
  onClick: () => void;
  isActive: boolean;
}

export function IssuePin({ issue, onClick, isActive }: IssuePinProps) {
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
      position={{ lat: issue.location.lat, lng: issue.location.lng }}
      onClick={onClick}
      zIndex={isActive ? 50 : 0}
      title={issue.title}
    >
      <div 
        className={cn(
          "w-8 h-8 rounded-full border-2 border-zinc-950 flex items-center justify-center cursor-pointer transition-all duration-300",
          pinClass,
          isActive ? "scale-125 shadow-lg" : "hover:scale-110 shadow-md",
          !isResolved && "shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        )}
      >
        {getStatusIcon(issue.status)}
      </div>
    </AdvancedMarker>
  );
}
