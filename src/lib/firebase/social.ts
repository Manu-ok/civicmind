import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp,
  writeBatch,
  runTransaction,
  onSnapshot,
  arrayUnion,
  Timestamp,
  Unsubscribe,
  collectionGroup
} from 'firebase/firestore';
import { db } from './config';
import {
  SocialUser,
  UsernameCheckResult,
  FollowRelation,
  FeedItem,
  Issue,
  Comment,
  ReactionType,
  CommentReactions,
  Story,
  Circle,
  CircleMember
} from '../types';
import { AppNotification, NotificationType, createNotification } from './firestore';
import { isValidUsername, generateUsernameSuggestions } from '../utils/usernameValidator';

// --- USERNAME FUNCTIONS ---

export async function checkUsernameAvailability(username: string): Promise<UsernameCheckResult> {
  const { valid, error } = isValidUsername(username);
  if (!valid) {
    return { available: false, reason: error, suggestions: [] };
  }

  const usernameDoc = await getDoc(doc(db, 'usernames', username));
  if (usernameDoc.exists()) {
    const suggestions = generateUsernameSuggestions(username, [username]);
    return { available: false, reason: "Username already taken", suggestions };
  }

  return { available: true, reason: null, suggestions: [] };
}

export async function claimUsername(userId: string, username: string): Promise<void> {
  const batch = writeBatch(db);
  const usernameRef = doc(db, 'usernames', username);
  const userRef = doc(db, 'users', userId);

  const usernameDoc = await getDoc(usernameRef);
  if (usernameDoc.exists()) {
    throw new Error("Username taken");
  }

  batch.set(usernameRef, { uid: userId, createdAt: serverTimestamp() });
  batch.update(userRef, { username, hasCompletedOnboarding: true });

  await batch.commit();
}

export async function releaseUsername(userId: string, oldUsername: string): Promise<void> {
  const batch = writeBatch(db);
  const usernameRef = doc(db, 'usernames', oldUsername);
  const userRef = doc(db, 'users', userId);

  batch.delete(usernameRef);
  batch.update(userRef, { username: null });

  await batch.commit();
}

