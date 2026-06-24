import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { isFollowing as checkIsFollowing, followUser, unfollowUser } from '@/lib/firebase/social';
import toast from 'react-hot-toast';
import { useFollowStore } from '@/lib/stores/followStore';

export function useFollow(targetUserId: string, initialIsFollowing?: boolean) {
  const { user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing ?? false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInitialCheckDone, setIsInitialCheckDone] = useState<boolean>(initialIsFollowing !== undefined);

  const { setFollowState, getFollowState } = useFollowStore();

  useEffect(() => {
    let mounted = true;
    
    const fetchFollowingState = async () => {
      // Don't check if not logged in, if we're checking ourselves, or if we got it pre-fetched
      if (!user || user.id === targetUserId || initialIsFollowing !== undefined) {
        setIsInitialCheckDone(true);
        if (initialIsFollowing !== undefined && user) {
          setFollowState(user.id, targetUserId, initialIsFollowing);
        }
        return;
      }

      const cachedState = getFollowState(user.id, targetUserId);
      if (cachedState !== undefined) {
        setIsFollowing(cachedState);
        setIsInitialCheckDone(true);
        return;
      }
      
      try {
        const state = await checkIsFollowing(user.id, targetUserId);
        if (mounted) {
          setIsFollowing(state);
          setFollowState(user.id, targetUserId, state);
          setIsInitialCheckDone(true);
        }
      } catch (error) {
        console.error("Failed to check follow status:", error);
      }
    };
    
    fetchFollowingState();
    
    return () => { mounted = false; };
  }, [user, targetUserId, initialIsFollowing]);

  const toggleFollow = useCallback(async () => {
    if (!user) return false;
    
    const previousState = isFollowing;
    setIsFollowing(!previousState); // Optimistic update
    setFollowState(user.id, targetUserId, !previousState);
    setLoading(true);
    
    try {
      if (!previousState) {
        await followUser(user.id, targetUserId);
      } else {
        await unfollowUser(user.id, targetUserId);
      }
      return !previousState;
    } catch (error) {
      setIsFollowing(previousState); // Revert on failure
      setFollowState(user.id, targetUserId, previousState);
      toast.error("Failed to update follow status");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isFollowing, targetUserId, setFollowState]);

  return { isFollowing, loading, isInitialCheckDone, toggleFollow };
}
