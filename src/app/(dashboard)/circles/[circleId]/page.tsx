"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Circle } from "@/lib/types";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCircles, useCircleMembers } from "@/lib/hooks/useCircles";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, MapPin, Users, Info, Settings, Loader2, CheckCircle2, Activity } from "lucide-react";

export default function CircleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const circleId = params.circleId as string;
  const { user } = useAuthStore();
  
  const { myCircles, joinCircle, leaveCircle, refresh } = useCircles();
  const { members, loading: membersLoading } = useCircleMembers(circleId);
  
  const [circle, setCircle] = useState<Circle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "about">("feed");

  useEffect(() => {
    const fetchCircle = async () => {
      if (!circleId) return;
      const snap = await getDoc(doc(db, "circles", circleId));
      if (snap.exists()) {
        setCircle({ ...snap.data(), id: snap.id } as Circle);
      }
      setLoading(false);
    };
    fetchCircle();
  }, [circleId]);

  const isMember = myCircles.some(c => c.id === circleId);
  const currentUserMember = members.find(m => m.userId === user?.id);
  const isAdmin = currentUserMember?.role === "admin";

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Circle not found</h1>
        <button onClick={() => router.push("/circles")} className="text-blue-500 hover:underline">Back to Circles</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      
      {/* HEADER HERO */}
      <div className="h-64 md:h-80 w-full bg-gradient-to-br from-blue-500/20 to-fuchsia-500/20 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        
        <div className="absolute -bottom-16 left-0 right-0 max-w-5xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-end md:items-center gap-6">
           <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white dark:bg-zinc-900 border-4 border-background flex items-center justify-center text-6xl shadow-2xl z-10 shrink-0">
             {circle.iconEmoji}
           </div>
           
           <div className="flex-1 pb-2 w-full">
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 w-full">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                   <h1 className="text-3xl md:text-4xl font-black text-white">{circle.name}</h1>
                   {circle.isOfficial && <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0 mt-1" />}
                 </div>
                 <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500 dark:text-zinc-400">
                   <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {circle.ward}, {circle.city}</span>
                   <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {circle.memberCount} members</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-3 shrink-0">
                 {isAdmin && (
                   <button className="p-3 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:bg-zinc-800 text-white rounded-xl transition-colors border border-white/5">
                     <Settings className="w-5 h-5" />
                   </button>
                 )}
                 <button 
                    onClick={() => isMember ? leaveCircle(circle.id) : joinCircle(circle.id)}
                    className={`px-8 py-3 rounded-xl font-bold transition-all shadow-xl ${
                      isMember 
                        ? "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-red-500/10 hover:text-red-500 border border-white/5" 
                        : "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20"
                    }`}
                  >
                    {isMember ? "Leave Circle" : "Join Circle"}
                  </button>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* TABS & CONTENT */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-24">
        
        <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-px overflow-x-auto no-scrollbar">
          {[
            { id: "feed", label: "Feed", icon: Activity },
            { id: "members", label: "Members", icon: Users },
            { id: "about", label: "About", icon: Info },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "text-white" : "text-slate-500 dark:text-zinc-500 hover:text-slate-600 dark:text-zinc-300"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-blue-500" : ""}`} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="circleTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "feed" && (
                <div className="max-w-xl">
                  {isMember ? (
                    <div className="bg-slate-50 dark:bg-zinc-950 border border-white/5 border-dashed rounded-3xl p-10 text-center">
                      <h3 className="text-lg font-bold text-white mb-2">Circle Feed</h3>
                      <p className="text-slate-500 dark:text-zinc-500 mb-6">Issues reported in {circle.ward} will appear here.</p>
                      <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200">
                        Post an Issue
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-zinc-950 border border-white/5 border-dashed rounded-3xl p-10 text-center">
                      <ShieldCheck className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">Members Only</h3>
                      <p className="text-slate-500 dark:text-zinc-500">Join this circle to view and participate in discussions.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "members" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {membersLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto col-span-full mt-10" />
                  ) : members.length === 0 ? (
                    <p className="text-slate-500 dark:text-zinc-500 col-span-full">No members yet.</p>
                  ) : (
                    members.map(member => (
                      <div key={member.userId} className="bg-slate-50 dark:bg-zinc-950 border border-white/5 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-white dark:bg-zinc-900 transition-colors" onClick={() => router.push(`/profile/${member.username}`)}>
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-white/5">
                          {member.photoURL ? (
                            <Image fill src={member.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 dark:text-zinc-500">{member.displayName.charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm truncate flex items-center gap-1">
                            {member.displayName}
                            {member.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-zinc-500 truncate">@{member.username}</div>
                          {member.role === 'admin' && <div className="text-[10px] text-blue-400 font-bold uppercase mt-1">Admin</div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "about" && (
                <div className="max-w-2xl bg-slate-50 dark:bg-zinc-950 border border-white/5 rounded-3xl p-8">
                  <h3 className="text-lg font-black text-white mb-4">About this Circle</h3>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed mb-8 whitespace-pre-wrap">{circle.description}</p>
                  
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                    <div>
                      <div className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-1">Created</div>
                      <div className="text-white font-medium">
                        {new Date((circle.createdAt as any)?.seconds ? (circle.createdAt as any).toDate() : circle.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-1">Status</div>
                      <div className="text-white font-medium flex items-center gap-1">
                        {circle.isOfficial ? <><ShieldCheck className="w-4 h-4 text-blue-500" /> Official</> : "Community"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
