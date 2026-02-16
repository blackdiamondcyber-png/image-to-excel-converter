"use client";

export default function EditableTable({ table, tableIndex, onUpdate }) {
  const { headers, rows, source } = table;

  const updateCell = (rowIdx, colIdx, value) => {
    const newRows = rows.map((r, ri) =>
      ri === rowIdx ? r.map((c, ci) => (ci === colIdx ? value : c)) : r
    );
    onUpdate(tableIndex, { ...table, rows: newRows });
  };

  const updateHeader = (colIdx, value) => {
    const newHeaders = headers.map((h, i) => (i === colIdx ? value : h));
    onUpdate(tableIndex, { ...table, headers: newHeaders });
  };

  const deleteRow = (rowIdx) => {
    onUpdate(tableIndex, {
      ...table,
      rows: rows.filter((_, i) => i !== rowIdx),
    });
  };

  const addRow = () => {
    onUpdate(tableIndex, {
      ...table,
      rows: [...rows, headers.map(() => "")],
    });
  };

  const addColumn = () => {
    onUpdate(tableIndex, {
      ...table,
      headers: [...headers, `Column ${headers.length + 1}`],
      rows: rows.map((r) => [...r, ""]),
    });
  };

  const deleteColumn = (colIdx) => {
    onUpdate(tableIndex, {
      ...table,
      headers: headers.filter((_, i) => i !== colIdx),
      rows: rows.map((r) => r.filter((_, i) => i !== colIdx)),
    });
  };

  return (
    <div className="bg-snap-surface rounded-[14px] border border-snap-border overflow-hidden mb-4">
      {/* Table Header Bar */}
      <div className="px-3 sm:px-4 py-3 border-b border-snap-border flex justify-between items-center gap-2">
        <div className="min-w-0">
          <span className="text-snap-text text-[13px] font-semibold">
            Table {tableIndex + 1}
          </span>
          <span className="text-snap-text-muted text-[11px] ml-2 hidden min-[340px]:inline">
            {rows.length} rows × {headers.length} cols
          </span>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={addRow}
            className="bg-snap-accent-glow border border-snap-accent text-snap-accent px-3 py-1.5 rounded-md text-[11px] cursor-pointer hover:opacity-80 active:opacity-70 transition-opacity min-h-[36px] min-w-[44px]"
          >
            + Row
          </button>
          <button
            onClick={addColumn}
            className="bg-snap-accent-glow border border-snap-accent text-snap-accent px-3 py-1.5 rounded-md text-[11px] cursor-pointer hover:opacity-80 active:opacity-70 transition-opacity min-h-[36px] min-w-[44px]"
          >
            + Col
          </button>
        </div>
      </div>

      {/* Scrollable Table — touch-optimized with momentum scrolling */}
      <div className="overflow-x-auto overflow-y-auto max-h-[400px] -webkit-overflow-scrolling-touch">
        <table
          className="w-full border-collapse"
          style={{ minWidth: Math.max(headers.length * 120, 300) }}
        >
          <thead>
            <tr>
              <th className="w-9 px-1 py-2 bg-snap-card border-b border-snap-border sticky top-0 z-[2]">
                <span className="text-snap-text-dim text-[10px]">#</span>
              </th>
              {headers.map((h, ci) => (
                <th
                  key={ci}
                  className="p-1 bg-snap-card border-b border-l border-snap-border sticky top-0 z-[2]"
                >
                  <div className="flex items-center gap-0.5">
                    <input
                      value={h}
                      onChange={(e) => updateHeader(ci, e.target.value)}
                      className="flex-1 bg-transparent border border-transparent rounded px-1.5 py-[6px] text-snap-accent text-[12px] font-bold outline-none min-w-[60px] focus:border-snap-border-focus"
                    />
                    {headers.length > 1 && (
                      <button
                        onClick={() => deleteColumn(ci)}
                        className="bg-transparent border-none text-snap-text-dim cursor-pointer text-[10px] p-2 rounded hover:text-snap-danger active:text-snap-danger transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Delete column"
                        aria-label={`Delete column ${ci + 1}`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-10 bg-snap-card border-b border-l border-snap-border sticky top-0 z-[2]" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={ri % 2 !== 0 ? "bg-white/[0.02]" : ""}
              >
                <td className="px-2 py-1 border-b border-snap-border text-center">
                  <span className="text-snap-text-dim text-[10px]">
                    {ri + 1}
                  </span>
                </td>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="p-0.5 border-b border-l border-snap-border"
                  >
                    <input
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      className="w-full bg-transparent border border-transparent rounded px-1.5 py-[6px] text-snap-text text-[13px] outline-none box-border focus:border-snap-border-focus focus:bg-[rgba(79,142,247,0.05)]"
                    />
                  </td>
                ))}
                <td className="p-0.5 border-b border-l border-snap-border text-center">
                  {rows.length > 1 && (
                    <button
                      onClick={() => deleteRow(ri)}
                      className="bg-transparent border-none text-snap-text-dim cursor-pointer text-[11px] p-2 rounded hover:text-snap-danger active:text-snap-danger transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                      title="Delete row"
                      aria-label={`Delete row ${ri + 1}`}
                    >
                      🗑
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
