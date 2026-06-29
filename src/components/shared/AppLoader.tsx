"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { Logo } from "@/components/shared/Logo";

export function AppLoader() {
  const { loading, user } = useAuthStore();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // If not loading anymore and auth is determined, hide after a small delay
    if (!loading) {
      const timer = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950"
        >
          {/* Logo animation */}
          <div className="relative flex flex-col items-center">
            {/* Pulsing glow ring */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute -inset-8 rounded-full bg-blue-500/20 blur-2xl"
            />
            
            <Logo variant="stacked" size="xl" animated className="relative z-10" />

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-4 text-sm font-medium tracking-widest text-slate-500 dark:text-zinc-500 uppercase"
            >
              Empowering Citizens
            </motion.p>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-12 w-64 h-1 bg-white dark:bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: loading ? "0%" : "100%" }}
              transition={{ 
                duration: loading ? 2 : 0.5, 
                ease: "easeInOut",
                repeat: loading ? Infinity : 0
              }}
              className="h-full w-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
