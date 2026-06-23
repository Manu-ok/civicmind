"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  Map,
  List,
  CheckCircle,
  BarChart2,
  Bot,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Shield,
  User,
  Settings,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/uiStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";

// ── nav config ──────────────────────────────────────────────────────
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Report Issue", href: "/report", icon: Plus },
  { label: "Live Map", href: "/map", icon: Map },
  { label: "Issues", href: "/issues", icon: List },
  { label: "Verify", href: "/verify", icon: CheckCircle, badge: 3 },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Civic Agent", href: "/agent", icon: Bot },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

// ── sidebar ─────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ──────────────────────────────────── */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06] bg-zinc-950/95 backdrop-blur-2xl md:bg-zinc-950/80"
        initial={false}
        animate={{ 
          width: typeof window !== "undefined" && window.innerWidth < 768 ? 256 : (sidebarOpen ? 256 : 72),
          x: typeof window !== "undefined" && window.innerWidth < 768 ? (sidebarOpen ? 0 : "-100%") : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* ── logo ─────────────────────────────────────────── */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
          <motion.div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield className="h-5 w-5 text-white" />
          </motion.div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-lg font-bold tracking-tight text-transparent"
              >
                CivicMind AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── navigation ───────────────────────────────────── */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <NavItem
                key={item.href}
                item={item}
                isActive={isActive}
                collapsed={!sidebarOpen}
              />
            );
          })}
        </nav>

        {/* ── bottom section ───────────────────────────────── */}
        <div className="border-t border-white/[0.06] p-3 space-y-2">
          {/* User row */}
          <div className={cn("flex items-center gap-3 rounded-xl p-2", sidebarOpen ? "" : "justify-center")}>
            <UserAvatar user={user as any} className="h-8 w-8 text-xs" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-medium text-zinc-200">{user?.displayName || "User"}</p>
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Sparkles className="h-3 w-3" />
                    <span>{user?.points ?? 0} pts</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons row */}
          <div className={cn("flex gap-1", sidebarOpen ? "" : "flex-col items-center")}>
            <motion.button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>

            <motion.button
              onClick={signOut}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Collapse toggle */}
          <motion.button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-lg py-1.5 text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}

// ── nav item ────────────────────────────────────────────────────────
function NavItem({
  item,
  isActive,
  collapsed,
}: {
  item: (typeof navItems)[number];
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  // On mobile, force uncollapsed text
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const showText = !collapsed || isMobile;

  return (
    <Link href={item.href} className="group relative block">
      <motion.div
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200",
          isActive
            ? "text-white"
            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
          !showText ? "justify-center" : ""
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Active background pill */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/15 to-violet-500/10 border border-blue-500/10"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {/* Active left indicator */}
        {isActive && (
          <motion.div
            layoutId="sidebar-indicator"
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-violet-500"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        <div className="relative z-10 flex-shrink-0">
          <Icon
            className={cn("h-[18px] w-[18px] transition-colors", isActive ? "text-blue-400" : "")}
          />
          {/* Active glow */}
          {isActive && (
            <div className="absolute inset-0 -m-1 rounded-full bg-blue-400/20 blur-md" />
          )}
        </div>

          <AnimatePresence>
            {showText && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap text-[13px] font-medium tracking-wide"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {item.badge && showText && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-bold text-blue-400"
              >
                {item.badge}
              </motion.div>
            )}
          </AnimatePresence>
      </motion.div>

      {/* Collapsed tooltip */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
          {item.label}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 rotate-45 border-b border-l border-white/[0.08] bg-zinc-900 h-2 w-2" />
        </div>
      )}
    </Link>
  );
}
