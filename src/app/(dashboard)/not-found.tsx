"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        <div className="absolute -inset-10 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white dark:bg-zinc-900/50 shadow-2xl">
          <Search className="h-12 w-12 text-slate-500 dark:text-zinc-500" />
          <AlertTriangle className="absolute bottom-4 right-4 h-8 w-8 text-amber-500" />
        </div>
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-2 text-4xl font-black tracking-tight text-white sm:text-5xl"
      >
        404
      </motion.h1>
      
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-4 text-xl font-medium text-slate-600 dark:text-zinc-300"
      >
        Page Not Found
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8 max-w-md text-slate-500 dark:text-zinc-400"
      >
        This page got lost like an unresolved civic issue! We&apos;ve dispatched our digital team to investigate.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link href="/dashboard">
          <Button className="h-12 gap-2 rounded-full bg-white px-8 text-zinc-950 hover:bg-zinc-200">
            <Home className="h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
