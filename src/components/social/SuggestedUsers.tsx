"use client";

import { useState, useEffect } from "react";
import { SocialUser } from "@/lib/types";
import { getSuggestedUsers } from "@/lib/firebase/social";
import { useAuthStore } from "@/lib/stores/authStore";
import { FollowButton } from "./FollowButton";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SuggestedUsers() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSuggestions = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const suggestions = await getSuggestedUsers(user.id, user.city || '', user.ward || '');
      // In a real app we'd shuffle or paginate
      setUsers(suggestions.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [user]);

  if (loading && users.length === 0) {
    return (
      <div className="bg-zinc-950 border border-white/5 rounded-3xl p-5 animate-pulse">
        <div className="h-5 bg-zinc-900 rounded w-1/2 mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-zinc-900 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-zinc-900 rounded w-3/4" />
              <div className="h-3 bg-zinc-900 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="bg-zinc-950 border border-white/5 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" /> People You May Know
        </h3>
        <button 
          onClick={loadSuggestions} 
          disabled={refreshing}
          className="p-1 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-500" : ""}`} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {users.map(u => (
            <motion.div 
              key={u.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-between group cursor-pointer"
              onClick={() => router.push(`/profile/${u.username}`)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                <div className="relative w-10 h-10 rounded-full bg-zinc-900 shrink-0 overflow-hidden border border-white/5">
                  {u.photoURL ? (
                    <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500 text-sm">
                      {u.displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate flex items-center gap-1 group-hover:underline">
                    {u.displayName} {u.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">@{u.username}</div>
                  {u.followersCount > 0 && (
                    <div className="text-[10px] text-zinc-600 font-medium mt-0.5">
                      {u.followersCount} followers
                    </div>
                  )}
                </div>
              </div>
              <div className="shrink-0" onClick={e => e.stopPropagation()}>
                <FollowButton targetUserId={u.id} targetUsername={u.username} size="sm" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button 
        onClick={() => router.push('/explore?tab=people')}
        className="w-full mt-4 py-2 text-sm font-bold text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors"
      >
        See more
      </button>
    </div>
  );
}
