import { NextResponse } from "next/server";
import { tablesToExcelBuffer } from "@/lib/excel";
import { getAdminAuth } from "@/lib/firebase-admin";

/**
 * Lightweight auth check — verifies the request has a valid Firebase token.
 */
async function isAuthenticated(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.split("Bearer ")[1];
  const auth = getAdminAuth();
  if (!auth) return false;

  try {
    await auth.verifyIdToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { tables } = await request.json();

    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json(
        { error: "No tables provided for export" },
        { status: 400 }
      );
    }

    const buffer = tablesToExcelBuffer(tables);

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
      { error: err.message || "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}
