import { geminiFlash, formatGeminiError } from "./config";
import { Issue } from "../types";

export async function checkForDuplicates(
  newIssue: Partial<Issue>,
  nearbyIssues: Issue[]
): Promise<{
  isDuplicate: boolean;
  duplicateOf: string | null;
  confidence: number;
  reason: string;
}> {
  if (!nearbyIssues || nearbyIssues.length === 0) {
    return { isDuplicate: false, duplicateOf: null, confidence: 0, reason: "No nearby issues to compare." };
  }

  const model = geminiFlash;

  const systemInstruction =
    "You are a duplicate detection system for a civic issue platform. Analyze if a new report is a duplicate of existing reports. Be strict - only mark as duplicate if very clearly the same physical issue. Respond only in JSON.";

  const existingIssuesList = nearbyIssues.map((i) => `ID: ${i.id} | Title: ${i.title} | Desc: ${i.description}`).join("\n");

  const userPrompt = `Existing Nearby Issues:
${existingIssuesList}

New Issue Report:
Title: ${newIssue.title}
Description: ${newIssue.description}

Analyze if the new report is a duplicate of any existing issue. Respond in this EXACT JSON format:
{
  "isDuplicate": boolean,
  "duplicateOf": "issueId or null",
  "confidence": number,
  "reason": "explanation"
}`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    throw new Error(formatGeminiError(error));
  }
}
