import { createClient } from "@supabase/supabase-js";

// Lovable Supabase integration: URL and anon key are provided by the platform once connected.
// We attempt to read commonly injected globals. If missing, the app will still run, but auth calls will fail gracefully.
const url = (window as any)?.__SUPABASE_URL__ || (window as any)?.SUPABASE_URL || "";
const anon = (window as any)?.__SUPABASE_ANON__ || (window as any)?.SUPABASE_ANON_KEY || "";

if (!url || !anon) {
  console.warn("Supabase URL or anon key not found. Ensure the project is connected to Supabase in Lovable (green button top-right).");
}

export const supabase = createClient(url, anon);
