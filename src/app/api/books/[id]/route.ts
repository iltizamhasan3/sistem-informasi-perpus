import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const GET = withSupabaseRoute<{ id: string }>({ auth: 'user' }, async (_req, ctx) => {
  const { id } = await ctx.params
  const book = await prisma.book.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  })
  if (!book) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
  return Response.json({ book }, { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=120' } })
})

export const PUT = withSupabaseRoute<{ id: string }>({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await ctx.params
  const { title, author, publisher, year, categoryId, stock, description, coverImage, isEbook, ebookFile } = await req.json()

  const book = await prisma.book.update({
    where: { id: Number(id) },
    data: {
      title, author,
      publisher: publisher || null,
      year: year ? Number(year) : null,
      categoryId: Number(categoryId),
      stock: Number(stock) || 1,
      description: description || null,
      coverImage: coverImage || null,
      isEbook: isEbook !== undefined ? Boolean(isEbook) : undefined,
      ebookFile: ebookFile !== undefined ? ebookFile : undefined,
    },
    include: { category: true },
  })
  return Response.json({ book })
})

export const DELETE = withSupabaseRoute<{ id: string }>({ auth: 'user' }, async (_req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await ctx.params
  const active = await prisma.transaction.findFirst({
    where: { bookId: Number(id), status: 'borrowed' },
  })
  if (active) return Response.json({ error: 'Buku sedang dipinjam' }, { status: 400 })

  await prisma.book.delete({ where: { id: Number(id) } })
  return Response.json({ message: 'Buku berhasil dihapus' })
})
