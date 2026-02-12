"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

/**
 * Auth hook — returns current user and auth helpers.
 * Gracefully handles missing Supabase config (app works without auth).
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) throw new Error("Supabase not configured");
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) throw new Error("Supabase not configured");
    return supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    return supabase.auth.signOut();
  };

  return { user, loading, signIn, signUp, signOut };
}
