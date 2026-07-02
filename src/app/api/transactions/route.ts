import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import type { Prisma } from '@/generated/prisma'

export const GET = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const userId = searchParams.get('userId')
  const page = searchParams.get('page')
  const mine = searchParams.get('mine')

  const where: Prisma.TransactionWhereInput = {}
  if (mine === 'true') where.userId = ctx.user!.id
  else if (ctx.user?.role === 'member') where.userId = ctx.user.id
  else if (userId) where.userId = Number(userId)
  if (status) where.status = status

  if (page) {
    const limit = 20
    const skip = (Number(page) - 1) * limit
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true, author: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])
    return Response.json({ transactions, meta: { page: Number(page), total, totalPages: Math.ceil(total / limit) } })
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      book: { select: { id: true, title: true, author: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json({ transactions })
})
