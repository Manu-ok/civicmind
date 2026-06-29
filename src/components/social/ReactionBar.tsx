"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactionType, CommentReactions } from "@/lib/types";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { FlipCounter } from "@/components/shared/FlipCounter";
import { hapticFeedback } from "@/lib/utils/haptics";

const REACTIONS = [
  { emoji: "❤️", label: "heart" as ReactionType, meaning: "This matters to me", color: "text-red-500", ring: "ring-red-500/50" },
  { emoji: "🔥", label: "fire" as ReactionType, meaning: "Urgent!", color: "text-orange-500", ring: "ring-orange-500/50" },
  { emoji: "👍", label: "thumbsUp" as ReactionType, meaning: "I've seen this too", color: "text-blue-500", ring: "ring-blue-500/50" },
  { emoji: "😢", label: "sad" as ReactionType, meaning: "This is unfortunate", color: "text-blue-400", ring: "ring-blue-400/50" },
  { emoji: "👏", label: "clap" as ReactionType, meaning: "Good report!", color: "text-yellow-500", ring: "ring-yellow-500/50" },
  { emoji: "😡", label: "angry" as ReactionType, meaning: "Needs immediate attention", color: "text-red-600", ring: "ring-red-600/50" }
];

interface ReactionBarProps {
  type: "issue" | "comment";
  issueId: string;
  commentId?: string;
  currentReaction: ReactionType | null;
  reactionCounts: CommentReactions;
  onReact: (reaction: ReactionType | null) => void;
  compact?: boolean;
}

export function ReactionBar({ type, issueId, commentId, currentReaction, reactionCounts, onReact, compact = false }: ReactionBarProps) {
  const [showDesktopPicker, setShowDesktopPicker] = useState(false);
  const [showMobilePicker, setShowMobilePicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowDesktopPicker(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDesktopPicker(false);
      setHoveredReaction(null);
    }, 300);
  };

  const activeReactions = Object.entries(reactionCounts || {})
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const totalCount = activeReactions.reduce((sum, [_, count]) => sum + count, 0);

  const handleMainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback.light();
    
    if (currentReaction) {
      onReact(currentReaction); 
      return;
    }
    
    if (activeReactions.length > 0) {
      onReact(activeReactions[0][0] as ReactionType);
    } else {
      onReact("heart");
    }
  };

  const handleLongPressStart = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return;
    pressTimerRef.current = setTimeout(() => {
      hapticFeedback.medium();
      setShowMobilePicker(true);
    }, 400); // 400ms long press
  };

  const handleLongPressEnd = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
  };

  const handleEmojiClick = (e: React.MouseEvent, reaction: ReactionType) => {
    e.stopPropagation();
    hapticFeedback.reaction();
    onReact(reaction);
    setShowDesktopPicker(false);
    setShowMobilePicker(false);
  };

  return (
    <div 
      className={`relative flex items-center gap-3 ${compact ? 'scale-90 origin-left' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* Desktop Picker (Floating Pill) */}
      <AnimatePresence>
        {showDesktopPicker && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className={`hidden md:flex absolute z-30 bottom-full ${compact ? 'left-0' : '-left-2'} mb-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-1.5 items-center gap-1`}
            onClick={e => e.stopPropagation()}
          >
            {REACTIONS.map(reaction => {
              const isSelected = currentReaction === reaction.label;
              return (
                <div key={reaction.label} className="relative flex flex-col items-center">
                  <AnimatePresence>
                    {hoveredReaction === reaction.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full mb-2 bg-black/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap z-40 border border-slate-200 dark:border-zinc-800"
                      >
                        {reaction.meaning}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.button 
                    onMouseEnter={() => setHoveredReaction(reaction.label)}
                    onMouseLeave={() => setHoveredReaction(null)}
                    onClick={(e) => handleEmojiClick(e, reaction.label)}
                    animate={{ 
                      scale: isSelected ? 1.5 : 1,
                      opacity: currentReaction && !isSelected ? 0.4 : 1
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-11 h-11 text-2xl flex items-center justify-center rounded-xl hover:bg-slate-100 dark:bg-zinc-800 origin-bottom transition-colors duration-200 ease-in-out ${
                      isSelected ? `bg-slate-100 dark:bg-zinc-800 ring-2 ${reaction.ring}` : ""
                    }`}
                  >
                    {reaction.emoji}
                  </motion.button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Picker (Bottom Sheet) */}
      <div className="md:hidden">
        <BottomSheet isOpen={showMobilePicker} onClose={() => setShowMobilePicker(false)}>
          <div className="px-2 pt-2 pb-6">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-6 text-center">Select Reaction</h3>
            <div className="grid grid-cols-3 gap-6 place-items-center">
              {REACTIONS.map(reaction => {
                const isSelected = currentReaction === reaction.label;
                return (
                  <motion.button 
                    key={reaction.label}
                    onClick={(e) => handleEmojiClick(e, reaction.label)}
                    animate={{ 
                      scale: isSelected ? 1.2 : 1,
                      opacity: currentReaction && !isSelected ? 0.4 : 1
                    }}
                    className={`flex flex-col items-center gap-2 w-full p-4 rounded-2xl transition-colors duration-200 ease-in-out ${
                      isSelected ? `bg-slate-100 dark:bg-zinc-800 ring-2 ${reaction.ring}` : "hover:bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <span className="text-4xl">{reaction.emoji}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? reaction.color : 'text-slate-500 dark:text-zinc-500'}`}>
                      {reaction.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </BottomSheet>
      </div>

      {/* Main Display Area */}
      <div 
        className="flex items-center gap-2 cursor-pointer group min-h-[44px] touch-manipulation select-none"
        onClick={handleMainClick}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchMove={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
      >
        {activeReactions.length === 0 ? (
          <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity px-2">
            <span className="text-xl grayscale group-hover:grayscale-0 transition-all">❤️</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-500 group-hover:text-slate-600 dark:text-zinc-300">React</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full px-4 py-2 group-hover:bg-slate-100 dark:bg-zinc-800 transition-colors duration-200 ease-in-out">
            <div className="flex items-center -space-x-1 mr-1">
              {activeReactions.slice(0, 3).map(([key, _], i) => {
                const r = REACTIONS.find(x => x.label === key);
                return r && (
                  <motion.div 
                    key={key}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative z-10 w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 rounded-full border-2 border-zinc-900 text-sm"
                    style={{ zIndex: 10 - i }}
                  >
                    {r.emoji}
                  </motion.div>
                );
              })}
            </div>
            
            <FlipCounter 
              value={totalCount} 
              className={`text-xs font-semibold ${currentReaction ? REACTIONS.find(r => r.label === currentReaction)?.color : "text-slate-500 dark:text-zinc-400"}`}
            />
          </div>
        )}
      </div>

    </div>
  );
}
