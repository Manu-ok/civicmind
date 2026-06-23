"use client";

import confetti from "canvas-confetti";

export const triggerConfetti = () => {
  if (typeof window === "undefined") return;

  const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (shouldReduceMotion) return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#3B82F6', '#8B5CF6', '#22C55E']
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};
