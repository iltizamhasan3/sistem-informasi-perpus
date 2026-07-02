import { withSupabaseRoute } from '@/lib/supabase-server'
import { expireExpiredBookings } from '@/lib/booking'

export const POST = withSupabaseRoute({ auth: 'user' }, async (_req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const count = await expireExpiredBookings()
  return Response.json({ expired: count })
})
