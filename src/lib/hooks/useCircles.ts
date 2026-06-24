import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { Circle, CircleMember } from '@/lib/types';
import { 
  getUserCircles, getCirclesForCity, joinCircle, leaveCircle, subscribeToCircleMembers 
} from '@/lib/firebase/circles';

export function useCircles() {
  const { user } = useAuthStore();
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [cityCircles, setCityCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCircles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [mine, allInCity] = await Promise.all([
        getUserCircles(user.id),
        getCirclesForCity(user.city || '')
      ]);
      setMyCircles(mine);
      setCityCircles(allInCity);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircles();
  }, [user]);

  const handleJoin = async (circleId: string) => {
    if (!user) throw new Error("Not logged in");
    await joinCircle(circleId, user.id);
    await fetchCircles(); // Refresh lists
  };

  const handleLeave = async (circleId: string) => {
    if (!user) throw new Error("Not logged in");
    await leaveCircle(circleId, user.id);
    await fetchCircles(); // Refresh lists
  };

  // The discoverable circles are the city circles the user hasn't joined yet
  const myCircleIds = new Set(myCircles.map(c => c.id));
  const discoverableCircles = cityCircles.filter(c => !myCircleIds.has(c.id));

  return {
    myCircles,
    discoverableCircles,
    loading,
    joinCircle: handleJoin,
    leaveCircle: handleLeave,
    refresh: fetchCircles
  };
}

export function useCircleMembers(circleId: string) {
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!circleId) return;
    setLoading(true);
    const unsubscribe = subscribeToCircleMembers(circleId, (newMembers) => {
      setMembers(newMembers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [circleId]);

  return { members, loading };
}
