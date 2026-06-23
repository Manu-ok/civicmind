"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { AgentMessage as AgentMessageType } from "@/lib/types";
import { AgentMessage } from "./AgentMessage";
import { Button } from "@/components/ui/button";
import { Send, Mic, Trash2, Brain, Loader2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { getIssues } from "@/lib/firebase/firestore";

interface CivicAgentChatProps {
  chatId: string;
}

export function CivicAgentChat({ chatId }: CivicAgentChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<AgentMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (chatId === "new") {
      setMessages([]);
    }
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: AgentMessageType = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date() as any // Safe date for UI
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // 1. Fetch Enriched Context on the client side safely
      const city = user?.city || "Unknown";
      let enrichedContext = null;
      
      try {
        const allIssues = await getIssues({ city });
        const categoryCounts: Record<string, number> = {};
        allIssues.forEach(issue => {
          categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
        });

        const topIssues = allIssues
          .filter(i => i.status !== "resolved")
          .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
          .slice(0, 5)
          .map(i => ({ title: i.title, category: i.category, ward: i.location.ward, upvotes: i.upvotes }));

        enrichedContext = {
          userStats: user ? {
            name: user.displayName,
            points: user.points,
            reported: user.issuesReported,
            verified: user.issuesVerified
          } : null,
          cityStats: {
            totalIssues: allIssues.length,
            categoryCounts
          },
          topIssues,
          ward: user?.ward || "Unknown"
        };
      } catch (dbError) {
        console.warn("Failed to fetch enriched context for agent:", dbError);
        // Continue without enriched context instead of breaking the chat
      }

      // 2. Call the server API with the context
      const res = await fetch("/api/civic-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          conversationHistory: messages.slice(-10),
          userLocation: { city, ward: user?.ward || "Unknown" },
          enrichedContext
        })
      });

      const data = await res.json();

      if (data.success) {
        const agentMsg: AgentMessageType = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date() as any
        };
        setMessages(prev => [...prev, agentMsg]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const err = error as any;
      console.error("Chat Error:", err);
      const errorMsg: AgentMessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error.message || "Unknown error occurred."}`,
        timestamp: new Date() as any
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20 relative">
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 relative z-10 shadow-2xl shadow-blue-500/20">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                  <Brain className="w-12 h-12 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-4">How can I help your community today?</h2>
              <p className="text-zinc-400">I have real-time access to civic issues, analytics, and resolution plans for your ward.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {[
                "What are the biggest problems near me?",
                "Which ward has the most issues?",
                "How do I report a water leakage?",
                "Show me resolved issues this month"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="p-4 text-left rounded-xl bg-zinc-900 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                >
                  <p className="text-sm text-zinc-300 group-hover:text-blue-400 transition-colors">{suggestion}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {messages.map((msg) => (
              <AgentMessage key={msg.id} message={msg} />
            ))}
            
            {/* Loading Indicator */}
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex max-w-[85%] sm:max-w-[75%] gap-4 flex-row">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shrink-0">
                    <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-zinc-900 border border-white/5 rounded-tl-sm flex items-center gap-1.5 h-12">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-blue-500/50" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-blue-500/50" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-blue-500/50" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-zinc-950 border-t border-white/10 z-10 shrink-0">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-zinc-900 rounded-2xl border border-white/10 p-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
          <Button variant="ghost" size="icon" className="shrink-0 rounded-xl text-zinc-400 hover:text-white h-12 w-12 hover:bg-zinc-800">
            <Mic className="w-5 h-5" />
          </Button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask CivicAgent anything..."
            className="w-full max-h-32 min-h-[48px] bg-transparent border-0 focus:ring-0 resize-none text-white placeholder:text-zinc-500 py-3 px-2 custom-scrollbar"
            rows={Math.min(4, input.split("\n").length || 1)}
          />

          {input.length > 0 && (
            <Button variant="ghost" size="icon" onClick={() => setInput("")} className="shrink-0 text-zinc-500 hover:text-zinc-300 h-12 w-10">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping}
            size="icon"
            className={cn(
              "shrink-0 rounded-xl h-12 w-12 transition-all",
              input.trim() ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-zinc-800 text-zinc-500"
            )}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-3 font-medium uppercase tracking-widest">
          CivicAgent can make mistakes. Verify important municipal actions.
        </p>
      </div>

    </div>
  );
}
