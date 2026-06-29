"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "stacked" | "wordmark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  clickable?: boolean;
  showTagline?: boolean;
  className?: string;
}

const LogoFallback = ({ size, variant }: { size: string; variant: string }) => {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20",
          sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md
        )}
      >
        <Shield className="h-1/2 w-1/2 text-white" />
      </div>
      {(variant === "full" || variant === "stacked" || variant === "wordmark") && (
        <span
          className={cn(
            "bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text font-bold tracking-tight text-transparent",
            textClasses[size as keyof typeof textClasses] || textClasses.md
          )}
        >
          CivicMind AI
        </span>
      )}
    </div>
  );
};

export function Logo({
  variant = "full",
  size = "md",
  animated = false,
  clickable = false,
  showTagline = false,
  className,
}: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [imageError, setImageError] = useState(false);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark" || !currentTheme;

  let src = "";
  if (variant === "full") src = isDark ? "/logo-full-dark.png" : "/logo-full-light.png";
  if (variant === "icon") src = isDark ? "/logo-icon-gradient.png" : "/logo-icon-white.png";
  if (variant === "stacked") src = isDark ? "/logo-stacked-dark.png" : "/logo-stacked-light.png";
  if (variant === "wordmark") src = isDark ? "/logo-wordmark-dark.png" : "/logo-wordmark-light.png";

  const sizeMap = {
    xs: { width: 24, height: 24 },
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 },
  };

  const dimensions = { ...sizeMap[size] };

  if (variant === "full" || variant === "stacked" || variant === "wordmark") {
    dimensions.width *= 4;
  }

  const content = (
    <div className={cn("flex flex-col items-center", className)}>
      {imageError ? (
        <LogoFallback size={size} variant={variant} />
      ) : (
        <Image
          src={src}
          alt="CivicMind AI Logo"
          width={dimensions.width}
          height={dimensions.height}
          className="object-contain"
          onError={() => setImageError(true)}
          priority
        />
      )}
      {showTagline && (
        <p className="mt-2 text-xs font-medium text-slate-500 dark:text-zinc-500">Citizen Intelligence</p>
      )}
    </div>
  );

  const animatedContent = animated ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={clickable ? { scale: 1.05 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {content}
    </motion.div>
  ) : clickable ? (
    <motion.div whileHover={{ scale: 1.05 }}>{content}</motion.div>
  ) : (
    content
  );

  if (clickable) {
    return <Link href="/">{animatedContent}</Link>;
  }

  return animatedContent;
}
