import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { MAX_BORROW } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const GET = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = ctx.user.id

  const activeCount = await prisma.booking.count({
    where: { userId, status: 'active' },
  })
  
  const borrowedCount = await prisma.transaction.count({
    where: { userId, status: 'borrowed' },
  })

  const maxSlot = MAX_BORROW
  const usedSlot = activeCount + borrowedCount
  const availableSlot = Math.max(0, maxSlot - usedSlot)

  return Response.json({ maxSlot, usedSlot, availableSlot })
})
