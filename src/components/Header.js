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

      <div className="flex items-center gap-2">
        {step !== "capture" && (
          <button
            onClick={onReset}
            className="bg-snap-surface border border-snap-border text-snap-text-muted px-3.5 py-2 rounded-lg text-xs cursor-pointer hover:border-snap-border-focus transition-colors"
          >
            ← New Scan
          </button>
        )}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-snap-accent/20 border border-snap-accent/40 flex items-center justify-center text-[11px] font-bold text-snap-accent uppercase">
              {user.email?.[0] || "U"}
            </div>
            <button
              onClick={signOut}
              className="text-snap-text-dim text-[11px] hover:text-snap-text-muted transition-colors cursor-pointer bg-transparent border-none p-1"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        ) : (
          step === "capture" && (
            <a
              href="/login"
              className="bg-snap-surface border border-snap-border text-snap-text-muted px-3.5 py-2 rounded-lg text-xs cursor-pointer hover:border-snap-border-focus transition-colors no-underline"
            >
              Sign in
            </a>
          )
        )}
      </div>
    </header>
  );
}
