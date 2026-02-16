import { NextResponse } from "next/server";
import { tablesToExcelBuffer } from "@/lib/excel";
import { getAdminAuth } from "@/lib/firebase-admin";

const MAX_TABLES = 100;
const MAX_ROWS_PER_TABLE = 10000;
const MAX_COLUMNS = 100;

/**
 * Verify a Firebase ID token via REST API fallback.
 */
async function verifyTokenViaRest(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return false;

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.users?.[0]) return false;

    // Validate JWT claims (expiration and audience)
    const parts = idToken.split(".");
    if (parts.length !== 3) return false;
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      const now = Math.floor(Date.now() / 1000);
      if (!payload.exp || payload.exp < now) return false;
      if (!payload.aud || payload.aud !== projectId) return false;
    } catch {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Auth check — verifies the request has a valid Firebase token.
 * Tries Admin SDK first, falls back to REST API verification.
 */
async function isAuthenticated(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.split("Bearer ")[1];
  if (!token || token.length < 20) return false;

  // Strategy 1: Firebase Admin SDK
  const auth = getAdminAuth();
  if (auth) {
    try {
      await auth.verifyIdToken(token);
      return true;
    } catch {
      // Fall through to REST fallback
    }
  }

  // Strategy 2: Firebase REST API fallback
  return verifyTokenViaRest(token);
}

/**
 * Sanitize table data — ensure all values are strings and within limits.
 */
function sanitizeTables(tables) {
  return tables.slice(0, MAX_TABLES).map((table) => ({
    title: String(table.title || "").slice(0, 200),
    source: String(table.source || "").slice(0, 200),
    headers: (table.headers || []).slice(0, MAX_COLUMNS).map((h) => String(h).slice(0, 500)),
    rows: (table.rows || []).slice(0, MAX_ROWS_PER_TABLE).map((row) =>
      (Array.isArray(row) ? row : []).slice(0, MAX_COLUMNS).map((cell) => String(cell).slice(0, 5000))
    ),
  }));
}

export async function POST(request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
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

    const { tables } = body;

    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json(
        { error: "No tables provided for export" },
        { status: 400 }
      );
    }

    const sanitized = sanitizeTables(tables);
    const buffer = tablesToExcelBuffer(sanitized);

    const timestamp = new Date()
      .toISOString()
      .slice(0, 16)
      .replace(/[:-]/g, "")
      .replace("T", "_");
    const filename = `Rohan_Export_${timestamp}.xlsx`;

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate Excel file. Please try again." },
      { status: 500 }
    );
  }
}
