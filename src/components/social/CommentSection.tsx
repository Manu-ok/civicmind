"use client";

import { useState, useMemo } from "react";
import { useComments } from "@/lib/hooks/useComments";
import { CommentInput } from "./CommentInput";
import { CommentCard } from "./CommentCard";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import { Comment } from "@/lib/types";

interface CommentSectionProps {
  issueId: string;
  isExpanded?: boolean;
  compact?: boolean;
}

export function CommentSection({ issueId, isExpanded = true, compact = false }: CommentSectionProps) {
  const { comments, loading, hasMore, loadMoreComments, addComment, editComment, deleteComment, reactToComment } = useComments(issueId);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // Group comments into parents and replies
  const { parentComments, repliesMap } = useMemo(() => {
    const parents: Comment[] = [];
    const rMap: Record<string, Comment[]> = {};

    comments.forEach(c => {
      if (c.replyTo) {
        if (!rMap[c.replyTo]) rMap[c.replyTo] = [];
        rMap[c.replyTo].push(c);
      } else {
        parents.push(c);
      }
    });

    // Sort replies oldest first to read top-to-bottom under parent
    Object.keys(rMap).forEach(key => {
      rMap[key].sort((a, b) => {
        const timeA = (a.createdAt as any).seconds || 0;
        const timeB = (b.createdAt as any).seconds || 0;
        return timeA - timeB; // Oldest first
      });
    });

    return { parentComments: parents, repliesMap: rMap };
  }, [comments]);

  const displayComments = compact ? parentComments.slice(0, 2) : parentComments;

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full overflow-hidden"
        >
          {!compact && (
        <div className="mb-6">
          <CommentInput onSubmit={async (content, mentions, usernames) => {
            await addComment(content, null, mentions, usernames);
          }} />
        </div>
      )}

      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-zinc-500 border border-white/5 border-dashed rounded-2xl">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
          <p className="text-sm font-bold text-zinc-400">No comments yet</p>
          <p className="text-xs">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence mode="popLayout">
            {displayComments.map(comment => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CommentCard 
                  comment={comment} 
                  replies={repliesMap[comment.id]}
                  isReplying={replyingToId === comment.id}
                  onReplyClick={() => setReplyingToId(prev => prev === comment.id ? null : comment.id)}
                  onReplySubmit={async (content, mentions, usernames) => {
                    await addComment(content, comment.id, mentions, usernames);
                  }}
                  onEdit={(content) => editComment(comment.id, content)}
                  onDelete={() => deleteComment(comment.id)}
                  onReact={(reaction) => reactToComment(comment.id, reaction)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {!compact && hasMore && (
            <div className="text-center mt-4">
              <button 
                onClick={loadMoreComments}
                className="text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-900 px-4 py-2 rounded-full"
              >
                Load more comments
              </button>
            </div>
          )}
        </div>
      )}
      
      {compact && parentComments.length > 2 && (
        <div className="text-center mt-4">
          <button className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">
            View all {comments.length} comments
          </button>
        </div>
      )}
    </motion.div>
    )}
    </AnimatePresence>
  );
}
