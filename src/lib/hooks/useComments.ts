import { useState, useEffect, useRef } from 'react';
import { Comment, ReactionType } from '@/lib/types';
import { 
  addComment, editComment, deleteComment, reactToComment, subscribeToComments 
} from '@/lib/firebase/social';
import { useAuthStore } from '@/lib/stores/authStore';
import { Timestamp } from 'firebase/firestore';
import { useCommentStore } from '@/lib/stores/commentStore';
import { globalSubManager } from '@/lib/utils/subscriptionManager';

export function useComments(issueId: string) {
  const { user } = useAuthStore();
  const { setComments: cacheComments, getComments } = useCommentStore();
  const [comments, setComments] = useState<Comment[]>(getComments(issueId) || []);
  const [loading, setLoading] = useState(getComments(issueId) === undefined);
  const [limitCount, setLimitCount] = useState(5);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!issueId) return;
    const subId = `comments_${issueId}`;
    
    const unsubscribe = subscribeToComments(issueId, limitCount, (newComments) => {
      setComments(newComments);
      cacheComments(issueId, newComments);
      setLoading(false);
      if (newComments.length < limitCount) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    });

    globalSubManager.add(subId, unsubscribe);
    
    return () => globalSubManager.remove(subId);
  }, [issueId, limitCount, cacheComments]);

  const loadMoreComments = () => {
    setLimitCount(prev => prev + 5);
  };

  const handleAddComment = async (content: string, replyTo: string | null = null, mentions: string[] = [], mentionUsernames: string[] = []) => {
    if (!user) throw new Error("Must be logged in");
    
    const commentData = {
      issueId,
      authorId: user.id,
      authorUsername: user.username || '',
      authorDisplayName: user.displayName,
      authorPhotoURL: user.photoURL || '',
      authorIsVerified: user.isVerified || false,
      authorBadge: "Active Citizen", 
      content,
      mentions,
      mentionUsernames,
      replyTo,
      createdAt: Timestamp.now()
    };
    
    return await addComment(issueId, commentData as any);
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    if (!user) throw new Error("Must be logged in");
    await editComment(issueId, commentId, newContent, user.id);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) throw new Error("Must be logged in");
    await deleteComment(issueId, commentId, user.id);
  };

  const handleReactToComment = async (commentId: string, reaction: ReactionType) => {
    if (!user) throw new Error("Must be logged in");
    
    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const currentReaction = c.userReactions?.[user.id];
        const newReactions = { ...c.reactions };
        const newUserReactions = { ...c.userReactions };
        
        if (currentReaction === reaction) {
          newReactions[reaction] = Math.max(0, newReactions[reaction] - 1);
          delete newUserReactions[user.id];
        } else {
          if (currentReaction) {
            newReactions[currentReaction] = Math.max(0, newReactions[currentReaction] - 1);
          }
          newReactions[reaction] = (newReactions[reaction] || 0) + 1;
          newUserReactions[user.id] = reaction;
        }
        return { ...c, reactions: newReactions, userReactions: newUserReactions };
      }
      return c;
    }));

    try {
      await reactToComment(issueId, commentId, user.id, reaction);
    } catch (error) {
      console.error("Failed to react to comment:", error);
    }
  };

  return {
    comments,
    loading,
    hasMore,
    loadMoreComments,
    addComment: handleAddComment,
    editComment: handleEditComment,
    deleteComment: handleDeleteComment,
    reactToComment: handleReactToComment
  };
}
