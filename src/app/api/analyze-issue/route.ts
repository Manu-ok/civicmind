import { NextRequest, NextResponse } from "next/server";
import { analyzeIssueFromMedia } from "@/lib/gemini/analyzeIssue";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No media files provided" },
        { status: 400 }
      );
    }

    const mediaBase64Array: string[] = [];
    const mimeTypes: string[] = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      mediaBase64Array.push(base64);
      mimeTypes.push(file.type);
    }

    const analysis = await analyzeIssueFromMedia(mediaBase64Array, mimeTypes);
    return NextResponse.json({ success: true, data: analysis, analysis }); // Kept analysis for backward compat
  } catch (error: any) {
    console.error("API Error - Analyze Issue:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze issue" },
      { status: 500 }
    );
  }
}
