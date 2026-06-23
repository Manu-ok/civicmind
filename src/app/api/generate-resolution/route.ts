import { NextRequest, NextResponse } from "next/server";
import { generateResolutionPlan } from "@/lib/gemini/generateResolution";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body || !body.title) {
      return NextResponse.json(
        { error: "Issue data is required" },
        { status: 400 }
      );
    }

    const plan = await generateResolutionPlan(body);
    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("API Error - Generate Resolution:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate resolution plan" },
      { status: 500 }
    );
  }
}
