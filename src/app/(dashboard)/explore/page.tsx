"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, TrendingUp, CircleDashed, MapPin, CheckCircle2, ChevronRight, Flame, MessageSquare, AlertTriangle, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { UserCard } from "@/components/social/UserCard";
import { SuggestedUsers } from "@/components/social/SuggestedUsers";
import { getSuggestedUsers } from "@/lib/firebase/social";
import { SocialUser } from "@/lib/types";

type TabType = "people" | "trending" | "circles" | "nearby";

export default function ExplorePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("people");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Data States
  const [heroes, setHeroes] = useState<SocialUser[]>([]);

  useEffect(() => {

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, TrendingUp, CircleDashed, MapPin, CheckCircle2, ChevronRight, Flame, MessageSquare, AlertTriangle, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { UserCard } from "@/components/social/UserCard";
import { SuggestedUsers } from "@/components/social/SuggestedUsers";
import { getSuggestedUsers } from "@/lib/firebase/social";
import { SocialUser } from "@/lib/types";

type TabType = "people" | "trending" | "circles" | "nearby";

export default function ExplorePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("people");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Data States
  const [heroes, setHeroes] = useState<SocialUser[]>([]);

  useEffect(() => {
    if (user) {
      // Mock fetch for "Heroes" using our existing suggested users logic for now
      getSuggestedUsers(user.id, user.city || '', user.ward || '').then(res => setHeroes(res.slice(0, 8)));
    }
  }, [user]);

  // --- SEARCH DROPDOWN ---
  const SearchDropdown = () => {
    const query = searchQuery.toLowerCase();
    
    const filteredPeople = heroes.filter(u => 
      (u.displayName?.toLowerCase().includes(query) || u.username?.toLowerCase().includes(query))
    ).slice(0, 3);
    
    const allIssues = [...MOCK_TRENDING, ...MOCK_DISCUSSED, ...MOCK_ALERTS];
    const filteredIssues = allIssues.filter(i => 
      i.title.toLowerCase().includes(query) || (i.category && i.category.toLowerCase().includes(query))
    ).slice(0, 3);

    const filteredCircles = MOCK_CIRCLES.filter(c => 
      c.name.toLowerCase().includes(query)
    ).slice(0, 3);

    const hasResults = filteredPeople.length > 0 || filteredIssues.length > 0 || filteredCircles.length > 0;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {!hasResults ? (
          <div className="p-6 text-center text-slate-500 dark:text-zinc-400">
            No results found for &quot;{searchQuery}&quot;
          </div>
        ) : (
          <>
            {filteredPeople.length > 0 && (
              <div className="p-4 border-b border-slate-100 dark:border-white/5">
                <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> People</h4>
                {filteredPeople.map(u => (
                  <div key={u.id} className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-slate-100 dark:bg-zinc-800 p-2 rounded-xl transition-colors" onMouseDown={() => router.push(`/profile/${u.username}`)}>
                     <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex-shrink-0 overflow-hidden relative">
                       {u.photoURL ? <Image fill src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 dark:bg-zinc-800" />}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.displayName}</div>
                       <div className="text-xs text-slate-500 dark:text-zinc-500 truncate">@{u.username}</div>
                     </div>
                  </div>
                ))}
              </div>
            )}
            
            {filteredIssues.length > 0 && (
              <div className="p-4 border-b border-slate-100 dark:border-white/5">
                <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Issues</h4>
                {filteredIssues.map((issue, i) => (
                  <div key={i} className="mb-3 cursor-pointer hover:bg-slate-100 dark:bg-zinc-800 p-2 rounded-xl transition-colors" onMouseDown={() => router.push(`/explore`)}>
                     <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{issue.title}</div>
                     <div className="text-xs text-slate-500 dark:text-zinc-500 truncate">{issue.location} • {issue.category || 'Alert'}</div>
                  </div>
                ))}
              </div>
            )}

            {filteredCircles.length > 0 && (
              <div className="p-4 border-b border-slate-100 dark:border-white/5">
                <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2"><CircleDashed className="w-4 h-4" /> Circles</h4>
                {filteredCircles.map((circle, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-slate-100 dark:bg-zinc-800 p-2 rounded-xl transition-colors" onMouseDown={() => router.push(`/explore`)}>
                     <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                       <ShieldCheck className="w-4 h-4 text-blue-500" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{circle.name}</div>
                       <div className="text-xs text-slate-500 dark:text-zinc-500 truncate">{circle.members} members</div>
                     </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-slate-50 dark:bg-zinc-950/50">
              <button className="text-sm font-bold text-blue-500 w-full text-center hover:text-blue-400">View all results for &quot;{searchQuery}&quot;</button>
            </div>
          </>
        )}
      </div>
    );
  };

  // --- TABS ---
  const TABS = [
    { id: "people", label: "People", icon: Users },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "circles", label: "Circles", icon: CircleDashed },
    { id: "nearby", label: "Nearby", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-6 pb-24 md:pb-12 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col lg:flex-row gap-8 relative">
        
        {/* LEFT / MAIN CONTENT */}
        <div className="flex-1 max-w-3xl">
          
          {/* SEARCH HERO */}
          <div className="mb-8 relative z-40">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-6">Discover CivicMind</h1>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-500 dark:text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 md:py-5 bg-slate-50 dark:bg-zinc-950 border-2 border-white/5 rounded-2xl text-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-all shadow-xl"
                placeholder="Search people, issues, circles, wards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
              />
              {isSearching && searchQuery.length > 1 && <SearchDropdown />}
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? "text-white" : "text-slate-500 dark:text-zinc-500 hover:bg-white dark:bg-zinc-900"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="exploreTab" 
                    className="absolute inset-0 bg-blue-500/20 border border-blue-500/30 rounded-full z-0" 
                  />
                )}
                <tab.icon className={`w-4 h-4 relative z-10 ${activeTab === tab.id ? "text-blue-500" : ""}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "people" && (
                <div className="space-y-12">
                  <PeopleSection title="Civic Heroes Near You" subtitle="Users making the biggest impact in your city" users={heroes} />
                  <PeopleSection title="Verified Civic Leaders" subtitle="Trusted voices in your community" users={heroes.filter((_, i) => i % 2 === 0)} showVerifiedOnly />
                  <PeopleSection title="Most Active This Week" subtitle="Reporting and resolving issues recently" users={heroes.slice().reverse()} />
                </div>
              )}

              {activeTab === "trending" && (
                <div className="space-y-12">
                  <TrendingSection title="🔥 Trending Issues This Week" items={MOCK_TRENDING} />
                  <TrendingSection title="💬 Most Discussed" items={MOCK_DISCUSSED} />
                  <AlertsSection title="🚨 Critical Alerts" items={MOCK_ALERTS} />
                </div>
              )}

              {activeTab === "circles" && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 border border-blue-500/30 rounded-3xl p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <CircleDashed className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-white mb-2">Join your ward&apos;s community circle</h2>
                    <p className="text-slate-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">Connect with neighbors, organize cleanups, and amplify your voice together.</p>
                    <button className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition-transform hover:scale-105 active:scale-95">
                      Create New Circle
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-black text-white mb-4">Official Civic Circles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {MOCK_CIRCLES.map((circle, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-zinc-950 border border-white/5 rounded-2xl p-5 hover:border-blue-500/30 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                              <ShieldCheck className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1">{circle.name} <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /></div>
                              <div className="text-xs text-slate-500 dark:text-zinc-500">{circle.type} • {circle.members} members</div>
                            </div>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-zinc-400">Join the official discussion and get real-time updates.</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "nearby" && (
                <div className="bg-slate-50 dark:bg-zinc-950 border border-white/5 rounded-3xl p-8 text-center py-20">
                  <MapPin className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Nearby Radar Active</h3>
                  <p className="text-slate-500 dark:text-zinc-500 text-sm max-w-xs mx-auto mb-6">Location services are scanning for recent issues and community members within a 5km radius.</p>
                  <button className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-500/20">
                    Open Interactive Map
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="hidden xl:block w-[320px] shrink-0 sticky top-24 h-[calc(100vh-6rem)]">
          <SuggestedUsers />
          
          <div className="mt-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/5 rounded-3xl p-5">
            <h3 className="text-sm font-black text-white mb-2">Did you know?</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Reporting issues with clear photos and exact locations increases resolution speed by 40%.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function PeopleSection({ title, subtitle, users, showVerifiedOnly }: { title: string, subtitle: string, users: SocialUser[], showVerifiedOnly?: boolean }) {
  if (users.length === 0) return null;
  return (
    <div>
      <div className="flex items-end justify-between mb-4 pr-2">
        <div>
          <h2 className="text-xl font-black text-white mb-1">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-500">{subtitle}</p>
        </div>
        <button className="text-sm font-bold text-blue-500 hover:text-blue-400 flex items-center">
          See all <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:flex md:overflow-x-auto md:no-scrollbar md:pb-4 md:snap-x">
        {users.map((u, i) => (
          <div key={i} className="w-full md:w-[200px] shrink-0 md:snap-start">
            <UserCard user={{...u, isVerified: showVerifiedOnly ? true : u.isVerified}} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingSection({ title, items }: { title: string, items: any[] }) {
  return (
    <div>
      <h2 className="text-xl font-black text-white mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div key={i} className="bg-slate-50 dark:bg-zinc-950 border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-4 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded uppercase tracking-wider">{item.category}</span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-500 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> {item.engagement}</span>
            </div>
            <h3 className="font-bold text-white text-lg leading-snug mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
            <div className="text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-4">
               <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>
               <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {item.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsSection({ title, items }: { title: string, items: any[] }) {
  return (
    <div>
      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> {title}</h2>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors rounded-xl p-4 cursor-pointer flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
               <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white mb-1 truncate">{item.title}</h3>
              <div className="text-xs text-red-400">{item.time} • {item.location}</div>
            </div>
            <button className="shrink-0 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold">View</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MOCK DATA ---
const MOCK_TRENDING = [
  { title: "Major water pipeline burst on Main St", category: "water", engagement: 452, location: "Ward 7", comments: 89 },
  { title: "Petition for new traffic light at 5th cross", category: "traffic", engagement: 320, location: "Ward 12", comments: 45 },
  { title: "Weekly park cleanup success!", category: "environment", engagement: 280, location: "City Center", comments: 112 },
  { title: "Pothole damages multiple vehicles", category: "infrastructure", engagement: 215, location: "Ward 4", comments: 34 }
];

const MOCK_DISCUSSED = [
  { title: "Proposed changes to waste collection schedule", category: "waste", engagement: 180, location: "Citywide", comments: 156 },
  { title: "Stray dog menace near public school", category: "animal_control", engagement: 145, location: "Ward 9", comments: 92 }
];

const MOCK_ALERTS = [
  { title: "Live electrical wire fallen on pavement", time: "10 mins ago", location: "Sector 4 Market" },
  { title: "Sewer overflow flooding residential area", time: "1 hour ago", location: "Ward 15" }
];

const MOCK_CIRCLES = [
  { name: 'City Hall Updates', members: 500, type: 'Official' },
  { name: 'Green Guardians', members: 650, type: 'Official' },
  { name: 'Traffic Watch', members: 800, type: 'Official' }
];
