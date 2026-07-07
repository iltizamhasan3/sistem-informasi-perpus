import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import type { Prisma } from '@/generated/prisma/client'

export const GET = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const userId = searchParams.get('userId')
  const page = searchParams.get('page')
  const mine = searchParams.get('mine')
  const limit = searchParams.get('limit')

  const whereTx: Prisma.TransactionWhereInput = {}
  const whereEb: Prisma.EbookRentalWhereInput = {}

  if (mine === 'true') {
    whereTx.userId = ctx.user!.id
    whereEb.userId = ctx.user!.id
  } else if (ctx.user?.role === 'member') {
    whereTx.userId = ctx.user.id
    whereEb.userId = ctx.user.id
  } else if (userId) {
    whereTx.userId = Number(userId)
    whereEb.userId = Number(userId)
  }

  // Handle status mapping
  let includeTx = true
  let includeEb = true
  if (status) {
    if (status === 'borrowed') {
      whereTx.status = 'borrowed'
      whereEb.status = 'active'
    } else if (status === 'returned') {
      whereTx.status = 'returned'
      whereEb.status = 'expired' // Not real status in DB, but conceptually
    } else if (status === 'overdue') {
      whereTx.status = 'overdue'
      includeEb = false
    }
  }

  const [rawTransactions, rawEbooks] = await Promise.all([
    includeTx ? prisma.transaction.findMany({
      where: whereTx,
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, author: true, coverImage: true } },
      },
      orderBy: { createdAt: 'desc' },
    }) : Promise.resolve([]),
    includeEb ? prisma.ebookRental.findMany({
      where: whereEb,
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, author: true, coverImage: true } },
      },
      orderBy: { createdAt: 'desc' },
    }) : Promise.resolve([]),
  ])

  const now = new Date()

  // Map ebooks to look like transactions
  const mappedEbooks = rawEbooks.map(e => {
    const isExpired = e.expiresAt < now || e.status === 'expired'
    return {
      id: `ebook-${e.id}`, // prefix with ebook to avoid collision, or maybe generate a large number
      originalId: e.id,
      borrowDate: e.rentedAt,
      dueDate: e.expiresAt,
      returnDate: isExpired ? e.expiresAt : null,
      fine: 0,
      status: isExpired ? 'returned' : 'borrowed',
      user: e.user,
      book: { ...e.book, isEbook: true },
      createdAt: e.createdAt,
    }
  })

  // Filter out mapped ebooks if specific status was requested but they don't match
  // (because 'expired' isn't actually a DB status for EbookRental, we compute it)
  let filteredEbooks = mappedEbooks
  if (status === 'borrowed') filteredEbooks = mappedEbooks.filter(e => e.status === 'borrowed')
  if (status === 'returned') filteredEbooks = mappedEbooks.filter(e => e.status === 'returned')

  const combined = [
    ...rawTransactions.map(t => ({ ...t, book: { ...t.book, isEbook: false } })),
    ...filteredEbooks
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (limit === 'all') {
    return Response.json({ transactions: combined })
  }

  if (page) {
    const limitNum = 20
    const skip = (Number(page) - 1) * limitNum
    const total = combined.length
    const paginated = combined.slice(skip, skip + limitNum)
    return Response.json({ 
      transactions: paginated, 
      meta: { page: Number(page), total, totalPages: Math.ceil(total / limitNum) } 
    })
  }

  return Response.json({ transactions: combined })
})
