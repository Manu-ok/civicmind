"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIssue } from "@/lib/firebase/firestore";
import { Issue } from "@/lib/types";
import { IssueDetail } from "@/components/issues/IssueDetail";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IssueClientPage({ issueId }: { issueId: string }) {
  const router = useRouter();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadIssue() {
      if (!issueId) return;
      try {
        const data = await getIssue(issueId);
        if (data) {
          setIssue(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadIssue();
  }, [issueId]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-slate-500 dark:text-zinc-400">Loading issue details...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Issue Not Found</h2>
        <p className="text-slate-500 dark:text-zinc-400 max-w-md mb-6">
          The issue you&apos;re looking for doesn&apos;t exist, has been deleted, or you don&apos;t have permission to view it.
        </p>
        <Button onClick={() => router.push('/issues')} variant="outline" className="border-white/10 bg-white dark:bg-zinc-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Issues Feed
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        onClick={() => router.back()} 
        variant="ghost" 
        className="mb-6 text-slate-500 dark:text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <IssueDetail issue={issue} />
    </div>
  );
}