// --- USERNAME CACHE ---
const usernameCache = new Map<string, { data: SocialUser, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getUserByUsername(username: string): Promise<SocialUser | null> {
  const cached = usernameCache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  const usernameDoc = await getDoc(doc(db, 'usernames', username));
  if (!usernameDoc.exists()) return null;

  const uid = usernameDoc.data().uid;
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;

  const user = { id: userDoc.id, ...userDoc.data() } as SocialUser;
  usernameCache.set(username, { data: user, timestamp: Date.now() });
  return user;
}

// --- FOLLOW FUNCTIONS ---

export async function followUser(followerId: string, followingId: string): Promise<void> {
  const batch = writeBatch(db);
  
  const followerUserDoc = await getDoc(doc(db, 'users', followerId));
  const followingUserDoc = await getDoc(doc(db, 'users', followingId));
  
  if (!followerUserDoc.exists() || !followingUserDoc.exists()) throw new Error("User not found");
  
  const followerData = followerUserDoc.data();
  const followingData = followingUserDoc.data();
  
  const followRelation: FollowRelation = {
    followerId,
    followingId,
    followerUsername: followerData.username || '',
    followingUsername: followingData.username || '',
    createdAt: Timestamp.now(),
    notifyOnReport: true,
    notifyOnVerify: true
  };

  batch.set(doc(db, `followers/${followingId}/list`, followerId), followRelation);
  batch.set(doc(db, `following/${followerId}/list`, followingId), followRelation);
  
  batch.update(doc(db, 'users', followingId), { followersCount: increment(1) });
  batch.update(doc(db, 'users', followerId), { followingCount: increment(1), points: increment(5) });
  
  batch.set(doc(db, 'follows', `${followerId}_${followingId}`), followRelation);

  const feedItemRef = doc(collection(db, `feed/${followingId}/items`));
  const feedItem: Omit<FeedItem, 'id'> = {
    type: "followed_you",
    actorId: followerId,
    actorUsername: followerData.username || '',
    actorDisplayName: followerData.displayName || '',
    actorPhotoURL: followerData.photoURL || '',
    actorIsVerified: followerData.isVerified || false,
    issueId: null,
    issueThumbnail: null,
    issueTitle: null,
    issueCategory: null,
    issueSeverity: null,
    commentId: null,
    commentPreview: null,
    storyId: null,
    createdAt: Timestamp.now(),
    isRead: false
  };
  batch.set(feedItemRef, feedItem);

  await batch.commit();
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const batch = writeBatch(db);
  
  batch.delete(doc(db, `followers/${followingId}/list`, followerId));
  batch.delete(doc(db, `following/${followerId}/list`, followingId));
  batch.delete(doc(db, 'follows', `${followerId}_${followingId}`));
  
  batch.update(doc(db, 'users', followingId), { followersCount: increment(-1) });
  batch.update(doc(db, 'users', followerId), { followingCount: increment(-1) });
  
  await batch.commit();
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const docRef = doc(db, 'follows', `${followerId}_${followingId}`);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

export async function getFollowers(userId: string, limitCount = 50): Promise<SocialUser[]> {
  const q = query(collection(db, `followers/${userId}/list`), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  const users: SocialUser[] = [];
  for (const d of snap.docs) {
    const followerId = d.data().followerId;
    const userDoc = await getDoc(doc(db, 'users', followerId));
    if (userDoc.exists()) {
      users.push({ id: userDoc.id, ...userDoc.data() } as SocialUser);
    }
  }
  return users;
}

export async function getFollowing(userId: string, limitCount = 50): Promise<SocialUser[]> {
  const q = query(collection(db, `following/${userId}/list`), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  const users: SocialUser[] = [];
  for (const d of snap.docs) {
    const followingId = d.data().followingId;
    const userDoc = await getDoc(doc(db, 'users', followingId));
    if (userDoc.exists()) {
      users.push({ id: userDoc.id, ...userDoc.data() } as SocialUser);
    }
  }
  return users;
}

export async function getMutualFollowers(userId1: string, userId2: string): Promise<SocialUser[]> {
  const followersSnap = await getDocs(query(collection(db, `followers/${userId1}/list`)));
  const mutuals: SocialUser[] = [];
  
  for (const d of followersSnap.docs) {
    if (mutuals.length >= 10) break;
    const followerId = d.data().followerId;
    const followsDoc = await getDoc(doc(db, 'follows', `${followerId}_${userId2}`));
    if (followsDoc.exists()) {
      const userDoc = await getDoc(doc(db, 'users', followerId));
      if (userDoc.exists()) {
        mutuals.push({ id: userDoc.id, ...userDoc.data() } as SocialUser);
      }
    }
  }
  return mutuals;
}

export async function getSuggestedUsers(currentUserId: string, city: string, ward: string): Promise<SocialUser[]> {
  const q = query(
    collection(db, 'users'),
    where('city', '==', city),
    orderBy('points', 'desc'),
    limit(20)
  );
  
  const snap = await getDocs(q);
  const suggestions: SocialUser[] = [];
  
  for (const d of snap.docs) {
    if (suggestions.length >= 10) break;
    if (d.id === currentUserId) continue;
    
    const isFollowed = await isFollowing(currentUserId, d.id);
    if (!isFollowed) {
      suggestions.push({ id: d.id, ...d.data() } as SocialUser);
    }
  }
  
  return suggestions.sort((a, b) => {
    if (a.ward === ward && b.ward !== ward) return -1;
    if (a.ward !== ward && b.ward === ward) return 1;
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;
    return (b.points || 0) - (a.points || 0);
  });
}

// --- FEED FUNCTIONS ---

export async function createFeedItem(targetUserId: string, feedItem: Omit<FeedItem, 'id' | 'isRead'>): Promise<void> {
  const feedRef = collection(db, `feed/${targetUserId}/items`);
  
  const snap = await getDocs(query(feedRef, orderBy('createdAt', 'desc'), limit(500)));
  if (snap.size >= 500) {
    const oldestDoc = snap.docs[snap.size - 1];
    const olderSnap = await getDocs(query(feedRef, orderBy('createdAt', 'desc'), startAfter(oldestDoc)));
    const batch = writeBatch(db);
    let deleted = 0;
    for (const d of olderSnap.docs) {
      if (deleted >= 100) break;
      batch.delete(d.ref);
      deleted++;
    }
    if (deleted > 0) {
      await batch.commit();
    }
  }

  await setDoc(doc(feedRef), {
    ...feedItem,
    isRead: false
  });
}

export async function getFeedForUser(userId: string, limitCount: number, startAfterDoc?: any): Promise<FeedItem[]> {
  let q = query(collection(db, `feed/${userId}/items`), orderBy('createdAt', 'desc'), limit(limitCount));
  if (startAfterDoc) {
    q = query(collection(db, `feed/${userId}/items`), orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(limitCount));
  }
  
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FeedItem));
}

export async function markFeedItemsRead(userId: string, itemIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  for (const id of itemIds) {
    batch.update(doc(db, `feed/${userId}/items`, id), { isRead: true });
  }
  await batch.commit();
}

export async function getUnreadFeedCount(userId: string): Promise<number> {
  const q = query(collection(db, `feed/${userId}/items`), where('isRead', '==', false));
  const snap = await getDocs(q);
  return snap.size;
}

export function subscribeToFeed(userId: string, callback: (items: FeedItem[]) => void): Unsubscribe {
  const q = query(collection(db, `feed/${userId}/items`), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FeedItem)));
  });
}

