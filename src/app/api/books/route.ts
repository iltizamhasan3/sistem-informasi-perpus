import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const GET = withSupabaseRoute({ auth: 'user' }, async (req) => {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('categoryId')
  const page = searchParams.get('page')

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (categoryId) where.categoryId = Number(categoryId)

  if (page) {
    const limit = 20
    const skip = (Number(page) - 1) * limit
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: { category: true, _count: { select: { transactions: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.book.count({ where }),
    ])
    return Response.json({ books, meta: { page: Number(page), total, totalPages: Math.ceil(total / limit) } }, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } })
  }

  const books = await prisma.book.findMany({
    where,
    include: { category: true, _count: { select: { transactions: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json({ books }, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } })
})

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { title, author, publisher, year, categoryId, stock, description, coverImage, isEbook, ebookFile } = await req.json()
  if (!title || !author || !categoryId) {
    return Response.json({ error: 'Judul, pengarang, dan kategori wajib diisi' }, { status: 400 })
  }

  const book = await prisma.book.create({
    data: {
      title, author,
      publisher: publisher || null,
      year: year ? Number(year) : null,
      categoryId: Number(categoryId),
      stock: Number(stock) || 1,
      description: description || null,
      coverImage: coverImage || null,
      isEbook: isEbook || false,
      ebookFile: ebookFile || null,
    },
    include: { category: true },
  })
  return Response.json({ book }, { status: 201 })
})
