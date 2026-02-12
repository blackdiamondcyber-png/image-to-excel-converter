import { createClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client with service role key for server-side operations.
 * Never import this from client components.
 */
export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn("Supabase server env vars not set — DB features disabled");
    return null;
  }

  return createClient(url, serviceKey);
}
