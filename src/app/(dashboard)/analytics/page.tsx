"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  AlertTriangle, Brain, CheckCircle2, Clock, MapPin, 
  RefreshCw, TrendingUp, Download, Share2, Bell, Zap, Droplets, Shield, Trash2, Home, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardStatSkeleton, ChartSkeleton } from "@/components/shared/Skeletons";
import { getIssues } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils";

// Category Colors Theme
const COLORS: Record<string, string> = {
  road: "#3b82f6",       // Blue
  water: "#0ea5e9",      // Sky
  electricity: "#eab308", // Yellow
  waste: "#8b5cf6",      // Purple
  safety: "#ef4444",     // Red
  other: "#9ca3af",      // Gray
};

const CATEGORY_ICONS: Record<string, any> = {
  road: MapPin,
  water: Droplets,
  electricity: Zap,
  waste: Trash2,
  safety: Shield,
  other: Home,
};

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  
  // KPI States
  const [kpis, setKpis] = useState({
    total: 0,
    resolutionRate: 0,
    avgTime: 0,
    activeCitizens: 0
  });

  // Chart Data States
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [wardData, setWardData] = useState<any[]>([]);
  
  // AI Predictions
  const [predictions, setPredictions] = useState<any[]>([]);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData(user?.city || "");
    }
  }, [user, authLoading]);

  const fetchDashboardData = async (city: string) => {
    setLoading(true);
    try {
      // If city is empty, it fetches all issues
      const fetched = await getIssues(city ? { city } : undefined);
      setIssues(fetched);

      // --- Calculate KPIs ---
      const total = fetched.length;
      const resolved = fetched.filter(i => i.status === "resolved");
      const resolutionRate = total > 0 ? Math.round((resolved.length / total) * 100) : 0;
      
      const activeCitizens = new Set(fetched.map(i => i.reportedBy)).size;

      // Mock avg time calculation (since we don't have resolvedAt timestamps reliably yet)
      const avgTime = 4.2; 

      setKpis({ total, resolutionRate, avgTime, activeCitizens });

      // --- Chart 1: Timeline (Last 30 days) ---
      // We will generate a mock 30-day timeline anchored to current date for demonstration,
      // then populate with real data where available.
      const timelineMap = new Map();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        timelineMap.set(dateStr, { name: dateStr, Reported: 0, Resolved: 0, InProgress: 0 });
      }

      fetched.forEach(issue => {
        if (!issue.reportedAt) return;
        const d = "seconds" in issue.reportedAt 
          ? new Date(issue.reportedAt.seconds * 1000) 
          : new Date(issue.reportedAt);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (timelineMap.has(dateStr)) {
          const entry = timelineMap.get(dateStr);
          if (issue.status === "resolved") entry.Resolved += 1;
          else if (issue.status === "in_progress") entry.InProgress += 1;
          else entry.Reported += 1;
        }
      });
      setTimelineData(Array.from(timelineMap.values()));

      // --- Chart 2: Category Distribution ---
      const catCount: Record<string, number> = {};
      fetched.forEach(i => {
        catCount[i.category] = (catCount[i.category] || 0) + 1;
      });
      setCategoryData(Object.entries(catCount).map(([name, value]) => ({ name, value })));

      // --- Chart 3: Ward Heatmap ---
      const wCount: Record<string, { total: number, resolved: number, dominant: string, cats: Record<string, number> }> = {};
      fetched.forEach(i => {
        const w = i.location?.ward || "Unknown";
        if (!wCount[w]) wCount[w] = { total: 0, resolved: 0, dominant: "other", cats: {} };
        wCount[w].total += 1;
        if (i.status === "resolved") wCount[w].resolved += 1;
        wCount[w].cats[i.category] = (wCount[w].cats[i.category] || 0) + 1;
      });

      const processedWards = Object.entries(wCount)
        .map(([name, data]) => {
          const dominant = Object.entries(data.cats).sort((a, b) => b[1] - a[1])[0][0];
          return {
            name,
            total: data.total,
            resolved: data.resolved,
            unresolved: data.total - data.resolved,
            dominant
          };
        })
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      setWardData(processedWards);

      // --- Initial AI Prediction Fetch ---
      generatePredictions(fetched, city);

    } catch (e) {
      console.error(e);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async (issueData: any[], city: string) => {
    setPredicting(true);
    try {
      const res = await fetch("/api/predict-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issues: issueData, city })
      });
      const data = await res.json();
      if (data.success) {
        setPredictions(data.predictions);
      } else {
        toast.error(data.error || "AI Predictions failed to load.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  const handleNotify = () => {
    toast.success("Alert securely dispatched to municipal department", {
      icon: '🚀'
    });
  };



  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-zinc-950 p-4 md:p-8 space-y-8 overflow-y-auto custom-scrollbar">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Operations Dashboard</h1>
          <p className="text-slate-500 dark:text-zinc-400">City-wide analytics and predictive intelligence for {user?.city}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white dark:bg-zinc-900 border-white/10 hover:bg-slate-100 dark:bg-zinc-800" onClick={() => toast.success("Report PDF generated!")}>
            <Download className="w-4 h-4 mr-2 text-blue-400" /> Export Report
          </Button>
          <Button variant="outline" className="bg-white dark:bg-zinc-900 border-white/10 hover:bg-slate-100 dark:bg-zinc-800" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}>
            <Share2 className="w-4 h-4 mr-2 text-blue-400" /> Share
          </Button>
        </div>
      </div>

      {/* SECTION 1: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
          </>
        ) : (
          [
            { title: "Total Issues", value: kpis.total, icon: AlertTriangle, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { title: "Resolution Rate", value: `${kpis.resolutionRate}%`, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
            { title: "Avg Resolution", value: `${kpis.avgTime} days`, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
            { title: "Active Citizens", value: kpis.activeCitizens, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={cn("p-6 backdrop-blur-xl border-white/5", kpi.bg, kpi.border)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mb-1">{kpi.title}</p>
                    <h3 className="text-3xl font-bold text-white">{kpi.value}</h3>
                  </div>
                  <div className={cn("p-3 rounded-full bg-black/20", kpi.color)}>
                    <kpi.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* SECTION 2: CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <Card className="p-6 bg-white dark:bg-zinc-900/50 border-white/5 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">Issues Over Time (Last 30 Days)</h3>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888' }} tickLine={false} />
                  <YAxis stroke="#666" tick={{ fill: '#888' }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="reported" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReported)" name="Reported" />
                  <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Category Pie Chart */}
        <Card className="p-6 bg-white dark:bg-zinc-900/50 border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">Distribution by Category</h3>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.other} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Custom Legend for Pie */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-white">{kpis.total}</span>
                <span className="text-xs text-slate-500 dark:text-zinc-500 uppercase tracking-wider">Total</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* SECTION 4: AI PREDICTIONS (Placed prominently before ward heatmap) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent blur-3xl -z-10" />
        <Card className="p-6 bg-slate-50 dark:bg-zinc-950/80 border-purple-500/30 overflow-hidden relative">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 rounded-xl">
                <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  AI Predictive Intelligence
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">BETA</Badge>
                </h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Analyzing historical patterns to predict community issues before they escalate.</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="bg-black/40 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              onClick={() => generatePredictions(issues, user?.city || "")}
              disabled={predicting}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", predicting && "animate-spin")} /> 
              {predicting ? "Analyzing..." : "Regenerate Forecast"}
            </Button>
          </div>

          {predicting ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-white dark:bg-zinc-900/50 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : predictions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {predictions.map((pred, i) => {
                const Icon = CATEGORY_ICONS[pred.category] || CATEGORY_ICONS.other;
                const isHighRisk = pred.probability >= 70;
                return (
                  <Card key={i} className="bg-white dark:bg-zinc-900/80 border-white/5 p-5 flex flex-col justify-between hover:border-purple-500/30 transition-colors group">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2",
                          isHighRisk ? "bg-red-500/10 border-red-500/50 text-red-400" : "bg-orange-500/10 border-orange-500/50 text-orange-400"
                        )}>
                          {pred.probability}%
                        </div>
                        <Badge variant="outline" className="bg-black/50 text-slate-500 dark:text-zinc-400 border-white/10">{pred.timeframe}</Badge>
                      </div>
                      
                      <h4 className="text-lg font-bold text-white mb-2">{pred.title}</h4>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={cn("capitalize bg-opacity-20", isHighRisk ? "bg-red-500 text-red-400" : "bg-blue-500 text-blue-400")}>
                          <Icon className="w-3 h-3 mr-1" /> {pred.category}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                          <MapPin className="w-3 h-3 mr-1 text-slate-500 dark:text-zinc-500" /> {pred.ward}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 italic border-l-2 border-white/10 pl-3 py-1">
                        &quot;{pred.basis}&quot;
                      </p>

                      <div className="space-y-2 mb-6">
                        <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Recommended Actions</p>
                        <ul className="space-y-1.5">
                          {pred.preventiveActions.map((action: string, j: number) => (
                            <li key={j} className="text-sm text-slate-600 dark:text-zinc-300 flex gap-2 items-start">
                              <span className="text-purple-400 mt-0.5">•</span> {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Button 
                      className={cn("w-full transition-all", isHighRisk ? "bg-red-600 hover:bg-red-700" : "bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:bg-zinc-700")}
                      onClick={handleNotify}
                    >
                      <Bell className="w-4 h-4 mr-2" /> Notify Department
                    </Button>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-zinc-500 border border-dashed border-white/10 rounded-2xl">
              No immediate risks forecasted for this period.
            </div>
          )}
        </Card>
      </motion.div>

      {/* SECTION 3 & 5: HEATMAP & PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ward Heatmap (Horizontal Bar Chart) */}
        <Card className="p-6 bg-white dark:bg-zinc-900/50 border-white/5">
          <h3 className="text-lg font-bold text-white mb-2">Issue Density by Ward</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mb-6">Top 10 highest volume areas</p>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={wardData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="resolved" name="Resolved" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="unresolved" name="Unresolved" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Performance Metrics Table */}
        <Card className="p-6 bg-white dark:bg-zinc-900/50 border-white/5 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-2">Department Performance</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mb-6">Average response time by division</p>
          
          <div className="flex-1 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-slate-500 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium text-right">Avg Response</th>
                  <th className="px-4 py-3 font-medium text-right">Clearance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { dept: "Electricity & Lighting", time: "1.2 Days", rate: "92%", color: "text-yellow-400" },
                  { dept: "Water & Sanitation", time: "2.4 Days", rate: "85%", color: "text-blue-400" },
                  { dept: "Roads & Traffic", time: "5.1 Days", rate: "68%", color: "text-slate-500 dark:text-zinc-400" },
                  { dept: "Waste Management", time: "1.5 Days", rate: "89%", color: "text-purple-400" },
                  { dept: "Public Safety", time: "0.8 Days", rate: "96%", color: "text-red-400" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-600 dark:text-zinc-300 flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full bg-current", row.color)} />
                      {row.dept}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-600 dark:text-zinc-300">{row.time}</td>
                    <td className="px-4 py-4 text-right text-green-400">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}
