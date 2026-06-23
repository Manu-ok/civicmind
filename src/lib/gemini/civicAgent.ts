import { geminiFlash, formatGeminiError } from "./config";
import { Issue, AgentMessage } from "../types";

export async function askCivicAgent(
  userMessage: string,
  conversationHistory: AgentMessage[],
  contextIssues: Issue[],
  userLocation: { city: string; ward: string }
): Promise<string> {
  const model = geminiFlash;

  const categoryCounts: Record<string, number> = {};
  contextIssues.forEach((issue) => {
    categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat)
    .join(", ");

  const systemInstruction = `You are CivicMind, an intelligent civic assistant for Indian communities. You have access to real-time data about community issues in the user's area. You help citizens understand local problems, suggest actions, answer questions about municipal processes, and provide insights about their community.

Current context:
- User's city: ${userLocation.city}
- User's ward: ${userLocation.ward}
- Active issues nearby: ${contextIssues.length}
- Top issue categories: ${topCategories}

You can:
1. Answer questions about local issues
2. Suggest which issues to prioritize
3. Explain municipal processes
4. Provide insights from the data
5. Help draft formal complaints
6. Explain what actions citizens can take

Be conversational, helpful, and data-driven. When referring to specific issues, mention them by their title. Keep responses concise but informative.`;

  // Map history to Gemini format
  const history = conversationHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  try {
    const chat = model.startChat({
      history,
      systemInstruction,
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    throw new Error(formatGeminiError(error));
  }
}
