import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, orderBy, onSnapshot, increment, arrayUnion, 
  Timestamp, limit
} from "firebase/firestore";
import { db } from "./config";
import { Issue, User, Verification, AnalyticsData } from "../types";

// ===================
// ISSUE FUNCTIONS
// ===================

export async function createIssue(issueData: Omit<Issue, "id">): Promise<string> {
  try {
    const newDocRef = doc(collection(db, "issues"));
    const issue: Issue = { ...issueData, id: newDocRef.id };
    await setDoc(newDocRef, issue);
    return newDocRef.id;
  } catch (error: any) {
    console.error("Error creating issue:", error);
    throw new Error(error.message || "Failed to create issue.");
  }
}

export async function getIssue(issueId: string): Promise<Issue | null> {
  try {
    const docSnap = await getDoc(doc(db, "issues", issueId));
    return docSnap.exists() ? (docSnap.data() as Issue) : null;
  } catch (error: any) {
    console.error("Error fetching issue:", error);
    throw new Error(error.message || "Failed to fetch issue.");
  }
}

export async function updateIssue(issueId: string, data: Partial<Issue>): Promise<void> {
  try {
    await updateDoc(doc(db, "issues", issueId), data);
  } catch (error: any) {
    console.error("Error updating issue:", error);
    throw new Error(error.message || "Failed to update issue.");
  }
}

export async function deleteIssue(issueId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "issues", issueId), { deleted: true }); // Soft delete
  } catch (error: any) {
    console.error("Error deleting issue:", error);
    throw new Error(error.message || "Failed to delete issue.");
  }
}

export async function getIssues(filters?: { category?: string, severity?: string, status?: string, ward?: string, city?: string }): Promise<Issue[]> {
  try {
    const q = query(collection(db, "issues"), orderBy("reportedAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let issues = querySnapshot.docs.map(doc => doc.data() as Issue).filter(issue => !issue.deleted);

    if (filters) {
      if (filters.category) issues = issues.filter(i => i.category === filters.category);
      if (filters.severity) issues = issues.filter(i => i.severity === filters.severity);
      if (filters.status) issues = issues.filter(i => i.status === filters.status);
      if (filters.ward) issues = issues.filter(i => i.location?.ward === filters.ward);
      if (filters.city) issues = issues.filter(i => i.location?.city === filters.city);
    }

    return issues;
  } catch (error: any) {
    console.error("Error fetching issues:", error);
    throw new Error(error.message || "Failed to fetch issues.");
  }
}

export async function getIssuesNearLocation(lat: number, lng: number, radiusKm: number): Promise<Issue[]> {
  try {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));
    
    const q = query(
      collection(db, "issues"),
      where("location.lat", ">=", lat - latDelta),
      where("location.lat", "<=", lat + latDelta)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => doc.data() as Issue)
      .filter(issue => issue.location.lng >= lng - lngDelta && issue.location.lng <= lng + lngDelta);
  } catch (error: any) {
    console.error("Error fetching issues near location:", error);
    throw new Error(error.message || "Failed to fetch issues near location.");
  }
}

export function subscribeToIssues(callback: (issues: Issue[]) => void, filters?: { category?: string, severity?: string, status?: string, ward?: string }): () => void {
  try {
    let q = collection(db, "issues") as any;
    
    if (filters) {
      if (filters.category) q = query(q, where("category", "==", filters.category));
      if (filters.severity) q = query(q, where("severity", "==", filters.severity));
      if (filters.status) q = query(q, where("status", "==", filters.status));
      if (filters.ward) q = query(q, where("location.ward", "==", filters.ward));
    }

    return onSnapshot(q, (snapshot: any) => {
      const issues = snapshot.docs.map((doc: any) => doc.data() as Issue);
      callback(issues.filter(i => !(i as any).deleted).sort((a, b) => {
        const timeA = (a.reportedAt as Timestamp).toMillis ? (a.reportedAt as Timestamp).toMillis() : 0;
        const timeB = (b.reportedAt as Timestamp).toMillis ? (b.reportedAt as Timestamp).toMillis() : 0;
        return timeB - timeA;
      }));
    });
  } catch (error: any) {
    console.error("Error subscribing to issues:", error);
    throw new Error(error.message || "Failed to subscribe to issues.");
  }
}

export async function incrementVerificationCount(issueId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "issues", issueId), { verificationCount: increment(1) });
  } catch (error: any) {
    console.error("Error incrementing verification count:", error);
    throw new Error(error.message || "Failed to increment verification count.");
  }
}

export async function addVerification(issueId: string, verification: Verification): Promise<void> {
  try {
    await updateDoc(doc(db, "issues", issueId), {
      verifications: arrayUnion(verification),
      verificationCount: increment(1)
    });
  } catch (error: any) {
    console.error("Error adding verification:", error);
    throw new Error(error.message || "Failed to add verification.");
  }
}

export async function incrementUpvotes(issueId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "issues", issueId), { upvotes: increment(1) });
  } catch (error: any) {
    console.error("Error incrementing upvotes:", error);
    throw new Error(error.message || "Failed to increment upvotes.");
  }
}

// ===================
// USER FUNCTIONS
// ===================

