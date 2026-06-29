import { genAI, formatGeminiError } from "./config";
import { AgentMessage } from "../types";

export async function askCivicAgent(
  userMessage: string,
  conversationHistory: AgentMessage[],
  enrichedContext: any,
  userLocation: { city: string; ward: string }
): Promise<string> {
  const systemInstruction = `You are CivicMind, an intelligent, world-class civic assistant for communities. You have access to real-time data about community issues in the user's area. You help citizens understand local problems, suggest actions, answer questions about municipal processes, and provide insights about their community.

Current context:
- User Location: ${userLocation.city}, Ward: ${userLocation.ward}
- User Profile: ${enrichedContext?.userStats ? `${enrichedContext.userStats.name} (${enrichedContext.userStats.points} XP, ${enrichedContext.userStats.reported} reported, ${enrichedContext.userStats.verified} verified)` : 'Anonymous'}
- Citywide Issues Total: ${enrichedContext?.cityStats?.totalIssues || 0}
- Category Breakdown: ${JSON.stringify(enrichedContext?.cityStats?.categoryCounts || {})}
- Top Unresolved Issues Nearby: ${JSON.stringify(enrichedContext?.topIssues || [])}

Instructions:
1. Be highly conversational, empathetic, and data-driven.
2. Structure your answers clearly. Use **bold** for emphasis, and bulleted/numbered lists where appropriate.
3. CRITICAL: When referring to a specific issue from the context, YOU MUST put the exact issue title in double quotes, like "Pothole on Main Street". The UI will parse this and render an interactive mini-card for the user. Do not wrap quotes around things that are not issue titles.
4. If asked about user stats, use the User Profile context to congratulate them on their civic XP and impact.
5. You can suggest which issues to prioritize, explain municipal processes, provide data insights, or draft formal complaints.
6. Keep responses concise but informative. Do not ramble.`;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction 
  });

  // Map history to Gemini format
  const history = conversationHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  try {
    const chat = model.startChat({
      history,
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    throw new Error(formatGeminiError(error));
  }
}
