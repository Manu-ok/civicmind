import { NextRequest, NextResponse } from "next/server";
import { genAI, formatGeminiError } from "@/lib/gemini/config";
import { isRateLimited, getCachedResponse, setCachedResponse, withRetry } from "@/lib/utils/apiOptimizer";

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, 10, 60000)) {
      return NextResponse.json({ success: false, error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { issues, city } = body;

    if (!issues || !Array.isArray(issues)) {
      return NextResponse.json(
        { success: false, error: "Invalid issues data" },
        { status: 400 }
      );
    }

    const cacheKey = `predict_${city || 'all'}_${issues.length}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached, predictions: cached, cached: true });
    }

    // Simplify the issues payload to fit context limits and highlight patterns
    const recentIssues = issues.slice(0, 50).map(i => ({
      category: i.category,
      severity: i.severity,
      ward: i.location?.ward || "Unknown",
      status: i.status,
      date: new Date(i.reportedAt?.seconds ? i.reportedAt.seconds * 1000 : Date.now()).toISOString().split('T')[0]
    }));

    const systemInstruction = "You are a predictive city planner AI for municipal operations. Analyze recent civic issues and predict future problem areas or escalations before they happen. Respond ONLY with a valid JSON array.";
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite", systemInstruction });

    const userPrompt = `City: ${city || "Unknown"}
Historical Data (Last 30 days summary):
${JSON.stringify(recentIssues)}

Analyze the historical data and predict 3 to 4 potential civic issues that are highly likely to escalate or occur in the next 7-14 days. 
Look for patterns (e.g., multiple minor water issues might lead to a major pipeline burst, or safety issues clustered in one ward).

Return the predictions as a JSON array of objects in this EXACT format:
[
  {
    "title": "Short descriptive title of prediction",
    "probability": number between 50 and 99,
    "category": "one of: road | water | electricity | waste | safety | other",
    "timeframe": "e.g., 'Next 7 days' or 'Next 14 days'",
    "basis": "Short explanation of why (e.g., 'Based on 12 related minor reports in last 30 days')",
    "ward": "The specific ward/area at risk",
    "preventiveActions": ["Action 1", "Action 2", "Action 3"]
  }
]`;

    const getPredictions = async () => {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
      return result.response.text();
    };

    let text = await withRetry(getPredictions, 1);
    // Safety: Remove markdown blocks if Gemini decides to ignore responseMimeType
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    let predictions = [];
    try {
      predictions = JSON.parse(text);
      if (!Array.isArray(predictions)) {
        // If the model returned an object with a predictions array inside
        if (predictions.predictions && Array.isArray(predictions.predictions)) {
          predictions = predictions.predictions;
        } else {
          predictions = [predictions]; // Wrap in array as last resort
        }
      }
    } catch (e) {
      console.error("Failed to parse Gemini JSON output:", text);
      throw new Error("Invalid JSON format from AI");
    }

    setCachedResponse(cacheKey, predictions, 3600); // Cache for 1 hour

    return NextResponse.json({ success: true, data: predictions, predictions });
  } catch (error: any) {
    console.error("API Error - Predict Issues:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate predictions" },
      { status: 500 }
    );
  }
}
