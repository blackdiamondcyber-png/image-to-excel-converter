"use client";

import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if user previously dismissed
    if (localStorage.getItem("pwa-install-dismissed")) return;

    // Android / Chrome: capture the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari: detect and show manual instructions
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setShowIOSPrompt(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIOSPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  if (dismissed) return null;
  if (!deferredPrompt && !showIOSPrompt) return null;

  return (
    <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-[92%] max-w-[440px] z-[100] animate-slide-up">
      <div className="bg-snap-surface border border-snap-border rounded-2xl p-4 shadow-xl shadow-black/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-snap-accent to-purple-600 flex items-center justify-center text-lg shrink-0">
            📊
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-snap-text text-sm font-semibold">
              Install Rohan
            </p>
            {showIOSPrompt ? (
              <p className="text-snap-text-muted text-xs mt-0.5 leading-relaxed">
                Tap{" "}
                <span className="inline-block bg-snap-bg rounded px-1.5 py-0.5 text-snap-text font-medium">
                  Share
                </span>{" "}
                then{" "}
                <span className="inline-block bg-snap-bg rounded px-1.5 py-0.5 text-snap-text font-medium">
                  Add to Home Screen
                </span>
              </p>
            ) : (
              <p className="text-snap-text-muted text-xs mt-0.5">
                Add to your home screen for the full app experience
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-snap-text-dim hover:text-snap-text-muted text-lg bg-transparent border-none cursor-pointer p-1 -mt-1 -mr-1 shrink-0"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>

        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="w-full mt-3 py-2.5 rounded-xl border-none bg-gradient-to-br from-snap-accent to-purple-600 text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
