import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { notifyUser } from '@/lib/notifications'

export const GET = withSupabaseRoute({ auth: 'user' }, async (_req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rentals = await prisma.ebookRental.findMany({
    where: { userId: ctx.user.id },
    include: {
      book: { select: { id: true, title: true, author: true, coverImage: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const active = rentals.filter((r) => r.status === 'active' && r.expiresAt > now)
  const expired = rentals.filter((r) => r.status !== 'active' || r.expiresAt <= now)

  const expiredIds = expired.filter((r) => r.status === 'active').map((r) => r.id)
  if (expiredIds.length > 0) {
    await prisma.ebookRental.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: 'expired' },
    })
    for (const r of expired.filter((e) => expiredIds.includes(e.id))) {
      r.status = 'expired'
      await notifyUser(ctx.user.id, 'Sewa E-book Berakhir', `Sewa e-book "${r.book.title}" telah berakhir.`)
    }
  }

  return Response.json({ active, expired })
})
