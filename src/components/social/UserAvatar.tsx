"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, User as UserIcon } from "lucide-react";
import { SocialUser } from "@/lib/types";
import { getUserProfile } from "@/lib/firebase/firestore";
import { getUsernameColor } from "@/lib/utils/usernameValidator";
import { useStories } from "@/lib/hooks/useStories";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  userId?: string;
  user?: SocialUser | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showVerified?: boolean;
  showStoryRing?: boolean;
  clickable?: boolean;
  showUsername?: boolean;
  showBadge?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
};

export function UserAvatar({
  userId,
  user: initialUser,
  size = "md",
  showVerified = false,
  showStoryRing = false,
  clickable = true,
  showUsername = false,
  showBadge = false,
  className,
}: UserAvatarProps) {
  const [user, setUser] = useState<SocialUser | null>(initialUser as SocialUser || null);
  const [loading, setLoading] = useState(!initialUser && !!userId);
  const { user: currentUser } = useAuthStore();
  const { myStories } = useStories();

  useEffect(() => {
    if (!initialUser && userId) {
      setLoading(true);
      getUserProfile(userId).then(data => {
        setUser(data as SocialUser);
        setLoading(false);
      });
    } else if (initialUser) {
      setUser(initialUser as SocialUser);
    }
  }, [userId, initialUser]);

  const hasActiveStories = showStoryRing && myStories.length > 0;
  const hasUnviewedStories = hasActiveStories && myStories.some(s => !s.viewedBy.includes(currentUser?.id || ''));

  const content = (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn(
        "relative flex-shrink-0 rounded-full flex items-center justify-center font-bold text-white uppercase transition-all",
        sizeClasses[size],
        hasActiveStories && "p-[2px]",
        hasUnviewedStories ? "bg-gradient-to-br from-blue-500 to-violet-600" : (hasActiveStories ? "bg-zinc-600" : "")
      )}>
        <div 
          className="relative w-full h-full rounded-full overflow-hidden border-2 border-zinc-900 flex items-center justify-center"
          style={{ backgroundColor: !user?.photoURL ? getUsernameColor(user?.username || user?.displayName || "u") : undefined }}
        >
          {loading ? (
            <div className="w-full h-full bg-zinc-800 animate-pulse" />
          ) : user?.photoURL ? (
            <Image 
              src={user.photoURL} 
              alt={user.displayName || "User avatar"} 
              fill 
              className="object-cover" 
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <span className="drop-shadow-md">{user?.displayName?.charAt(0) || user?.username?.charAt(0) || "U"}</span>
          )}
        </div>

        {/* Verified Badge */}
        {showVerified && user?.isVerified && !loading && (
          <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5">
            <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20" />
          </div>
        )}
      </div>

      {showUsername && user && !loading && (
        <div className="mt-2 text-center">
          <p className="text-sm font-semibold text-white line-clamp-1">{user.displayName}</p>
          <p className="text-xs text-zinc-500 line-clamp-1">@{user.username || 'user'}</p>
        </div>
      )}
    </div>
  );

  if (clickable && user?.username && !loading) {
    return (
      <Link href={`/profile/${user.username}`} className="group hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
