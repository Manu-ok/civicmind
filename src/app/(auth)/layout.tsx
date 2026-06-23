import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — CivicMind AI",
  description: "Sign in to CivicMind AI to report, track, and resolve community issues with the power of AI.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
