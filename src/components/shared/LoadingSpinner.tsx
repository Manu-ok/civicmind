import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  className?: string;
}

export function InlineSpinner({ className }: LoadingSpinnerProps) {
  return (
    <Loader2 className={`h-4 w-4 animate-spin text-zinc-400 ${className}`} />
  );
}

export function DotsLoader() {
  return (
    <div className="flex space-x-1.5 items-center justify-center">
      <motion.div
        className="w-2 h-2 rounded-full bg-blue-500"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-blue-500"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-blue-500"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
      />
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        
        {/* Spinner */}
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          
          {/* Inner Logo/Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-blue-400" />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-medium text-white tracking-tight">CivicMind AI</h3>
        <DotsLoader />
      </div>
    </div>
  );
}
