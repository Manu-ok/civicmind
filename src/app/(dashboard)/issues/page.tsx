"use client";

import { useEffect, useState, useMemo } from "react";
import { IssueCard } from "@/components/issues/IssueCard";
import { getIssues } from "@/lib/firebase/firestore";
import { Issue } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { IssueCardSkeleton } from "@/components/shared/Skeletons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MobileFilters } from "@/components/shared/MobileFilters";
import { Search, Filter, Loader2, AlertCircle, MapPin, User, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "road", "water", "electricity", "waste", "safety", "other"];
const SEVERITIES = ["All", "critical", "high", "medium", "low"];
const STATUSES = ["All", "pending", "verified", "in_progress", "resolved"];

export default function IssuesPage() {
  const { user } = useAuthStore();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [quickFilter, setQuickFilter] = useState("All");
  
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "urgent" | "upvotes">("newest");
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadIssues() {
      try {
        const fetchedIssues = await getIssues();
        setIssues(fetchedIssues);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadIssues();
  }, []);

  const filteredAndSortedIssues = useMemo(() => {
    let result = issues.filter(issue => {
      const matchSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "All" || issue.category === categoryFilter;
      const matchSeverity = severityFilter === "All" || issue.severity === severityFilter;
      const matchStatus = statusFilter === "All" || issue.status === statusFilter;
      
      let matchQuick = true;
      if (quickFilter === "Critical") matchQuick = issue.severity === "critical";
      if (quickFilter === "Verified") matchQuick = issue.status === "verified";
      if (quickFilter === "Near Me") matchQuick = issue.city === user?.city;
      if (quickFilter === "My Reports") matchQuick = issue.reportedBy === user?.uid;
      if (quickFilter === "Resolved") matchQuick = issue.status === "resolved";

      return matchSearch && matchCategory && matchSeverity && matchStatus && matchQuick;
    });

    result.sort((a, b) => {
      const timeA = (a.reportedAt as any)?.toMillis ? (a.reportedAt as any).toMillis() : 0;
      const timeB = (b.reportedAt as any)?.toMillis ? (b.reportedAt as any).toMillis() : 0;
      
      switch (sortBy) {
        case "newest": return timeB - timeA;
        case "oldest": return timeA - timeB;
        case "upvotes": return (b.upvotes || 0) - (a.upvotes || 0);
        case "urgent": return (b.priorityScore || 0) - (a.priorityScore || 0);
        default: return 0;
      }
    });

    return result;
  }, [issues, searchQuery, categoryFilter, severityFilter, statusFilter, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Community Feed</h1>
          <p className="text-zinc-400">Discover and support civic issues reported in your city.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search issues..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900 border-white/10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={cn("border-white/10 shrink-0", showFilters ? "bg-primary/20 text-primary border-primary/30" : "bg-zinc-900")}
          >
            <Filter className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Filters</span>
          </Button>
        </div>
      </div>

      {/* QUICK FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6">
        {[
          { id: "All", label: "All Issues", color: "bg-zinc-800 text-zinc-300" },
          { id: "Critical", label: "Critical", icon: ShieldAlert, color: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
          { id: "Verified", label: "Verified", icon: CheckCircle2, color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
          { id: "Near Me", label: "Near Me", icon: MapPin, color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20" },
          { id: "My Reports", label: "My Reports", icon: User, color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" },
          { id: "Resolved", label: "Resolved", icon: CheckCircle2, color: "bg-green-500/10 text-green-500 hover:bg-green-500/20" }
        ].map((chip) => {
          const isSelected = quickFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setQuickFilter(chip.id)}
              className={cn(
                "relative flex items-center shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                isSelected ? chip.color.split(' ')[0].replace('/10', '/20') + " " + chip.color.split(' ')[1] + " shadow-lg" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeChip"
                  className="absolute inset-0 rounded-full border border-current opacity-30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              {chip.icon && <chip.icon className={cn("w-4 h-4 mr-2", isSelected ? "" : "opacity-50")} />}
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        {showFilters && (
          <Card className="hidden lg:block w-64 shrink-0 p-5 bg-zinc-900/50 border-white/5 space-y-6 sticky top-6">
            
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Sort By</h3>
              <div className="flex flex-col gap-2">
                {[
                  { id: "newest", label: "Newest First" },
                  { id: "oldest", label: "Oldest First" },
                  { id: "urgent", label: "Most Urgent" },
                  { id: "upvotes", label: "Most Upvoted" }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id as any)}
                    className={cn(
                      "text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      sortBy === s.id ? "bg-primary/20 text-primary font-medium" : "text-zinc-400 hover:bg-zinc-800"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-800" />

            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Category</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                      categoryFilter === cat ? "bg-primary text-primary-foreground border-primary" : "bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800"
                    )}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-800" />

            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Severity</h3>
              <div className="flex flex-wrap gap-2">
                {SEVERITIES.map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                      severityFilter === sev ? "bg-primary text-primary-foreground border-primary" : "bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800"
                    )}
                  >
                    {sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-800" />

            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(stat => (
                  <button
                    key={stat}
                    onClick={() => setStatusFilter(stat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                      statusFilter === stat ? "bg-primary text-primary-foreground border-primary" : "bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800"
                    )}
                  >
                    {stat.replace("_", " ").charAt(0).toUpperCase() + stat.slice(1).replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            
          </Card>
        )}

        <MobileFilters 
          isOpen={showFilters} 
          onClose={() => setShowFilters(false)} 
          sortBy={sortBy} setSortBy={setSortBy}
          categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
          severityFilter={severityFilter} setSeverityFilter={setSeverityFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          CATEGORIES={CATEGORIES} SEVERITIES={SEVERITIES} STATUSES={STATUSES}
        />

        {/* Feed Grid */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <IssueCardSkeleton />
              <IssueCardSkeleton />
              <IssueCardSkeleton />
              <IssueCardSkeleton />
              <IssueCardSkeleton />
              <IssueCardSkeleton />
            </div>
          ) : filteredAndSortedIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedIssues.map((issue, idx) => (
                <IssueCard key={issue.id} issue={issue} index={idx} />
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-zinc-900/20 text-center px-4">
              <AlertCircle className="w-12 h-12 text-zinc-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No issues found</h3>
              <p className="text-zinc-400 max-w-sm">
                Try adjusting your search queries or clearing the filters to see more results.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 border-white/10 bg-zinc-900"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                  setSeverityFilter("All");
                  setStatusFilter("All");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
