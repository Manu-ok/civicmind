"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUIStore } from "@/lib/stores/uiStore";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import PageWrapper from "@/components/layout/PageWrapper";
import { DemoBanner } from "@/components/shared/DemoBanner";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (!user.hasCompletedOnboarding && pathname !== "/onboarding") {
        router.replace("/onboarding");
      } else if (user.hasCompletedOnboarding && pathname === "/onboarding") {
        router.replace("/feed");
      }
    }
  }, [user, loading, pathname, router]);

  // Show nothing while checking auth or waiting for redirect
  if (loading || !user || (!user.hasCompletedOnboarding && pathname !== "/onboarding")) {
    return null;
  }

  if (pathname === "/onboarding") {
    return (
      <div className="min-h-screen bg-background">
        <PageWrapper>{children}</PageWrapper>
      </div>
    );
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
        <DemoBanner />

        <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
          <PageWrapper>{children}</PageWrapper>
        </main>
        
        <MobileNav />
      </motion.div>
    </div>
  );
}
