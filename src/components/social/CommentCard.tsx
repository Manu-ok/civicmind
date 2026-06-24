"use client";

import { useState } from "react";
import { Comment, ReactionType } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/lib/stores/authStore";
import { CheckCircle2, MoreHorizontal, MessageCircle, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { CommentInput } from "./CommentInput";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const REACTIONS = [
  { emoji: "❤️", label: "heart" as ReactionType },
  { emoji: "🔥", label: "fire" as ReactionType },
  { emoji: "👍", label: "thumbsUp" as ReactionType },
  { emoji: "😢", label: "sad" as ReactionType },
  { emoji: "👏", label: "clap" as ReactionType },
  { emoji: "😡", label: "angry" as ReactionType }
];

interface CommentCardProps {
  comment: Comment;
  replies?: Comment[];
  isReplying?: boolean;
  onReplyClick?: () => void;
  onReplySubmit?: (content: string, mentions: string[], mentionUsernames: string[]) => Promise<void>;
  onEdit?: (content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onReact?: (reaction: ReactionType) => Promise<void>;
  isReply?: boolean;
}

export function CommentCard({ 
  comment, replies = [], isReplying, onReplyClick, onReplySubmit, onEdit, onDelete, onReact, isReply 
}: CommentCardProps) {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isOwn = user?.id === comment.authorId;
  const timeAgo = comment.createdAt 
    ? formatDistanceToNow(new Date((comment.createdAt as any).seconds ? (comment.createdAt as any).toDate() : comment.createdAt), { addSuffix: true })
    : "Just now";

  // Parse mentions in text
  const renderContent = (text: string) => {
    return text.split(/(?<=\s|^)(@\w+)(?=\s|$)/g).map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-blue-400 hover:underline cursor-pointer">{part}</span>;
      }
      return part;
    });
  };

  if (comment.isDeleted) {
    return (
      <div className={`py-2 text-zinc-500 italic text-sm ${isReply ? "ml-10" : ""}`}>
        [Comment deleted]
      </div>
    );
  }

  const handleEditSubmit = async (content: string) => {
    if (onEdit) await onEdit(content);
    setIsEditing(false);
  };

  const activeReactionEntries = Object.entries(comment.reactions || {}).filter(([_, count]) => count > 0);
  const userReactionLabel = user ? comment.userReactions?.[user.id] : null;

  return (
    <div className={`flex gap-3 relative ${isReply ? "mt-4" : "mt-6"}`}>
      {/* Avatar */}
      <div className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-white/5 cursor-pointer">
        {comment.authorPhotoURL ? (
          <img src={comment.authorPhotoURL} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500 text-xs">
            {comment.authorDisplayName.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Comment Bubble */}
        <div className={`relative bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm p-4 group ${isEditing ? "p-0 bg-transparent border-none" : ""}`}>
          
          {isEditing ? (
            <div className="bg-zinc-900 border border-blue-500/50 rounded-2xl p-2 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <CommentInput onSubmit={handleEditSubmit} placeholder="Edit your comment..." autoFocus />
              <button className="text-xs text-zinc-500 mt-2 ml-2 hover:text-white" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link href={`/profile/${comment.authorUsername}`} className="font-semibold text-white text-sm cursor-pointer hover:underline">
                    {comment.authorDisplayName}
                  </Link>
                  <Link href={`/profile/${comment.authorUsername}`} className="text-xs text-zinc-500 hover:text-blue-400 hover:underline">
                    @{comment.authorUsername}
                  </Link>
                  {comment.authorIsVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                  {comment.authorBadge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400 ml-1 border border-zinc-800">
                      {comment.authorBadge}
                    </span>
                  )}
                  <span className="text-xs text-zinc-500 ml-1">@{comment.authorUsername} • {timeAgo}</span>
                  {comment.isEdited && <span className="text-xs text-zinc-600 italic">(edited)</span>}
                </div>

                <div className="relative">
                  <button 
                    className="p-1 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out rounded-full hover:bg-zinc-800"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-1 w-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-20"
                      >
                        {isOwn ? (
                          <>
                            <button className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-zinc-700 flex items-center gap-2" onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2" onClick={() => { onDelete && onDelete(); setShowMenu(false); }}>
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </>
                        ) : (
                          <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2" onClick={() => setShowMenu(false)}>
                            <ShieldAlert className="w-4 h-4" /> Report
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {renderContent(comment.content)}
              </div>
            </>
          )}

          {/* Reaction Bubbles (floating bottom right if > 0) */}
          {!isEditing && activeReactionEntries.length > 0 && (
            <div className="absolute -bottom-3 right-4 flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-2 py-0.5 shadow-lg">
              {activeReactionEntries.slice(0, 3).map(([key, count]) => {
                const r = REACTIONS.find(x => x.label === key);
                return r ? <span key={key} className="text-xs mr-1">{r.emoji}</span> : null;
              })}
              <span className="text-[10px] font-bold text-zinc-400 pl-1">{activeReactionEntries.reduce((sum, [_, c]) => sum + c, 0)}</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-2 ml-1 relative">
            <div className="relative">
              <button 
                className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors duration-200 ease-in-out flex items-center gap-1 min-h-[44px]"
                onClick={() => setShowReactions(!showReactions)}
              >
                {userReactionLabel ? REACTIONS.find(r => r.label === userReactionLabel)?.emoji : "React"}
              </button>
              
              <AnimatePresence>
                {showReactions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-full left-0 mb-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-1.5 flex items-center gap-1 z-20"
                  >
                    {REACTIONS.map(reaction => (
                      <button 
                        key={reaction.label}
                        onClick={() => {
                          if (onReact) onReact(reaction.label);
                          setShowReactions(false);
                        }}
                        className={`w-11 h-11 text-lg flex items-center justify-center rounded-xl hover:bg-zinc-800 hover:scale-125 transition-all duration-200 ease-in-out ${
                          userReactionLabel === reaction.label ? "bg-zinc-800 scale-110" : ""
                        }`}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isReply && (
              <button 
                className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors duration-200 ease-in-out flex items-center gap-1 min-h-[44px]"
                onClick={onReplyClick}
              >
                ↩ Reply
              </button>
            )}
          </div>
        )}

        {/* Replying State */}
        <AnimatePresence>
          {isReplying && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="relative before:absolute before:left-[-22px] before:top-[-20px] before:w-px before:h-[calc(100%+20px)] before:bg-zinc-800">
                <CommentInput 
                  onSubmit={async (content, mentions, usernames) => {
                    if (onReplySubmit) {
                      await onReplySubmit(content, mentions, usernames);
                      if (onReplyClick) onReplyClick(); // Close reply input
                    }
                  }} 
                  placeholder={`Reply to @${comment.authorUsername}...`} 
                  autoFocus 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested Replies */}
        {replies.length > 0 && !isReply && (
          <div className="mt-2">
            {!showReplies ? (
              <button 
                className="flex items-center gap-2 text-xs font-semibold text-blue-500 hover:text-blue-400 mt-2 mb-2 transition-colors duration-200 ease-in-out relative before:absolute before:left-[-22px] before:top-[-10px] before:w-4 before:h-[18px] before:border-l before:border-b before:border-zinc-800 before:rounded-bl-xl"
                onClick={() => setShowReplies(true)}
              >
                <div className="w-5 h-px bg-zinc-800" />
                View {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </button>
            ) : (
              <div className="relative before:absolute before:left-[-22px] before:top-[-10px] before:w-px before:h-full before:bg-zinc-800">
                <button 
                  className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white mb-2 ml-4 transition-colors duration-200 ease-in-out min-h-[44px]"
                  onClick={() => setShowReplies(false)}
                >
                  Hide replies
                </button>
                <div className="space-y-4">
                  {replies.map(reply => (
                    <div key={reply.id} className="relative before:absolute before:left-[-22px] before:top-4 before:w-4 before:h-px before:bg-zinc-800">
                      <CommentCard 
                        comment={reply} 
                        isReply 
                        onEdit={onEdit ? async (content) => { /* Requires passing replyId up or handling in parent */ } : undefined}
                        onDelete={onDelete ? async () => { /* Same */ } : undefined}
                        onReact={onReact ? async (reaction) => { /* Same */ } : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
