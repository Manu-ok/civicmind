"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Plus, Compass, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/authStore";
import { useFeedStats } from "@/lib/hooks/useFeedStats";

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { unreadCount } = useFeedStats();

  const mobileNavItems = [
    { label: "Feed", href: "/feed", icon: Newspaper, badge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Report", href: "/report", icon: Plus, isPrimary: true },
    { label: "Circles", href: "/circles", icon: Users },
    { label: "Profile", href: `/profile/${user?.username || 'user'}`, icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] border-t border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-zinc-950/90 backdrop-blur-2xl md:hidden">
      <div className="flex items-center justify-around px-2 py-1.5 h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          
          if (item.isPrimary) {
            return (
              <div key={item.href} className="relative -top-5 flex flex-col items-center">
                <Link
                  href={item.href}
                  className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20 transition-transform active:scale-95"
                >
                  <item.icon className="h-6 w-6 text-white" />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex flex-col items-center justify-center gap-1 px-3 w-16 h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-500/15 to-violet-500/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <div className="relative">
                <item.icon
                  className={cn(
                    "relative z-10 h-5 w-5 transition-colors",
                    isActive ? "text-blue-400" : "text-slate-500 dark:text-zinc-500 group-hover:text-slate-600 dark:text-zinc-300"
                  )}
                />
                <AnimatePresence>
                  {item.badge && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute -top-1.5 -right-2 flex h-4 px-1 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg shadow-red-500/20 z-20"
                    >
                      {item.badge}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <span
                className={cn(
                  "relative z-10 text-[10px] font-medium transition-colors mt-0.5",
                  isActive ? "text-blue-400" : "text-slate-500 dark:text-zinc-500 group-hover:text-slate-600 dark:text-zinc-300"
                )}
              >
                {item.label}
              </span>
              
              {/* Active dot indicator beneath label */}
              {isActive && (
                <motion.div
                  layoutId="mobile-dot"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area for devices with gesture bars */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
