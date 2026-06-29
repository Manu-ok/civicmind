"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapSkeleton } from "@/components/shared/Skeletons";
const CivicMap = dynamic(() => import("@/components/map/CivicMap").then(mod => mod.CivicMap), { ssr: false, loading: () => <MapSkeleton /> });
import { useIssueStore } from "@/lib/stores/issueStore";
import { Filter, Layers, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useIssues } from "@/lib/hooks/useIssues";
import { Category, Severity } from "@/lib/types";

export default function MapPage() {
  const router = useRouter();
  const { filters, setFilters } = useIssueStore();
  const { issues, loading } = useIssues();
  
  const [showFilters, setShowFilters] = useState(false);

  const toggleCategory = (cat: Category) => {
    if (filters.category === cat) {
      setFilters({ category: undefined });
    } else {
      setFilters({ category: cat });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen w-full relative">
      
      {/* Top Stats & Filters Bar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button 
          variant="secondary" 
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white dark:bg-zinc-900/90 backdrop-blur shadow-xl border-white/10"
        >
          <Filter className="w-4 h-4" />
        </Button>
        <div className="hidden md:flex bg-white dark:bg-zinc-900/90 backdrop-blur rounded-lg shadow-xl border border-white/10 items-center px-4 py-2 gap-4">
          <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">Live Issues: <span className="text-white font-bold">{issues.length}</span></span>
        </div>
      </div>

      {/* Floating Filters Panel */}
      {showFilters && (
        <div className="absolute top-16 left-4 z-20 w-64 bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4">
          <h3 className="font-semibold text-sm text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {(["road", "water", "electricity", "waste", "safety", "other"] as Category[]).map(cat => (
              <Badge 
                key={cat}
                variant={filters.category === cat ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>

          <h3 className="font-semibold text-sm text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Severity</h3>
          <div className="flex flex-wrap gap-2">
            {(["critical", "high", "medium", "low"] as Severity[]).map(sev => (
              <Badge 
                key={sev}
                variant={filters.severity === sev ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setFilters({ severity: filters.severity === sev ? undefined : sev })}
              >
                {sev}
              </Badge>
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full mt-6 text-slate-500 dark:text-zinc-400 hover:text-white"
            onClick={() => setFilters({ category: undefined, severity: undefined, status: undefined, ward: undefined })}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Main Map */}
      {loading ? (
        <div className="absolute inset-0 z-0 p-4 pt-20">
          <MapSkeleton />
        </div>
      ) : (
        <CivicMap />
      )}

      {/* Floating Action Button */}
      <Button 
        size="lg"
        className="absolute bottom-6 right-6 rounded-full shadow-2xl shadow-primary/25 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 z-10"
        onClick={() => router.push("/report")}
      >
        <Navigation className="w-5 h-5 mr-2" />
        Report Issue
      </Button>

    </div>
  );
}
