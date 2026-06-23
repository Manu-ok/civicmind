"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Issue } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Droplets, Zap, ShieldAlert, CheckCircle2, Trash2, MapPin } from "lucide-react";

interface ActivityEvent {
  id: string;
  type: 'reported' | 'resolved';
  issue: Issue;
  timestamp: Date;
}

export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "issues"),
      orderBy("reportedAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Issue[];

      const newEvents: ActivityEvent[] = [];
      
      issues.forEach(issue => {
        // Handle firestore timestamps
        const reportedAt = (issue.reportedAt as any)?.toDate ? (issue.reportedAt as any).toDate() : new Date();
        
        newEvents.push({
          id: `${issue.id}-reported`,
          type: 'reported',
          issue,
          timestamp: reportedAt
        });

        // If it's resolved, add a resolved event too
        if (issue.status === 'resolved' && issue.updatedAt) {
          const resolvedAt = (issue.updatedAt as any)?.toDate ? (issue.updatedAt as any).toDate() : new Date();
          newEvents.push({
            id: `${issue.id}-resolved`,
            type: 'resolved',
            issue,
            timestamp: resolvedAt
          });
        }
      });

      // Sort all events by timestamp desc and take top 10
      newEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setEvents(newEvents.slice(0, 10));
    });

    return () => unsubscribe();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "water": return <Droplets className="w-4 h-4 text-blue-400" />;
      case "electricity": return <Zap className="w-4 h-4 text-yellow-400" />;
      case "roads": return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case "safety": return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case "waste": return <Trash2 className="w-4 h-4 text-emerald-400" />;
      default: return <MapPin className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-white/[0.04] rounded-2xl p-6 flex flex-col h-[500px]">
      <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Live Activity Feed
      </h2>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {events.map((event) => {
            const isRecent = (new Date().getTime() - event.timestamp.getTime()) < 5 * 60 * 1000;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
                className={`p-4 rounded-xl border transition-all duration-500 ${
                  isRecent 
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                    : 'bg-zinc-800/30 border-white/[0.04]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-full ${event.type === 'resolved' ? 'bg-green-500/20' : 'bg-zinc-800'}`}>
                    {event.type === 'resolved' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : getCategoryIcon(event.issue.category)}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-zinc-200">
                      {event.type === 'resolved' ? (
                        <span>Issue resolved: <span className="font-medium text-white">{event.issue.title}</span></span>
                      ) : (
                        <span>
                          Someone reported a <span className="font-medium text-white capitalize">{event.issue.category}</span> issue in <span className="font-medium text-white">{event.issue.location?.ward || 'Unknown'}</span>
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 font-medium">
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {events.length === 0 && (
          <div className="text-center text-zinc-500 mt-10">Waiting for live activity...</div>
        )}
      </div>
    </div>
  );
}
