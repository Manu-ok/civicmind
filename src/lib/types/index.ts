import { Timestamp } from 'firebase/firestore';

export type Category = "road" | "water" | "electricity" | "waste" | "safety" | "other";
export type Severity = "critical" | "high" | "medium" | "low";
export type IssueStatus = "pending" | "verified" | "in_progress" | "resolved";

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  ward: string;
  city: string;
  points: number;
  issuesReported: number;
  issuesVerified: number;
  createdAt: Timestamp | Date;
  role: "citizen" | "admin";
  isPublicProfile?: boolean;
  username: string | null;
  hasCompletedOnboarding: boolean;
  isVerified?: boolean;
  fcmTokens?: string[];
}

export interface IssueLocation {
  lat: number;
  lng: number;
  address: string;
  ward: string;
  city: string;
}

export interface AIAnalysis {
  detectedIssue: string;
  confidence: number; // 0-100
  department: string;
  riskAssessment: string;
  estimatedImpact: string;
  processingTime: number;
}

export interface ResolutionPlan {
  steps: string[];
  estimatedDays: number;
  estimatedImpact: string; // residents affected
  department: string;
  priority: string;
}

export interface Verification {
  userId: string;
  userDisplayName: string;
  mediaUrl?: string;
  timestamp: Timestamp | Date;
  isValid: boolean;
  aiValidationNote?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: Category;
  deleted?: boolean;
  severity: Severity;
  priorityScore: number;
  status: IssueStatus;
  location: IssueLocation;
  mediaUrls: string[];
  reportedBy: string;
  reportedByUsername?: string;
  reportedByDisplayName?: string;
  reportedAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  aiAnalysis?: AIAnalysis;
  resolutionPlan?: ResolutionPlan;
  verifications: Verification[];
  verificationCount: number;
  upvotes: number;
  isDuplicate: boolean;
  duplicateOf?: string;
  commentCount: number;
  reactionCounts: CommentReactions;
  shareCount: number;
  storyCount: number;
}

export interface PredictionData {
  ward: string;
  category: string;
  probability: number;
  basedOn: string;
  generatedAt: Timestamp | Date;
  suggestedActions: string[];
}

export interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  averageResolutionDays: number;
  categoryBreakdown: Record<string, number>;
  wardData: Record<string, any>[];
  topCitizens: Record<string, any>[];
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Timestamp | Date;
  isLoading?: boolean;
  issueReferences?: Issue[];
}

export interface ChatSession {
  id: string;
  messages: AgentMessage[];
  createdAt: Timestamp | Date;
  title: string;
}

export interface SocialUser extends User {
  username: string;
  bio: string | null;
  website: string | null;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  verifiedReason: string | null;
  isPrivate: boolean;
  coverPhotoURL: string | null;
  pinnedIssueId: string | null;
  hasCompletedOnboarding: boolean;
  fcmTokens?: string[];
}

export interface FollowRelation {
  followerId: string;
  followingId: string;
  followerUsername: string;
  followingUsername: string;
  createdAt: Timestamp;
  notifyOnReport: boolean;
  notifyOnVerify: boolean;
}

export interface FeedItem {
  id: string;
  type: "issue_reported" | "issue_verified" | "issue_resolved" | "issue_commented" | "followed_you" | "mentioned_you" | "circle_joined" | "story_posted";
  actorId: string;
  actorUsername: string;
  actorDisplayName: string;
  actorPhotoURL: string;
  actorIsVerified: boolean;
  issueId: string | null;
  issueThumbnail: string | null;
  issueTitle: string | null;
  issueCategory: string | null;
  issueSeverity: string | null;
  commentId: string | null;
  commentPreview: string | null;
  storyId: string | null;
  createdAt: Timestamp;
  isRead: boolean;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorPhotoURL: string;
  authorIsVerified: boolean;
  authorBadge: string;
  content: string;
  mentions: string[];
  mentionUsernames: string[];
  reactions: CommentReactions;
  userReactions: Record<string, ReactionType>;
  replyTo: string | null;
  replyCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CommentReactions {
  heart: number;
  fire: number;
  thumbsUp: number;
  sad: number;
  clap: number;
  angry: number;
}

export type ReactionType = "heart" | "fire" | "thumbsUp" | "sad" | "clap" | "angry";

export interface IssueReaction {
  userId: string;
  reaction: ReactionType;
  createdAt: Timestamp;
}

export interface Story {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorPhotoURL: string;
  authorIsVerified: boolean;
  issueId: string | null;
  mediaUrl: string;
  caption: string;
  type: "update" | "resolved" | "before_after" | "general";
  viewCount: number;
  viewedBy: string[];
  expiresAt: Timestamp;
  createdAt: Timestamp;
  isActive: boolean;
}

export interface Circle {
  id: string;
  name: string;
  ward: string;
  city: string;
  description: string;
  memberCount: number;
  issueCount: number;
  createdBy: string;
  isOfficial: boolean;
  coverUrl: string | null;
  iconEmoji: string;
  createdAt: Timestamp;
}

export interface CircleMember {
  userId: string;
  username: string;
  displayName: string;
  photoURL: string;
  role: "admin" | "moderator" | "member";
  joinedAt: Timestamp;
}

export interface ShareCard {
  id: string;
  issueId: string;
  issueTitle: string;
  issueCategory: string;
  issueSeverity: string;
  issueLocation: string;
  generatedBy: string;
  imageUrl: string | null;
  shareCount: number;
  createdAt: Timestamp;
}

export type ExploreSection = "people" | "issues" | "circles" | "trending";

export interface UsernameCheckResult {
  available: boolean;
  reason: string | null;
  suggestions: string[];
}
