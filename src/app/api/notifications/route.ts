import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const GET = withSupabaseRoute({ auth: 'user' }, async (_req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: ctx.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return Response.json({ notifications })
})

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, message, type } = await req.json()
  const notification = await prisma.notification.create({
    data: { userId: ctx.user.id, title, message, type: type || 'in-app' },
  })
  return Response.json({ notification }, { status: 201 })
})
