"use client";

const STEPS = [
  { key: "capture", label: "Capture", icon: "📸" },
  { key: "processing", label: "Process", icon: "⚙️" },
  { key: "review", label: "Review", icon: "✏️" },
  { key: "export", label: "Export", icon: "📥" },
];

export default function StepIndicator({ current }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex justify-center gap-1 pt-4 pb-2 px-3 overflow-x-auto scrollbar-none">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1 shrink-0">
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all duration-300 ${
              i === currentIndex
                ? "bg-snap-accent-glow border-snap-accent"
                : i < currentIndex
                  ? "bg-snap-success-bg border-snap-success"
                  : "bg-transparent border-snap-border"
            }`}
          >
            <span className="text-[13px]">{s.icon}</span>
            <span
              className={`text-[10px] hidden min-[360px]:inline ${
                i === currentIndex
                  ? "font-semibold text-snap-accent"
                  : i < currentIndex
                    ? "text-snap-success"
                    : "text-snap-text-dim"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-3 h-px ${
                i < currentIndex ? "bg-snap-success" : "bg-snap-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
