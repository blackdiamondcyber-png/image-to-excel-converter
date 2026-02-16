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
    <div className="flex items-center justify-center gap-0.5 pt-4 pb-2 px-3">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-0.5">
          <div
            className={`flex items-center gap-1 px-2 py-1.5 rounded-full border transition-all duration-300 ${
              i === currentIndex
                ? "bg-snap-accent-glow border-snap-accent shadow-[0_0_8px_rgba(79,142,247,0.25)]"
                : i < currentIndex
                  ? "bg-snap-success-bg border-snap-success"
                  : "bg-transparent border-snap-border"
            }`}
          >
            <span className="text-xs leading-none">{s.icon}</span>
            <span
              className={`text-[9px] leading-none whitespace-nowrap ${
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
              className={`w-2 h-px transition-colors duration-300 ${
                i < currentIndex ? "bg-snap-success" : "bg-snap-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
