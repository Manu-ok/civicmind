"use client";

import { useState } from "react";
import { CivicAgentChat } from "@/components/agent/CivicAgentChat";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, MessageSquare, Trash2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock conversation history
const MOCK_HISTORY = [
  { id: "1", title: "Pothole repair timeframe...", date: "Today" },
  { id: "2", title: "Reporting a water leak...", date: "Yesterday" },
  { id: "3", title: "How to volunteer for...", date: "Last Week" },
];

export default function AgentPage() {
  const [activeChatId, setActiveChatId] = useState<string>("new");
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) setActiveChatId("new");
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex bg-slate-50 dark:bg-zinc-950 overflow-hidden relative">
      
      {/* Mobile Sidebar Toggle */}
      <Button 
        variant="ghost" 
        className="md:hidden absolute top-4 left-4 z-50 text-white bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-white/10"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Left Sidebar */}
      <div className={cn(
        "absolute md:relative z-40 w-72 md:w-64 h-full bg-slate-50 dark:bg-zinc-950 border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        
        {/* New Chat Button */}
        <div className="p-4 pt-16 md:pt-4">
          <Button 
            onClick={() => { setActiveChatId("new"); setSidebarOpen(false); }}
            className="w-full justify-start h-12 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:bg-zinc-800 text-white border border-white/5 rounded-xl shadow-sm"
          >
            <MessageSquarePlus className="w-5 h-5 mr-3 text-blue-400" />
            <span className="font-semibold">New Chat</span>
          </Button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest px-3 py-2 mt-2">Recent Chats</p>
          
          {history.map(chat => (
            <div 
              key={chat.id}
              onClick={() => { setActiveChatId(chat.id); setSidebarOpen(false); }}
              className={cn(
                "group flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-colors",
                activeChatId === chat.id ? "bg-slate-100 dark:bg-zinc-800/80" : "hover:bg-white dark:bg-zinc-900/50"
              )}
            >
              <div className="flex items-center overflow-hidden pr-2">
                <MessageSquare className="w-4 h-4 text-slate-500 dark:text-zinc-500 mr-3 shrink-0" />
                <div className="truncate">
                  <p className="text-sm text-slate-600 dark:text-zinc-300 truncate">{chat.title}</p>
                  <p className="text-[10px] text-zinc-600 font-medium mt-0.5">{chat.date}</p>
                </div>
              </div>
              <button 
                onClick={(e) => handleDelete(e, chat.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-500 hover:text-red-400 transition-all shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          
          {history.length === 0 && (
            <div className="px-3 py-4 text-sm text-zinc-600 text-center">
              No recent conversations
            </div>
          )}
        </div>
        
        {/* User Profile Snippet (Optional bottom area) */}
        <div className="p-4 border-t border-white/5 bg-white dark:bg-zinc-900/30">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
            CivicAgent v1.0
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        <CivicAgentChat chatId={activeChatId} />
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="md:hidden absolute inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
