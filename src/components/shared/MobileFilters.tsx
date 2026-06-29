"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: string;
  setSortBy: (val: any) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  severityFilter: string;
  setSeverityFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  CATEGORIES: string[];
  SEVERITIES: string[];
  STATUSES: string[];
}

export function MobileFilters({
  isOpen,
  onClose,
  sortBy, setSortBy,
  categoryFilter, setCategoryFilter,
  severityFilter, setSeverityFilter,
  statusFilter, setStatusFilter,
  CATEGORIES, SEVERITIES, STATUSES
}: MobileFiltersProps) {

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/[0.08] bg-slate-50 dark:bg-zinc-950 p-6 shadow-2xl md:hidden"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) onClose();
            }}
          >
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-slate-100 dark:bg-zinc-800" />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-500 dark:text-zinc-400">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-8 pb-20">
              {/* Sort By */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Sort By</h3>
                <div className="grid grid-cols-2 gap-2">
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
                        "text-left px-3 py-2.5 rounded-xl text-sm transition-colors border",
                        sortBy === s.id ? "bg-primary/20 text-primary border-primary/30 font-medium" : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-white/5 hover:bg-slate-100 dark:bg-zinc-800"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                        categoryFilter === cat ? "bg-primary text-primary-foreground border-primary" : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-white/5 hover:bg-slate-100 dark:bg-zinc-800"
                      )}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Severity</h3>
                <div className="flex flex-wrap gap-2">
                  {SEVERITIES.map(sev => (
                    <button
                      key={sev}
                      onClick={() => setSeverityFilter(sev)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                        severityFilter === sev ? "bg-primary text-primary-foreground border-primary" : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-white/5 hover:bg-slate-100 dark:bg-zinc-800"
                      )}
                    >
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(stat => (
                    <button
                      key={stat}
                      onClick={() => setStatusFilter(stat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                        statusFilter === stat ? "bg-primary text-primary-foreground border-primary" : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-white/5 hover:bg-slate-100 dark:bg-zinc-800"
                      )}
                    >
                      {stat.replace("_", " ").charAt(0).toUpperCase() + stat.slice(1).replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-50 dark:bg-zinc-950 border-t border-white/10 md:hidden pb-[max(1rem,env(safe-area-inset-bottom))]">
               <Button onClick={onClose} className="w-full h-12 rounded-xl text-lg font-bold">Apply Filters</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
