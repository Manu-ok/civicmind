import { useState, useEffect } from 'react';
import { ReactionType, CommentReactions } from '@/lib/types';
import { reactToIssue, getIssueReactions } from '@/lib/firebase/social';
import { useAuthStore } from '@/lib/stores/authStore';

export function useReactions(issueId: string) {
  const { user } = useAuthStore();
  const [reactions, setReactions] = useState<CommentReactions>({ heart: 0, fire: 0, thumbsUp: 0, sad: 0, clap: 0, angry: 0 });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);

  useEffect(() => {
    if (!issueId || !user) return;
    
    getIssueReactions(issueId, user.id).then(({ counts, userReaction }) => {
      setReactions(counts);
      setUserReaction(userReaction);
    }).catch(console.error);
  }, [issueId, user]);

  const react = async (reaction: ReactionType) => {
    if (!user) return;

    // Optimistic update
    const prevReactions = { ...reactions };
    const prevUserReaction = userReaction;

    const newReactions = { ...reactions };
    if (userReaction === reaction) {
      newReactions[reaction] = Math.max(0, newReactions[reaction] - 1);
      setUserReaction(null);
    } else {
      if (userReaction) {
        newReactions[userReaction] = Math.max(0, newReactions[userReaction] - 1);
      }
      newReactions[reaction] = (newReactions[reaction] || 0) + 1;
      setUserReaction(reaction);
    }
    setReactions(newReactions);

    try {
      await reactToIssue(issueId, user.id, reaction);
    } catch (error) {
      console.error("Failed to react to issue:", error);
      // Revert on failure
      setReactions(prevReactions);
      setUserReaction(prevUserReaction);
    }
  };

  return { reactions, userReaction, react };
}
