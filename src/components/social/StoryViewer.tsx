"use client";
import Image from "next/image";

import { useState, useEffect, useRef } from "react";
import { StoryGroup } from "@/lib/hooks/useStories";
import { Story } from "@/lib/types";
import { X, MoreHorizontal, Heart, MessageCircle, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
  onMarkViewed: (storyId: string) => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export function StoryViewer({ groups, initialGroupIndex, onClose, onMarkViewed }: StoryViewerProps) {
  const router = useRouter();
  
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  // Auto-advance logic
  useEffect(() => {
    if (!currentStory) return;
    
    // Mark as viewed as soon as it appears
    onMarkViewed(currentStory.id);
    
    if (isPaused) return;

    setProgress(0);
    const startTime = Date.now();
    let animationFrame: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STORY_DURATION) * 100;
      
      if (newProgress < 100) {
        setProgress(newProgress);
        animationFrame = requestAnimationFrame(animate);
      } else {
        handleNext();
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [groupIndex, storyIndex, isPaused, currentStory]);

  const handleNext = () => {
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(prev => prev + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(prev => prev + 1);
      setStoryIndex(0);
    } else {
      onClose(); // Reached the end
    }
  };

  const handlePrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(prev => prev - 1);
      setStoryIndex(groups[groupIndex - 1].stories.length - 1);
    } else {
      setProgress(0); // Reset current story if at very beginning
    }
  };

  if (!currentGroup || !currentStory) return null;

  const timeAgo = currentStory.createdAt 
    ? formatDistanceToNow(new Date((currentStory.createdAt as any).seconds ? (currentStory.createdAt as any).toDate() : currentStory.createdAt), { addSuffix: true })
    : "Just now";

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center sm:p-4"
      >
        <div className="relative w-full max-w-[400px] h-full sm:h-[800px] sm:max-h-[90vh] bg-white dark:bg-zinc-900 sm:rounded-xl sm:border sm:border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xl flex flex-col">
          
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-3">
            {currentGroup.stories.map((s, i) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all ease-linear"
                  style={{ 
                    width: i === storyIndex ? `${progress}%` : i < storyIndex ? "100%" : "0%"
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-white/20">
                {currentGroup.user.photoURL ? (
                  <Image fill src={currentGroup.user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs">{currentGroup.user.displayName.charAt(0)}</div>
                )}
              </div>
              <div className="flex flex-col drop-shadow-md">
                <div className="flex items-center gap-1 font-semibold text-white text-sm">
                  {currentGroup.user.displayName} {currentGroup.user.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                </div>
                <div className="text-xs text-white/80">{timeAgo}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-white hover:text-white/80"><MoreHorizontal className="w-5 h-5" /></button>
              <button className="text-white hover:text-white/80" onClick={onClose}><X className="w-6 h-6" /></button>
            </div>
          </div>

          {/* Touch Zones & Swipe */}
          <motion.div 
            className="absolute inset-0 z-10 flex"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            dragTransition={{ bounceStiffness: 400, bounceDamping: 25 }}
            onDragEnd={(e, info) => {
              if (info.offset.x < -50) {
                handleNext();
              } else if (info.offset.x > 50) {
                handlePrev();
              }
            }}
          >
            <div className="w-1/3 h-full touch-none" onClick={handlePrev} />
            <div className="w-2/3 h-full touch-none" onClick={handleNext} 
                 onPointerDown={() => setIsPaused(true)} 
                 onPointerUp={() => setIsPaused(false)}
                 onPointerLeave={() => setIsPaused(false)}
            />
          </motion.div>

          {/* Content */}
          <div className="relative flex-1 bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
            {currentStory.mediaUrl ? (
               <Image fill src={currentStory.mediaUrl} alt="" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-violet-900 p-8 text-center">
                 {currentStory.type === "resolved" && <CheckCircle2 className="w-24 h-24 text-green-500 mb-6 mx-auto opacity-80" />}
                 {currentStory.type === "update" && <AlertTriangle className="w-24 h-24 text-orange-500 mb-6 mx-auto opacity-80" />}
               </div>
            )}

            {/* Overlays */}
            {currentStory.type === "resolved" && (
              <div className="absolute top-1/4 left-0 right-0 text-center z-10 animate-bounce">
                <span className="bg-green-500 text-white font-black px-6 py-2 rounded-full text-xl shadow-2xl uppercase tracking-widest border-2 border-white/20">
                  Resolved!
                </span>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-20 z-20">
              <p className="text-white text-lg font-medium drop-shadow-md mb-4">{currentStory.caption}</p>
              
              {currentStory.issueId && (
                <button 
                  onClick={(e) => { e.stopPropagation(); router.push(`/issues/${currentStory.issueId}`); onClose(); }}
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-3 rounded-xl flex items-center justify-between transition-colors duration-200 ease-in-out z-30 min-h-[44px]"
                >
                  <span className="font-semibold flex items-center gap-2">🔗 View Related Issue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Footer */}
          <div className="absolute bottom-0 left-0 right-0 z-30 p-4 flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Send message..." 
              className="flex-1 bg-transparent border border-white/30 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-white/60 placeholder-white/50 backdrop-blur-md min-h-[44px]"
              onClick={e => e.stopPropagation()}
            />
            <button className="p-2 text-white hover:text-red-500 transition-colors duration-200 ease-in-out min-h-[44px] flex items-center justify-center" onClick={e => e.stopPropagation()}><Heart className="w-6 h-6" /></button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
