import { NextResponse } from "next/server";
import { extractTablesFromImage } from "@/lib/claude";

export async function POST(request) {
  try {
    const { image, mediaType } = await request.json();

    if (!image || !mediaType) {
      return NextResponse.json(
        { error: "Missing image data or mediaType" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const tables = await extractTablesFromImage(image, mediaType);
    return NextResponse.json({ tables });
  } catch (err) {
    console.error("Extract API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to extract data from image" },
      { status: 500 }
    );
  }
}
