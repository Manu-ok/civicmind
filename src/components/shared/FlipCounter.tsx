"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function FlipCounter({ value, className = "" }: { value: number; className?: string }) {
  const [direction, setDirection] = useState(1);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setDirection(value > prevValue ? 1 : -1);
      setPrevValue(value);
    }
  }, [value, prevValue]);

  return (
    <div className={`relative overflow-hidden inline-flex items-center justify-center ${className}`}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.span
          key={value}
          custom={direction}
          initial={{ y: direction * 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction * -15, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
