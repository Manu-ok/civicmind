import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { getUserByUsername, isFollowing as checkIsFollowing } from '@/lib/firebase/social';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { SocialUser, Issue, Story } from '@/lib/types';

export function useProfile(username: string) {
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<SocialUser | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!username) return;
      
      setLoading(true);
      setError(null);
      try {
        const userProfile = await getUserByUsername(username);
        if (!userProfile) {
          if (mounted) {
            setError('User not found');
            setLoading(false);
          }
          return;
        }

        if (mounted) setProfile(userProfile);

        // Fetch issues
        const issuesQuery = query(
          collection(db, 'issues'),
          where('reportedBy', '==', userProfile.id),
          orderBy('reportedAt', 'desc'),
          limit(50)
        );
        try {
          const issuesSnap = await getDocs(issuesQuery);
          const fetchedIssues = issuesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Issue));
          if (mounted) setIssues(fetchedIssues);
        } catch (idxErr) {
          console.warn("Index might be missing for issues", idxErr);
          // Fallback if index missing
          const fallbackQuery = query(collection(db, 'issues'), where('reportedBy', '==', userProfile.id));
          const fallbackSnap = await getDocs(fallbackQuery);
          const fetchedIssues = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() } as Issue));
          if (mounted) setIssues(fetchedIssues.sort((a,b) => (b.reportedAt as any).toMillis() - (a.reportedAt as any).toMillis()));
        }

        // Check if following
        if (currentUser && !isOwnProfile) {
          const followingStatus = await checkIsFollowing(currentUser.id, userProfile.id);
          if (mounted) setIsFollowing(followingStatus);
        }

        // Check stories
        const storiesQuery = query(
          collection(db, 'stories'),
          where('authorId', '==', userProfile.id),
          where('isActive', '==', true)
        );
        const storiesSnap = await getDocs(storiesQuery);
        const fetchedStories = storiesSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as Story))
          .filter(s => (s.expiresAt as any).toDate() > new Date());
          
        if (mounted) setStories(fetchedStories);

      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [username, currentUser, isOwnProfile]);

  return { profile, issues, stories, isFollowing, loading, error, isOwnProfile };
}
