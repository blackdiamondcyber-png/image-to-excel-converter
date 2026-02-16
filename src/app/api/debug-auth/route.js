import { NextResponse } from "next/server";
import { getAdminAuth, getInitError } from "@/lib/firebase-admin";

export async function GET(request) {
  const auth = getAdminAuth();
  const initError = getInitError();

  const result = {
    adminSdkAvailable: !!auth,
    adminInitError: initError || null,
    envCheck: {
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "MISSING",
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "MISSING",
      FIREBASE_PRIVATE_KEY_present: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_PRIVATE_KEY_length: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      CLAUDE_API_KEY: !!process.env.CLAUDE_API_KEY,
    },
  };

  // If Authorization header is present, try to verify the token
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    result.tokenReceived = true;
    result.tokenLength = token.length;

    // Try Admin SDK
    if (auth) {
      try {
        const decoded = await auth.verifyIdToken(token);
        result.adminVerify = { success: true, uid: decoded.uid };
      } catch (err) {
        result.adminVerify = { success: false, code: err.code, message: err.message };
      }
    }

    // Try REST fallback
    try {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: token }),
        }
      );
      const data = await res.json();
      result.restVerify = {
        httpStatus: res.status,
        ok: res.ok,
        user: data.users?.[0]?.localId || null,
        error: data.error || null,
      };

      // Check JWT claims
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        const now = Math.floor(Date.now() / 1000);
        result.jwtClaims = {
          aud: payload.aud,
          iss: payload.iss,
          exp: payload.exp,
          iat: payload.iat,
          now: now,
          expired: payload.exp < now,
          audMatchesProject: payload.aud === projectId,
        };
      }
    } catch (err) {
      result.restVerify = { error: err.message };
    }
  } else {
    result.tokenReceived = false;
    result.hint = "Pass Authorization: Bearer <token> header to test token verification";
  }

  return NextResponse.json(result);
}
