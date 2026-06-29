"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAchievementStore } from "@/lib/stores/achievementStore";
import confetti from "canvas-confetti";
import { Award, Shield, Activity, Star } from "lucide-react";

export function AchievementOverlay() {
  const { activeAchievement, hideAchievement } = useAchievementStore();

  useEffect(() => {
    if (activeAchievement) {
      // Fire confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6']; // Brand colors

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      // Auto hide
      const timer = setTimeout(() => {
        hideAchievement();
      }, 4000); // 4 seconds total display

      return () => clearTimeout(timer);
    }
  }, [activeAchievement, hideAchievement]);

  return (
    <AnimatePresence>
      {activeAchievement && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white dark:bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-[90%] pointer-events-auto text-center relative overflow-hidden"
          >
            {/* Background glow */}
            <div className={`absolute inset-0 opacity-20 ${activeAchievement.color} blur-3xl`} />

            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 15 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-lg ${activeAchievement.color}`}
            >
              <div className="absolute inset-1 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
                <span className="text-5xl">{activeAchievement.icon}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10"
            >
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Level Up!</h2>
              <h3 className="text-2xl font-black text-white mb-2">{activeAchievement.title}</h3>
              <p className="text-slate-500 dark:text-zinc-400 text-sm">{activeAchievement.description}</p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={hideAchievement}
              className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold text-sm transition-colors relative z-10"
            >
              Awesome
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
