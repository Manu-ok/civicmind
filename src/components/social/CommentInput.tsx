"use client";
import Image from "next/image";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { MentionInput } from "./MentionInput";
import { Send, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJIS = ["👍", "❤️", "🔥", "😂", "😢", "👏", "🙌", "🤔", "👀", "✨"];

interface CommentInputProps {
  onSubmit: (content: string, mentions: string[], mentionUsernames: string[]) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentInput({ onSubmit, placeholder = "Share your thoughts... Use @ to mention", autoFocus }: CommentInputProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Basic extraction of mentions (e.g. @username)
      const mentionMatches = content.match(/@(\w+)/g) || [];
      const mentionUsernames = mentionMatches.map(m => m.substring(1));
      
      await onSubmit(content, [], mentionUsernames);
      setContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojis(false);
  };

  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 shrink-0 overflow-hidden border border-white/5 hidden sm:block">
        {user?.photoURL ? (
          <Image fill src={user.photoURL} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 dark:text-zinc-500">
            {user?.displayName?.charAt(0) || "U"}
          </div>
        )}
      </div>
      
      <div className="flex-1 relative">
        <MentionInput 
          value={content}
          onChange={setContent}
          onSubmit={handleSubmit}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
        
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <div className="relative">
            <button 
              className="p-1.5 text-slate-500 dark:text-zinc-500 hover:text-white hover:bg-slate-100 dark:bg-zinc-800 rounded-lg transition-colors"
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <Smile className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showEmojis && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 bg-slate-100 dark:bg-zinc-800 border border-white/10 rounded-xl p-2 shadow-2xl grid grid-cols-5 gap-1 z-10"
                >
                  {EMOJIS.map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded text-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button 
            className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
              content.trim() && !isSubmitting ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
