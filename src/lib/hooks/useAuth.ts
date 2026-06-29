"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/stores/authStore";
import {
  signInWithGoogle as firebaseGoogleSignIn,
  signInWithEmail as firebaseEmailSignIn,
  signUpWithEmail as firebaseEmailSignUp,
  signOut as firebaseSignOut,
  deleteUserAccount as firebaseDeleteUserAccount,
  updateUserProfile,
} from "@/lib/firebase/auth";
import { User } from "@/lib/types";

export function useAuth() {
  const { user, loading, error, setLoading, setError } = useAuthStore();
  const router = useRouter();

  const handleSignInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await firebaseGoogleSignIn();
      toast.success("Welcome to CivicMind AI!");
      router.push("/feed");
    } catch (err: any) {
      const message = err.message || "Google sign-in failed.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [router, setLoading, setError]);

  const handleSignInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);
        await firebaseEmailSignIn(email, password);
        toast.success("Welcome back!");
        router.push("/feed");
      } catch (err: any) {
        const message = err.message || "Email sign-in failed.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [router, setLoading, setError]
  );

  const handleSignUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        setLoading(true);
        setError(null);
        await firebaseEmailSignUp(email, password, displayName);
        toast.success("Account created! Welcome to CivicMind AI!");
        router.push("/feed");
      } catch (err: any) {
        const message = err.message || "Email sign-up failed.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [router, setLoading, setError]
  );

  const handleSignInAsDemo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await firebaseEmailSignIn("demo@civicmind.com", "Demo!123");
      toast.success("Welcome to Demo Mode!");
      router.push("/feed");
    } catch (err: any) {
      // If user doesn't exist, try creating it
      try {
        await firebaseEmailSignUp("demo@civicmind.com", "Demo!123", "Demo Civic");
        toast.success("Demo account created. Welcome!");
        router.push("/feed");
      } catch (signupErr: any) {
        const message = signupErr.message || "Demo sign-in failed.";
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, [router, setLoading, setError]);

  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      await firebaseSignOut();
      toast.success("Signed out successfully.");
      router.push("/login");
    } catch (err: any) {
      const message = err.message || "Sign-out failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [router, setLoading]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      setLoading(true);
      await firebaseDeleteUserAccount();
      toast.success("Account deleted successfully.");
      router.push("/login");
    } catch (err: any) {
      const message = err.message || "Failed to delete account.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [router, setLoading]);

  const handleUpdateProfile = useCallback(async (data: Partial<User>) => {
    try {
      if (!user) throw new Error("No user logged in.");
      setLoading(true);
      await updateUserProfile(user.id, data);
      useAuthStore.getState().setUser({ ...user, ...data });
      toast.success("Profile updated successfully.");
    } catch (err: any) {
      const message = err.message || "Failed to update profile.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [user, setLoading]);

  return {
    user,
    loading,
    error,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signInAsDemo: handleSignInAsDemo,
    signOut: handleSignOut,
    deleteAccount: handleDeleteAccount,
    updateProfile: handleUpdateProfile,
  };
}
