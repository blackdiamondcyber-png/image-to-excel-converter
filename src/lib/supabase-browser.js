import { createClient } from "@supabase/supabase-js";

let client = null;

/**
 * Returns a Supabase client for browser usage (anon key, RLS-enforced).
 */
export function getSupabaseBrowser() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      "Supabase env vars not set — auth and storage features disabled"
    );
    return null;
  }

  client = createClient(url, anonKey);
  return client;
}
