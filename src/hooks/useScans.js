"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

/**
 * Hook for managing saved scans in Supabase.
 * Gracefully returns empty state if Supabase is not configured.
 */
export function useScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScans = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (err) {
      console.error("Error fetching scans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const saveScan = useCallback(async (scanData) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("scans")
      .insert(scanData)
      .select()
      .single();

    if (error) throw error;
    setScans((prev) => [data, ...prev]);
    return data;
  }, []);

  const deleteScan = useCallback(async (id) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const { error } = await supabase.from("scans").delete().eq("id", id);
    if (error) throw error;
    setScans((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { scans, loading, fetchScans, saveScan, deleteScan };
}
