import { NextResponse } from "next/server";
import { tablesToExcelBuffer } from "@/lib/excel";

export async function POST(request) {
  try {
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
    const filename = `SnapSheet_Export_${timestamp}.xlsx`;

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
