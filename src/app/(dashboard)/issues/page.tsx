"use client";

import { useEffect, useState, useMemo } from "react";
import { IssueCard } from "@/components/issues/IssueCard";
import { getIssues } from "@/lib/firebase/firestore";
import { Issue } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Filter, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "road", "water", "electricity", "waste", "safety", "other"];
const SEVERITIES = ["All", "critical", "high", "medium", "low"];
const STATUSES = ["All", "pending", "verified", "in_progress", "resolved"];

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
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
      
      return matchSearch && matchCategory && matchSeverity && matchStatus;
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

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Filters */}
        {showFilters && (
          <Card className="w-full lg:w-64 shrink-0 p-5 bg-zinc-900/50 border-white/5 space-y-6 sticky top-6">
            
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
                      "px-3 py-1 rounded-full text-xs font-medium capitalize border transition-all",
                      categoryFilter === cat ? "bg-zinc-200 text-zinc-900 border-zinc-200" : "bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/30"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Severity</h3>
              <div className="flex flex-wrap gap-2">
                {SEVERITIES.map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium capitalize border transition-all",
                      severityFilter === sev ? "bg-zinc-200 text-zinc-900 border-zinc-200" : "bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/30"
                    )}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(stat => (
                  <button
                    key={stat}
                    onClick={() => setStatusFilter(stat)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium capitalize border transition-all",
                      statusFilter === stat ? "bg-zinc-200 text-zinc-900 border-zinc-200" : "bg-zinc-900 border-white/10 text-zinc-400 hover:border-white/30"
                    )}
                  >
                    {stat.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

          </Card>
        )}

        {/* Feed Grid */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-zinc-400">Loading issues...</p>
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
