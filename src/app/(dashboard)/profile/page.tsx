"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, MapPin, Calendar, Edit3, Shield, Star, Award, TrendingUp, 
  CheckCircle2, Clock, Map, ChevronRight, Activity, Image as ImageIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IssueCard } from "@/components/issues/IssueCard";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Issue } from "@/lib/types";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIssues } from "@/lib/hooks/useIssues";
import { uploadProfileMedia } from "@/lib/firebase/storage";
import toast from "react-hot-toast";

// Dummy user data
const MOCK_USER = {
  name: "Aditi Sharma",
  email: "aditi.s@example.com",
  avatar: "https://i.pravatar.cc/150?u=aditi",
  city: "Jamshedpur",
  ward: "Ward 12",
  joined: "March 2025",
  stats: {
    reported: 24,
    verified: 56,
    points: 1250,
    rank: 47,
  },
  badge: {
    name: "Civic Guardian",
    color: "from-amber-400 to-orange-500",
    icon: Shield,
    currentXP: 1250,
    nextBadge: "City Champion",
    nextXP: 2000,
  }
};

// Dummy issues
const MOCK_ISSUES: Issue[] = [
  {
    id: "1",
    title: "Large Pothole on Main Street causing traffic jams",
    description: "Deep pothole near the intersection.",
    location: { lat: 22.8046, lng: 86.2029, address: "Main Street, Ward 12", ward: "Ward 12", city: "Jamshedpur" },
    category: "road",
    severity: "high",
    status: "in_progress",
    mediaUrls: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400"],
    reportedBy: "user1",
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    upvotes: 45,
    verificationCount: 12,
    priorityScore: 85,
    verifications: [],
    isDuplicate: false,
  },
  {
    id: "2",
    title: "Street lights not working for a week",
    description: "Complete darkness at night.",
    location: { lat: 22.8056, lng: 86.2039, address: "Park Avenue, Ward 12", ward: "Ward 12", city: "Jamshedpur" },
    category: "electricity",
    severity: "medium",
    status: "verified",
    mediaUrls: [],
    reportedBy: "user1",
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    upvotes: 23,
    verificationCount: 8,
    priorityScore: 60,
    verifications: [],
    isDuplicate: false,
  }
];

const ACTIVITY_LOG = [
  { id: 1, action: "Verified an issue in Ward 12", points: "+5", time: "2 hours ago", icon: CheckCircle2, color: "text-blue-400" },
  { id: 2, action: "Reported a pothole on MG Road", points: "+20", time: "1 day ago", icon: MapPin, color: "text-amber-400" },
  { id: 3, action: "Earned Civic Guardian badge", points: "+50", time: "3 days ago", icon: Shield, color: "text-orange-400" },
  { id: 4, action: "Upvoted 5 local issues", points: "+5", time: "1 week ago", icon: Star, color: "text-yellow-400" },
];

const TABS = [
  { id: "reported", label: "My Reports" },
  { id: "verified", label: "Verified by Me" },
  { id: "upvoted", label: "Upvoted" },
];

