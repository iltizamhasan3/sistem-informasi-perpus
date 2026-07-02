import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const GET = withSupabaseRoute({ auth: 'user' }, async (_req, ctx) => {
  if (ctx.user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalBooks, totalMembers, activeBorrows, todayTransactions, lowStockBooks, popularBooks, recentTransactions] = await Promise.all([
    prisma.book.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: 'member', isActive: true, deletedAt: null } }),
    prisma.transaction.count({ where: { status: 'borrowed' } }),
    prisma.transaction.count({ where: { createdAt: { gte: today } } }),
    prisma.book.findMany({ where: { stock: { lte: 2 }, deletedAt: null }, select: { id: true, title: true, stock: true }, orderBy: { stock: 'asc' }, take: 5 }),
    prisma.transaction.groupBy({
      by: ['bookId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }).then(async (groups) => {
      if (groups.length === 0) return []
      const books = await prisma.book.findMany({
        where: { id: { in: groups.map((g) => g.bookId) } },
        select: { id: true, title: true, author: true },
      })
      return groups
        .map((g) => {
          const book = books.find((b) => b.id === g.bookId)
          if (!book) return null
          return { ...book, borrowCount: g._count.id }
        })
        .filter((b): b is NonNullable<typeof b> => b !== null)
    }),
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } }, book: { select: { title: true } } },
    }),
  ])

  return Response.json({
    stats: { totalBooks, totalMembers, activeBorrows, todayTransactions },
    lowStockBooks, popularBooks, recentTransactions,
  }, { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=120' } })
})
