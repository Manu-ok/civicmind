import { NextRequest, NextResponse } from "next/server";
import { genAI, formatGeminiError } from "@/lib/gemini/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { issues, city } = body;

    if (!issues || !Array.isArray(issues)) {
      return NextResponse.json(
        { error: "Invalid issues data" },
        { status: 400 }
      );
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

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    let text = result.response.text();
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

    return NextResponse.json({ success: true, predictions });
  } catch (error: any) {
    console.error("API Error - Predict Issues:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate predictions" },
      { status: 500 }
    );
  }
}
