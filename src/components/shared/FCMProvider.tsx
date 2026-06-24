"use client";

import { useEffect } from "react";
import { useFCM } from "@/lib/hooks/useFCM";
import { Bell, BellOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FCMProvider() {
  const { permission, requestPermission } = useFCM();

  // If permission is already granted or denied, don't show the prompt banner.
  // The hook automatically initializes FCM if permission is granted.
  if (permission !== "default") return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-blue-500 text-white p-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Enable push notifications</h4>
            <p className="text-xs text-white/80">Get real-time updates on civic issues and social interactions in your ward.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => requestPermission()}
            className="flex-1 sm:flex-none bg-white text-blue-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors shadow-lg"
          >
            Enable
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
