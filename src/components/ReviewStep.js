"use client";

import EditableTable from "./EditableTable";

export default function ReviewStep({ tables, setTables, onExport, onBack }) {
  const handleUpdate = (index, updatedTable) => {
    setTables((prev) => prev.map((t, i) => (i === index ? updatedTable : t)));
  };

  const totalRows = tables.reduce((sum, t) => sum + t.rows.length, 0);

  return (
    <div className="px-4 sm:px-5 py-5 flex-1">
      {/* Summary Card */}
      <div className="bg-snap-success-bg border border-snap-success rounded-xl px-4 py-3.5 mb-4 flex items-center gap-2.5">
        <span className="text-xl shrink-0">✅</span>
        <div className="min-w-0">
          <p className="text-snap-success text-[13px] font-semibold">
            Extraction Complete
          </p>
          <p className="text-snap-text-muted text-[11px]">
            {tables.length} table{tables.length !== 1 ? "s" : ""} found ·{" "}
            {totalRows} total rows — Review and edit below
          </p>
        </div>
      </div>

      {/* Tables */}
      {tables.map((table, i) => (
        <EditableTable
          key={i}
          table={table}
          tableIndex={i}
          onUpdate={handleUpdate}
        />
      ))}

      {/* Actions */}
      <div className="flex gap-2.5 mt-4">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-snap-border bg-snap-surface text-snap-text-muted text-sm cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors min-h-[48px]"
        >
          ← Re-scan
        </button>
        <button
          onClick={onExport}
          disabled={tables.length === 0 || totalRows === 0}
          className="flex-[2] py-3.5 rounded-xl border-none bg-gradient-to-br from-snap-success to-emerald-600 text-white text-sm font-bold cursor-pointer shadow-[0_4px_20px_rgba(52,211,153,0.3)] flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
        >
          📥 Export to Excel
        </button>
      </div>
    </div>
  );
}
