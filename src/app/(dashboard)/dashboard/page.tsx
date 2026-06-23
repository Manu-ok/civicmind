"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { getIssues, getTopCitizens, getAnalytics } from "@/lib/firebase/firestore";
import { Issue, User } from "@/lib/types";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { IssueCard } from "@/components/issues/IssueCard";
import { MiniMap } from "@/components/map/MiniMap";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, MapPin, CheckCircle2, TrendingUp, Users, Clock, 
  ShieldCheck, AlertOctagon, Droplets, Zap, Trash2, Shield, MoreHorizontal,
  Brain, FileText, Activity, ChevronRight, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for Categories & Predictions (if analytics is empty)
const MOCK_CATEGORIES = [
  { id: "road", label: "Roads", icon: AlertOctagon, color: "bg-red-500", text: "text-red-500", count: 124, total: 350, trend: "+12%" },
  { id: "water", label: "Water", icon: Droplets, color: "bg-blue-500", text: "text-blue-500", count: 86, total: 350, trend: "-5%" },
  { id: "electricity", label: "Power", icon: Zap, color: "bg-yellow-500", text: "text-yellow-500", count: 64, total: 350, trend: "+2%" },
  { id: "waste", label: "Waste", icon: Trash2, color: "bg-green-500", text: "text-green-500", count: 42, total: 350, trend: "-10%" },
  { id: "safety", label: "Safety", icon: Shield, color: "bg-purple-500", text: "text-purple-500", count: 28, total: 350, trend: "+5%" },
  { id: "other", label: "Other", icon: MoreHorizontal, color: "bg-zinc-500", text: "text-zinc-500", count: 6, total: 350, trend: "0%" },
];

const MOCK_PREDICTIONS = [
  { id: 1, title: "Pothole Clusters Expected", category: "road", prob: 85, time: "Next 48h", ward: "Downtown", icon: AlertOctagon, severity: "red" },
  { id: 2, title: "Water Line Pressure Drop", category: "water", prob: 62, time: "Next 3 Days", ward: "North Hills", icon: Droplets, severity: "yellow" },
  { id: 3, title: "Streetlight Outages", category: "electricity", prob: 45, time: "Next Week", ward: "Westside", icon: Zap, severity: "yellow" },
  { id: 4, title: "Waste Overflow Risk", category: "waste", prob: 25, time: "Weekend", ward: "East End", icon: Trash2, severity: "green" },
  { id: 5, title: "Traffic Signal Malfunction", category: "safety", prob: 15, time: "Next 24h", ward: "South Park", icon: Shield, severity: "green" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [topCitizens, setTopCitizens] = useState<User[]>([]);
  
  useEffect(() => {
    async function loadData() {
      try {
        const issues = await getIssues();
        // Just take the first 5 for recent
        setRecentIssues(issues.slice(0, 5));

        const citizens = await getTopCitizens(user?.city || "Unknown", 5);
        setTopCitizens(citizens);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [user]);

  const getRankBadge = (points: number) => {
    if (points > 500) return { name: "Civic Hero", color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30" };
    if (points > 200) return { name: "Civic Guardian", color: "text-purple-400 bg-purple-500/20 border-purple-500/30" };
    if (points > 50) return { name: "Active Citizen", color: "text-blue-400 bg-blue-500/20 border-blue-500/30" };
    return { name: "Observer", color: "text-zinc-400 bg-zinc-500/20 border-zinc-500/30" };
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
            <p className="text-lg text-zinc-300">
              Your reports have positively impacted <span className="text-white font-bold">{((user?.issuesReported || 0) * 12) + ((user?.issuesVerified || 0) * 5)} residents</span> this month.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-right">
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Civic Score</p>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                <AnimatedCounter value={user?.points || 0} /> ✨
              </p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div>
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Rank</p>
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
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { title: "Total Issues Reported", value: 1248, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", trend: "+14%" },
          { title: "Resolved This Month", value: 342, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", trend: "+28%" },
          { title: "Active Citizens", value: 5890, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", trend: "+5%" },
          { title: "Avg Resolution Time", value: 4, suffix: " days", icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", trend: "-2 days", isInverse: true }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="group relative overflow-hidden p-6 bg-zinc-900/50 backdrop-blur-md border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.bg)} />
              
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl border", stat.bg, stat.color, stat.border)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-xs font-bold flex items-center gap-1",
                  stat.isInverse ? "bg-green-500/10 text-green-400" : "bg-green-500/10 text-green-400"
                )}>
                  <TrendingUp className="w-3 h-3" /> {stat.trend}
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-zinc-400 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix || ""} />
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* SECTION 3: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Recent Issues */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" /> Recent Activity Near You
            </h2>
            <Button variant="ghost" onClick={() => router.push('/issues')} className="text-primary hover:text-primary hover:bg-primary/10">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentIssues.map((issue, idx) => (
              <IssueCard key={issue.id} issue={issue} index={idx} />
            ))}
          </div>
        </div>

        {/* RIGHT: Map & Actions */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          {/* Action Hub */}
          <Card className="p-6 bg-zinc-900 border-white/5 space-y-4">
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

          {/* Mini Map */}
          <Card className="overflow-hidden bg-zinc-900 border-white/5 p-1 relative group">
            <div className="h-[300px] w-full relative rounded-xl overflow-hidden pointer-events-none">
              {/* Overlay to make it look like a snapshot */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent pointer-events-none" />
              <MiniMap />
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
            <Card key={i} className="p-4 bg-zinc-900 border-white/5 hover:border-white/20 transition-all group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-lg", cat.color.replace('bg-', 'bg-opacity-20 bg-'))}>
                  <cat.icon className={cn("w-5 h-5", cat.text)} />
                </div>
                <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">{cat.trend}</span>
              </div>
              <p className="text-2xl font-bold text-white mb-1"><AnimatedCounter value={cat.count} /></p>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-3">{cat.label}</p>
              <Progress value={(cat.count / cat.total) * 100} className="h-1.5 bg-zinc-800" indicatorClassName={cat.color} />
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
            <Card key={i} className="min-w-[300px] p-5 bg-zinc-900/80 border-white/5 shrink-0 snap-start hover:border-blue-500/30 transition-all cursor-default group">
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
              <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium mt-3">
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
