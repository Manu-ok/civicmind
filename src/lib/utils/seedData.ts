import { db } from "@/lib/firebase/config";
import { writeBatch, doc, collection, Timestamp, getDoc } from "firebase/firestore";
import { User, Issue, AnalyticsData, PredictionData, IssueLocation, AIAnalysis, SocialUser, FollowRelation, FeedItem, Story, Circle, CircleMember, Comment } from "@/lib/types";

const JAMSHEDPUR_CENTER = { lat: 22.8046, lng: 86.2029 };

function getRandomLocation(): IssueLocation {
  const radius = 0.05; // ~5km radius
  return {
    lat: JAMSHEDPUR_CENTER.lat + (Math.random() - 0.5) * radius,
    lng: JAMSHEDPUR_CENTER.lng + (Math.random() - 0.5) * radius,
    address: `Sector ${Math.floor(Math.random() * 12) + 1}, Jamshedpur`,
    ward: `Ward ${Math.floor(Math.random() * 20) + 1}`,
    city: "Jamshedpur"
  };
}

function getRandomPastDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return Timestamp.fromDate(date);
}

const DEMO_USERS: Partial<SocialUser>[] = [
  {
    id: "demo-admin-1",
    displayName: "Rajesh Kumar",
    username: "rajesh_k",
    email: "rajesh.admin@civicmind.com",
    points: 850,
    role: "admin",
    issuesReported: 45,
    issuesVerified: 120,
    city: "Jamshedpur",
    ward: "Ward 5",
    followersCount: 15,
    followingCount: 10,
    isVerified: true,
    hasCompletedOnboarding: true,
    isPublicProfile: true,
  },
  {
    id: "demo-user-1",
    displayName: "Priya Sharma",
    username: "priya_sharma",
    email: "priya@example.com",
    points: 450,
    role: "citizen",
    issuesReported: 22,
    issuesVerified: 34,
    city: "Jamshedpur",
    ward: "Ward 12",
    followersCount: 8,
    followingCount: 12,
    isVerified: false,
    hasCompletedOnboarding: true,
    isPublicProfile: true,
  },
  {
    id: "demo-user-2",
    displayName: "Amit Singh",
    username: "amit_s",
    email: "amit@example.com",
    points: 280,
    role: "citizen",
    issuesReported: 15,
    issuesVerified: 18,
    city: "Jamshedpur",
    ward: "Ward 2",
    followersCount: 5,
    followingCount: 5,
    isVerified: false,
    hasCompletedOnboarding: true,
    isPublicProfile: true,
  },
  {
    id: "demo-user-3",
    displayName: "Neha Patel",
    username: "neha_p",
    email: "neha@example.com",
    points: 120,
    role: "citizen",
    issuesReported: 5,
    issuesVerified: 7,
    city: "Jamshedpur",
    ward: "Ward 8",
    followersCount: 3,
    followingCount: 8,
    isVerified: false,
    hasCompletedOnboarding: true,
    isPublicProfile: true,
  }
];

const ISSUES_TEMPLATES = [
  { title: "Pothole on Main Road causing accidents", category: "road", severity: "critical", priorityScore: 95 },
  { title: "Waterlogging after rain in Sector 7", category: "water", severity: "high", priorityScore: 80 },
  { title: "Broken streetlight near bus stop", category: "electricity", severity: "medium", priorityScore: 65 },
  { title: "Garbage not collected for 3 days", category: "waste", severity: "high", priorityScore: 78 },
  { title: "Open manhole on pedestrian path", category: "safety", severity: "critical", priorityScore: 99 },
  { title: "Clogged drainage pipe overflowing", category: "water", severity: "high", priorityScore: 82 },
  { title: "Traffic signal malfunctioning at junction", category: "road", severity: "critical", priorityScore: 92 },
  { title: "Fallen tree blocking the side road", category: "other", severity: "medium", priorityScore: 60 },
  { title: "Illegal dumping of construction waste", category: "waste", severity: "medium", priorityScore: 55 },
  { title: "Power outage for more than 5 hours", category: "electricity", severity: "high", priorityScore: 85 },
  { title: "Leaking main water pipeline", category: "water", severity: "critical", priorityScore: 96 },
  { title: "Broken pavement tiles creating trip hazard", category: "road", severity: "low", priorityScore: 35 },
  { title: "Stray dog menace near school", category: "safety", severity: "high", priorityScore: 75 },
  { title: "Transformer sparking dangerously", category: "electricity", severity: "critical", priorityScore: 98 },
  { title: "Public park overflowing with trash", category: "waste", severity: "medium", priorityScore: 45 },
  { title: "No water supply since yesterday", category: "water", severity: "high", priorityScore: 88 },
  { title: "Deep crater on flyover", category: "road", severity: "critical", priorityScore: 94 },
  { title: "Street lamps flickering constantly", category: "electricity", severity: "low", priorityScore: 30 },
  { title: "Dead animal on the highway", category: "waste", severity: "high", priorityScore: 72 },
  { title: "Missing caution sign at construction site", category: "safety", severity: "medium", priorityScore: 66 },
];

