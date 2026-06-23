"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUIStore } from "@/lib/stores/uiStore";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import PageWrapper from "@/components/layout/PageWrapper";

import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Show nothing while checking auth
  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main content area ──────────────────────────────── */}
      <motion.div
        className="flex min-h-screen flex-1 flex-col"
        animate={{
          marginLeft: typeof window !== "undefined" && window.innerWidth >= 768
            ? sidebarOpen ? 256 : 72
            : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Navbar />

        {/* ── Demo Banner ────────────────────────────────────── */}
        <div className="w-full bg-indigo-600/20 border-b border-indigo-500/30 px-4 py-1.5 flex items-center justify-center backdrop-blur-md sticky top-[64px] z-40 hidden md:flex">
          <p className="text-xs font-bold text-indigo-300 tracking-wider uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            🎮 Demo Mode — AI features are live
          </p>
        </div>
        <div className="w-full bg-indigo-600/20 border-b border-indigo-500/30 px-4 py-1.5 flex items-center justify-center backdrop-blur-md sticky top-[60px] z-40 md:hidden">
          <p className="text-[10px] font-bold text-indigo-300 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Demo Mode — AI features live
          </p>
        </div>

        <main className="flex-1 pb-20 md:pb-0">
          <ErrorBoundary>
            <PageWrapper>{children}</PageWrapper>
          </ErrorBoundary>
        </main>
        
        <MobileNav />
      </motion.div>
    </div>
  );
}
