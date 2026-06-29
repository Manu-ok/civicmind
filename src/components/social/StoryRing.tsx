"use client";
import Image from "next/image";

import { SocialUser } from "@/lib/types";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface StoryRingProps {
  user?: Partial<SocialUser>;
  hasUnviewed?: boolean;
  isAdd?: boolean;
  size?: "sm" | "md" | "lg";
  showUsername?: boolean;
  onClick?: () => void;
}

export function StoryRing({ 
  user, 
  hasUnviewed = false, 
  isAdd = false, 
  size = "md", 
  showUsername = true,
  onClick 
}: StoryRingProps) {
  
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20"
  };

  return (
    <motion.div 
      className="flex flex-col items-center gap-1.5 cursor-pointer group" 
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`relative rounded-full ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Animated Gradient Ring */}
        {!isAdd && (
          <motion.div 
            className="absolute inset-0 rounded-full"
            initial={false}
            animate={{
              background: hasUnviewed 
                ? "conic-gradient(from 0deg, #2563eb, #7c3aed, #2563eb)"
                : "conic-gradient(from 0deg, #3f3f46, #3f3f46)",
              rotate: hasUnviewed ? 360 : 0
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              background: { duration: 0.5, ease: "easeInOut" }
            }}
            style={{ padding: "2.5px" }}
          >
            {/* Inner background cut-out for ring effect */}
            <div className="w-full h-full rounded-full bg-background" />
          </motion.div>
        )}

        {/* Static add button ring */}
        {isAdd && (
          <div className="absolute inset-0 rounded-full bg-slate-100 dark:bg-zinc-800 p-[2px]">
            <div className="w-full h-full rounded-full bg-background" />
          </div>
        )}

        {/* Avatar Image (Static, not rotating) */}
        <div className="absolute inset-[2.5px] rounded-full overflow-hidden border-2 border-background bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
          {user?.photoURL ? (
            <Image fill src={user.photoURL} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-slate-500 dark:text-zinc-500">
              {user?.displayName?.charAt(0) || "U"}
            </span>
          )}
        </div>
        
        {/* Add icon badge */}
        {isAdd && (
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-blue-500 border-2 border-background rounded-full flex items-center justify-center z-10"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4 text-white" />
          </motion.div>
        )}
      </div>

      {showUsername && (
        <span className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-zinc-400 w-16 truncate text-center group-hover:text-white transition-colors duration-200 ease-in-out">
          {isAdd ? "Add Story" : user?.username}
        </span>
      )}
    </motion.div>
  );
}
