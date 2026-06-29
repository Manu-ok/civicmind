import React from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Compass } from "lucide-react";

export default function ExploreLoading() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Search Bar Skeleton */}
        <div className="w-full max-w-xl mx-auto h-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full animate-pulse" />

        {/* Categories/Filters Skeleton */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-24 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 animate-pulse shrink-0" />
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="w-3/4 h-5 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="w-1/2 h-4 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between">
                <div className="w-16 h-4 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="w-16 h-4 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
