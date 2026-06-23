import { db } from "@/lib/firebase/config";
import { writeBatch, doc, collection, Timestamp } from "firebase/firestore";
import { User, Issue, AnalyticsData, PredictionData, IssueLocation, AIAnalysis } from "@/lib/types";

const JAMSHEDPUR_CENTER = { lat: 22.8046, lng: 86.2029 };

// Helper to generate a random coordinate near Jamshedpur
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

// Helper to get random past date
function getRandomPastDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return Timestamp.fromDate(date);
}

const DEMO_USERS: Partial<User>[] = [
  {
    id: "demo-admin-1",
    displayName: "Rajesh Kumar",
    email: "rajesh.admin@civicmind.com",
    points: 850,
    role: "admin",
    issuesReported: 45,
    issuesVerified: 120,
    city: "Jamshedpur",
    ward: "Ward 5",
  },
  {
    id: "demo-user-1",
    displayName: "Priya Sharma",
    email: "priya@example.com",
    points: 450,
    role: "citizen",
    issuesReported: 22,
    issuesVerified: 34,
    city: "Jamshedpur",
    ward: "Ward 12",
  },
  {
    id: "demo-user-2",
    displayName: "Amit Singh",
    email: "amit@example.com",
    points: 280,
    role: "citizen",
    issuesReported: 15,
    issuesVerified: 18,
    city: "Jamshedpur",
    ward: "Ward 2",
  },
  {
    id: "demo-user-3",
    displayName: "Neha Patel",
    email: "neha@example.com",
    points: 120,
    role: "citizen",
    issuesReported: 5,
    issuesVerified: 7,
    city: "Jamshedpur",
    ward: "Ward 8",
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
    const batch = writeBatch(db);

    // 1. Seed Users
    DEMO_USERS.forEach((user) => {
      const userRef = doc(db, "users", user.id!);
      batch.set(userRef, {
        ...user,
        createdAt: Timestamp.now(),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName!)}&background=random`
      });
    });

    // 2. Seed Issues
    const issueStatuses = ["pending", "verified", "in_progress", "resolved"];
    
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

      const issue: Omit<Issue, "id"> = {
        title: template.title,
        description: `This is a simulated demo issue for ${template.title}. Action needs to be taken by the respective department to ensure public safety and convenience.`,
        category: template.category as Issue["category"],
        severity: template.severity as Issue["severity"],
        priorityScore: template.priorityScore,
        status: status,
        location: getRandomLocation(),
        mediaUrls: [`https://source.unsplash.com/random/800x600/?${template.category},street`],
        reportedBy: i % 5 === 0 ? currentUserId : DEMO_USERS[i % 4].id!,
        reportedAt: getRandomPastDate(30),
        updatedAt: Timestamp.now(),
        aiAnalysis,
        verifications: [],
        verificationCount: Math.floor(Math.random() * 10),
        upvotes: Math.floor(Math.random() * 50),
        isDuplicate: false
      };

      batch.set(issueRef, issue);
    });

    // 3. Seed Analytics
    const analyticsRef = doc(db, "analytics", city);
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

    // 4. Seed Predictions
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

    // Commit all
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}
