import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const PUT = withSupabaseRoute({ auth: 'user' }, async (_req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { userId: ctx.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })
  return Response.json({ message: 'Semua notifikasi telah dibaca' })
})
