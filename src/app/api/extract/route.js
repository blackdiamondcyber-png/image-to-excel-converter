import { NextResponse } from "next/server";
import { extractTablesFromImage } from "@/lib/claude";
import { checkRateLimit, recordExtraction } from "@/lib/rate-limit";
import { getAdminAuth, getInitError } from "@/lib/firebase-admin";

/**
 * Verify the Firebase ID token from the Authorization header.
 * Returns { uid } on success, or { error, status } on failure.
 */
async function authenticateRequest(request) {
  const auth = getAdminAuth();
  if (!auth) {
    const initError = getInitError();
    return {
      error: initError
        ? `Server auth failed to initialize: ${initError}`
        : "Server authentication is not configured. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
      status: 500,
    };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing authorization header. Please sign in.", status: 401 };
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch (err) {
    console.error("Token verification failed:", err.code || err.message);
    // Return specific message based on the Firebase error
    if (err.code === "auth/id-token-expired") {
      return { error: "Your session has expired. Please sign in again.", status: 401 };
    }
    if (err.code === "auth/argument-error" || err.code === "auth/id-token-revoked") {
      return { error: "Invalid session. Please sign out and sign in again.", status: 401 };
    }
    return { error: "Authentication failed. Please sign in again.", status: 401 };
  }
}

export async function POST(request) {
  try {
    // Authenticate
    const authResult = await authenticateRequest(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const userId = authResult.uid;

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
