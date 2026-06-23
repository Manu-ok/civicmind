import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full rounded-xl border border-dashed border-white/10 bg-zinc-950/50">
      <div className="mb-4 rounded-full bg-zinc-900 p-4">
        <Icon className="h-10 w-10 text-zinc-600" />
      </div>
      <h3 className="text-h3 text-zinc-200 mb-2">{title}</h3>
      <p className="text-body max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
