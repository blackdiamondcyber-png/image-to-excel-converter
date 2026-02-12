"use client";

import { useState } from "react";
import { downloadExcel } from "@/lib/excel";

export default function ExportStep({ tables, onReset }) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    try {
      downloadExcel(tables);
      setDownloaded(true);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const totalRows = tables.reduce((sum, t) => sum + t.rows.length, 0);

  if (!downloaded) {
    return (
      <div className="px-5 py-10 text-center flex-1 flex flex-col items-center justify-center">
        <div className="text-5xl mb-5">📊</div>
        <h2 className="text-snap-text text-xl font-bold mb-2">
          Ready to Export
        </h2>
        <p className="text-snap-text-muted text-[13px] mb-8">
          {tables.length} table{tables.length !== 1 ? "s" : ""} · {totalRows}{" "}
          rows of data
        </p>
        <button
          onClick={handleDownload}
          className="px-12 py-4 rounded-xl border-none bg-gradient-to-br from-snap-success to-emerald-600 text-white text-base font-bold cursor-pointer shadow-[0_4px_24px_rgba(52,211,153,0.35)] hover:opacity-90 transition-opacity"
        >
          📥 Download .xlsx File
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-10 text-center flex-1 flex flex-col items-center justify-center">
      <div className="w-[72px] h-[72px] rounded-full bg-snap-success-bg flex items-center justify-center text-4xl mb-5 border-2 border-snap-success">
        ✓
      </div>
      <h2 className="text-snap-success text-xl font-bold mb-2">
        Download Complete!
      </h2>
      <p className="text-snap-text-muted text-[13px] mb-8">
        Your Excel file has been saved
      </p>
      <div className="flex gap-2.5">
        <button
          onClick={handleDownload}
          className="px-6 py-3 rounded-[10px] border border-snap-border bg-snap-surface text-snap-text text-[13px] cursor-pointer hover:border-snap-border-focus transition-colors"
        >
          Download Again
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-[10px] border-none bg-gradient-to-br from-snap-accent to-purple-600 text-white text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
        >
          Scan More Images →
        </button>
      </div>
    </div>
  );
}
