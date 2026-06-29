import React from "react";
import PageWrapper from "@/components/layout/PageWrapper";

export default function FeedLoading() {
  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Story Rings Skeleton */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 animate-pulse border-2 border-zinc-900" />
              <div className="w-12 h-3 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Feed Items Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-full h-48 bg-slate-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="w-3/4 h-4 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="w-1/2 h-4 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
