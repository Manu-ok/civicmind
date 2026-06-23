import { NextRequest, NextResponse } from "next/server";
import { geminiFlash, formatGeminiError } from "@/lib/gemini/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    const model = geminiFlash;
    const systemInstruction = 
      "Extract structured issue information from a citizen's voice report. The user has described a community problem verbally. Extract and structure this into a civic issue report. Always respond in valid JSON format only.";

    const userPrompt = `Voice Transcript: "${transcript}"
    
Extract the issue and provide a comprehensive assessment in this EXACT JSON format:
{
  "title": "Concise issue title (max 10 words)",
  "description": "Detailed description of the issue based on the transcript",
  "category": "one of: road | water | electricity | waste | safety | other",
  "severity": "one of: critical | high | medium | low",
  "priorityScore": number between 0-100 (100 being most urgent),
  "department": "Responsible municipal department",
  "riskAssessment": "Assessment of risks if not addressed",
  "estimatedImpact": "Estimated number and type of people affected",
  "confidence": number between 0-100 representing detection confidence,
  "detectedIssue": "What exactly was detected from the voice report"
}`;

    const startTime = Date.now();
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    const parsed = JSON.parse(text);
    const processingTime = Date.now() - startTime;

    return NextResponse.json({ 
      success: true, 
      analysis: {
        ...parsed,
        processingTime
      }
    });
  } catch (error: any) {
    console.error("API Error - Voice to Issue:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process voice report" },
      { status: 500 }
    );
  }
}
