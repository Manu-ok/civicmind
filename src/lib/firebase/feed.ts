import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { Issue, SocialUser, FeedItem } from '../types';
import {
  getFollowing,
  getUnreadFeedCount,
  getActiveStoriesForFeed
} from './social';

export function getEngagementScore(issue: Issue): number {
  const upvotes = issue.upvotes || 0;
  const commentCount = issue.commentCount || 0;
  const verifications = issue.verificationCount || 0;
  const shareCount = issue.shareCount || 0;
  return (upvotes * 2) + (commentCount * 3) + (verifications * 5) + (shareCount * 1);
}

export function getRecencyScore(createdAt: Timestamp | Date | any): number {
  if (!createdAt) return 5;
  
  let createdDate: Date;
  if (typeof createdAt.toDate === 'function') {
    createdDate = createdAt.toDate();
  } else if (createdAt instanceof Date) {
    createdDate = createdAt;
  } else {
    createdDate = new Date(createdAt);
  }

  const now = new Date();
  const diffHours = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

  if (diffHours <= 1) return 100;
  if (diffHours <= 6) return 80;
  if (diffHours <= 24) return 60;
  if (diffHours <= 72) return 40; // 3 days
  if (diffHours <= 168) return 20; // 7 days
  return 5;
}

export function createFeedItemFromIssue(issue: Issue, actor: SocialUser, type: FeedItem['type']): FeedItem {
  return {
    id: `feed_${issue.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: type,
    actorId: actor.id,
    actorUsername: actor.username || '',
    actorDisplayName: actor.displayName,
    actorPhotoURL: actor.photoURL || '',
    actorIsVerified: actor.isVerified || false,
    issueId: issue.id,
    issueThumbnail: issue.mediaUrls?.[0] || null,
    issueTitle: issue.title,
    issueCategory: issue.category,
    issueSeverity: issue.severity,
    commentId: null,
    commentPreview: null,
    storyId: null,
    createdAt: Timestamp.now(),
    isRead: false
  };
}

export async function generateFeedForUser(userId: string, city: string, ward: string): Promise<FeedItem[]> {
  const followingUsers = await getFollowing(userId, 100);
  const followingIds = followingUsers.map(u => u.id);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysTimestamp = Timestamp.fromDate(sevenDaysAgo);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const oneDayTimestamp = Timestamp.fromDate(oneDayAgo);

  const rawIssues: { issue: Issue, source: 'following' | 'ward' | 'trending' }[] = [];

  // a) Following feed (60% weight algorithmically via score sorting and fetching)
  if (followingIds.length > 0) {
    // Firestore 'in' queries are limited to 10. Chunk them if needed.
    const chunkSize = 10;
    for (let i = 0; i < followingIds.length; i += chunkSize) {
      const chunk = followingIds.slice(i, i + chunkSize);
      const qFollowing = query(
        collection(db, 'issues'),
        where('reportedBy', 'in', chunk),
        where('reportedAt', '>=', sevenDaysTimestamp)
      );
      const snapFollowing = await getDocs(qFollowing);
      snapFollowing.docs.forEach(d => {
        rawIssues.push({ issue: { id: d.id, ...d.data() } as Issue, source: 'following' });
      });
    }
  }

  // b) Ward feed (25% weight via fetching logic)
  if (city && ward) {
    const qWard = query(
      collection(db, 'issues'),
      where('location.city', '==', city),
      where('location.ward', '==', ward),
      where('reportedAt', '>=', sevenDaysTimestamp)
    );
    const snapWard = await getDocs(qWard);
    snapWard.docs.forEach(d => {
      const issue = { id: d.id, ...d.data() } as Issue;
      if (issue.reportedBy !== userId) {
        rawIssues.push({ issue, source: 'ward' });
      }
    });
  }

  // c) Trending feed (15% weight - last 24 hours high engagement)
  if (city) {
    const qTrending = query(
      collection(db, 'issues'),
      where('location.city', '==', city),
      where('reportedAt', '>=', oneDayTimestamp)
    );
    const snapTrending = await getDocs(qTrending);
    snapTrending.docs.forEach(d => {
      const issue = { id: d.id, ...d.data() } as Issue;
      if (issue.reportedBy !== userId) {
        rawIssues.push({ issue, source: 'trending' });
      }
    });
  }

  // Deduplicate issues by ID
  const uniqueIssuesMap = new Map<string, { issue: Issue, sources: Set<string> }>();
  for (const item of rawIssues) {
    if (uniqueIssuesMap.has(item.issue.id)) {
      uniqueIssuesMap.get(item.issue.id)!.sources.add(item.source);
    } else {
      uniqueIssuesMap.set(item.issue.id, { issue: item.issue, sources: new Set([item.source]) });
    }
  }

  // Calculate scores and sort
  const scoredIssues = Array.from(uniqueIssuesMap.values()).map(item => {
    const engagementScore = getEngagementScore(item.issue);
    const recencyScore = getRecencyScore(item.issue.reportedAt);
    const finalScore = (engagementScore * 0.4) + (recencyScore * 0.6);
    return { ...item, finalScore };
  });

  scoredIssues.sort((a, b) => b.finalScore - a.finalScore);

  // Take top 50
  const topIssues = scoredIssues.slice(0, 50);

  // Convert to FeedItems
  const feedItems: FeedItem[] = [];
  
  // Cache for users to prevent multiple fetches of the same actor
  const userCache = new Map<string, SocialUser>();
  const getUser = async (uid: string) => {
    if (userCache.has(uid)) return userCache.get(uid)!;
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      const u = { id: docSnap.id, ...docSnap.data() } as SocialUser;
      userCache.set(uid, u);
      return u;
    }
    return null;
  };

  for (const item of topIssues) {
    const actor = await getUser(item.issue.reportedBy);
    if (actor) {
      feedItems.push(createFeedItemFromIssue(item.issue, actor, 'issue_reported'));
    }
  }

  return feedItems;
}

export async function refreshFeedForFollowers(reporterId: string, issue: Issue): Promise<void> {
  const reporterDoc = await getDoc(doc(db, 'users', reporterId));
  if (!reporterDoc.exists()) return;
  const reporterData = { id: reporterDoc.id, ...reporterDoc.data() } as SocialUser;

  const targetUserIds = new Set<string>();

  // 1. Get Followers
  const followersSnap = await getDocs(collection(db, `followers/${reporterId}/list`));
  followersSnap.docs.forEach(d => targetUserIds.add(d.data().followerId));

  // 2. Get Ward Users (city-wide awareness for that specific ward)
  if (issue.location && issue.location.city && issue.location.ward) {
    const wardUsersSnap = await getDocs(
      query(
        collection(db, 'users'),
        where('city', '==', issue.location.city),
        where('ward', '==', issue.location.ward)
      )
    );
    wardUsersSnap.docs.forEach(d => {
      if (d.id !== reporterId) {
        targetUserIds.add(d.id);
      }
    });
  }

  // Write efficiently using Batches
  const batches: any[] = [];
  let currentBatch = writeBatch(db);
  let opCount = 0;

  for (const targetId of targetUserIds) {
    const feedItemRef = doc(collection(db, `feed/${targetId}/items`));
    const feedItem = createFeedItemFromIssue(issue, reporterData, 'issue_reported');
    
    currentBatch.set(feedItemRef, feedItem);
    opCount++;

    if (opCount === 500) {
      batches.push(currentBatch.commit());
      currentBatch = writeBatch(db);
      opCount = 0;
    }
  }

  if (opCount > 0) {
    batches.push(currentBatch.commit());
  }

  await Promise.all(batches);
}

export async function getFeedStats(userId: string): Promise<{
  unreadCount: number,
  followingCount: number,
  activeStoriesCount: number
}> {
  const [unreadCount, following, stories] = await Promise.all([
    getUnreadFeedCount(userId),
    getFollowing(userId, 100),
    getActiveStoriesForFeed(userId)
  ]);

  let activeStoriesCount = 0;
  for (const group of stories) {
    activeStoriesCount += group.stories.length;
  }

  return {
    unreadCount,
    followingCount: following.length,
    activeStoriesCount
  };
}
