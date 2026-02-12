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
 * Build a workbook from tables and return it along with default filename.
 */
function buildWorkbook(tables) {
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

  return { wb, defaultFilename: `Rohan_Export_${ts}.xlsx` };
}

/**
 * Get an Excel file as a Blob (useful for cloud uploads and Save As).
 */
export function getExcelBlob(tables) {
  const { wb, defaultFilename } = buildWorkbook(tables);
  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  return { blob, defaultFilename };
}

/**
 * Client-side: download tables as an Excel file directly in the browser.
 */
export function downloadExcel(tables, filename) {
  const { wb, defaultFilename } = buildWorkbook(tables);
  XLSX.writeFile(wb, filename || defaultFilename);
}

/**
 * Save using the File System Access API (Save As picker).
 * Lets the user choose where to save the file.
 * Falls back to regular download if not supported.
 * Returns "saved" if picker was used, "downloaded" if fallback.
 */
export async function saveExcelAs(tables) {
  const { blob, defaultFilename } = getExcelBlob(tables);

  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: defaultFilename,
        types: [
          {
            description: "Excel Spreadsheet",
            accept: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return "saved";
    } catch (err) {
      // User cancelled the picker
      if (err.name === "AbortError") return "cancelled";
      throw err;
    }
  }

  // Fallback: regular download
  downloadExcel(tables);
  return "downloaded";
}
