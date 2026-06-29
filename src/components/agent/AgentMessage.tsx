"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import { Brain, Copy, ExternalLink, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentMessage as AgentMessageType } from "@/lib/types";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface AgentMessageProps {
  message: AgentMessageType;
}

export function AgentMessage({ message }: AgentMessageProps) {
  const router = useRouter();
  const isAssistant = message.role === "assistant";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  };

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => {
      handleCopy();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50); // haptic feedback
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Basic Markdown Parser
  const parsedContent = useMemo(() => {
    if (!isAssistant) return message.content;

    const blocks = message.content.split('\n\n');
    return blocks.map((block, i) => {
      // Check if list
      if (block.match(/^(\d+\.|-|\*)\s/m)) {
        const items = block.split('\n').map(line => line.replace(/^(\d+\.|-|\*)\s/, ''));
        return (
          <ul key={i} className="list-disc list-inside space-y-1 mb-4 text-slate-600 dark:text-zinc-300">
            {items.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            ))}
          </ul>
        );
      }
      
      // Default Paragraph
      return (
        <p key={i} className="mb-4 text-slate-600 dark:text-zinc-300 leading-relaxed">
          {parseInlineToNodes(block, router)}
        </p>
      );
    });
  }, [message.content, isAssistant, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full group", isAssistant ? "justify-start" : "justify-end")}
    >
      <div className={cn("flex max-w-[85%] sm:max-w-[75%] gap-4", isAssistant ? "flex-row" : "flex-row-reverse")}>
        
        {/* Avatar */}
        {isAssistant && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shrink-0 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full rounded-full bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        )}

        {/* Bubble */}
        <div className="flex flex-col relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}>
          <div
            className={cn(
              "px-5 py-4 rounded-2xl",
              isAssistant
                ? "bg-white dark:bg-zinc-900 border border-white/5 rounded-tl-sm shadow-xl"
                : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-blue-500/20"
            )}
          >
            {isAssistant ? (
              <div className="text-sm prose prose-invert max-w-none">
                {parsedContent}
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            )}
          </div>

          {/* Timestamp & Actions */}
          <div className={cn(
            "flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isAssistant ? "justify-start ml-2" : "justify-end mr-2"
          )}>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500">
              {format((message.timestamp as any)?.toDate ? (message.timestamp as any).toDate() : new Date(message.timestamp as any || Date.now()), 'h:mm a')}
            </span>
            {isAssistant && (
              <button onClick={handleCopy} className="text-slate-500 dark:text-zinc-500 hover:text-white transition-colors">
                <Copy className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helpers for basic markdown parsing
function parseInline(text: string) {
  let html = text;
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
  return html;
}

function parseInlineToNodes(text: string, router: any) {
  // Split by double quotes to find potential issue references
  // E.g., "Pothole on Main St"
  const parts = text.split(/(".*?")/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('"') && part.endsWith('"') && part.length > 2) {
      const issueTitle = part.slice(1, -1);
      // We render a mini inline card for the issue
      return (
        <span 
          key={index} 
          onClick={() => router.push('/issues')} 
          className="inline-flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-2.5 py-0.5 rounded-md cursor-pointer transition-colors mx-1 group/link"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-blue-400 font-medium group-hover/link:text-blue-300">{issueTitle}</span>
          <ExternalLink className="w-3 h-3 text-blue-500" />
        </span>
      );
    }

    // Process bold text inside normal string
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bp, j) => {
      if (bp.startsWith('**') && bp.endsWith('**')) {
        return <strong key={`${index}-${j}`} className="text-white font-bold">{bp.slice(2, -2)}</strong>;
      }
      return <span key={`${index}-${j}`}>{bp}</span>;
    });
  });
}
