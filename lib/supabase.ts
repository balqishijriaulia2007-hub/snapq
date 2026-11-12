import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY TERSEDIA:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL atau API Key belum terbaca dari .env.local");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);