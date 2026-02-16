"use client";

import { useAuth } from "@/hooks/useAuth";

export default function Header({ step, onReset }) {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-gradient-to-br from-snap-surface to-snap-bg border-b border-snap-border px-5 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-snap-accent to-purple-600 flex items-center justify-center text-lg">
          📊
        </div>
        <div>
          <h1 className="text-[17px] font-bold text-snap-text tracking-tight leading-tight">
            Rohan
          </h1>
          <p className="text-[11px] text-snap-text-muted leading-tight">
            Image → Excel in seconds
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {step !== "capture" && (
          <button
            onClick={onReset}
            className="bg-snap-surface border border-snap-border text-snap-text-muted px-2.5 py-2 rounded-lg text-xs cursor-pointer hover:border-snap-border-focus transition-colors whitespace-nowrap"
          >
            ← New
          </button>
        )}
        {user && (
          <button
            onClick={signOut}
            className="w-8 h-8 rounded-full bg-snap-accent/20 border border-snap-accent/40 flex items-center justify-center text-[11px] font-bold text-snap-accent uppercase cursor-pointer hover:bg-snap-accent/30 transition-colors min-w-[44px] min-h-[44px]"
            title="Sign out"
          >
            {user.email?.[0] || "U"}
          </button>
        )}
      </div>
    </header>
  );
}
