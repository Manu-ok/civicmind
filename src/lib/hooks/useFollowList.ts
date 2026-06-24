import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { SocialUser } from '@/lib/types';

export function useFollowList(userId: string, type: "followers" | "following") {
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const lastDocRef = useRef<any>(null);

  const loadUsers = async (isNextPage = false) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const collectionPath = type === "followers" ? `followers/${userId}/list` : `following/${userId}/list`;
      let q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'), limit(20));
      
      if (isNextPage && lastDocRef.current) {
        q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'), startAfter(lastDocRef.current), limit(20));
      }

      const snap = await getDocs(q);
      
      if (snap.empty) {
        setHasMore(false);
        if (!isNextPage) setUsers([]);
        return;
      }

      lastDocRef.current = snap.docs[snap.docs.length - 1];
      
      const fetchedUsers: SocialUser[] = [];
      for (const d of snap.docs) {
        const targetId = type === "followers" ? d.data().followerId : d.data().followingId;
        const userDoc = await getDoc(doc(db, 'users', targetId));
        if (userDoc.exists()) {
          fetchedUsers.push({ id: userDoc.id, ...userDoc.data() } as SocialUser);
        }
      }

      setUsers(prev => isNextPage ? [...prev, ...fetchedUsers] : fetchedUsers);
      setHasMore(snap.docs.length === 20);
      
    } catch (err: any) {
      console.error("Error fetching follow list:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    lastDocRef.current = null;
    setUsers([]);
    setHasMore(true);
    loadUsers(false);
  }, [userId, type]);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadUsers(true);
    }
  };

  return { users, loading, error, hasMore, loadMore };
}
