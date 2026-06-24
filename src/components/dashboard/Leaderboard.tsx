"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User } from "@/lib/types";
import { getBadgeForPoints } from "@/lib/firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, ShieldAlert, CheckCircle2, Leaf } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import Image from "next/image";
import Link from "next/link";
import { UserAvatar } from "@/components/social/UserAvatar";
import { FollowButton } from "@/components/social/FollowButton";
import { Users } from "lucide-react";

export function Leaderboard() {
  const { user: currentUser } = useAuthStore();
  const [leaders, setLeaders] = useState<User[]>([]);

  useEffect(() => {
    // Only subscribe to the top 10 users globally
    const q = query(
      collection(db, "users"),
      orderBy("points", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setLeaders(users);
    });

    return () => unsubscribe();
  }, []);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return <Trophy className="w-4 h-4 text-white" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-white" />;
      case 'Star': return <Star className="w-4 h-4 text-white" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-4 h-4 text-white" />;
      default: return <Leaf className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-white/[0.04] rounded-xl p-6 flex flex-col h-[500px]">
      <h2 className="text-h3 text-zinc-100 mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Civic Leaderboard
      </h2>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
        <AnimatePresence>
          <ul className="space-y-3 relative">
            {leaders.map((leader, index) => {
              const isCurrentUser = leader.id === currentUser?.id;
              const badge = getBadgeForPoints(leader.points || 0);

              return (
                <motion.li
                  key={leader.id || leader.email || index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30 
                  }}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                    isCurrentUser 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : 'bg-zinc-800/30 border-transparent hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 text-center font-bold text-zinc-500">
                    #{index + 1}
                  </div>
                  
                  <div className="relative">
                    <UserAvatar user={leader as any} size="md" clickable={true} showStoryRing={false} />
                    {index < 3 && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Trophy className={`w-5 h-5 ${
                          index === 0 ? 'text-yellow-400' : 
                          index === 1 ? 'text-zinc-300' : 'text-amber-600'
                        }`} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link href={`/profile/${leader.username || 'user'}`} className="text-sm font-semibold text-zinc-100 truncate hover:underline">
                      {leader.displayName} {isCurrentUser && "(You)"}
                    </Link>
                    {leader.username && (
                      <span className="text-xs text-zinc-500 truncate">@{leader.username}</span>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r ${badge.color}`}>
                        {getBadgeIcon(badge.icon)}
                        {badge.name}
                      </span>
                      {!isCurrentUser && (leader as any).followersCount !== undefined && (
                        <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {(leader as any).followersCount} followers
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <motion.div 
                        key={leader.points}
                        initial={{ scale: 1.5, color: '#4ade80' }}
                        animate={{ scale: 1, color: '#f4f4f5' }}
                        className="text-lg font-bold"
                      >
                        {leader.points || 0}
                      </motion.div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Points</p>
                    </div>
                    {!isCurrentUser && (
                      <div className="ml-2">
                        <FollowButton targetUserId={leader.id} targetUsername={leader.username || "user"} size="sm" variant="outline" showIcon={false} />
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </AnimatePresence>
        
        {leaders.length === 0 && (
          <div className="text-center text-zinc-500 mt-10">No leaders yet...</div>
        )}
      </div>
    </div>
  );
}
