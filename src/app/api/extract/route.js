import { NextResponse } from "next/server";
import { extractTablesFromImage } from "@/lib/claude";
import { checkRateLimit, recordExtraction } from "@/lib/rate-limit";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * Verify the Firebase ID token from the Authorization header.
 * Returns the user's UID or null if unauthenticated.
 */
async function getUserId(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ") || !adminAuth) {
    return null;
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    // Authenticate
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to use the extraction feature" },
        { status: 401 }
      );
    }

    // Rate limit
    const limit = checkRateLimit(userId);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: limit.reason, remaining: 0 },
        { status: 429 }
      );
    }

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

    // Only count successful extractions
    recordExtraction(userId);

    return NextResponse.json({
      tables,
      remaining: limit.remaining - 1,
    });
  } catch (err) {
    console.error("Extract API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to extract data from image" },
      { status: 500 }
    );
  }
}
