"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { createCircle } from "@/lib/firebase/circles";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Smile } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMOJIS = ["🌍", "🏘️", "🌳", "⚡", "💧", "🚲", "🛡️", "🚦", "🐾", "♻️", "🤝", "🎉"];

export function CreateCircleModal({ isOpen, onClose, onSuccess }: CreateCircleModalProps) {
  const { user } = useAuthStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ward, setWard] = useState(user?.ward || "");
  const [iconEmoji, setIconEmoji] = useState(EMOJIS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await createCircle({
        name,
        description,
        ward,
        city: user.city || "Unknown City",
        createdBy: user.id,
        isOfficial: false,
        coverUrl: null,
        iconEmoji
      }, user.id);
      
      toast.success("Circle created successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create circle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-slate-50 dark:bg-zinc-950 border-white/10 text-white p-0 overflow-hidden">
        <div className="h-24 bg-gradient-to-tr from-blue-500/20 to-fuchsia-500/20 relative flex items-center justify-center border-b border-white/5">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
           <div className="w-16 h-16 bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-3xl shadow-xl absolute -bottom-8">
             {iconEmoji}
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 pt-12 space-y-5">
          <div className="text-center mb-6">
            <h2 className="text-xl font-black">Create a Circle</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-500">Start a community group in your area</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">Circle Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sector 4 Neighborhood Watch"
                className="w-full bg-white dark:bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                required
                maxLength={50}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What is this circle about?"
                className="w-full bg-white dark:bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none h-20"
                required
                maxLength={200}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1 block">Ward / Area</label>
              <input 
                type="text" 
                value={ward}
                onChange={e => setWard(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">City is automatically set to {user?.city}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2 block">Choose Icon</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIconEmoji(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      iconEmoji === emoji ? 'bg-blue-500/20 border-2 border-blue-500' : 'bg-white dark:bg-zinc-900 border border-transparent hover:bg-slate-100 dark:bg-zinc-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-6"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Circle"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
