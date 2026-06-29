"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useFollow } from "@/lib/hooks/useFollow";
import { UserPlus, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FollowButtonProps {
  targetUserId: string;
  targetUsername: string;
  initialIsFollowing?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "minimal";
  showIcon?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
}

// Sparkle Particle Animation
const Sparkles = ({ active }: { active: boolean }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 4 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40 - 20,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5,
              x: p.x,
              y: p.y,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export function FollowButton({
  targetUserId,
  targetUsername,
  initialIsFollowing,
  size = "md",
  variant = "default",
  showIcon = false,
  onFollowChange,
  className
}: FollowButtonProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const { isFollowing: remoteIsFollowing, toggleFollow } = useFollow(targetUserId, initialIsFollowing);
  
  const [localIsFollowing, setLocalIsFollowing] = useState(initialIsFollowing ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [justFollowed, setJustFollowed] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLocalIsFollowing(remoteIsFollowing);
    }
  }, [remoteIsFollowing, isLoading]);

  if (user?.id === targetUserId) {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    if (isLoading) return;

    const previous = localIsFollowing;
    setLocalIsFollowing(!previous); // Optimistic
    setIsLoading(true);

    if (!previous) {
      setJustFollowed(true);
      setTimeout(() => setJustFollowed(false), 1000);
    }

    try {
      const newState = await toggleFollow();
      if (newState !== undefined && onFollowChange) {
        onFollowChange(newState);
      }
    } catch {
      setLocalIsFollowing(previous); // Revert
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "min-h-[44px] text-xs px-3",
    md: "min-h-[44px] text-sm px-4",
    lg: "min-h-[44px] text-base px-6",
  };

  const isUnfollowHoverState = localIsFollowing && isHovered;

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: justFollowed ? [1, 0.95, 1.05, 1] : 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative rounded-full font-semibold inline-flex items-center justify-center transition-all duration-200 ease-in-out overflow-hidden",
        sizeClasses[size],
        
        // Not following
        !localIsFollowing && variant === "default" && "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-md shadow-blue-900/20",
        !localIsFollowing && variant === "outline" && "bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",
        !localIsFollowing && variant === "minimal" && "bg-transparent text-blue-500 hover:bg-blue-500/10",
        
        // Following (Normal)
        localIsFollowing && !isUnfollowHoverState && "bg-slate-100 dark:bg-zinc-800 text-white hover:bg-slate-200 dark:bg-zinc-700",
        
        // Following (Hover - Unfollow Intent)
        isUnfollowHoverState && "bg-slate-100 dark:bg-zinc-800 text-red-500 hover:bg-slate-200 dark:bg-zinc-700",

        isLoading && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      <Sparkles active={justFollowed} />

      {/* Animated Background for sliding gradient */}
      <AnimatePresence>
        {!localIsFollowing && variant === "default" && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 z-0"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-center justify-center min-w-[80px]">
        {isLoading ? (
          <Loader2 className="animate-spin absolute w-4 h-4" />
        ) : (
          <AnimatePresence mode="wait">
            {localIsFollowing ? (
              <motion.div
                key="following"
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5"
              >
                {isUnfollowHoverState ? (
                  <>
                    {showIcon && <X className="w-4 h-4" />}
                    <span>Unfollow</span>
                  </>
                ) : (
                  <>
                    {showIcon && <Check className="w-4 h-4" />}
                    <span>Following</span>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="follow"
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5"
              >
                {showIcon && <UserPlus className="w-4 h-4" />}
                <span>Follow</span>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.button>
  );
}
