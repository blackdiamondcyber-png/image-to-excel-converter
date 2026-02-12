import * as XLSX from "xlsx";

/**
 * Convert an array of table objects into an Excel buffer.
 * Each table becomes a separate sheet.
 *
 * @param {Array<{headers: string[], rows: string[][], title?: string, source?: string}>} tables
 * @returns {Buffer} Excel file as a buffer
 */
export function tablesToExcelBuffer(tables) {
  const wb = XLSX.utils.book_new();

  tables.forEach((table, i) => {
    const sheetData = [table.headers, ...table.rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Auto-size columns
    const colWidths = table.headers.map((h, ci) => {
      const maxLen = Math.max(
        h.length,
        ...table.rows.map((r) => String(r[ci] || "").length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
    });
    ws["!cols"] = colWidths;

    const sheetName =
      tables.length === 1
        ? "Data"
        : `Table ${i + 1} - ${table.source || "Sheet"}`.slice(0, 31);

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

/**
 * Client-side: download tables as an Excel file directly in the browser.
 *
 * @param {Array<{headers: string[], rows: string[][], title?: string, source?: string}>} tables
 * @param {string} [filename] Optional filename override
 */
export function downloadExcel(tables, filename) {
  const wb = XLSX.utils.book_new();

  tables.forEach((table, i) => {
    const sheetData = [table.headers, ...table.rows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    const colWidths = table.headers.map((h, ci) => {
      const maxLen = Math.max(
        h.length,
        ...table.rows.map((r) => String(r[ci] || "").length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
    });
    ws["!cols"] = colWidths;

    const sheetName =
      tables.length === 1
        ? "Data"
        : `Table ${i + 1} - ${table.source || "Sheet"}`.slice(0, 31);

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const ts = new Date()
    .toISOString()
    .slice(0, 16)
    .replace(/[:-]/g, "")
    .replace("T", "_");

  XLSX.writeFile(wb, filename || `Rohan_Export_${ts}.xlsx`);
}
