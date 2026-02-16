"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "rohan_scans";

/**
 * Read scans from localStorage with validation.
 */
function readFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate each scan has required fields
    return parsed.filter(
      (scan) =>
        scan &&
        typeof scan === "object" &&
        typeof scan.id === "string" &&
        !Object.prototype.hasOwnProperty.call(scan, "__proto__") // Reject prototype pollution
    );
  } catch {
    return [];
  }
}

/**
 * Write scans to localStorage.
 */
function writeToStorage(scans) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
  } catch (err) {
    // localStorage full — remove oldest scans until it fits
    if (err.name === "QuotaExceededError" && scans.length > 1) {
      writeToStorage(scans.slice(0, -1));
    }
  }
}

/**
 * Hook for managing saved scans in localStorage.
 * All data stays on the user's device — no cloud storage needed.
 */
export function useScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScans = useCallback(() => {
    const data = readFromStorage();
    setScans(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const saveScan = useCallback((scanData) => {
    const id = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const saved = {
      id,
      ...scanData,
      created_at: new Date().toISOString(),
    };

    setScans((prev) => {
      const updated = [saved, ...prev];
      writeToStorage(updated);
      return updated;
    });

    return saved;
  }, []);

  const deleteScan = useCallback((id) => {
    setScans((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      writeToStorage(updated);
      return updated;
    });
  }, []);

  return { scans, loading, fetchScans, saveScan, deleteScan };
}
