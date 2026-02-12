"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error", 5000),
    info: (msg) => addToast(msg, "info"),
    warning: (msg) => addToast(msg, "warning"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-[90%] max-w-[400px] pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const styles = {
    success: "bg-snap-success-bg border-snap-success text-snap-success",
    error: "bg-snap-danger-bg border-snap-danger text-snap-danger",
    warning: "bg-snap-warning-bg border-snap-warning text-snap-warning",
    info: "bg-snap-accent-glow border-snap-accent text-snap-accent",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`pointer-events-auto border rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2 transition-all duration-300 ${styles[toast.type] || styles.info} ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
    >
      <span className="text-sm">{icons[toast.type]}</span>
      {toast.message}
    </div>
  );
}
