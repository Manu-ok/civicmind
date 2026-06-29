"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { getIssues, getTopCitizens, getAnalytics } from "@/lib/firebase/firestore";
import { Issue, User } from "@/lib/types";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { GlowCard } from "@/components/shared/GlowCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { IssueCard } from "@/components/issues/IssueCard";
import { MiniMap } from "@/components/map/MiniMap";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { DashboardStatSkeleton, IssueCardSkeleton } from "@/components/shared/Skeletons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, MapPin, CheckCircle2, TrendingUp, Users, Clock, 
  ShieldCheck, AlertOctagon, Droplets, Zap, Trash2, Shield, MoreHorizontal,
  Brain, FileText, Activity, ChevronRight, Target, BookOpen, Bell, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFollowList } from "@/lib/hooks/useFollowList";
import { useFeed } from "@/lib/hooks/useFeed";
import { useStories } from "@/lib/hooks/useStories";
import { StoryRing } from "@/components/social/StoryRing";
import { UserAvatar } from "@/components/social/UserAvatar";
import Link from "next/link";

// Mock Data for Categories & Predictions (if analytics is empty)
const MOCK_CATEGORIES = [
  { id: "road", label: "Roads", icon: AlertOctagon, color: "bg-red-500", text: "text-red-500", count: 124, total: 350, trend: "+12%" },
  { id: "water", label: "Water", icon: Droplets, color: "bg-blue-500", text: "text-blue-500", count: 86, total: 350, trend: "-5%" },
  { id: "electricity", label: "Power", icon: Zap, color: "bg-yellow-500", text: "text-yellow-500", count: 64, total: 350, trend: "+2%" },
  { id: "waste", label: "Waste", icon: Trash2, color: "bg-green-500", text: "text-green-500", count: 42, total: 350, trend: "-10%" },
  { id: "safety", label: "Safety", icon: Shield, color: "bg-purple-500", text: "text-purple-500", count: 28, total: 350, trend: "+5%" },
  { id: "other", label: "Other", icon: MoreHorizontal, color: "bg-zinc-500", text: "text-slate-500 dark:text-zinc-500", count: 6, total: 350, trend: "0%" },
];