export async function createUserProfile(uid: string, data: User): Promise<void> {
  try {
    await setDoc(doc(db, "users", uid), data);
  } catch (error: any) {
    console.error("Error creating user profile:", error);
    throw new Error(error.message || "Failed to create user profile.");
  }
}

export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    return docSnap.exists() ? (docSnap.data() as User) : null;
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    throw new Error(error.message || "Failed to fetch user profile.");
  }
}

export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), data);
  } catch (error: any) {
    console.error("Error updating user details:", error);
    throw new Error(error.message || "Failed to update user details.");
  }
}

export async function getUserStats(uid: string): Promise<{ points: number; issuesReported: number; issuesVerified: number } | null> {
  try {
    const user = await getUserProfile(uid);
    if (user) {
      return { points: user.points, issuesReported: user.issuesReported, issuesVerified: user.issuesVerified };
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching user stats:", error);
    throw new Error(error.message || "Failed to fetch user stats.");
  }
}

export async function incrementUserPoints(uid: string, points: number): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), { points: increment(points) });
  } catch (error: any) {
    console.error("Error incrementing points:", error);
    throw new Error(error.message || "Failed to increment user points.");
  }
}

export async function getTopCitizens(city: string, limitCount: number): Promise<User[]> {
  try {
    const q = query(collection(db, "users"));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => doc.data() as User);
    
    return users
      .filter(user => user.city === city)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, limitCount);
  } catch (error: any) {
    console.error("Error fetching top citizens:", error);
    throw new Error(error.message || "Failed to fetch top citizens.");
  }
}

// ===================
// ANALYTICS FUNCTIONS
// ===================

export async function getAnalytics(city: string): Promise<AnalyticsData | null> {
  try {
    const docSnap = await getDoc(doc(db, "analytics", city));
    return docSnap.exists() ? (docSnap.data() as AnalyticsData) : null;
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    throw new Error(error.message || "Failed to fetch analytics.");
  }
}

export async function updateAnalytics(city: string, issueData: any): Promise<void> {
  try {
    console.log("Updating analytics for issue:", issueData.id);
    await setDoc(doc(db, "analytics", city), { lastUpdated: Timestamp.now() }, { merge: true });
  } catch (error: any) {
    console.error("Error updating analytics:", error);
    throw new Error(error.message || "Failed to update analytics.");
  }
}

// ===================
// GAMIFICATION & POINTS
// ===================

export const POINT_VALUES = {
  REPORT_ISSUE: 15,
  VERIFY_ISSUE: 10,
  VOICE_REPORT: 20,
  ISSUE_RESOLVED: 25,
  FIRST_OF_DAY: 5,
};

export function getBadgeForPoints(points: number): { name: string; color: string; icon: string } {
  if (points >= 1000) return { name: "Civic Hero", color: "from-yellow-400 to-amber-600", icon: "Trophy" };
  if (points >= 600) return { name: "Civic Guardian", color: "from-purple-400 to-indigo-600", icon: "ShieldAlert" };
  if (points >= 300) return { name: "Civic Champion", color: "from-blue-400 to-blue-600", icon: "Star" };
  if (points >= 100) return { name: "Civic Citizen", color: "from-green-400 to-emerald-600", icon: "CheckCircle2" };
  return { name: "Civic Rookie", color: "from-zinc-400 to-zinc-600", icon: "Leaf" };
}

export async function updatePoints(uid: string, actionType: keyof typeof POINT_VALUES, customPoints?: number): Promise<void> {
  try {
    const pointsToAdd = customPoints !== undefined ? customPoints : POINT_VALUES[actionType];
    await updateDoc(doc(db, "users", uid), { 
      points: increment(pointsToAdd) 
    });
    
    // Auto-create a notification for the earned points
    await createNotification(uid, {
      title: `Earned ${pointsToAdd} points!`,
      message: `You earned points for: ${actionType.replace('_', ' ').toLowerCase()}`,
      type: 'points',
      createdAt: Timestamp.now(),
      read: false
    });
  } catch (error: any) {
    console.error("Error updating points:", error);
  }
}

// ===================
// NOTIFICATIONS
// ===================

export interface AppNotification {
  id?: string;
  title: string;
  message: string;
  type: 'points' | 'status_change' | 'nearby_issue' | 'verified' | 'system';
  issueId?: string;
  createdAt: Timestamp;
  read: boolean;
}

export async function createNotification(uid: string, notification: AppNotification): Promise<void> {
  try {
    const notificationsRef = collection(db, "users", uid, "notifications");
    await setDoc(doc(notificationsRef), notification);
  } catch (error: any) {
    console.error("Error creating notification:", error);
  }
}

export async function markNotificationRead(uid: string, notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid, "notifications", notificationId), { read: true });
  } catch (error: any) {
    console.error("Error marking notification read:", error);
  }
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  try {
    const notificationsRef = collection(db, "users", uid, "notifications");
    const q = query(notificationsRef, where("read", "==", false));
    const snapshot = await getDocs(q);
    
    // Warning: batch updates are better for large datasets, using loop for simplicity
    const promises = snapshot.docs.map(doc => updateDoc(doc.ref, { read: true }));
    await Promise.all(promises);
  } catch (error: any) {
    console.error("Error marking all read:", error);
  }
}
