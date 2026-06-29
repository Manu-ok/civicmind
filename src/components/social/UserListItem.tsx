"use client";
import Image from "next/image";

import { SocialUser } from "@/lib/types";
import { FollowButton } from "./FollowButton";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";

interface UserListItemProps {
  user: SocialUser;
  mutualCount?: number;
}

export function UserListItem({ user, mutualCount }: UserListItemProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();

  const isCurrentUser = currentUser?.id === user.id;

  return (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-white dark:bg-zinc-900/80 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-white/5"
      onClick={() => router.push(`/profile/${user.username}`)}
    >
      <div className="relative shrink-0 w-11 h-11 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-white/10">
        {user.photoURL ? (
          <Image fill src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 dark:text-zinc-500">
            {user.displayName.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white truncate text-sm">{user.displayName}</span>
          {user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
        </div>
        <div className="text-xs text-slate-500 dark:text-zinc-500 truncate">@{user.username}</div>
        
        {user.bio && (
          <div className="text-[13px] text-slate-500 dark:text-zinc-400 truncate mt-1">{user.bio}</div>
        )}
        
        {mutualCount && mutualCount > 0 && (
          <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-zinc-600" /> Followed by {mutualCount} mutual
          </div>
        )}
      </div>

      {!isCurrentUser && (
        <div className="shrink-0 ml-3" onClick={e => e.stopPropagation()}>
          <FollowButton targetUserId={user.id} targetUsername={user.username || ''} size="sm" />
        </div>
      )}
    </div>
  );
}
