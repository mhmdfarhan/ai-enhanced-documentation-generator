import { createClient as createSupabaseClient } from '@supabase/supabase-js';
const g = globalThis as unknown as { __supabase?: ReturnType<typeof createSupabaseClient>; __admin?: ReturnType<typeof createSupabaseClient> };
export function createClient() {
  if (g.__supabase) return g.__supabase;
  g.__supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return g.__supabase;
}
export function createAdminClient() {
  if (g.__admin) return g.__admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  g.__admin = createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return g.__admin;
}
export const supabase = createClient();
export const supabaseAdmin = createAdminClient();
