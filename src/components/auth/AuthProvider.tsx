"use client";

import { useEffect } from "react";
import { onAuthStateChange } from "@/lib/firebase/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { motion } from "framer-motion";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, loading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}

function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-1/4 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-violet-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-transparent border-b-blue-400 border-l-violet-400"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Brand */}
        <motion.h1
          className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-xl font-bold tracking-tight text-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          CivicMind AI
        </motion.h1>
        <p className="text-sm text-zinc-500">Loading your experience...</p>
      </motion.div>
    </div>
  );
}
