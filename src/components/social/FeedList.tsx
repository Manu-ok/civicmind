"use client";

import { useEffect, useRef } from "react";
import { FeedItem as FeedItemType } from "@/lib/types";
import { FeedItem } from "./FeedItem";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Loader2 } from "lucide-react";
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { EmptyState } from "@/components/shared/EmptyState";

interface FeedListProps {
  items: FeedItemType[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function FeedList({ items, loading, hasMore, onLoadMore }: FeedListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Create a debounced load more to prevent rapid firing
  const debouncedLoadMore = useDebounce(onLoadMore, 100);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          debouncedLoadMore();
        }
      },
      // Trigger at 80% scroll of viewport or earlier depending on position
      { rootMargin: "0px 0px 400px 0px", threshold: 0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, debouncedLoadMore]);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => 350,
    overscan: 3,
  });

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-50 dark:bg-zinc-950 border border-white/5 rounded-3xl p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white dark:bg-zinc-900 rounded w-1/3" />
                <div className="h-3 bg-white dark:bg-zinc-900 rounded w-1/4" />
              </div>
            </div>
            <div className="w-full h-48 bg-white dark:bg-zinc-900 rounded-2xl mb-4" />
            <div className="space-y-2">
              <div className="h-5 bg-white dark:bg-zinc-900 rounded w-3/4" />
              <div className="h-4 bg-white dark:bg-zinc-900 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="py-10">
        <EmptyState
          icon={Filter}
          title="Nothing here yet"
          description="Follow community members, join circles, or change your ward to see local activity."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="popLayout">
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;
            return (
              <motion.div
                key={item.id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
                transition={{ 
                  type: "spring",
                  damping: 25,
                  stiffness: 200,
                  delay: virtualItem.index < 10 ? virtualItem.index * 0.08 : 0 
                }}
              >
                <FeedItem item={item} priority={virtualItem.index < 3} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Element for IntersectionObserver to trigger infinite scroll at 80% */}
      <div ref={observerTarget} className="h-10 w-full" />
      
      {loading && items.length > 0 && (
        <div className="py-6 flex justify-center">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="py-8 text-center text-slate-500 dark:text-zinc-500 text-sm font-bold">
          You&apos;ve caught up on all updates!
        </div>
      )}
    </div>
  );
}
