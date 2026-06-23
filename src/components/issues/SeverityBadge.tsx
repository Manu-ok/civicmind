import { AlertCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: "critical" | "high" | "medium" | "low" | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SeverityBadge({ severity, size = "md", className }: SeverityBadgeProps) {
  const config = {
    critical: {
      color: "bg-red-500/20 text-red-500 border-red-500/30",
      icon: ShieldAlert,
      label: "Critical",
      pulse: true,
    },
    high: {
      color: "bg-orange-500/20 text-orange-500 border-orange-500/30",
      icon: AlertTriangle,
      label: "High",
      pulse: false,
    },
    medium: {
      color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      icon: AlertCircle,
      label: "Medium",
      pulse: false,
    },
    low: {
      color: "bg-green-500/20 text-green-500 border-green-500/30",
      icon: Info,
      label: "Low",
      pulse: false,
    },
  };

  const current = config[severity as keyof typeof config] || config.medium;
  const Icon = current.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold uppercase tracking-wider rounded-full border",
        current.color,
        sizeClasses[size],
        current.pulse && "animate-pulse",
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "w-3 h-3" : size === "md" ? "w-3.5 h-3.5" : "w-4 h-4")} />
      {current.label}
    </span>
  );
}
