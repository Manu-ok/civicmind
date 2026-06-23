import { NextResponse } from "next/server";
import { getVisionModel, formatGeminiError } from "@/lib/gemini/config";

export async function POST(req: Request) {
  try {
    const { issueTitle, issueCategory, imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ success: false, error: "Image data is required" }, { status: 400 });
    }

    const model = getVisionModel();
    const prompt = `You are an AI civic auditor. A community member has submitted a photo to verify a reported issue.
    
    Original Issue Title: "${issueTitle}"
    Category: ${issueCategory}

    Analyze the attached photo and determine if it legitimately depicts the issue described above.
    
    Respond STRICTLY in the following JSON format:
    {
      "isValid": boolean,
      "confidence": number,
      "reasoning": "Brief explanation of why the photo does or does not match the issue."
    }`;

    // Remove the data URI prefix if present
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const text = result.response.text();
    // Parse JSON safely
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    
    const analysis = JSON.parse(jsonString);

    return NextResponse.json({ success: true, result: analysis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: formatGeminiError(error) }, { status: 500 });
  }
}