export async function seedDemoData(city: string = "Jamshedpur", currentUserId: string) {
  try {
    const analyticsRef = doc(db, "analytics", city);
    const analyticsDoc = await getDoc(analyticsRef);
    if (analyticsDoc.exists()) {
      return { success: true, message: "Demo data is already seeded." };
    }

    const batch = writeBatch(db);

    // Add current user to DEMO_USERS to seed their data
    const currentUserProfile: Partial<SocialUser> = {
      id: currentUserId,
      displayName: "Demo Civic",
      username: "demo_civic",
      email: "demo@civicmind.com",
      points: 100,
      role: "citizen",
      issuesReported: 2,
      issuesVerified: 1,
      city: "Jamshedpur",
      ward: "Ward 5",
      followersCount: 4,
      followingCount: 4,
      isVerified: false,
      hasCompletedOnboarding: true,
      isPublicProfile: true,
    };
    
    const allUsers = [...DEMO_USERS, currentUserProfile];

    // 1. Seed Users
    allUsers.forEach((user) => {
      const userRef = doc(db, "users", user.id!);
      batch.set(userRef, {
        ...user,
        createdAt: Timestamp.now(),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName!)}&background=random`
      });
    });

    // 2. Seed Follow Relationships
    allUsers.forEach(follower => {
      allUsers.forEach(following => {
        if (follower.id !== following.id) {
          const relation: FollowRelation = {
            followerId: follower.id!,
            followingId: following.id!,
            followerUsername: follower.username!,
            followingUsername: following.username!,
            createdAt: Timestamp.now(),
            notifyOnReport: true,
            notifyOnVerify: false
          };
          
          batch.set(doc(db, `following/${follower.id}/list`, following.id!), relation);
          batch.set(doc(db, `followers/${following.id}/list`, follower.id!), relation);
        }
      });
    });

    // 3. Seed Issues
    const issueStatuses = ["pending", "verified", "in_progress", "resolved"];
    const createdIssues: any[] = [];
    
    ISSUES_TEMPLATES.forEach((template, i) => {
      const issueRef = doc(collection(db, "issues"));
      const status = issueStatuses[Math.floor(Math.random() * issueStatuses.length)] as Issue["status"];
      
      const aiAnalysis: AIAnalysis = {
        detectedIssue: template.title,
        confidence: 85 + Math.floor(Math.random() * 15),
        department: template.category === "road" ? "Public Works Department" : 
                    template.category === "water" ? "Water Board" : 
                    template.category === "electricity" ? "Electricity Board" : "Municipal Corporation",
        riskAssessment: template.severity === "critical" ? "High risk of injury or property damage" : "Moderate disruption to public life",
        estimatedImpact: "Affects approximately 500-1000 residents",
        processingTime: 1200 + Math.floor(Math.random() * 1000)
      };

      const reporter = allUsers[i % 5];

      const issue: Omit<Issue, "id"> = {
        title: template.title,
        description: `This is a simulated demo issue for ${template.title}. Action needs to be taken by the respective department to ensure public safety and convenience.`,
        category: template.category as Issue["category"],
        severity: template.severity as Issue["severity"],
        priorityScore: template.priorityScore,
        status: status,
        location: getRandomLocation(),
        mediaUrls: [`https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800`],
        reportedBy: reporter.id!,
        reportedByUsername: reporter.username!,
        reportedByDisplayName: reporter.displayName!,
        reportedAt: getRandomPastDate(30),
        updatedAt: Timestamp.now(),
        aiAnalysis,
        verifications: [],
        verificationCount: Math.floor(Math.random() * 10),
        upvotes: Math.floor(Math.random() * 50),
        isDuplicate: false,
        commentCount: 0,
        reactionCounts: { heart: 0, fire: 0, thumbsUp: 0, sad: 0, clap: 0, angry: 0 },
        shareCount: 0,
        storyCount: 0
      };

      if (template.severity === "critical") {
        issue.reactionCounts = { heart: 12, fire: 5, thumbsUp: 24, sad: 2, clap: 8, angry: 15 };
        issue.commentCount = 2;
      }

      batch.set(issueRef, issue);
      createdIssues.push({ id: issueRef.id, ...issue });
    });

    // 4. Seed Feed Items
    createdIssues.forEach((issue) => {
      if (issue.reportedBy !== currentUserId) {
        const feedRef = doc(collection(db, `feeds/${currentUserId}/items`));
        const reporter = allUsers.find(u => u.id === issue.reportedBy)!;
        const feedItem: FeedItem = {
          id: feedRef.id,
          type: "issue_reported",
          actorId: reporter.id!,
          actorUsername: reporter.username!,
          actorDisplayName: reporter.displayName!,
          actorPhotoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(reporter.displayName!)}&background=random`,
          actorIsVerified: reporter.isVerified!,
          issueId: issue.id,
          issueThumbnail: issue.mediaUrls[0],
          issueTitle: issue.title,
          issueCategory: issue.category,
          issueSeverity: issue.severity,
          commentId: null,
          commentPreview: null,
          storyId: null,
          createdAt: issue.reportedAt as Timestamp,
          isRead: false
        };
        batch.set(feedRef, feedItem);
      }
    });

    // 5. Seed Story
    const rajeshIssue = createdIssues.find(i => i.reportedBy === "demo-admin-1" && i.category === "road");
    if (rajeshIssue) {
      const storyRef = doc(collection(db, "stories"));
      const story: Story = {
        id: storyRef.id,
        authorId: "demo-admin-1",
        authorUsername: "rajesh_k",
        authorDisplayName: "Rajesh Kumar",
        authorPhotoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent("Rajesh Kumar")}&background=random`,
        authorIsVerified: true,
        issueId: rajeshIssue.id,
        mediaUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&q=80&w=800",
        caption: "Work has finally begun on the main road pothole! Thanks everyone for upvoting.",
        type: "update",
        viewCount: 45,
        viewedBy: [],
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        createdAt: Timestamp.now(),
        isActive: true
      };
      batch.set(storyRef, story);

      const storyFeedRef = doc(collection(db, `feeds/${currentUserId}/items`));
      const storyFeedItem: FeedItem = {
        id: storyFeedRef.id,
        type: "story_posted",
        actorId: "demo-admin-1",
        actorUsername: "rajesh_k",
        actorDisplayName: "Rajesh Kumar",
        actorPhotoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent("Rajesh Kumar")}&background=random`,
        actorIsVerified: true,
        issueId: rajeshIssue.id,
        issueThumbnail: null,
        issueTitle: null,
        issueCategory: null,
        issueSeverity: null,
        commentId: null,
        commentPreview: null,
        storyId: story.id,
        createdAt: Timestamp.now(),
        isRead: false
      };
      batch.set(storyFeedRef, storyFeedItem);
    }

    // 6. Seed Circles
    const circle1Ref = doc(collection(db, "circles"));
    const circle1: Circle = {
      id: circle1Ref.id,
      name: "Sakchi Ward Citizens",
      ward: "Sakchi",
      city: "Jamshedpur",
      description: "A community circle for all residents of Sakchi ward to discuss and resolve local issues together.",
      memberCount: 5,
      issueCount: 12,
      createdBy: "demo-admin-1",
      isOfficial: true,
      coverUrl: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=1200",
      iconEmoji: "🏙️",
      createdAt: Timestamp.now()
    };
    batch.set(circle1Ref, circle1);

    const circle2Ref = doc(collection(db, "circles"));
    const circle2: Circle = {
      id: circle2Ref.id,
      name: "NIT Jamshedpur Area",
      ward: "Adityapur",
      city: "Jamshedpur",
      description: "Students and residents around NIT campus keeping the area clean and safe.",
      memberCount: 5,
      issueCount: 8,
      createdBy: "demo-user-1",
      isOfficial: false,
      coverUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200",
      iconEmoji: "🎓",
      createdAt: Timestamp.now()
    };
    batch.set(circle2Ref, circle2);

    allUsers.forEach(user => {
      const member1Ref = doc(db, `circles/${circle1.id}/members`, user.id!);
      const member2Ref = doc(db, `circles/${circle2.id}/members`, user.id!);
      
      const memberData: CircleMember = {
        userId: user.id!,
        username: user.username!,
        displayName: user.displayName!,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName!)}&background=random`,
        role: user.id === "demo-admin-1" ? "admin" : "member",
        joinedAt: Timestamp.now()
      };
      
      batch.set(member1Ref, memberData);
      batch.set(member2Ref, { ...memberData, role: user.id === "demo-user-1" ? "admin" : "member" });
    });

    // 7. Seed Comments and Reactions
    const criticalIssue = createdIssues.find(i => i.severity === "critical");
    if (criticalIssue) {
      const comment1Ref = doc(collection(db, `issues/${criticalIssue.id}/comments`));
      const comment1: Comment = {
        id: comment1Ref.id,
        issueId: criticalIssue.id,
        authorId: "demo-user-1",
        authorUsername: "priya_sharma",
        authorDisplayName: "Priya Sharma",
        authorPhotoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent("Priya Sharma")}&background=random`,
        authorIsVerified: false,
        authorBadge: "Top Contributor",
        content: "I nearly had an accident here yesterday! @demo_civic can we escalate this?",
        mentions: [currentUserId],
        mentionUsernames: ["demo_civic"],
        reactions: { heart: 5, fire: 0, thumbsUp: 12, sad: 0, clap: 0, angry: 0 },
        userReactions: {},
        replyTo: null,
        replyCount: 0,
        isEdited: false,
        isDeleted: false,
        createdAt: getRandomPastDate(2),
        updatedAt: Timestamp.now()
      };
      batch.set(comment1Ref, comment1);

      const comment2Ref = doc(collection(db, `issues/${criticalIssue.id}/comments`));
      const comment2: Comment = {
        id: comment2Ref.id,
        issueId: criticalIssue.id,
        authorId: "demo-admin-1",
        authorUsername: "rajesh_k",
        authorDisplayName: "Rajesh Kumar",
        authorPhotoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent("Rajesh Kumar")}&background=random`,
        authorIsVerified: true,
        authorBadge: "Admin",
        content: "I have forwarded this to the municipal road works division. They promised to look into it within 48 hours.",
        mentions: [],
        mentionUsernames: [],
        reactions: { heart: 24, fire: 5, thumbsUp: 18, sad: 0, clap: 40, angry: 0 },
        userReactions: {},
        replyTo: null,
        replyCount: 0,
        isEdited: false,
        isDeleted: false,
        createdAt: getRandomPastDate(1),
        updatedAt: Timestamp.now()
      };
      batch.set(comment2Ref, comment2);
    }

    // 8. Seed Analytics
    // analyticsRef is already defined at the top of the function
    const analytics: AnalyticsData = {
      totalIssues: 347,
      resolvedIssues: 218,
      pendingIssues: 85,
      averageResolutionDays: 4.2,
      categoryBreakdown: {
        road: 120,
        water: 85,
        electricity: 60,
        waste: 45,
        safety: 25,
        other: 12
      },
      wardData: [],
      topCitizens: []
    };
    batch.set(analyticsRef, analytics);

    // 9. Seed Predictions
    const predictionsRef = collection(db, "predictions");
    const demoPredictions: Omit<PredictionData, "id">[] = [
      {
        ward: "Ward 5",
        category: "water",
        probability: 0.85,
        basedOn: "Historical pattern of waterlogging during monsoon + recent weather forecast",
        generatedAt: Timestamp.now(),
        suggestedActions: ["Clear storm drains", "Deploy standby pumps", "Alert residents"]
      },
      {
        ward: "Ward 12",
        category: "electricity",
        probability: 0.72,
        basedOn: "Age of local transformer + recent load spikes reported by smart meters",
        generatedAt: Timestamp.now(),
        suggestedActions: ["Preventive maintenance of transformer", "Load balancing"]
      },
      {
        ward: "Ward 2",
        category: "road",
        probability: 0.91,
        basedOn: "Multiple micro-reports of surface damage + high traffic volume",
        generatedAt: Timestamp.now(),
        suggestedActions: ["Schedule immediate pothole patching", "Divert heavy traffic"]
      }
    ];

    demoPredictions.forEach(pred => {
      const predDoc = doc(predictionsRef);
      batch.set(predDoc, pred);
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}
