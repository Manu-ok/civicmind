import { db } from './config';
import { 
  collection, doc, getDoc, getDocs, query, where, orderBy, 
  limit, writeBatch, serverTimestamp, increment, onSnapshot, Unsubscribe 
} from 'firebase/firestore';
import { Circle, CircleMember } from '../types';

export async function createCircle(circleData: Omit<Circle, 'id' | 'memberCount' | 'issueCount' | 'createdAt'>, userId: string): Promise<string> {
  const circleRef = doc(collection(db, 'circles'));
  const circleId = circleRef.id;

  const batch = writeBatch(db);

  const fullCircle: Circle = {
    ...circleData,
    id: circleId,
    memberCount: 1,
    issueCount: 0,
    createdAt: serverTimestamp() as any
  };

  batch.set(circleRef, fullCircle);

  // Add creator as admin
  const memberRef = doc(db, `circles/${circleId}/members`, userId);
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.exists() ? userDoc.data() : {};

  const memberData: CircleMember = {
    userId,
    username: userData.username || '',
    displayName: userData.displayName || '',
    photoURL: userData.photoURL || '',
    role: 'admin',
    joinedAt: serverTimestamp() as any
  };

  batch.set(memberRef, memberData);
  
  // Track circles user joined
  const userCircleRef = doc(db, `users/${userId}/joinedCircles`, circleId);
  batch.set(userCircleRef, { joinedAt: serverTimestamp() });

  await batch.commit();
  return circleId;
}

export async function getUserCircles(userId: string): Promise<Circle[]> {
  const joinedSnap = await getDocs(collection(db, `users/${userId}/joinedCircles`));
  const circleIds = joinedSnap.docs.map(d => d.id);
  
  if (circleIds.length === 0) return [];

  // Firestore allows up to 10 items in an 'in' clause. Chunk if necessary.
  const chunks = [];
  for (let i = 0; i < circleIds.length; i += 10) {
    chunks.push(circleIds.slice(i, i + 10));
  }

  let circles: Circle[] = [];
  for (const chunk of chunks) {
    const q = query(collection(db, 'circles'), where('id', 'in', chunk));
    const snap = await getDocs(q);
    circles = [...circles, ...snap.docs.map(d => d.data() as Circle)];
  }

  return circles;
}

export async function getCirclesForCity(city: string): Promise<Circle[]> {
  const q = query(
    collection(db, 'circles'),
    where('city', '==', city),
    orderBy('memberCount', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Circle);
}

export async function joinCircle(circleId: string, userId: string): Promise<void> {
  const batch = writeBatch(db);

  const memberRef = doc(db, `circles/${circleId}/members`, userId);
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.exists() ? userDoc.data() : {};

  const memberData: CircleMember = {
    userId,
    username: userData.username || '',
    displayName: userData.displayName || '',
    photoURL: userData.photoURL || '',
    role: 'member',
    joinedAt: serverTimestamp() as any
  };

  batch.set(memberRef, memberData);
  batch.update(doc(db, 'circles', circleId), { memberCount: increment(1) });
  batch.set(doc(db, `users/${userId}/joinedCircles`, circleId), { joinedAt: serverTimestamp() });

  await batch.commit();
}

export async function leaveCircle(circleId: string, userId: string): Promise<void> {
  const batch = writeBatch(db);

  batch.delete(doc(db, `circles/${circleId}/members`, userId));
  batch.update(doc(db, 'circles', circleId), { memberCount: increment(-1) });
  batch.delete(doc(db, `users/${userId}/joinedCircles`, circleId));

  await batch.commit();
}

export function subscribeToCircleMembers(circleId: string, callback: (members: CircleMember[]) => void): Unsubscribe {
  const q = query(collection(db, `circles/${circleId}/members`), orderBy('joinedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as CircleMember));
  });
}
