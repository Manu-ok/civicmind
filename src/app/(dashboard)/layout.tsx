"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUIStore } from "@/lib/stores/uiStore";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import PageWrapper from "@/components/layout/PageWrapper";

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

        <main className="flex-1 pb-20 md:pb-0">
          <PageWrapper>{children}</PageWrapper>
        </main>
      </motion.div>
    </div>
  );
}
