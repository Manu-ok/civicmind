"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation, useMotionValue } from "framer-motion";

export function SwipeToBack({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [isSwiping, setIsSwiping] = useState(false);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      <motion.div
        className="w-full h-full bg-background relative z-10"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: typeof window !== 'undefined' ? window.innerWidth : 400 }}
        dragElastic={0.1}
        onDragStart={(e, info) => {
          // Only start drag if originating from the left edge (first 30px)
          if (info.point.x < 30) {
            setIsSwiping(true);
          } else {
            // Cancel drag if not from edge
            setIsSwiping(false);
          }
        }}
        onDrag={(e, info) => {
          if (!isSwiping) x.set(0);
        }}
        onDragEnd={(e, info) => {
          if (!isSwiping) return;
          if (info.offset.x > 100 || info.velocity.x > 500) {
            controls.start({ x: window.innerWidth, transition: { duration: 0.2 } }).then(() => {
              router.back();
            });
          } else {
            controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } });
          }
          setIsSwiping(false);
        }}
        animate={controls}
      >
        {children}
      </motion.div>
      
      {/* Background layer to show underneath while swiping */}
      <div className="absolute inset-0 bg-black z-0 flex items-center p-4">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
