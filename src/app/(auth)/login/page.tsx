"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "@/components/auth/LoginCard";
import { useAuthStore } from "@/lib/stores/authStore";

export default function LoginPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // Don't render login if user is already authenticated and being redirected
  if (!loading && user) return null;

  return <LoginCard />;
}
