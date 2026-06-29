import { geminiPro, formatGeminiError, cleanJSON } from "./config";
import { Issue } from "../types";

export async function generatePredictions(
  historicalIssues: Issue[],
  ward: string,
  city: string
): Promise<Array<{
  category: string;
  probability: number;
  timeframe: "Next 7 days" | "Next 30 days" | "Next season";
  basedOn: string;
  suggestedPreventiveActions: string[];
  affectedAreas: string[];
}>> {
  const model = geminiPro;

  const systemInstruction =
    "You are an urban analytics AI for Indian municipalities. Analyze patterns in community issue reports and predict likely future problems. Focus on seasonal patterns, ward-specific issues, and infrastructure deterioration patterns. Respond in JSON.";

  // Aggregate stats
  const categoryCounts: Record<string, number> = {};
  historicalIssues.forEach((issue) => {
    categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, count]) => `${cat}: ${count}`)
    .join(", ");

  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  const userPrompt = `
Context:
- Ward: ${ward}
- City: ${city}
- Total Issues Last 30 Days: ${historicalIssues.length}
- Top Categories: ${topCategories}
- Current Month: ${currentMonth}

Analyze the data and predict likely future problems.
Respond in this EXACT JSON format, returning an array of prediction objects:
[
  {
    "category": "string",
    "probability": number (0-100),
    "timeframe": "Next 7 days | Next 30 days | Next season",
    "basedOn": "explanation of why",
    "suggestedPreventiveActions": ["action 1", "action 2"],
    "affectedAreas": ["area 1", "area 2"]
  }
]`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = cleanJSON(result.response.text());
    const jsonMatch = text.match(/\[[\s\S]*\]/); // Array expected
    if (!jsonMatch) throw new Error("Invalid JSON response from AI");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error(formatGeminiError(error));
  }
}
