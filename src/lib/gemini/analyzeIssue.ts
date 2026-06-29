import { getVisionModel, formatGeminiError, cleanJSON } from "./config";
import { AIAnalysis } from "../types";

export async function analyzeIssueFromMedia(
  mediaBase64Array: string[],
  mimeTypes: string[]
): Promise<Partial<AIAnalysis> & Record<string, any>> {
  const startTime = Date.now();
  const model = getVisionModel();

  const systemInstruction = 
    "You are an expert urban infrastructure analyst for Indian municipalities. Your role is to analyze images/videos of community issues and provide structured assessments. Always respond in valid JSON format only, no markdown.";

  const userPrompt = `Analyze this image of a community issue. Provide a comprehensive assessment in this EXACT JSON format:
{
  "title": "Concise issue title (max 10 words)",
  "description": "Detailed description of the issue in 2-3 sentences",
  "category": "one of: road | water | electricity | waste | safety | other",
  "severity": "one of: critical | high | medium | low",
  "priorityScore": number between 0-100 (100 being most urgent),
  "department": "Responsible municipal department",
  "riskAssessment": "Assessment of risks if not addressed",
  "estimatedImpact": "Estimated number and type of people affected",
  "confidence": number between 0-100 representing detection confidence,
  "detectedIssue": "What exactly was detected in the image"
}`;

  const imageParts = mediaBase64Array.map((base64, index) => ({
    inlineData: {
      data: base64,
      mimeType: mimeTypes[index] || "image/jpeg",
    },
  }));

  let retryCount = 0;
  while (retryCount < 2) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }, ...imageParts] }],
        systemInstruction,
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const text = cleanJSON(result.response.text());
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid JSON response from AI");
      const parsed = JSON.parse(jsonMatch[0]);
      const processingTime = Date.now() - startTime;

      return {
        ...parsed,
        processingTime,
      };
    } catch (error) {
      retryCount++;
      if (retryCount >= 2) {
        throw new Error(formatGeminiError(error));
      }
    }
  }

  throw new Error("Failed to analyze issue after retries.");
}
