"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, MapPin, Activity, FileText, CheckCircle2, Clock, ShieldAlert, AlertTriangle } from "lucide-react";
import { getIssues } from "@/lib/firebase/firestore";
import { Issue } from "@/lib/types";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      
      // Fetch issues for client-side search simulation
      getIssues().then(setIssues).catch(console.error);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredIssues = issues
    .filter(issue => 
      issue.title.toLowerCase().includes(query.toLowerCase()) || 
      issue.description.toLowerCase().includes(query.toLowerCase()) ||
      issue.ward.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4);

  const quickActions = [
    { id: 'report', title: 'Report New Issue', icon: FileText, action: () => router.push('/report') },
    { id: 'analytics', title: 'View Analytics', icon: Activity, action: () => router.push('/analytics') },
    { id: 'map', title: 'Live Map', icon: MapPin, action: () => router.push('/map') },
  ].filter(action => action.title.toLowerCase().includes(query.toLowerCase()));

  const totalResults = filteredIssues.length + quickActions.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalResults);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalResults) % totalResults);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (totalResults === 0) return;
      
      if (selectedIndex < quickActions.length) {
        quickActions[selectedIndex].action();
        onClose();
      } else {
        const issue = filteredIssues[selectedIndex - quickActions.length];
        router.push(`/issues/${issue.id}`);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-32">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Search Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden mx-4"
        >
          {/* Input Header */}
          <div className="flex items-center px-4 py-4 border-b border-white/10 bg-zinc-900/50">
            <Search className="w-5 h-5 text-zinc-400 mr-3" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search issues, locations, or actions..."
              className="flex-1 bg-transparent border-0 text-white placeholder-zinc-500 focus:outline-none focus:ring-0 text-lg"
            />
            <div className="flex items-center gap-1">
              <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-medium text-zinc-400 bg-zinc-800 rounded-md border border-white/10">ESC</kbd>
            </div>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
            {totalResults === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No results found for &quot;{query}&quot;</p>
              </div>
            ) : (
              <>
                {/* Quick Actions */}
                {quickActions.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Quick Actions
                    </div>
                    {quickActions.map((action, idx) => (
                      <div
                        key={action.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => { action.action(); onClose(); }}
                        className={`flex items-center px-4 py-3 cursor-pointer rounded-xl transition-colors ${
                          selectedIndex === idx ? "bg-blue-500/10 text-blue-400" : "text-zinc-300 hover:bg-white/5"
                        }`}
                      >
                        <action.icon className="w-5 h-5 mr-3 opacity-70" />
                        <span className="font-medium">{action.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Issues */}
                {filteredIssues.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Issues
                    </div>
                    {filteredIssues.map((issue, idx) => {
                      const actualIndex = idx + quickActions.length;
                      return (
                        <div
                          key={issue.id}
                          onMouseEnter={() => setSelectedIndex(actualIndex)}
                          onClick={() => { router.push(`/issues/${issue.id}`); onClose(); }}
                          className={`flex items-start px-4 py-3 cursor-pointer rounded-xl transition-colors ${
                            selectedIndex === actualIndex ? "bg-zinc-800/80 text-white" : "text-zinc-400 hover:bg-white/5"
                          }`}
                        >
                          <div className="mt-0.5 mr-3">
                            {getSeverityIcon(issue.severity)}
                          </div>
                          <div>
                            <h4 className={`text-sm font-medium ${selectedIndex === actualIndex ? 'text-white' : 'text-zinc-200'}`}>
                              {issue.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                              <span className="capitalize">{issue.category}</span>
                              <span className="w-1 h-1 rounded-full bg-zinc-600" />
                              <span>{issue.ward}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="px-4 py-3 border-t border-white/5 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-[10px]">↓</kbd>
                <span className="ml-1">to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-[10px]">↵</kbd>
                <span className="ml-1">to select</span>
              </span>
            </div>
            <span>Powered by CivicMind AI</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
