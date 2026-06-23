"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";

// ── breadcrumb mapping ──────────────────────────────────────────────
const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  report: "Report Issue",
  map: "Live Map",
  issues: "Issues",
  verify: "Verify",
  analytics: "Analytics",
  agent: "Civic Agent",
};

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6"
    >
      {/* ── breadcrumbs ──────────────────────────────────────── */}
      {segments.length > 0 && (
        <nav className="mb-6 flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>

          {segments.map((segment, i) => {
            const href = "/" + segments.slice(0, i + 1).join("/");
            const label = breadcrumbLabels[segment] || segment;
            const isLast = i === segments.length - 1;

            return (
              <span key={href} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3 text-zinc-700" />
                {isLast ? (
                  <span className="font-medium text-zinc-300">{label}</span>
                ) : (
                  <Link
                    href={href}
                    className="text-zinc-500 transition-colors hover:text-zinc-300"
                  >
                    {label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* ── page content ─────────────────────────────────────── */}
      {children}
    </motion.div>
  );
}
