"use client";

import { useState } from "react";

export default function ScanCard({ scan, onView, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(scan.id);
    } catch {
      setDeleting(false);
    }
  };

  const date = new Date(scan.created_at);
  const timeAgo = getTimeAgo(date);

  return (
    <div
      onClick={() => onView(scan)}
      className="bg-snap-surface border border-snap-border rounded-xl p-4 cursor-pointer hover:border-snap-border-focus transition-all active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-snap-text text-sm font-semibold truncate">
            {scan.title || "Untitled Scan"}
          </h3>
          <p className="text-snap-text-dim text-[11px] mt-0.5">{timeAgo}</p>
        </div>
        <div className="flex items-center gap-1.5 ml-3">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              scan.status === "completed"
                ? "bg-snap-success-bg text-snap-success"
                : scan.status === "failed"
                  ? "bg-snap-danger-bg text-snap-danger"
                  : "bg-snap-warning-bg text-snap-warning"
            }`}
          >
            {scan.status}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-3">
        <Stat label="Images" value={scan.image_count} />
        <Stat label="Tables" value={scan.table_count} />
        <Stat label="Rows" value={scan.row_count} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-snap-border">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(scan);
          }}
          className="flex-1 py-2 rounded-lg bg-snap-accent-glow border border-snap-accent text-snap-accent text-[11px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
        >
          View & Export
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="py-2 px-3 rounded-lg border border-snap-border text-snap-text-dim text-[11px] cursor-pointer hover:border-snap-danger hover:text-snap-danger transition-colors disabled:opacity-40 bg-transparent min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          {deleting ? "..." : "🗑"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-snap-text text-sm font-semibold">{value || 0}</p>
      <p className="text-snap-text-dim text-[10px]">{label}</p>
    </div>
  );
}

function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}
