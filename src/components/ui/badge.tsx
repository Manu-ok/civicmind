import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Categories
        road: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        water: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        electricity: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        waste: "bg-green-500/20 text-green-400 border-green-500/30",
        safety: "bg-red-500/20 text-red-400 border-red-500/30",
        other: "bg-zinc-500/20 text-slate-500 dark:text-zinc-400 border-zinc-500/30",
        // Severities
        critical: "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]",
        high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        low: "bg-green-500/20 text-green-400 border-green-500/30",
        // Statuses
        pending: "bg-zinc-500/20 text-slate-500 dark:text-zinc-400 border-zinc-500/30",
        verified: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        resolved: "bg-green-500/20 text-green-400 border-green-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
