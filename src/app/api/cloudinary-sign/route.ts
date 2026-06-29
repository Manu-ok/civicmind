import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { folder } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      return NextResponse.json({ error: "Cloudinary credentials missing" }, { status: 500 });
    }

    // Parameters to sign must be in alphabetical order
    let signatureStr = "";
    if (folder) {
      signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    } else {
      signatureStr = `timestamp=${timestamp}${apiSecret}`;
    }

    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    return NextResponse.json({
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder
    });
  } catch (error: any) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}
