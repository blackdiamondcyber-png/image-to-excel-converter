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
      <div className="px-4 py-3 border-b border-snap-border flex justify-between items-center">
        <div>
          <span className="text-snap-text text-[13px] font-semibold">
            Table {tableIndex + 1}
          </span>
          <span className="text-snap-text-muted text-[11px] ml-2">
            {rows.length} rows × {headers.length} cols · from {source}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={addRow}
            className="bg-snap-accent-glow border border-snap-accent text-snap-accent px-3 py-1.5 rounded-md text-[11px] cursor-pointer hover:opacity-80 transition-opacity min-h-[36px]"
          >
            + Row
          </button>
          <button
            onClick={addColumn}
            className="bg-snap-accent-glow border border-snap-accent text-snap-accent px-3 py-1.5 rounded-md text-[11px] cursor-pointer hover:opacity-80 transition-opacity min-h-[36px]"
          >
            + Col
          </button>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto max-h-[400px]">
        <table
          className="w-full border-collapse"
          style={{ minWidth: headers.length * 130 }}
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
                      className="flex-1 bg-transparent border border-transparent rounded px-1.5 py-[5px] text-snap-accent text-[11px] font-bold outline-none min-w-[60px] focus:border-snap-border-focus"
                    />
                    {headers.length > 1 && (
                      <button
                        onClick={() => deleteColumn(ci)}
                        className="bg-transparent border-none text-snap-text-dim cursor-pointer text-[10px] p-2 rounded hover:text-snap-danger transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title="Delete column"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-8 bg-snap-card border-b border-l border-snap-border sticky top-0 z-[2]" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={ri % 2 !== 0 ? "bg-white/[0.01]" : ""}
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
                      className="w-full bg-transparent border border-transparent rounded px-1.5 py-[5px] text-snap-text text-xs outline-none box-border focus:border-snap-border-focus focus:bg-[rgba(79,142,247,0.05)]"
                    />
                  </td>
                ))}
                <td className="p-0.5 border-b border-l border-snap-border text-center">
                  {rows.length > 1 && (
                    <button
                      onClick={() => deleteRow(ri)}
                      className="bg-transparent border-none text-snap-text-dim cursor-pointer text-[11px] p-2 rounded hover:text-snap-danger transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Delete row"
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
