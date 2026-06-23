import { NextRequest, NextResponse } from "next/server";
import { generatePredictions } from "@/lib/gemini/predictIssues";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { historicalIssues, ward, city } = body;

    if (!historicalIssues || !ward || !city) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const predictions = await generatePredictions(historicalIssues, ward, city);
    return NextResponse.json({ success: true, predictions });
  } catch (error: any) {
    console.error("API Error - Predict Issues:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate predictions" },
      { status: 500 }
    );
  }
}
