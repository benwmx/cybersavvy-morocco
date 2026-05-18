import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Clean the URL: remove trailing slashes and common /rest/v1 suffixes that users might accidentally paste
const supabaseUrl = rawUrl?.replace(/\/+$/, "").replace(/\/rest\/v1\/?$/, "");

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. App will fallback to mock mode if api.ts is configured to do so.");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);
