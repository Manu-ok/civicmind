import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

export function FullPageError({ message = "An unexpected error occurred.", onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 rounded-full bg-red-500/10 p-6">
        <AlertOctagon className="h-16 w-16 text-red-500" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">Something went wrong</h2>
      <p className="mb-8 max-w-md text-zinc-400">{message}</p>
      
      {onRetry && (
        <Button 
          onClick={onRetry} 
          className="gap-2 bg-white text-zinc-950 hover:bg-zinc-200"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function InlineError({ message = "Failed to load data.", onRetry }: ErrorDisplayProps) {
  return (
    <Card className="flex flex-col items-center justify-center border-red-500/20 bg-red-500/5 p-6 text-center">
      <AlertOctagon className="mb-3 h-8 w-8 text-red-400" />
      <p className="mb-4 text-sm text-red-200">{message}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <RotateCcw className="mr-2 h-3 w-3" />
          Retry
        </Button>
      )}
    </Card>
  );
}