export async function distributeIssueToFollowerFeeds(reporterId: string, issue: Issue): Promise<void> {
  const followersSnap = await getDocs(collection(db, `followers/${reporterId}/list`));
  const reporterDoc = await getDoc(doc(db, 'users', reporterId));
  if (!reporterDoc.exists()) return;
  const reporterData = reporterDoc.data();

  const batches: any[] = [];
  let currentBatch = writeBatch(db);
  let opCount = 0;

  for (const d of followersSnap.docs) {
    const followerId = d.data().followerId;
    
    const feedItemRef = doc(collection(db, `feed/${followerId}/items`));
    const feedItem: Omit<FeedItem, 'id'> = {
      type: "issue_reported",
      actorId: reporterId,
      actorUsername: reporterData.username || '',
      actorDisplayName: reporterData.displayName || '',
      actorPhotoURL: reporterData.photoURL || '',
      actorIsVerified: reporterData.isVerified || false,
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

// --- COMMENT FUNCTIONS ---

export async function addComment(issueId: string, comment: Omit<Comment, 'id' | 'reactions' | 'replyCount' | 'isEdited' | 'isDeleted' | 'updatedAt'>): Promise<string> {
  const commentRef = doc(collection(db, `comments/${issueId}/threads`));
  const commentId = commentRef.id;

  const batch = writeBatch(db);
  
  const fullComment: Comment = {
    ...comment,
    id: commentId,
    reactions: { heart: 0, fire: 0, thumbsUp: 0, sad: 0, clap: 0, angry: 0 },
    userReactions: {},
    replyCount: 0,
    isEdited: false,
    isDeleted: false,
    updatedAt: comment.createdAt
  };

  batch.set(commentRef, fullComment);
  batch.update(doc(db, 'issues', issueId), { commentCount: increment(1) });
  batch.update(doc(db, 'users', comment.authorId), { points: increment(5) });

  await batch.commit();

  const issueDoc = await getDoc(doc(db, 'issues', issueId));
  let issueTitle = null, issueCategory = null, issueSeverity = null, issueThumbnail = null, issueReporter = null;
  if (issueDoc.exists()) {
    const issueData = issueDoc.data() as Issue;
    issueTitle = issueData.title;
    issueCategory = issueData.category;
    issueSeverity = issueData.severity;
    issueThumbnail = issueData.mediaUrls?.[0] || null;
    issueReporter = issueData.reportedBy;
    
    if (issueReporter !== comment.authorId) {
      await createFeedItem(issueReporter, {
        type: "issue_commented",
        actorId: comment.authorId,
        actorUsername: comment.authorUsername,
        actorDisplayName: comment.authorDisplayName,
        actorPhotoURL: comment.authorPhotoURL,
        actorIsVerified: comment.authorIsVerified,
        issueId: issueId,
        issueThumbnail,
        issueTitle,
        issueCategory,
        issueSeverity,
        commentId: commentId,
        commentPreview: comment.content.substring(0, 50),
        storyId: null,
        createdAt: Timestamp.now()
      });
    }
  }

  if (comment.mentionUsernames && comment.mentionUsernames.length > 0) {
    for (const username of comment.mentionUsernames) {
      const userResult = await getUserByUsername(username);
      if (userResult && userResult.id !== comment.authorId && userResult.id !== issueReporter) {
        await createFeedItem(userResult.id, {
          type: "mentioned_you",
          actorId: comment.authorId,
          actorUsername: comment.authorUsername,
          actorDisplayName: comment.authorDisplayName,
          actorPhotoURL: comment.authorPhotoURL,
          actorIsVerified: comment.authorIsVerified,
          issueId: issueId,
          issueThumbnail,
          issueTitle,
          issueCategory,
          issueSeverity,
          commentId: commentId,
          commentPreview: comment.content.substring(0, 50),
          storyId: null,
          createdAt: Timestamp.now()
        });
      }
    }
  }

  return commentId;
}

export async function getComments(issueId: string, limitCount = 50, replyTo: string | null = null): Promise<Comment[]> {
  const q = query(
    collection(db, `comments/${issueId}/threads`),
    where('replyTo', '==', replyTo),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Comment);
}

export function subscribeToComments(issueId: string, limitCount: number, callback: (comments: Comment[]) => void): Unsubscribe {
  const q = query(
    collection(db, `comments/${issueId}/threads`),
    where('replyTo', '==', null),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as Comment));
  });
}

