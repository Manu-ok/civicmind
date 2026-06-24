"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginCard from "@/components/auth/LoginCard";
import { useAuthStore } from "@/lib/stores/authStore";

export default function LoginPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  useEffect(() => {
    if (!loading && user) {
      router.replace(returnUrl || "/feed");
    }
  }, [user, loading, router, returnUrl]);

  // Don't render login if user is already authenticated and being redirected
  if (!loading && user) return null;

  return <LoginCard />;
}
