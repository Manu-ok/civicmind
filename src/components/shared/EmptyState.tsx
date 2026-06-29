"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-800 mb-6">
        <Icon className="h-8 w-8 text-slate-400 dark:text-zinc-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
        {description}
      </p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