export async function editComment(issueId: string, commentId: string, newContent: string, userId: string): Promise<void> {
  const commentRef = doc(db, `comments/${issueId}/threads`, commentId);
  const commentSnap = await getDoc(commentRef);
  if (!commentSnap.exists()) throw new Error("Comment not found");
  if (commentSnap.data().authorId !== userId) throw new Error("Unauthorized");
  
  await updateDoc(commentRef, {
    content: newContent,
    isEdited: true,
    updatedAt: serverTimestamp()
  });
}

export async function deleteComment(issueId: string, commentId: string, userId: string): Promise<void> {
  const commentRef = doc(db, `comments/${issueId}/threads`, commentId);
  const commentSnap = await getDoc(commentRef);
  if (!commentSnap.exists()) throw new Error("Comment not found");
  
  const userSnap = await getDoc(doc(db, 'users', userId));
  const isAdmin = userSnap.exists() && userSnap.data().role === 'admin';
  
  if (commentSnap.data().authorId !== userId && !isAdmin) {
    throw new Error("Unauthorized");
  }

  const batch = writeBatch(db);
  batch.update(commentRef, { isDeleted: true });
  batch.update(doc(db, 'issues', issueId), { commentCount: increment(-1) });
  await batch.commit();
}

export async function reactToComment(issueId: string, commentId: string, userId: string, reaction: ReactionType): Promise<void> {
  const commentRef = doc(db, `comments/${issueId}/threads`, commentId);
  
  await runTransaction(db, async (transaction) => {
    const commentSnap = await transaction.get(commentRef);
    if (!commentSnap.exists()) throw new Error("Comment not found");
    
    const data = commentSnap.data() as Comment;
    const userReactions = data.userReactions || {};
    const currentReaction = userReactions[userId];
    
    const reactions = { ...data.reactions };
    
    if (currentReaction === reaction) {
      reactions[reaction] = Math.max(0, reactions[reaction] - 1);
      delete userReactions[userId];
    } else {
      if (currentReaction) {
        reactions[currentReaction] = Math.max(0, reactions[currentReaction] - 1);
      }
      reactions[reaction] = (reactions[reaction] || 0) + 1;
      userReactions[userId] = reaction;
    }
    
    transaction.update(commentRef, { reactions, userReactions });
  });
}

// --- ISSUE REACTION FUNCTIONS ---

export async function reactToIssue(issueId: string, userId: string, reaction: ReactionType): Promise<void> {
  const issueRef = doc(db, 'issues', issueId);
  const reactionRef = doc(db, `reactions/${issueId}/userReactions`, userId);
  
  await runTransaction(db, async (transaction) => {
    const issueSnap = await transaction.get(issueRef);
    if (!issueSnap.exists()) throw new Error("Issue not found");
    
    const currentReactionSnap = await transaction.get(reactionRef);
    const currentReaction = currentReactionSnap.exists() ? currentReactionSnap.data().reaction as ReactionType : null;
    
    const data = issueSnap.data() as Issue;
    const reactionCounts = data.reactionCounts || { heart: 0, fire: 0, thumbsUp: 0, sad: 0, clap: 0, angry: 0 };
    
    if (currentReaction === reaction) {
      reactionCounts[reaction] = Math.max(0, reactionCounts[reaction] - 1);
      transaction.delete(reactionRef);
    } else {
      if (currentReaction) {
        reactionCounts[currentReaction] = Math.max(0, reactionCounts[currentReaction] - 1);
      }
      reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
      transaction.set(reactionRef, { userId, reaction, createdAt: serverTimestamp() });
    }
    
    transaction.update(issueRef, { reactionCounts });
  });
}

export async function getUserIssueReaction(issueId: string, userId: string): Promise<ReactionType | null> {
  const reactionRef = doc(db, `reactions/${issueId}/userReactions`, userId);
  const snap = await getDoc(reactionRef);
  return snap.exists() ? snap.data().reaction as ReactionType : null;
}

