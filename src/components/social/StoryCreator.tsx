"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Camera, Image as ImageIcon, Link2, Search, Send, Loader2, CheckCircle2, SplitSquareHorizontal, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface StoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mediaUrl: string, caption: string, type: any, issueId: string | null) => Promise<void>;
}

export function StoryCreator({ isOpen, onClose, onSubmit }: StoryCreatorProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [type, setType] = useState<"general" | "update" | "resolved" | "before_after">("general");
  const [issueId, setIssueId] = useState("");
  const [linkIssue, setLinkIssue] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock upload for UI demo
  const handleSimulatedUpload = () => {
    toast.success("Photo uploaded successfully!");
    setMediaUrl("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400"); // Civic generic image
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!mediaUrl) return;
    setIsSubmitting(true);
    try {
      await onSubmit(mediaUrl, caption, type, linkIssue ? issueId : null);
      toast.success("Story posted!");
      setStep(1);
      setMediaUrl("");
      setCaption("");
      onClose();
    } catch (err) {
      toast.error("Failed to post story");
    } finally {
      setIsSubmitting(false);
    }
  };

  const TYPES = [
    { id: "general", label: "General", icon: MessageSquare },
    { id: "update", label: "Update", icon: Camera },
    { id: "resolved", label: "Resolved", icon: CheckCircle2 },
    { id: "before_after", label: "Before/After", icon: SplitSquareHorizontal },
  ] as const;

  const Content = (
    <div className="flex flex-col h-full text-white">
      {step === 1 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-black mb-2">Create Story</h2>
          <p className="text-zinc-500 text-sm mb-8">Share a 24-hour update with your community</p>

          <div 
            className="w-full aspect-[9/16] max-h-[400px] bg-zinc-900 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
            onClick={handleSimulatedUpload}
          >
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-blue-500/20">
              <Camera className="w-8 h-8 text-zinc-500 group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="font-bold text-zinc-400 group-hover:text-blue-400">Tap to take photo</span>
            <span className="text-xs text-zinc-600 mt-2">or select from gallery</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
            <button className="text-sm font-bold text-zinc-400" onClick={() => setStep(1)}>Back</button>
            <h2 className="font-black">Story Details</h2>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="text-sm font-bold text-blue-500 hover:text-blue-400 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Preview */}
            <div className="flex gap-4">
              <div className="w-20 h-32 rounded-xl bg-zinc-900 overflow-hidden shrink-0">
                <img src={mediaUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <textarea 
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full bg-transparent border-none text-white focus:outline-none resize-none h-full placeholder:text-zinc-600"
                  maxLength={100}
                />
                <div className="text-right text-xs text-zinc-600">{caption.length}/100</div>
              </div>
            </div>

            {/* Story Type */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Story Type</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                      type === t.id ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-zinc-900 border-transparent text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    <span className="text-sm font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Link Issue */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Link2 className="w-4 h-4" /> Link to Issue
                </label>
                <button 
                  className={`w-10 h-6 rounded-full relative transition-colors ${linkIssue ? 'bg-blue-500' : 'bg-zinc-800'}`}
                  onClick={() => setLinkIssue(!linkIssue)}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${linkIssue ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              {linkIssue && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Paste issue ID or search your issues"
                    value={issueId}
                    onChange={e => setIssueId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-white/10 p-0 overflow-hidden h-[600px] flex flex-col">
            {Content}
          </DialogContent>
        </Dialog>
      </div>
      <div className="md:hidden">
        <BottomSheet isOpen={isOpen} onClose={onClose}>
          {Content}
        </BottomSheet>
      </div>
    </>
  );
}
