"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";
import { useFeed } from "@/lib/hooks/useFeed";
import { getActiveStoriesForFeed } from "@/lib/firebase/social";
import { useStories } from "@/lib/hooks/useStories";
import { StoryRing } from "@/components/social/StoryRing";
import dynamic from "next/dynamic";
const StoryViewer = dynamic(() => import('@/components/social/StoryViewer').then(mod => mod.StoryViewer), { ssr: false });
const StoryCreator = dynamic(() => import('@/components/social/StoryCreator').then(mod => mod.StoryCreator), { ssr: false });
import { FeedList } from "@/components/social/FeedList";
import { SocialUser, Story } from "@/lib/types";
import { useRouter } from "next/navigation";
import { 
  Zap, Plus, ChevronUp, Loader2, Filter, Hash, CircleDashed, Users, Activity, MapPin, CheckCircle2 
} from "lucide-react";

type TabType = "for-you" | "following" | "ward" | "city";

export default function FeedPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>("for-you");
  const { items, loading, hasMore, loadMore, newItemCount, markAllRead } = useFeed(activeTab);
  
  const { storyGroups, myStories, loading: storiesLoading, createStory, markStoryViewed } = useStories();
  
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [activeViewerIndex, setActiveViewerIndex] = useState<number | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    markAllRead();
  };

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-6 pb-24 md:pb-12 max-w-7xl mx-auto px-4 md:px-6">
      
      {/* NEW ITEMS PILL */}
      <AnimatePresence>
        {newItemCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
          >
            <button 
              onClick={scrollToTop}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-colors"
            >
              <ChevronUp className="w-4 h-4" /> {newItemCount} new {newItemCount === 1 ? 'update' : 'updates'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8 relative">
        
        {/* ── LEFT COLUMN (Sticky Navigation) ── */}
        <div className="hidden lg:flex flex-col w-[240px] shrink-0 sticky top-24 h-[calc(100vh-6rem)]">
          <h1 className="text-2xl font-black text-white flex items-center gap-2 mb-8">
            <Zap className="w-6 h-6 text-yellow-500 fill-current" /> Civic Feed
          </h1>

          <div className="flex flex-col gap-1 mb-8">
            {[
              { id: "for-you", label: "For You" },
              { id: "following", label: "Following" },
              { id: "ward", label: "Your Ward" },
              { id: "city", label: "City" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as TabType); window.scrollTo(0, 0); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id 
                    ? "bg-white dark:bg-zinc-900 text-white" 
                    : "text-slate-500 dark:text-zinc-500 hover:bg-white dark:bg-zinc-900/50 hover:text-slate-600 dark:text-zinc-300"
                }`}
              >
                {activeTab === tab.id && <motion.div layoutId="navIndicator" className="w-1 h-5 bg-blue-500 rounded-full absolute left-0" />}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Hash className="w-4 h-4" /> Trending in {user?.city || 'City'}
            </h3>
            <div className="flex flex-col gap-3">
              {['Potholes', 'Streetlights', 'Garbage', 'Water Supply', 'Traffic'].map((tag, i) => (
                <div key={tag} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-bold text-slate-500 dark:text-zinc-400 group-hover:text-blue-400 transition-colors">#{tag}</span>
                  <span className="text-xs text-zinc-600">{120 - (i * 15)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CircleDashed className="w-4 h-4" /> Your Circles
            </h3>
            <div className="flex flex-col gap-3 mb-3">
              {['Green Guardians', 'Traffic Watch', 'Clean City Initiative'].map((circle) => (
                <div key={circle} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-blue-500/50 transition-colors">
                    <Users className="w-4 h-4 text-slate-500 dark:text-zinc-500 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-zinc-300 group-hover:text-white transition-colors truncate">{circle}</span>
                </div>
              ))}
            </div>
            <button className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors pl-11">
              See all
            </button>
          </div>
        </div>

        {/* ── MIDDLE COLUMN (Feed) ── */}
        <div className="flex-1 max-w-xl mx-auto w-full flex flex-col">
          
          {/* Mobile Header / Tabs */}
          <div className="lg:hidden flex items-center justify-between mb-4 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
            {[
              { id: "for-you", label: "For You" },
              { id: "following", label: "Following" },
              { id: "ward", label: "Ward" },
              { id: "city", label: "City" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as TabType); window.scrollTo(0, 0); }}
                className={`relative px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? "text-white" : "text-slate-500 dark:text-zinc-500"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="mobileNavIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* Stories Row */}
          <div className="mb-6 flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
            
            {/* Add Story / My Story */}
            <div className="shrink-0 snap-start">
              <StoryRing 
                user={(user as any) || undefined} 
                isAdd={myStories.length === 0} 
                hasUnviewed={myStories.length > 0 && myStories.some(s => !s.viewedBy.includes(user?.id || ''))}
                onClick={() => {
                  if (myStories.length === 0) {
                    setIsStoryCreatorOpen(true);
                  } else {
                    // Logic to view own stories could go here, or we can just open creator for now
                    setIsStoryCreatorOpen(true);
                  }
                }}
              />
            </div>

            {/* Friends' Stories */}
            {storyGroups.map((group, index) => (
              <div key={group.user.id} className="shrink-0 snap-start">
                <StoryRing 
                  user={group.user}
                  hasUnviewed={group.hasUnviewed}
                  onClick={() => setActiveViewerIndex(index)}
                />
              </div>
            ))}
            
            {/* Story skeleton while loading */}
            {storiesLoading && storyGroups.length === 0 && (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-zinc-900 animate-pulse border-2 border-background" />
                  <div className="w-10 h-2 bg-white dark:bg-zinc-900 animate-pulse rounded" />
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col mt-2">
            <FeedList 
              items={items} 
              loading={loading} 
              hasMore={hasMore} 
              onLoadMore={loadMore} 
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN (Widgets) ── */}
        <div className="hidden xl:flex flex-col w-[300px] shrink-0 sticky top-24 h-[calc(100vh-6rem)] gap-6">
          
          {/* Who to Follow */}
          <div className="bg-slate-50 dark:bg-zinc-950 border border-white/5 rounded-3xl p-5">
            <h3 className="text-sm font-black text-white mb-4">Who to Follow</h3>
            <div className="flex flex-col gap-4">
              {[
                { name: "Sarah Jenkins", username: "sjenkins", role: "City official" },
                { name: "Mark Doe", username: "markdoe", role: "Active Citizen" },
                { name: "Traffic Dept", username: "traffic_dept", role: "Verified Agency", verified: true }
              ].map(u => (
                <div key={u.username} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate flex items-center gap-1 group-hover:underline">
                        {u.name} {u.verified && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-zinc-500 truncate">@{u.username}</div>
                    </div>
                  </div>
                  <button className="shrink-0 bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold hover:bg-zinc-200 transition-colors">
                    Follow
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-bold text-blue-500 hover:bg-blue-500/10 rounded-xl transition-colors">
              Show more
            </button>
          </div>

          {/* Ward Activity Mini-Feed */}
          <div className="bg-slate-50 dark:bg-zinc-950 border border-white/5 rounded-3xl p-5">
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Ward Activity
            </h3>
            <div className="relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-white dark:bg-zinc-900">
              {[
                { time: "10m ago", text: "New pothole reported on MG Road" },
                { time: "2h ago", text: "Streetlight fixed in Sector 4" },
                { time: "5h ago", text: "50+ signatures on park petition" }
              ].map((act, i) => (
                <div key={i} className="relative flex items-start gap-4 mb-4 last:mb-0">
                  <div className="w-4 h-4 rounded-full bg-slate-50 dark:bg-zinc-950 border-4 border-slate-200 dark:border-zinc-800 shrink-0 mt-1 z-10" />
                  <div>
                    <div className="text-xs font-bold text-zinc-600 mb-0.5">{act.time}</div>
                    <div className="text-sm font-medium text-slate-600 dark:text-zinc-300">{act.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-zinc-600 font-medium px-2">
            © 2026 CivicMind AI • Privacy • Terms • Community Guidelines
          </div>

        </div>

      </div>

      <StoryCreator 
        isOpen={isStoryCreatorOpen}
        onClose={() => setIsStoryCreatorOpen(false)}
        onSubmit={createStory}
      />
      
      {activeViewerIndex !== null && (
        <StoryViewer 
          groups={storyGroups}
          initialGroupIndex={activeViewerIndex}
          onClose={() => setActiveViewerIndex(null)}
          onMarkViewed={markStoryViewed}
        />
      )}
    </div>
  );
}