export async function getIssueReactions(issueId: string, userId: string): Promise<{counts: CommentReactions, userReaction: ReactionType | null}> {
  const issueDoc = await getDoc(doc(db, 'issues', issueId));
  const counts = issueDoc.exists() && issueDoc.data().reactionCounts ? issueDoc.data().reactionCounts : { heart: 0, fire: 0, thumbsUp: 0, sad: 0, clap: 0, angry: 0 };
  const userReaction = await getUserIssueReaction(issueId, userId);
  return { counts, userReaction };
}

// --- STORY FUNCTIONS ---

export async function createStory(story: Omit<Story, 'id' | 'viewCount' | 'viewedBy' | 'isActive'>): Promise<string> {
  const storyRef = doc(collection(db, 'stories'));
  const expiresAtDate = new Date();
  expiresAtDate.setHours(expiresAtDate.getHours() + 24);
  
  await setDoc(storyRef, {
    ...story,
    id: storyRef.id,
    viewCount: 0,
    viewedBy: [],
    isActive: true,
    expiresAt: Timestamp.fromDate(expiresAtDate)
  });
  
  return storyRef.id;
}

export async function getActiveStoriesForFeed(userId: string): Promise<{user: SocialUser, stories: Story[]}[]> {
  const followingSnap = await getDocs(collection(db, `following/${userId}/list`));
  const followingIds = followingSnap.docs.map(d => d.data().followingId);
  followingIds.push(userId);
  
  const result: {user: SocialUser, stories: Story[]}[] = [];
  
  const chunkSize = 10;
  for (let i = 0; i < followingIds.length; i += chunkSize) {
    const chunk = followingIds.slice(i, i + chunkSize);
    const q = query(
      collection(db, 'stories'),
      where('authorId', 'in', chunk),
      where('isActive', '==', true),
      where('expiresAt', '>', Timestamp.now()),
      orderBy('expiresAt', 'asc') 
    );
    const snap = await getDocs(q);
    
    const storiesByAuthor: Record<string, Story[]> = {};
    for (const d of snap.docs) {
      const s = d.data() as Story;
      if (!storiesByAuthor[s.authorId]) storiesByAuthor[s.authorId] = [];
      storiesByAuthor[s.authorId].push(s);
    }
    
    for (const authorId of Object.keys(storiesByAuthor)) {
      const userDoc = await getDoc(doc(db, 'users', authorId));
      if (userDoc.exists()) {
        result.push({
          user: { id: userDoc.id, ...userDoc.data() } as SocialUser,
          stories: storiesByAuthor[authorId].sort((a, b) => (a.createdAt as Timestamp).toMillis() - (b.createdAt as Timestamp).toMillis())
        });
      }
    }
  }
  
  return result.sort((a, b) => {
    const aLatest = a.stories[a.stories.length - 1];
    const bLatest = b.stories[b.stories.length - 1];
    return (bLatest.createdAt as Timestamp).toMillis() - (aLatest.createdAt as Timestamp).toMillis();
  });
}

export async function markStoryViewed(storyId: string, userId: string): Promise<void> {
  const storyRef = doc(db, 'stories', storyId);
  await updateDoc(storyRef, {
    viewedBy: arrayUnion(userId),
    viewCount: increment(1)
  });
}

