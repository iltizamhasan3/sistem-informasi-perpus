import { withSupabaseRoute } from '@/lib/supabase-server'

export const GET = withSupabaseRoute({ auth: 'user' }, async (_req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'User tidak ditemukan' }, { status: 404 })
  return Response.json({ user: ctx.user })
})
