import { createClient } from '@supabase/supabase-js'

const globalForSupabase = globalThis as unknown as {
  supabaseAdmin: ReturnType<typeof createClient> | undefined
}

export function getSupabaseAdmin() {
  if (!globalForSupabase.supabaseAdmin) {
    globalForSupabase.supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
  }
  return globalForSupabase.supabaseAdmin
}