const MOCK_PREDICTIONS = [
  { id: 1, title: "Pothole Clusters Expected", category: "road", prob: 85, time: "Next 48h", ward: "Downtown", icon: AlertOctagon, severity: "red" },
  { id: 2, title: "Water Line Pressure Drop", category: "water", prob: 62, time: "Next 3 Days", ward: "North Hills", icon: Droplets, severity: "yellow" },
  { id: 3, title: "Streetlight Outages", category: "electricity", prob: 45, time: "Next Week", ward: "Westside", icon: Zap, severity: "yellow" },
  { id: 4, title: "Waste Overflow Risk", category: "waste", prob: 25, time: "Weekend", ward: "East End", icon: Trash2, severity: "green" },
  { id: 5, title: "Traffic Signal Malfunction", category: "safety", prob: 15, time: "Next 24h", ward: "South Park", icon: Shield, severity: "green" },
];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [topCitizens, setTopCitizens] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New social hooks
  const { users: followers } = useFollowList(user?.id || "", "followers");
  const { users: following } = useFollowList(user?.id || "", "following");
  const { newItemCount: unreadFeedCount } = useFeed("for-you");
  const { storyGroups } = useStories();

  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const issues = await getIssues();
        // Just take the first 5 for recent
        setRecentIssues(issues.slice(0, 5));

        const citizens = await getTopCitizens(user?.city || "Unknown", 5);
        setTopCitizens(citizens);

        // Derive active users from recent issues (simulating "active now")
        const uniqueReporters = new Map();
        issues.slice(0, 20).forEach(issue => {
          if (!uniqueReporters.has(issue.reportedBy)) {
            uniqueReporters.set(issue.reportedBy, {
              id: issue.reportedBy,
              displayName: issue.reportedByDisplayName || "Anonymous",
              category: issue.category,
              ward: issue.location?.ward || "City Area",
              timestamp: issue.reportedAt,
            });
          }
        });
        setActiveUsers(Array.from(uniqueReporters.values()).slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const getRankBadge = (points: number) => {
    if (points > 500) return { name: "Civic Hero", color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30" };
    if (points > 200) return { name: "Civic Guardian", color: "text-purple-400 bg-purple-500/20 border-purple-500/30" };
    if (points > 50) return { name: "Active Citizen", color: "text-blue-400 bg-blue-500/20 border-blue-500/30" };
    return { name: "Observer", color: "text-slate-500 dark:text-zinc-400 bg-zinc-500/20 border-zinc-500/30" };
  };

  const userRank = getRankBadge(user?.points || 0);

  return (
    <div className="container mx-auto px-4 py-8 pb-24 space-y-12">
      
      {/* SECTION 2: Welcome Banner (moved above stats for better flow) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-white/10 p-8"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Good morning, {user?.displayName?.split(' ')[0] || "Citizen"}!
            </h1>
            <p className="text-lg text-slate-600 dark:text-zinc-300">
              Your reports have positively impacted <span className="text-white font-bold">{((user?.issuesReported || 0) * 12) + ((user?.issuesVerified || 0) * 5)} residents</span> this month.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Civic Score</p>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                <AnimatedCounter value={user?.points || 0} /> ✨
              </p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Rank</p>
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", userRank.color)}>
                {userRank.name}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SECTION 1: Hero Stats Bar */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {isLoading ? (
          <>
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
          </>
        ) : (
          [
            { label: "Total Issues Reported", value: 1248, icon: FileText, color: "text-blue-400 bg-blue-500/10", trend: "+14%" },
            { label: "Resolved This Month", value: 342, icon: CheckCircle2, color: "text-green-400 bg-green-500/10", trend: "+28%" },
            { label: "Active Citizens", value: 5890, icon: Users, color: "text-purple-400 bg-purple-500/10", trend: "+5%" },
            { label: "Avg Resolution Time", value: 4, icon: Clock, color: "text-orange-400 bg-orange-500/10", trend: "-2 days" }
          ].map((stat, i) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <GlowCard className="rounded-xl h-full border border-white/5">
                <div className="relative h-full overflow-hidden bg-white dark:bg-zinc-900/50 backdrop-blur-xl transition-all hover:bg-slate-100 dark:bg-zinc-800/50 group">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{stat.label}</p>
                      <div className={`p-2 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`h-5 w-5 ${stat.color.split(' ')[0]}`} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <h2 className="text-3xl font-bold text-white">
                        <AnimatedCounter value={stat.value} />
                      </h2>
                      {stat.trend && (
                        <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {stat.trend}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Decorative bottom border */}
                  <div className={`absolute bottom-0 left-0 h-1 w-full opacity-50 ${stat.color.split(' ')[1]}`} />
                </div>
              </GlowCard>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* SECTION 1.5: Social Stats Strip & Stories */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <GlowCard className="p-4 rounded-xl border border-white/5 bg-white dark:bg-zinc-900/50 hover:bg-slate-100 dark:bg-zinc-800/50 transition-all flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Followers</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">{followers.length}</p>
                  <span className="text-xs font-bold text-blue-400">+3 this week</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </GlowCard>
            <GlowCard className="p-4 rounded-xl border border-white/5 bg-white dark:bg-zinc-900/50 hover:bg-slate-100 dark:bg-zinc-800/50 transition-all flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Following</p>
                <p className="text-2xl font-bold text-white">{following.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
            </GlowCard>
            <Link href="/feed">
              <GlowCard className="p-4 rounded-xl border border-white/5 bg-white dark:bg-zinc-900/50 hover:bg-slate-100 dark:bg-zinc-800/50 transition-all flex items-center justify-between group h-full">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Unread Feed</p>
                  <p className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">{unreadFeedCount}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-400" />
                </div>
              </GlowCard>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4">
          <GlowCard className="p-4 rounded-xl border border-white/5 bg-white dark:bg-zinc-900/50 h-full flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" /> Stories from your community
              </h3>
              <Link href="/feed" className="text-xs text-slate-500 dark:text-zinc-400 hover:text-white flex items-center">
                See all <ChevronRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              {storyGroups.length > 0 ? (
                storyGroups.slice(0, 5).map(group => (
                  <StoryRing key={group.user.id} user={group.user} hasUnviewed={group.hasUnviewed} size="sm" onClick={() => router.push('/feed')} />
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium">No new stories right now.</p>
              )}
            </div>
          </GlowCard>
        </div>
      </div>

      {/* SECTION 3: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Recent Issues */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Latest updates from your city</p>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-500 dark:text-zinc-400 hover:text-white" onClick={() => router.push('/issues')}>
                  View all
                </Button>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  <IssueCardSkeleton />
                  <IssueCardSkeleton />
                </div>
              ) : recentIssues.length > 0 ? (
                <div className="space-y-4">
                  {recentIssues.slice(0, 3).map(issue => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Activity}
                  title="No recent activity"
                  description="Be the first to report an issue in your community!"
                />
              )}
        </div>

        {/* RIGHT: Map & Actions */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          {/* Action Hub */}
          <Card className="p-6 bg-white dark:bg-zinc-900 border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Button onClick={() => router.push('/report')} className="w-full justify-start h-14 bg-primary hover:bg-primary/90 text-white text-lg rounded-xl">
                <AlertTriangle className="w-5 h-5 mr-3" /> Report New Issue
              </Button>
              <Button onClick={() => router.push('/verify')} variant="outline" className="w-full justify-start h-14 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 rounded-xl text-lg">
                <ShieldCheck className="w-5 h-5 mr-3" /> Verify Issues
              </Button>
              <Button onClick={() => router.push('/agent')} variant="outline" className="w-full justify-start h-14 bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 rounded-xl text-lg">
                <Brain className="w-5 h-5 mr-3" /> Ask CivicAgent
              </Button>
            </div>
          </Card>

          {/* Who's Active Now */}
          <Card className="p-6 bg-white dark:bg-zinc-900 border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Who&apos;s Active Now
            </h3>
            <div className="flex flex-col gap-3">
              {activeUsers.map(u => (
                <div key={u.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="relative">
                    <UserAvatar userId={u.id} size="sm" clickable />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-zinc-900 rounded-full" />
                  </div>
                  <div>
                    <Link href={`/profile/${u.id}`} className="text-sm font-bold text-zinc-200 hover:text-blue-400 hover:underline">
                      {u.displayName}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-zinc-500">
                      reported <span className="text-slate-500 dark:text-zinc-400 capitalize">{u.category}</span> issue in <span className="text-slate-500 dark:text-zinc-400">{u.ward}</span>
                    </p>
                  </div>
                </div>
              ))}
              {activeUsers.length === 0 && !isLoading && (
                <p className="text-xs text-slate-500 dark:text-zinc-500">No recent activity.</p>
              )}
            </div>
          </Card>

          {/* Mini Map */}
          <Card className="overflow-hidden bg-white dark:bg-zinc-900 border-white/5 p-1 relative group">
            <div className="h-[300px] w-full relative rounded-xl overflow-hidden pointer-events-none">
              {/* Overlay to make it look like a snapshot */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent pointer-events-none" />
              <MiniMap onLocationChange={() => {}} />
              <div className="absolute bottom-4 left-4 z-20">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live City Map</span>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* SECTION 4: Category Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" /> Citywide Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOCK_CATEGORIES.map((cat, i) => (
            <Card key={i} className="p-4 bg-white dark:bg-zinc-900 border-white/5 hover:border-white/20 transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-lg", cat.color.replace('bg-', 'bg-opacity-20 bg-'))}>
                  <cat.icon className={cn("w-5 h-5", cat.text)} />
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-500 group-hover:text-slate-600 dark:text-zinc-300 transition-colors">{cat.trend}</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1"><AnimatedCounter value={cat.count} /></p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-3">{cat.label}</p>
              <Progress value={(cat.count / cat.total) * 100} className="h-1.5 bg-slate-100 dark:bg-zinc-800" indicatorClassName={cat.color} />
            </Card>
          ))}
        </div>
      </motion.div>

      {/* SECTION 5: AI Predictions Strip */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-6 overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-400" /> AI Predicted Issues — Stay Ahead
          </h2>
          <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
            Full Analysis <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
          {MOCK_PREDICTIONS.map((pred, i) => (
            <Card key={i} className="min-w-[300px] p-5 bg-white dark:bg-zinc-900/80 border-white/5 shrink-0 snap-start hover:border-blue-500/30 transition-all cursor-default group">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-xl bg-black/40 border border-white/5")}>
                  <pred.icon className={cn("w-5 h-5", 
                    pred.severity === 'red' ? "text-red-400" : 
                    pred.severity === 'yellow' ? "text-yellow-400" : "text-green-400"
                  )} />
                </div>
                <div className={cn("px-2 py-1 rounded text-xs font-bold border", 
                  pred.severity === 'red' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                  pred.severity === 'yellow' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : 
                  "bg-green-500/10 text-green-400 border-green-500/20"
                )}>
                  {pred.prob}% Prob
                </div>
              </div>
              <h3 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{pred.title}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 font-medium mt-3">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {pred.time}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {pred.ward}</span>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* SECTION 6: Real-time Command Center */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <ActivityFeed />
        <Leaderboard />
      </motion.div>

    </div>
  );
}
