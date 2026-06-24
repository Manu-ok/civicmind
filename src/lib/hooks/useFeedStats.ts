import { useState, useEffect } from 'react';
import { getFeedStats } from '@/lib/firebase/feed';
import { useAuthStore } from '@/lib/stores/authStore';

export function useFeedStats() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<{
    unreadCount: number;
    followingCount: number;
    activeStoriesCount: number;
  }>({ unreadCount: 0, followingCount: 0, activeStoriesCount: 0 });

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    
    const fetchStats = async () => {
      try {
        const data = await getFeedStats(user.id);
        if (mounted) {
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch feed stats:", err);
      }
    };

    fetchStats();

    // Poll every 30 seconds for new feed items
    const interval = setInterval(fetchStats, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user]);

  return stats;
}
