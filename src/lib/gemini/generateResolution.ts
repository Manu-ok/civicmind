import { geminiPro, formatGeminiError, cleanJSON } from "./config";
import { Issue, ResolutionPlan } from "../types";

export async function generateResolutionPlan(issue: Partial<Issue>): Promise<ResolutionPlan> {
  const model = geminiPro;

  const systemInstruction =
    "You are a senior municipal engineer and urban planner specializing in Indian cities. Generate actionable resolution plans for community issues. Always respond in valid JSON.";

  const issueDetails = `
    Title: ${issue.title}
    Description: ${issue.description}
    Category: ${issue.category}
    Severity: ${issue.severity}
    Location City: ${issue.location?.city}
  `;

  const userPrompt = `Based on the following issue details, create an actionable resolution plan.
Details:
${issueDetails}

Respond in this EXACT JSON format:
{
  "steps": ["Step 1: description", "Step 2: description", "Step 3: description"],
  "estimatedDays": number,
  "estimatedImpact": "number (residents benefited) as a string",
  "department": "responsible department",
  "priority": "Immediate | High | Medium | Standard",
  "resources": ["resource 1", "resource 2"],
  "successMetrics": ["metric 1", "metric 2"]
}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = cleanJSON(result.response.text());
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON response from AI");
    return JSON.parse(jsonMatch[0]) as ResolutionPlan;
  } catch (error) {
    throw new Error(formatGeminiError(error));
  }
}
