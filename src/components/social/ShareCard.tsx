"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Issue } from "@/lib/types";
import { QrCode, Link2, Download, Copy, Share2, MapPin, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | any; // Any for mocked issues in feed
}

export function ShareCard({ isOpen, onClose, issue }: ShareCardProps) {
  const [activeTab, setActiveTab] = useState<"quick" | "card">("quick");
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!issue) return null;

  const url = typeof window !== 'undefined' ? `${window.location.origin}/issues/${issue.id || issue.issueId}` : '';
  const shareText = `Check out this civic issue: ${issue.title} in ${issue.location || issue.ward}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CivicMind Issue',
          text: shareText,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      toast.error("Native share not supported on this device.");
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#09090b', useCORS: true });
      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.download = `civicmind-issue-${issue.id || issue.issueId}.png`;
      a.click();
      toast.success("Card downloaded successfully!");
      setHasExported(true);
      setTimeout(() => {
        setHasExported(false);
        onClose();
      }, 600);
    } catch (err) {
      toast.error("Failed to generate card image.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#09090b', useCORS: true });
      canvas.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          toast.success("Image copied to clipboard!");
          setHasExported(true);
          setTimeout(() => {
            setHasExported(false);
            onClose();
          }, 600);
        }
      });
    } catch (err) {
      toast.error("Failed to copy image.");
    } finally {
      setIsExporting(false);
    }
  };

  const Content = (
    <div className="flex flex-col text-white">
      {/* Header Tabs */}
      <div className="flex items-center border-b border-white/5">
        <button 
          className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ease-in-out ${activeTab === 'quick' ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setActiveTab('quick')}
        >
          Quick Share
        </button>
        <button 
          className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ease-in-out ${activeTab === 'card' ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setActiveTab('card')}
        >
          Civic Card
        </button>
      </div>

      <div className="p-6 overflow-y-auto">
        {activeTab === 'quick' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-4 gap-4">
              <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 group min-h-[44px]">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors duration-200 ease-in-out">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-white">Share</span>
              </button>
              <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 group min-h-[44px]">
                <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center group-hover:bg-zinc-700 transition-colors duration-200 ease-in-out">
                  <Link2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-white">Copy</span>
              </button>
              
              <a href={`whatsapp://send?text=${encodeURIComponent(shareText + ' ' + url)}`} className="flex flex-col items-center gap-2 group min-h-[44px]">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors duration-200 ease-in-out">
                  <span className="text-xl">💬</span>
                </div>
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-white">WhatsApp</span>
              </a>

              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group min-h-[44px]">
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-200 ease-in-out">
                  <span className="text-xl">𝕏</span>
                </div>
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-white">X</span>
              </a>
            </div>

            <div className="bg-zinc-900 rounded-xl p-2 flex items-center gap-3 border border-zinc-800 min-h-[44px]">
              <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                <Link2 className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                readOnly 
                value={url} 
                className="bg-transparent border-none outline-none text-sm text-zinc-300 flex-1 min-w-0"
              />
              <button 
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 ease-in-out shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="flex flex-col gap-6 overflow-hidden pt-4 px-1">
            <motion.div
              initial={{ clipPath: "inset(0 0 100% 0)", y: -20 }}
              animate={hasExported 
                ? { scale: 1.1, opacity: 0, y: 50 } 
                : { clipPath: "inset(0 0 0 0)", y: 0 }
              }
              transition={{ 
                clipPath: { duration: 0.8, ease: "circOut" },
                y: { type: "spring", stiffness: 200, damping: 20 },
                scale: { duration: 0.4 },
                opacity: { duration: 0.4 }
              }}
            >
              <div 
                ref={cardRef}
                className="w-full aspect-[4/5] bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col origin-bottom"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px]" />

              <div className="p-5 flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-white tracking-tight">CivicMind AI</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {issue.severity || 'HIGH'}
                </div>
              </div>

              <div className="flex-1 px-5 py-2 flex flex-col relative z-10">
                <div className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2">{issue.category}</div>
                <h2 className="text-2xl font-bold text-white leading-tight mb-4">{issue.title}</h2>
                
                <div className="w-full h-32 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden mb-4 shrink-0">
                  {issue.mediaUrls && issue.mediaUrls.length > 0 ? (
                    <img src={issue.mediaUrls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-900/40 to-violet-900/40 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-zinc-300 font-medium mb-auto">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {issue.location || issue.ward}
                </div>
              </div>

              <div className="p-5 bg-black/40 backdrop-blur-md border-t border-white/5 flex items-end justify-between relative z-10 mt-auto">
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-semibold tracking-wider mb-1">Reported By</div>
                  <div className="text-white font-semibold text-sm mb-2">@{issue.reporter?.username || 'user'}</div>
                  <div className="text-blue-400 text-xs font-semibold">Join the community at civicmind.ai</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-white p-1 rounded-lg">
                    <QrCode className="w-12 h-12 text-black" />
                  </div>
                  <span className="text-[8px] font-semibold text-zinc-500 uppercase">Scan to View</span>
                </div>
              </div>
            </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: hasExported ? 0 : 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <button 
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 bg-white hover:bg-zinc-200 text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out disabled:opacity-50 min-h-[44px]"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button 
                onClick={handleCopyImage}
                disabled={isExporting}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out disabled:opacity-50 min-h-[44px]"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 border border-zinc-800 text-white p-0 overflow-hidden rounded-xl">
            {Content}
          </DialogContent>
        </Dialog>
      </div>
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        {Content}
      </BottomSheet>
    </>
  );
}
