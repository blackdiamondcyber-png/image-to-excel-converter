"use client";

import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptType, setPromptType] = useState(null); // "android" | "ios"
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show on mobile / touch devices
    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isMobile) return;

    // Don't show if already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if user previously dismissed
    if (localStorage.getItem("pwa-install-dismissed")) return;

    // Android / Chrome: capture the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
      setPromptType("android");
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari: detect and show manual instructions
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setShowPrompt(true);
      setPromptType("ios");
    }

    // Android fallback: if on Android mobile browser but event hasn't fired yet,
    // show generic install instructions after a short delay
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChromelike = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    let fallbackTimer;
    if (isAndroid && isChromelike) {
      fallbackTimer = setTimeout(() => {
        // Only show fallback if the native prompt hasn't appeared
        setShowPrompt((prev) => {
          if (!prev) {
            setPromptType("android-manual");
            return true;
          }
          return prev;
        });
      }, 2000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  if (dismissed) return null;
  if (!showPrompt) return null;

  return (
    <div className="mx-auto w-[92%] max-w-[440px] mb-4 animate-slide-up">
      <div className="bg-snap-surface border border-snap-border rounded-2xl p-4 shadow-xl shadow-black/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-snap-accent to-purple-600 flex items-center justify-center text-lg shrink-0">
            📊
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-snap-text text-sm font-semibold">
              Install Rohan
            </p>
            {promptType === "ios" ? (
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
            ) : promptType === "android-manual" ? (
              <p className="text-snap-text-muted text-xs mt-0.5 leading-relaxed">
                Tap{" "}
                <span className="inline-block bg-snap-bg rounded px-1.5 py-0.5 text-snap-text font-medium">
                  ⋮
                </span>{" "}
                then{" "}
                <span className="inline-block bg-snap-bg rounded px-1.5 py-0.5 text-snap-text font-medium">
                  Add to Home screen
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
            className="w-full mt-3 py-2.5 rounded-xl border-none bg-gradient-to-br from-snap-accent to-purple-600 text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity min-h-[44px]"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
