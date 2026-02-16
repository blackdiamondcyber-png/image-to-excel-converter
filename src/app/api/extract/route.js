import { NextResponse } from "next/server";
import { extractTablesFromImage } from "@/lib/claude";
import { checkAndRecordExtraction } from "@/lib/rate-limit";
import { getAdminAuth } from "@/lib/firebase-admin";

const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

/**
 * Fallback: verify a Firebase ID token using the public REST API.
 * Only requires the public FIREBASE_API_KEY — no admin credentials needed.
 * Validates token claims (expiration, audience) for defense in depth.
 */
async function verifyTokenViaRest(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return null;

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
    const user = data.users?.[0];
    if (!user) return null;

    // Validate token claims
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;

    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) return null; // Expired
      if (payload.aud && payload.aud !== projectId) return null; // Wrong project
    } catch {
      // If claims can't be parsed, still allow if REST API verified the user
    }

    return user.localId;
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

  // Reject obviously invalid tokens
  if (!token || token.length < 20 || token.length > 5000) {
    return { error: "Invalid token format.", status: 401 };
  }

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

    // Atomic rate limit check + record (prevents race condition)
    const limit = checkAndRecordExtraction(userId);
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

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { image, mediaType } = body;

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid image data" },
        { status: 400 }
      );
    }

    if (!mediaType || !ALLOWED_MEDIA_TYPES.includes(mediaType)) {
      return NextResponse.json(
        { error: `Invalid mediaType. Allowed: ${ALLOWED_MEDIA_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate base64 format (basic check)
    if (!/^[A-Za-z0-9+/=]+$/.test(image.slice(0, 100))) {
      return NextResponse.json(
        { error: "Invalid base64 image data" },
        { status: 400 }
      );
    }

    if (!process.env.CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: "API key is not configured. Contact the administrator." },
        { status: 500 }
      );
    }

    const tables = await extractTablesFromImage(image, mediaType);

    return NextResponse.json({
      tables,
      remaining: limit.remaining,
    });
  } catch (err) {
    console.error("Extract API error:", err.message);
    return NextResponse.json(
      { error: "Failed to extract data from image. Please try again." },
      { status: 500 }
    );
  }
}
