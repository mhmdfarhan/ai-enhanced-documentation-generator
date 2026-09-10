import { createClient as createSupabaseClient } from '@supabase/supabase-js';
const g = globalThis as unknown as { __supabase?: ReturnType<typeof createSupabaseClient>; __admin?: ReturnType<typeof createSupabaseClient> };
export function createClient(): any {
  if (g.__supabase) return g.__supabase;
  g.__supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  );
  return g.__supabase;
}
export function createAdminClient(): any {
  if (g.__admin) return g.__admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  g.__admin = createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return g.__admin;
}
export const supabase: any = createClient();
export const supabaseAdmin: any = createAdminClient();
