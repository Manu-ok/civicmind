import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { Story, SocialUser } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { 
  collection, query, where, orderBy, getDocs, 
  addDoc, serverTimestamp, updateDoc, doc, arrayUnion, Timestamp,
  writeBatch
} from 'firebase/firestore';
import { getFollowing } from '@/lib/firebase/social';

export interface StoryGroup {
  user: SocialUser;
  stories: Story[];
  hasUnviewed: boolean;
}

export function useStories() {
  const { user } = useAuthStore();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Get following list
      const followingUsers = await getFollowing(user.id, 50);
      const followingIds = followingUsers.map(u => u.id);
      
      // Cleanup expired stories (in a real app this is a Cloud Function, but doing lightweight cleanup here)
      const now = Timestamp.now();
      
      // We will only query active stories that haven't expired
      const storiesRef = collection(db, 'stories');
      
      // 2. Fetch my stories
      const myStoriesQuery = query(
        storiesRef,
        where('authorId', '==', user.id),
        where('isActive', '==', true)
      );
      const mySnap = await getDocs(myStoriesQuery);
      const myValidStories = mySnap.docs
        .map(d => ({ ...d.data(), id: d.id } as Story))
        .filter(s => s.expiresAt.toMillis() > now.toMillis());
      
      setMyStories(myValidStories.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()));

      // 3. Fetch following stories
      if (followingIds.length > 0) {
        // Chunk if > 10
        const chunks = [];
        for (let i = 0; i < followingIds.length; i += 10) {
          chunks.push(followingIds.slice(i, i + 10));
        }

        let allFollowingStories: Story[] = [];
        for (const chunk of chunks) {
          const q = query(
            storiesRef,
            where('authorId', 'in', chunk),
            where('isActive', '==', true)
          );
          const snap = await getDocs(q);
          allFollowingStories = [
            ...allFollowingStories, 
            ...snap.docs.map(d => ({ ...d.data(), id: d.id } as Story))
          ];
        }

        // Filter out expired ones
        allFollowingStories = allFollowingStories.filter(s => s.expiresAt.toMillis() > now.toMillis());

        // Group by user
        const groupsMap = new Map<string, StoryGroup>();
        
        allFollowingStories.forEach(story => {
          if (!groupsMap.has(story.authorId)) {
            const author = followingUsers.find(u => u.id === story.authorId);
            if (author) {
              groupsMap.set(story.authorId, {
                user: author,
                stories: [],
                hasUnviewed: false
              });
            }
          }
          
          const group = groupsMap.get(story.authorId);
          if (group) {
            group.stories.push(story);
            if (!story.viewedBy?.includes(user.id)) {
              group.hasUnviewed = true;
            }
          }
        });

        // Sort stories within groups by creation time
        groupsMap.forEach(group => {
          group.stories.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        });

        // Sort groups: unviewed first, then by latest story
        const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => {
          if (a.hasUnviewed && !b.hasUnviewed) return -1;
          if (!a.hasUnviewed && b.hasUnviewed) return 1;
          
          const latestA = a.stories[a.stories.length - 1].createdAt.toMillis();
          const latestB = b.stories[b.stories.length - 1].createdAt.toMillis();
          return latestB - latestA;
        });

        setStoryGroups(sortedGroups);
      } else {
        setStoryGroups([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [user]);

  const createStory = async (
    mediaUrl: string, 
    caption: string, 
    type: "update" | "resolved" | "before_after" | "general",
    issueId: string | null = null
  ) => {
    if (!user) return;
    
    // Expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const storyData = {
      authorId: user.id,
      authorUsername: user.username || '',
      authorDisplayName: user.displayName,
      authorPhotoURL: user.photoURL || '',
      authorIsVerified: user.isVerified || false,
      issueId,
      mediaUrl,
      caption,
      type,
      viewCount: 0,
      viewedBy: [],
      isActive: true,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt)
    };

    await addDoc(collection(db, 'stories'), storyData);
    await fetchStories(); // Refresh
  };

  const markStoryViewed = async (storyId: string) => {
    if (!user) return;
    
    const storyRef = doc(db, 'stories', storyId);
    // Optimistic local update
    setStoryGroups(prev => prev.map(group => {
      let updated = false;
      const newStories = group.stories.map(s => {
        if (s.id === storyId && !s.viewedBy.includes(user.id)) {
          updated = true;
          return { ...s, viewedBy: [...s.viewedBy, user.id] };
        }
        return s;
      });
      if (updated) {
        return {
          ...group,
          stories: newStories,
          hasUnviewed: newStories.some(s => !s.viewedBy.includes(user.id))
        };
      }
      return group;
    }));

    try {
      await updateDoc(storyRef, {
        viewedBy: arrayUnion(user.id),
        viewCount: increment(1)
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    storyGroups,
    myStories,
    loading,
    refresh: fetchStories,
    createStory,
    markStoryViewed
  };
}

// Helper to use increment in updateDoc
import { increment } from 'firebase/firestore';
