import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set in the environment variables.");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiPro = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
export const geminiFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export function getVisionModel() {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
}

export function formatGeminiError(error: any): string {
  console.error("Gemini AI Error:", error);
  if (error?.message?.includes("API key not valid")) {
    return "Invalid Gemini API Key configured.";
  }
  if (error?.message?.includes("fetch failed")) {
    return "Network error while contacting AI service.";
  }
  if (error?.message?.includes("503") || error?.message?.includes("overloaded")) {
    return "The AI service is currently experiencing high demand. Please try again in a few moments.";
  }
  return error?.message || "An unexpected error occurred during AI processing.";
}
