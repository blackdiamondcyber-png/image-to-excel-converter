"use client";

import { useAuth } from "@/hooks/useAuth";

export default function Header({ step, onReset }) {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-gradient-to-br from-snap-surface to-snap-bg border-b border-snap-border px-4 sm:px-5 pt-4 pb-3 flex items-center justify-between sticky top-0 z-50 safe-area-top">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-snap-accent to-purple-600 flex items-center justify-center text-lg shrink-0">
          📊
        </div>
        <div className="min-w-0">
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
            className="bg-snap-surface border border-snap-border text-snap-text-muted px-3 py-2.5 rounded-lg text-xs cursor-pointer hover:border-snap-border-focus active:bg-snap-surface-hover transition-colors whitespace-nowrap min-h-[44px]"
          >
            ← New
          </button>
        )}
        {user && (
          <button
            onClick={signOut}
            className="w-[44px] h-[44px] rounded-full bg-snap-accent/20 border border-snap-accent/40 flex items-center justify-center text-[12px] font-bold text-snap-accent uppercase cursor-pointer hover:bg-snap-accent/30 active:bg-snap-accent/40 transition-colors"
            title="Sign out"
          >
            {user.email?.[0] || "U"}
          </button>
        )}
      </div>
    </header>
  );
}
