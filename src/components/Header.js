"use client";

export default function Header({ step, onReset }) {
  return (
    <header className="bg-gradient-to-br from-snap-surface to-snap-bg border-b border-snap-border px-5 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-snap-accent to-purple-600 flex items-center justify-center text-lg">
          📊
        </div>
        <div>
          <h1 className="text-[17px] font-bold text-snap-text tracking-tight leading-tight">
            SnapSheet
          </h1>
          <p className="text-[11px] text-snap-text-muted leading-tight">
            Image → Excel in seconds
          </p>
        </div>
      </div>
      {step !== "capture" && (
        <button
          onClick={onReset}
          className="bg-snap-surface border border-snap-border text-snap-text-muted px-3.5 py-2 rounded-lg text-xs cursor-pointer hover:border-snap-border-focus transition-colors"
        >
          ← New Scan
        </button>
      )}
    </header>
  );
}