function getBadgeInfo(points: number) {
  if (points >= 5000) return { name: "City Champion", icon: Award, color: "from-purple-400 to-pink-500", nextXP: 10000, nextBadge: "Civic Legend" };
  if (points >= 1000) return { name: "Civic Guardian", icon: Shield, color: "from-amber-400 to-orange-500", nextXP: 5000, nextBadge: "City Champion" };
  if (points >= 500) return { name: "Active Citizen", icon: Star, color: "from-blue-400 to-indigo-500", nextXP: 1000, nextBadge: "Civic Guardian" };
  return { name: "Rising Star", icon: TrendingUp, color: "from-green-400 to-emerald-500", nextXP: 500, nextBadge: "Active Citizen" };
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { issues } = useIssues();
  const [activeTab, setActiveTab] = useState("reported");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setUploading(true);
      const url = await uploadProfileMedia(file, user.id);
      await updateProfile({ photoURL: url });
      toast.success("Profile photo updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };
  
  const currentXP = user?.points || 0;
  const userBadge = getBadgeInfo(currentXP);
  const progressPercent = (currentXP / userBadge.nextXP) * 100;
  
  const userIssues = issues.filter(i => i.reportedBy === user?.id);
  const displayIssues = userIssues.length > 0 ? userIssues : MOCK_ISSUES;

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-16 md:pt-0">
      {/* Header gradient bg */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-blue-900/20 to-zinc-950 pointer-events-none" />

      <div className="relative mx-auto max-w-5xl space-y-8 p-4 md:p-8">
        
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl sm:flex-row sm:items-start sm:p-10">
          <div className="relative group">
            <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${userBadge.color} opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-500`} />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <div 
              className={`relative h-32 w-32 cursor-pointer flex-shrink-0 group/avatar ${uploading ? 'opacity-50' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <UserAvatar user={user as any} className="h-full w-full border-4 border-zinc-900 text-4xl" />
              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <ImageIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-2 text-white shadow-lg transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">{user?.displayName || "User"}</h1>
              <div className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${userBadge.color} px-3 py-1 text-xs font-bold text-white shadow-lg`}>
                <userBadge.icon className="h-3.5 w-3.5" />
                {userBadge.name}
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400 sm:justify-start">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {user?.city || "City"}, {user?.ward || "Ward"}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {user?.createdAt ? new Date((user.createdAt as any).seconds ? (user.createdAt as any).toDate() : user.createdAt).toLocaleDateString() : "Recently"}</span>
            </div>

            <div className="mt-6">
              <Button 
                onClick={() => window.location.href = '/settings'}
                className="rounded-xl bg-white text-zinc-950 hover:bg-zinc-200"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          {/* LEFT COLUMN: Stats & Progress */}
          <div className="space-y-6 md:col-span-1">
            {/* PROGRESS TO NEXT BADGE */}
            <section className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-lg font-semibold text-white">Next Level</h2>
              
              <div className="mb-2 flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400">Current XP</p>
                  <p className="text-2xl font-bold text-white">{currentXP}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-400">Goal</p>
                  <p className="text-sm font-bold text-zinc-300">{userBadge.nextXP}</p>
                </div>
              </div>
              
              <Progress value={progressPercent} className="h-3 bg-zinc-800" indicatorClassName={`bg-gradient-to-r ${userBadge.color}`} />
              
              <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-950/50 p-3 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400">Next Badge</p>
                    <p className="text-sm font-bold text-white">{userBadge.nextBadge}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-400">{userBadge.nextXP - currentXP} pts left</span>
              </div>
            </section>

            {/* STATS GRID */}
            <section className="grid grid-cols-2 gap-4">
              <StatCard icon={Activity} label="Reported" value={user?.issuesReported || 0} color="text-blue-400" bg="bg-blue-500/10" />
              <StatCard icon={CheckCircle2} label="Verified" value={user?.issuesVerified || 0} color="text-green-400" bg="bg-green-500/10" />
              <StatCard icon={Star} label="Points" value={user?.points || 0} color="text-yellow-400" bg="bg-yellow-500/10" />
              <StatCard icon={TrendingUp} label="City Rank" value="Top 10%" color="text-purple-400" bg="bg-purple-500/10" />
            </section>
            
            {/* ACTIVITY LOG */}
            <section className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-400" /> Recent Activity
              </h2>
              <div className="space-y-4">
                {ACTIVITY_LOG.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-950 border border-white/5 ${log.color}`}>
                      <log.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-200">{log.action}</p>
                      <p className="text-xs text-zinc-500">{log.time}</p>
                    </div>
                    <span className="text-xs font-bold text-green-400">{log.points}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs text-zinc-400 hover:text-white">View Full History</Button>
            </section>
          </div>

          {/* RIGHT COLUMN: Issues Tab */}
          <div className="md:col-span-2 space-y-6">
            <section className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl min-h-[600px]">
              
              {/* Animated Tabs */}
              <div className="relative flex w-full overflow-x-auto border-b border-white/10 pb-2 no-scrollbar">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    {displayIssues.map((issue, i) => (
                      <IssueCard key={issue.id} issue={issue} index={i} />
                    ))}
                    {userIssues.length === 0 && (
                      <div className="col-span-full py-12 text-center text-zinc-500">
                        <MapPin className="mx-auto h-8 w-8 opacity-50 mb-3" />
                        <p>No issues found for this tab yet.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any, label: string, value: string | number, color: string, bg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-zinc-900 p-4 transition-transform hover:scale-105">
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${bg} ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
    </div>
  );
}
