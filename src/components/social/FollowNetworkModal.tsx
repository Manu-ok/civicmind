"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2, Users } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { useFollowList } from "@/lib/hooks/useFollowList";
import { UserListItem } from "./UserListItem";
import { cn } from "@/lib/utils";

interface FollowNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: "followers" | "following";
}

export function FollowNetworkModal({ isOpen, onClose, userId, initialTab = "followers" }: FollowNetworkModalProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const followersData = useFollowList(userId, "followers");
  const followingData = useFollowList(userId, "following");

  const currentData = activeTab === "followers" ? followersData : followingData;
  const filteredUsers = currentData.users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const Content = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900/80 backdrop-blur-md">
        <h2 className="text-lg font-semibold text-white flex-1 text-center">{activeTab === "followers" ? "Followers" : "Following"}</h2>
        <button onClick={onClose} className="absolute right-4 p-2 rounded-full hover:bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-white transition-colors duration-200 ease-in-out min-h-[44px] min-w-[44px] flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
        {["followers", "following"].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as any);
              setSearchQuery("");
            }}
            className={cn(
              "flex-1 py-3.5 text-sm font-semibold capitalize transition-colors duration-200 ease-in-out relative min-h-[44px]",
              activeTab === tab ? "text-white" : "text-slate-500 dark:text-zinc-500 hover:text-slate-600 dark:text-zinc-300"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="followTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-4 shrink-0 bg-white dark:bg-zinc-900">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-zinc-500" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder:text-slate-500 dark:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-100 dark:bg-zinc-800/80 transition-all duration-200 ease-in-out shadow-inner min-h-[44px]"
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar bg-white dark:bg-zinc-900">
        {currentData.loading && currentData.users.length === 0 ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-1 px-2">
            {filteredUsers.map(user => (
              <UserListItem key={user.id} user={user} />
            ))}
            
            {currentData.hasMore && (
              <button 
                onClick={currentData.loadMore}
                disabled={currentData.loading}
                className="w-full py-4 mt-2 text-xs font-bold text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors flex items-center justify-center"
              >
                {currentData.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More"}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
              {searchQuery ? <Search className="w-6 h-6 text-zinc-600" /> : <Users className="w-6 h-6 text-zinc-600" />}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {searchQuery ? "No matches found" : activeTab === "followers" ? "No followers yet" : "Not following anyone"}
            </h3>
            <p className="text-slate-500 dark:text-zinc-500 text-sm max-w-[250px]">
              {searchQuery 
                ? `We couldn't find anyone matching "${searchQuery}".` 
                : activeTab === "followers" 
                  ? "Share your profile to grow your network and community presence." 
                  : "Explore the feed to find active citizens in your area."}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-[400px] bg-slate-50 dark:bg-zinc-950 border-white/10 p-0 overflow-hidden h-[600px] flex flex-col">
            {Content}
          </DialogContent>
        </Dialog>
      </div>
      <div className="md:hidden">
        <BottomSheet isOpen={isOpen} onClose={onClose}>
          {Content}
        </BottomSheet>
      </div>
    </>
  );
}
