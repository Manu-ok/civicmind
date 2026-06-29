import { NextRequest, NextResponse } from "next/server";
import { genAI, formatGeminiError } from "@/lib/gemini/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: "Transcript is required" },
        { status: 400 }
      );
    }

    const systemInstruction = "You are a civic issue extraction system for Indian cities. Extract structured issue data from informal voice descriptions. Be smart about inferring severity and category from context clues. Respond only in valid JSON.";
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite", systemInstruction });

    const userPrompt = `Extract civic issue information from this voice report: '${transcript}'
    
Return the EXACT following JSON structure only:
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
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON response from AI");
    const parsed = JSON.parse(jsonMatch[0]);
    const processingTime = Date.now() - startTime;

    const analysisResult = { ...parsed, processingTime };

    return NextResponse.json({ 
      success: true, 
      data: analysisResult,
      analysis: analysisResult
    });
  } catch (error: any) {
    console.error("API Error - Voice to Issue:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process voice report" },
      { status: 500 }
    );
  }
}
