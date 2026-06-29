"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVoice } from "@/lib/hooks/useVoice";
import { cn } from "@/lib/utils";

interface VoiceReporterProps {
  onComplete: (data: any, transcript: string) => void;
}

export function VoiceReporter({ onComplete }: VoiceReporterProps) {
  const { 
    listening, 
    transcript, 
    interimTranscript, 
    startListening, 
    stopListening, 
    error, 
    isSupported 
  } = useVoice();

  const [state, setState] = useState<"idle" | "recording" | "processing" | "completed">("idle");
  const [duration, setDuration] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [finalText, setFinalText] = useState("");

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === "recording") {
      interval = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [state]);

  // Sync component state with actual browser microphone status
  useEffect(() => {
    if (listening && state === "idle") {
      setState("recording");
    } else if (!listening && state === "recording") {
      const finalAudio = transcript || interimTranscript;
      if (finalAudio) {
        handleProcessAudio(finalAudio);
      } else {
        setState("idle");
      }
    }
  }, [listening, state, transcript, interimTranscript]);

  const handleStart = () => {
    // Only call startListening. The useEffect above will trigger the UI change
    // when the browser's microphone actually opens.
    startListening();
  };

  const handleStop = () => {
    // Only call stopListening. The useEffect above will gracefully handle 
    // the UI transition and process the text when listening becomes false.
    stopListening();
  };

  const handleProcessAudio = async (textToProcess: string) => {
    setFinalText(textToProcess);
    setState("processing");
    try {
      const res = await fetch("/api/voice-to-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: textToProcess }),
      });
      const data = await res.json();
      if (data.success) {
        setExtractedData(data.analysis);
        setState("completed");
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      setState("idle");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!isSupported || error) {
    return (
      <Card className="p-6 bg-red-900/10 border-red-500/20 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium">
          {error || "Your browser does not support Voice Reporting. Please use Google Chrome."}
        </p>
      </Card>
    );
  }

  return (
    <div className="w-full relative overflow-hidden rounded-3xl border border-white/5 bg-slate-50 dark:bg-zinc-950 p-8 shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
      
      {/* Background Glow */}
      <div className={cn(
        "absolute inset-0 opacity-20 blur-3xl transition-colors duration-1000",
        state === "recording" ? "bg-red-500" : state === "completed" ? "bg-green-500" : "bg-blue-500"
      )} />

      <AnimatePresence mode="wait">
        
        {/* ================= IDLE STATE ================= */}
        {state === "idle" && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center z-10"
          >
            <button
              onClick={handleStart}
              className="group relative w-32 h-32 rounded-full bg-white dark:bg-zinc-900 border-4 border-slate-200 dark:border-zinc-800 flex items-center justify-center hover:border-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-300"
            >
              <Mic className="w-12 h-12 text-slate-500 dark:text-zinc-400 group-hover:text-blue-400 transition-colors" />
            </button>
            <h3 className="mt-8 text-xl font-bold text-white">Voice Report</h3>
            <p className="text-slate-500 dark:text-zinc-500 mt-2">Tap to describe the issue naturally</p>
          </motion.div>
        )}

        {/* ================= RECORDING STATE ================= */}
        {state === "recording" && (
          <motion.div 
            key="recording"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center w-full max-w-lg z-10"
          >
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Pulsing Rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-full border-2 border-red-500/30"
                  animate={{
                    scale: [1, 2],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: ring * 0.6,
                    ease: "easeOut",
                  }}
                />
              ))}
              
              <button
                onClick={handleStop}
                className="relative z-10 w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-colors"
              >
                <Square className="w-8 h-8 text-white fill-white" />
              </button>
            </div>

            <div className="mt-8 text-3xl font-mono font-bold text-red-400 tabular-nums">
              {formatTime(duration)}
            </div>
            
            {/* Sound Wave Animation */}
            <div className="flex items-center gap-1 mt-6 h-8">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-red-500 rounded-full"
                  animate={{
                    height: ["20%", "100%", "20%"],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.05,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <div className="w-full mt-8 p-4 bg-black/40 rounded-xl border border-white/5 min-h-[80px]">
              <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">Live Transcript</p>
              <p className="text-slate-600 dark:text-zinc-300 italic text-center">
                {interimTranscript || transcript || "Listening..."}
              </p>
            </div>
          </motion.div>
        )}

        {/* ================= PROCESSING STATE ================= */}
        {state === "processing" && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center z-10"
          >
            <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI is analyzing...</h3>
            <p className="text-slate-500 dark:text-zinc-400 text-center max-w-sm">
              Extracting civic category, severity, and exact location details from your voice.
            </p>
          </motion.div>
        )}

        {/* ================= COMPLETED STATE ================= */}
        {state === "completed" && extractedData && (
          <motion.div 
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col w-full z-10"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <h3 className="text-2xl font-bold text-white">Report Extracted!</h3>
            </div>

            <Card className="bg-black/40 border-green-500/20 p-5 mb-8 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase">Issue Title</p>
                <p className="text-lg text-white font-medium">{extractedData.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase">Category</p>
                  <p className="text-blue-400 capitalize">{extractedData.category}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase">Severity</p>
                  <p className={cn("capitalize", 
                    extractedData.severity === 'critical' ? 'text-red-400' :
                    extractedData.severity === 'high' ? 'text-orange-400' :
                    extractedData.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                  )}>{extractedData.severity}</p>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 bg-transparent border-white/10 hover:bg-white/5"
                onClick={() => {
                  setExtractedData(null);
                  setState("idle");
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Redo
              </Button>
              <Button 
                className="flex-[2] bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onComplete(extractedData, finalText)}
              >
                Use This Report
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
