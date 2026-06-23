"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/uiStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { useAuth } from "@/lib/hooks/useAuth";

// ── route → title mapping ───────────────────────────────────────────
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/report": "Report Issue",
  "/map": "Live Map",
  "/issues": "Issues",
  "/verify": "Verify Reports",
  "/analytics": "Analytics",
  "/agent": "Civic Agent",
};

function getPageTitle(pathname: string): string {
  for (const [route, title] of Object.entries(pageTitles)) {
    if (pathname === route || pathname.startsWith(route + "/")) return title;
  }
  return "CivicMind AI";
}

// ── navbar ──────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const { signOut } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(user?.city || "All Cities");

  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
        setUserMenuOpen(false);
        setCityMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pageTitle = getPageTitle(pathname);

  const cities = ["All Cities", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad"];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-zinc-950/80 px-4 backdrop-blur-2xl md:px-6">
        {/* ── Hamburger ──────────────────────────────────────── */}
        <motion.button
          onClick={toggleSidebar}
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200 md:flex"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="h-5 w-5" />
        </motion.button>

        {/* ── Page Title ─────────────────────────────────────── */}
        <div className="flex-1">
          <motion.h1
            key={pageTitle}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-semibold text-white"
          >
            {pageTitle}
          </motion.h1>
        </div>

        {/* ── Search trigger ─────────────────────────────────── */}
        <motion.button
          onClick={() => setSearchOpen(true)}
          className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 text-sm text-zinc-500 transition-all hover:border-white/[0.1] hover:bg-white/[0.05]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search issues...</span>
          <kbd className="ml-2 hidden rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline-block">
            ⌘K
          </kbd>
        </motion.button>

        {/* ── City selector ──────────────────────────────────── */}
        <div ref={cityRef} className="relative hidden md:block">
          <motion.button
            onClick={() => setCityMenuOpen(!cityMenuOpen)}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 text-sm text-zinc-300 transition-all hover:border-white/[0.1]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MapPin className="h-3.5 w-3.5 text-blue-400" />
            <span>{selectedCity}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${cityMenuOpen ? "rotate-180" : ""}`} />
          </motion.button>

          <AnimatePresence>
            {cityMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
              >
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => { setSelectedCity(city); setCityMenuOpen(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      selectedCity === city ? "bg-blue-500/10 text-blue-400" : "text-zinc-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    {selectedCity === city && <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />}
                    {city}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Notifications ──────────────────────────────────── */}
        <div ref={notifRef} className="relative">
          <motion.button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              5
            </span>
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                  <h3 className="text-sm font-semibold text-zinc-200">Notifications</h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {[
                    { title: "Issue Verified", desc: "Pothole on MG Road was verified by 3 citizens", time: "2m ago", unread: true },
                    { title: "AI Analysis Complete", desc: "Water leakage on 5th Cross received severity: High", time: "15m ago", unread: true },
                    { title: "Resolution Started", desc: "BBMP marked road repair issue as in-progress", time: "1h ago", unread: false },
                    { title: "Points Earned!", desc: "You earned 25 points for verifying an issue", time: "2h ago", unread: false },
                    { title: "New Issue Nearby", desc: "Broken streetlight reported in your ward", time: "3h ago", unread: false },
                  ].map((n, i) => (
                    <div key={i} className={`flex gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.03] ${n.unread ? "bg-blue-500/[0.03]" : ""}`}>
                      {n.unread && <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />}
                      <div className={n.unread ? "" : "ml-5"}>
                        <p className="text-sm font-medium text-zinc-200">{n.title}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{n.desc}</p>
                        <p className="mt-1 text-[10px] text-zinc-600">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/[0.06] px-4 py-2.5 text-center">
                  <button className="text-xs font-medium text-blue-400 hover:text-blue-300">View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── User avatar menu ───────────────────────────────── */}
        <div ref={userRef} className="relative">
          <motion.button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-600 ring-2 ring-transparent transition-all hover:ring-blue-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white">
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
              >
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="text-sm font-medium text-zinc-200">{user?.displayName}</p>
                  <p className="text-xs text-zinc-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  {[
                    { label: "Profile Settings", action: () => {} },
                    { label: "My Reports", action: () => {} },
                    { label: "Help & Support", action: () => {} },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="flex w-full items-center px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.04]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/[0.06] py-1">
                  <button
                    onClick={signOut}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── COMMAND PALETTE / SEARCH OVERLAY ────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />

            {/* Search modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
                <Search className="h-5 w-5 text-zinc-500" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search issues, locations, citizens..."
                  className="h-14 w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="flex h-6 items-center rounded border border-white/[0.1] bg-white/[0.04] px-1.5 text-[10px] text-zinc-500"
                >
                  ESC
                </button>
              </div>

              {/* Quick actions */}
              <div className="px-2 py-2">
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  Quick Actions
                </p>
                {[
                  { label: "Report a new issue", hint: "Create" },
                  { label: "View nearby issues on map", hint: "Navigate" },
                  { label: "Talk to Civic Agent", hint: "AI" },
                  { label: "View analytics dashboard", hint: "Data" },
                ].map((item, i) => (
                  <button
                    key={i}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/[0.04]"
                  >
                    <span>{item.label}</span>
                    <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-500">{item.hint}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
