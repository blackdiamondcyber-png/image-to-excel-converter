import { NextResponse } from "next/server";
import { extractTablesFromImage } from "@/lib/claude";
import { checkRateLimit, recordExtraction } from "@/lib/rate-limit";
import { getAdminAuth } from "@/lib/firebase-admin";

/**
 * Fallback: verify a Firebase ID token using the public REST API.
 * Only requires the public FIREBASE_API_KEY — no admin credentials needed.
 */
async function verifyTokenViaRest(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.users?.[0]?.localId || null;
  } catch {
    return null;
  }
}

/**
 * Verify the Firebase ID token from the Authorization header.
 * Tries Admin SDK first, falls back to REST API verification.
 * Returns { uid } on success, or { error, status } on failure.
 */
async function authenticateRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing authorization header. Please sign in.", status: 401 };
  }

  const token = authHeader.split("Bearer ")[1];

  // Strategy 1: Firebase Admin SDK (fastest, offline-capable)
  const auth = getAdminAuth();
  if (auth) {
    try {
      const decoded = await auth.verifyIdToken(token);
      return { uid: decoded.uid };
    } catch (err) {
      console.error("Admin token verification failed:", err.code || err.message);
      if (err.code === "auth/id-token-expired") {
        return { error: "Your session has expired. Please sign in again.", status: 401 };
      }
      if (err.code === "auth/id-token-revoked") {
        return { error: "Invalid session. Please sign out and sign in again.", status: 401 };
      }
      // For other admin errors, fall through to REST fallback
    }
  }

  // Strategy 2: Firebase REST API (no admin credentials needed)
  const uid = await verifyTokenViaRest(token);
  if (uid) {
    return { uid };
  }

  return { error: "Authentication failed. Please sign in again.", status: 401 };
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

    // Enforce body size limit (10MB max for base64 image + metadata)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Request too large. Maximum image size is ~7MB." },
        { status: 413 }
      );
    }

    const { image, mediaType } = await request.json();

    if (!image || !mediaType) {
      return NextResponse.json(
        { error: "Missing image data or mediaType" },
        { status: 400 }
      );
    }

    if (!process.env.CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: "CLAUDE_API_KEY is not configured" },
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
    console.error("Extract API error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to extract data from image" },
      { status: 500 }
    );
  }
}
