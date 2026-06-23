"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, Plus, Map, Bot, List } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Report", href: "/report", icon: Plus },
  { label: "Map", href: "/map", icon: Map },
  { label: "Issues", href: "/issues", icon: List },
  { label: "Agent", href: "/agent", icon: Bot },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-2xl md:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex flex-col items-center gap-1 px-3 py-1.5 w-16"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-500/15 to-violet-500/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "relative z-10 h-5 w-5 transition-colors",
                  isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              <span
                className={cn(
                  "relative z-10 text-[10px] font-medium transition-colors",
                  isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              >
                {item.label}
              </span>
              
              {/* Active dot indicator beneath label */}
              {isActive && (
                <motion.div
                  layoutId="mobile-dot"
                  className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-400"
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
