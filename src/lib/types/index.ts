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
  severity: Severity;
  priorityScore: number;
  status: IssueStatus;
  location: IssueLocation;
  mediaUrls: string[];
  reportedBy: string;
  reportedAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  aiAnalysis?: AIAnalysis;
  resolutionPlan?: ResolutionPlan;
  verifications: Verification[];
  verificationCount: number;
  upvotes: number;
  isDuplicate: boolean;
  duplicateOf?: string;
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
