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
import { NotificationCenter } from "../shared/NotificationCenter";
import { GlobalSearch } from "../shared/GlobalSearch";
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
        <NotificationCenter />

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
                  
                  {/* Demo Admin Toggle */}
                  <div className="border-t border-white/[0.06] mt-1 pt-1">
                    <button
                      onClick={() => useAuthStore.getState().toggleAdminMode()}
                      className="flex w-full items-center justify-between px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.04]"
                    >
                      <span>Admin Mode (Demo)</span>
                      <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${user?.role === 'admin' ? 'bg-blue-500' : 'bg-zinc-700'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${user?.role === 'admin' ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  </div>
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
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