export async function expireOldStories(): Promise<void> {
  const q = query(
    collection(db, 'stories'),
    where('isActive', '==', true),
    where('expiresAt', '<', Timestamp.now())
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  let count = 0;
  for (const d of snap.docs) {
    batch.update(d.ref, { isActive: false });
    count++;
    if (count === 500) break;
  }
  if (count > 0) {
    await batch.commit();
  }
}

// --- CIRCLE FUNCTIONS ---

export async function createCircle(circle: Omit<Circle, 'id' | 'memberCount' | 'issueCount'>): Promise<string> {
  const circleRef = doc(collection(db, 'circles'));
  const batch = writeBatch(db);
  
  const fullCircle: Circle = {
    ...circle,
    id: circleRef.id,
    memberCount: 1,
    issueCount: 0
  };
  
  batch.set(circleRef, fullCircle);
  
  const creatorDoc = await getDoc(doc(db, 'users', circle.createdBy));
  const creatorData = creatorDoc.exists() ? creatorDoc.data() : {};
  
  const memberRef = doc(db, `circleMembers/${circleRef.id}/members`, circle.createdBy);
  batch.set(memberRef, {
    userId: circle.createdBy,
    username: creatorData.username || '',
    displayName: creatorData.displayName || '',
    photoURL: creatorData.photoURL || '',
    role: 'admin',
    joinedAt: serverTimestamp()
  });
  
  await batch.commit();
  return circleRef.id;
}

export async function joinCircle(circleId: string, userId: string): Promise<void> {
  const batch = writeBatch(db);
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.exists() ? userDoc.data() : {};
  
  const memberRef = doc(db, `circleMembers/${circleId}/members`, userId);
  batch.set(memberRef, {
    userId,
    username: userData.username || '',
    displayName: userData.displayName || '',
    photoURL: userData.photoURL || '',
    role: 'member',
    joinedAt: serverTimestamp()
  });
  
  batch.update(doc(db, 'circles', circleId), { memberCount: increment(1) });
  await batch.commit();
}

export async function leaveCircle(circleId: string, userId: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, `circleMembers/${circleId}/members`, userId));
  batch.update(doc(db, 'circles', circleId), { memberCount: increment(-1) });
  await batch.commit();
}

export async function getCirclesForCity(city: string): Promise<Circle[]> {
  const q = query(
    collection(db, 'circles'),
    where('city', '==', city),
    orderBy('memberCount', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Circle);
}

export async function getCirclesForWard(ward: string, city: string): Promise<Circle[]> {
  const q = query(
    collection(db, 'circles'),
    where('city', '==', city),
    where('ward', '==', ward),
    orderBy('memberCount', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Circle);
}

export async function getUserCircles(userId: string): Promise<Circle[]> {
  const q = query(collectionGroup(db, 'members'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const circles: Circle[] = [];
  for (const d of snap.docs) {
    const circleId = d.ref.parent.parent?.id;
    if (circleId) {
      const circleDoc = await getDoc(doc(db, 'circles', circleId));
      if (circleDoc.exists()) {
        circles.push(circleDoc.data() as Circle);
      }
    }
  }
  return circles;
}

export async function getCircleMembers(circleId: string): Promise<CircleMember[]> {
  const snap = await getDocs(collection(db, `circleMembers/${circleId}/members`));
  return snap.docs.map(d => d.data() as CircleMember);
}

// --- SHARE FUNCTIONS ---

export async function incrementShareCount(issueId: string): Promise<void> {
  await updateDoc(doc(db, 'issues', issueId), { shareCount: increment(1) });
}

export async function getShareStats(issueId: string): Promise<number> {
  const snap = await getDoc(doc(db, 'issues', issueId));
  if (snap.exists()) {
    return snap.data().shareCount || 0;
  }
  return 0;
}
// --- SOCIAL NOTIFICATIONS HELPER ---

export async function createSocialNotification(
  targetUserId: string,
  data: {
    type: NotificationType;
    title: string;
    message: string;
    actorId?: string;
    actorName?: string;
    actorUsername?: string;
    actorPhotoUrl?: string;
    issueId?: string;
    commentPreview?: string;
    circleId?: string;
    circleName?: string;
    badgeName?: string;
    reactionType?: string;
  }
) {
  if (!targetUserId) return;

  try {
    // Basic aggregation for reactions
    if (data.type === 'reaction_on_issue' && data.issueId) {
      // Find recent reaction notifications for this issue within the last 30 minutes
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60000);
      const notifsRef = collection(db, 'users', targetUserId, 'notifications');
      const recentQuery = query(
        notifsRef,
        where('type', '==', 'reaction_on_issue'),
        where('issueId', '==', data.issueId),
        where('createdAt', '>=', Timestamp.fromDate(thirtyMinsAgo)),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(recentQuery);
      if (!snapshot.empty) {
        // Aggregate
        const existingDoc = snapshot.docs[0];
        const existingData = existingDoc.data() as AppNotification;
        const newCount = (existingData.aggregatedCount || 1) + 1;
        
        await updateDoc(doc(db, 'users', targetUserId, 'notifications', existingDoc.id), {
          aggregatedCount: newCount,
          message: `${data.actorName} and ${newCount - 1} others reacted to your issue`,
          read: false,
          createdAt: serverTimestamp() // bump to top
        });
        return;
      }
    }

    const notification = {
      ...data,
      read: false,
      createdAt: Timestamp.now()
    } as AppNotification;

    await createNotification(targetUserId, notification);
  } catch (error) {
    console.error("Error creating social notification:", error);
  }
}
