"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Clock, ShieldCheck, BrainCircuit, Activity, CheckCircle2 } from "lucide-react";
import { Issue } from "@/lib/types";

interface StatusTimelineProps {
  issue: Issue;
}

export function StatusTimeline({ issue }: StatusTimelineProps) {
  // Determine if steps are completed
  const isReported = true;
  const isAIAnalyzed = !!issue.aiAnalysis;
  const isVerified = issue.verificationCount >= 2 || issue.status !== "pending";
  const isInProgress = issue.status === "in_progress" || issue.status === "resolved";
  const isResolved = issue.status === "resolved";

  const steps = [
    {
      id: "reported",
      title: "Reported",
      description: "Issue submitted by citizen",
      icon: Clock,
      completed: isReported,
      isCurrent: isReported && !isAIAnalyzed
    },
    {
      id: "analyzed",
      title: "AI Analyzed",
      description: "Priority & department assigned",
      icon: BrainCircuit,
      completed: isAIAnalyzed,
      isCurrent: isAIAnalyzed && !isVerified
    },
    {
      id: "verified",
      title: "Community Verified",
      description: "Confirmed by 2+ citizens",
      icon: ShieldCheck,
      completed: isVerified,
      isCurrent: isVerified && !isInProgress
    },
    {
      id: "in_progress",
      title: "In Progress",
      description: "City officials working on it",
      icon: Activity,
      completed: isInProgress,
      isCurrent: isInProgress && !isResolved
    },
    {
      id: "resolved",
      title: "Resolved",
      description: "Issue fixed & verified",
      icon: CheckCircle2,
      completed: isResolved,
      isCurrent: isResolved
    }
  ];

  return (
    <div className="py-4">
      <div className="relative">
        {/* Continuous background line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-zinc-800" />
        
        {/* Animated fill line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 flex flex-col justify-start overflow-hidden">
          <motion.div
            className="w-full bg-blue-500 origin-top"
            initial={{ scaleY: 0 }}
            animate={{ 
              scaleY: isResolved ? 1 : 
                      isInProgress ? 0.75 : 
                      isVerified ? 0.5 : 
                      isAIAnalyzed ? 0.25 : 0 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <div className="space-y-8 relative">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const Icon = step.completed ? Check : step.icon;
            
            return (
              <div key={step.id} className="flex gap-4 items-start relative group">
                {/* Circle Icon */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-colors duration-500
                    ${step.completed 
                      ? "bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                      : step.isCurrent 
                        ? "bg-white dark:bg-zinc-900 border-blue-500 text-blue-500" 
                        : "bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-500"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                {/* Content */}
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="pt-2 flex-1"
                >
                  <h4 className={`text-sm font-bold ${step.completed || step.isCurrent ? "text-zinc-100" : "text-slate-500 dark:text-zinc-500"}`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs mt-1 ${step.completed || step.isCurrent ? "text-slate-500 dark:text-zinc-400" : "text-zinc-600"}`}>
                    {step.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
