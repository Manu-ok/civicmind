"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Show in development or if ?demo=true
    if (process.env.NODE_ENV === "development" || searchParams.get("demo") === "true") {
      setIsVisible(true);
    }
  }, [searchParams]);

  if (!isVisible) return null;

  const exitDemo = () => {
    setIsVisible(false);
    // If URL has demo=true, remove it
    if (searchParams.get("demo") === "true") {
      router.replace(pathname);
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40 flex h-8 items-center justify-center bg-amber-500 text-amber-950 px-4 shadow-md md:left-64 md:top-0">
      <div className="flex w-full max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <span className="text-sm">🎮</span> Demo Mode Active — AI features are live
        </div>
        <button
          onClick={exitDemo}
          className="flex items-center gap-1 rounded bg-amber-950/10 px-2 py-0.5 text-xs font-medium hover:bg-amber-950/20 transition-colors"
        >
          Exit Demo
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
