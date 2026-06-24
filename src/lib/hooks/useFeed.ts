import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { generateFeedForUser } from '@/lib/firebase/feed';
import { getFeedForUser, subscribeToFeed, markFeedItemsRead } from '@/lib/firebase/social';
import { FeedItem } from '@/lib/types';
import { globalSubManager } from '@/lib/utils/subscriptionManager';

export function useFeed(activeTab: "for-you" | "following" | "ward" | "city") {
  const { user } = useAuthStore();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [newItemCount, setNewItemCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const lastDocRef = useRef<any>(null);
  const subscriptionRef = useRef<(() => void) | null>(null);
  const initialLoadDone = useRef<boolean>(false);

  const fetchFeed = useCallback(async (isNextPage = false) => {
    if (!user) return;
    
    try {
      if (!isNextPage) {
        setLoading(true);
        setNewItemCount(0);
        initialLoadDone.current = false;
      }
      
      let fetchedItems: FeedItem[] = [];

      if (activeTab === "for-you" && !isNextPage) {
        // Use algorithmic feed for initial 'For You' load
        fetchedItems = await generateFeedForUser(user.id, user.city || '', user.ward || '');
        setHasMore(false); // Algorithmic feed doesn't paginate via cursors yet
      } else {
        // Use standard feed collection for other tabs or pagination
        // In a real app, we'd have dedicated queries for 'ward', 'city', 'following'.
        // For now, we will fallback to the user's feed collection
        const result = await getFeedForUser(user.id, 10, isNextPage ? lastDocRef.current : undefined);
        fetchedItems = result;
        
        if (result.length > 0) {
          lastDocRef.current = result[result.length - 1]; // We'd need the actual doc snapshot for true pagination, 
                                                          // but getFeedForUser returns FeedItem[]. 
                                                          // Assuming we adjust this in a real scenario.
          setHasMore(result.length === 10);
        } else {
          setHasMore(false);
        }
      }

      setItems(prev => {
        if (!isNextPage) return fetchedItems;
        
        // Merge and deduplicate
        const existingIds = new Set(prev.map(i => i.id));
        const newUniqueItems = fetchedItems.filter(i => !existingIds.has(i.id));
        return [...prev, ...newUniqueItems];
      });

      initialLoadDone.current = true;

    } catch (err: any) {
      console.error("Error fetching feed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    fetchFeed(false);
  }, [fetchFeed]);

  useEffect(() => {
    if (!user) return;

    const subId = `feed_${user.id}`;
    const unsub = subscribeToFeed(user.id, (newItems) => {
      if (!initialLoadDone.current) return; // Don't trigger on initial mount

      setItems(prev => {
        let addedCount = 0;
        const currentIds = new Set(prev.map(i => i.id));
        
        const totallyNew = newItems.filter(item => {
          if (!currentIds.has(item.id) && !item.isRead) {
            addedCount++;
            return true;
          }
          return false;
        });

        if (addedCount > 0) {
          setNewItemCount(curr => curr + addedCount);
          // Prepend new items
          return [...totallyNew, ...prev];
        }

        return prev;
      });
    });

    globalSubManager.add(subId, unsub);

    return () => {
      globalSubManager.remove(subId);
    };
  }, [user]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchFeed(true);
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    const unreadIds = items.filter(i => !i.isRead).map(i => i.id);
    if (unreadIds.length > 0) {
      await markFeedItemsRead(user.id, unreadIds);
      setItems(prev => prev.map(i => ({ ...i, isRead: true })));
    }
    setNewItemCount(0);
  };

  return { items, loading, hasMore, loadMore, newItemCount, markAllRead, error };
}
