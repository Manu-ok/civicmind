import { NextRequest, NextResponse } from "next/server";
import { askCivicAgent } from "@/lib/gemini/civicAgent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory, userLocation, enrichedContext } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const responseText = await askCivicAgent(
      message,
      conversationHistory || [],
      enrichedContext || {},
      userLocation || { city: "Unknown", ward: "Unknown" }
    );

    return NextResponse.json({ success: true, response: responseText });
  } catch (error: any) {
    console.error("API Error - Civic Agent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get agent response" },
      { status: 500 }
    );
  }
}
