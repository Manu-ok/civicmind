import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { AppLoader } from "@/components/shared/AppLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "CivicMind AI — AI-Powered Community Resolution",
  description:
    "Report, track, and resolve community issues with the power of AI. Join 10,000+ citizens making their communities better.",
  keywords: ["civic", "community", "AI", "issue reporting", "smart city", "resolution"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CivicMind AI",
  },
  icons: {
    apple: "/icon-192x192.png",
  },
  openGraph: {
    title: "CivicMind AI",
    description: "AI-Powered Community Resolution Platform",
    type: "website",
  },
};

import { FCMProvider } from "@/components/shared/FCMProvider";
import { AchievementOverlay } from "@/components/social/AchievementOverlay";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          geistMono.variable,
          "antialiased bg-background text-foreground"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
            <AuthProvider>
              <AppLoader />
              <FCMProvider />
              <AchievementOverlay />
              {children}
            </AuthProvider>
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#18181b", // zinc-900
              color: "#e4e4e7", // zinc-200
              border: "1px solid #27272a", // zinc-800
              fontSize: "14px",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#18181b" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#18181b" },
            },
          }}
        />
      </body>
    </html>
  );
}
