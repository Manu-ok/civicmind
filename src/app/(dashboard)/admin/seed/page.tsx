"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { seedDemoData } from "@/lib/utils/seedData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

export default function SeedPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSeeding, setIsSeeding] = useState(false);
  const [success, setSuccess] = useState(false);

  // Security check
  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-500 dark:text-zinc-400 max-w-md">
          You do not have the required permissions to view this page. This area is restricted to administrators only.
        </p>
        <Button className="mt-6" onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      setSuccess(false);
      toast.loading("Seeding demo data...", { id: "seed" });
      
      await seedDemoData("Jamshedpur", user.id);
      
      toast.success("Demo data seeded successfully!", { id: "seed" });
      setSuccess(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to seed data. Check console for details.", { id: "seed" });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Database Management</h1>
        <p className="text-slate-500 dark:text-zinc-400">Seed the database with realistic demo data for presentations and testing.</p>
      </div>

      <Card className="bg-white dark:bg-zinc-900/50 border-white/5 overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="p-8 relative z-10">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Database className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Seed Demo Data</h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                This action will populate the Firestore database with 5 demo users, 20 realistic issues mapped to Jamshedpur, base analytics data, and AI predictions.
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8">
            <p className="text-amber-400/90 text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Note: This will add new records. It will not delete existing data.
            </p>
          </div>

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-8 flex items-center gap-3 text-green-400"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Data seeded successfully! You can now explore the app.</span>
            </motion.div>
          )}

          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xl shadow-blue-900/20"
                  disabled={isSeeding}
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    "Initialize Demo Data"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-50 dark:bg-zinc-950 border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-500 dark:text-zinc-400">
                    This will inject roughly 30 documents into your Firestore database. This action is safe but will clutter the database if run multiple times unnecessarily.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white dark:bg-zinc-900 text-white hover:bg-slate-100 dark:bg-zinc-800 border-white/10">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSeed} className="bg-blue-600 text-white hover:bg-blue-700">
                    Yes, Seed Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    </div>
  );
}
