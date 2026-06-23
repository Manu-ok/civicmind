import { NextRequest, NextResponse } from "next/server";
import { checkForDuplicates } from "@/lib/gemini/detectDuplicate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { newIssue, nearbyIssues } = body;

    if (!newIssue || !nearbyIssues) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = await checkForDuplicates(newIssue, nearbyIssues);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("API Error - Detect Duplicate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to detect duplicates" },
      { status: 500 }
    );
  }
}
