"use client";
import Image from "next/image";

import { SocialUser } from "@/lib/types";
import { FollowButton } from "./FollowButton";
import { CheckCircle2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { getUsernameColor } from "@/lib/utils/usernameValidator";

export function UserCard({ user }: { user: SocialUser }) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  
  const isCurrentUser = currentUser?.id === user.id;
  const gradient = getUsernameColor(user.username || "user");

  return (
    <div 
      onClick={() => router.push(`/profile/${user.username}`)}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:border-zinc-700 rounded-xl overflow-hidden transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 cursor-pointer group shadow-lg flex flex-col"
    >
      <div className="h-20 w-full opacity-80 group-hover:opacity-100 transition-opacity relative">
        {user.coverPhotoURL ? (
          <Image fill src={user.coverPhotoURL} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: gradient }} />
        )}
      </div>
      
      <div className="p-5 pt-0 relative flex flex-col flex-1">
        <div className="flex justify-between items-end mb-3 -mt-10">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-zinc-900 bg-slate-100 dark:bg-zinc-800 shrink-0">
            {user.photoURL ? (
              <Image fill src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-slate-500 dark:text-zinc-500">
                {user.displayName.charAt(0)}
              </div>
            )}
          </div>
          
          {!isCurrentUser && (
            <div onClick={e => e.stopPropagation()} className="mb-2">
              <FollowButton targetUserId={user.id} targetUsername={user.username || ''} size="md" />
            </div>
          )}
        </div>
        
        <div className="mb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white truncate text-lg tracking-tight">{user.displayName}</span>
            {user.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-zinc-500 truncate">@{user.username}</div>
        </div>
        
        <div className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2 min-h-[40px] flex-1 leading-relaxed">
          {user.bio || "Active citizen in the community."}
        </div>
        
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-zinc-500">
          <div className="flex items-center gap-1.5 truncate">
            {(user.city || user.ward) && (
              <>
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{user.ward ? `${user.ward}, ` : ''}{user.city}</span>
              </>
            )}
          </div>
          <div className="shrink-0 text-slate-500 dark:text-zinc-400">
            <strong className="text-white">{user.followersCount || 0}</strong> followers
          </div>
        </div>
      </div>
    </div>
  );
}
