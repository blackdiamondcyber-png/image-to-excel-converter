import { NextResponse } from "next/server";
import { tablesToExcelBuffer } from "@/lib/excel";
import { getAdminAuth } from "@/lib/firebase-admin";

const MAX_TABLES = 100;
const MAX_ROWS_PER_TABLE = 10000;
const MAX_COLUMNS = 100;

/**
 * Lightweight auth check — verifies the request has a valid Firebase token.
 */
async function isAuthenticated(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.split("Bearer ")[1];
  if (!token || token.length < 20) return false;

  const auth = getAdminAuth();
  if (!auth) return false;

  try {
    await auth.verifyIdToken(token);
    return true;
  } catch {
    return false;
  }
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
  } catch (err) {
    console.error("Export API error:", err);
    return NextResponse.json(
      { error: "Failed to generate Excel file. Please try again." },
      { status: 500 }
    );
  }
}
