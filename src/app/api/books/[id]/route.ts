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
  const bookId = Number(id)
  if (isNaN(bookId)) return Response.json({ error: 'ID buku tidak valid' }, { status: 400 })

  const book = await prisma.book.findUnique({ where: { id: bookId } })
  if (!book) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })

  const activeLoan = await prisma.transaction.findFirst({
    where: { bookId, status: 'borrowed' },
  })
  if (activeLoan) return Response.json({ error: 'Buku sedang dipinjam, tidak bisa dihapus' }, { status: 400 })

  const activeBooking = await prisma.booking.findFirst({
    where: { bookId, status: 'active' },
  })
  if (activeBooking) return Response.json({ error: 'Buku memiliki booking aktif, tidak bisa dihapus' }, { status: 400 })

  const activeRental = await prisma.ebookRental.findFirst({
    where: { bookId, status: 'active' },
  })
  if (activeRental) return Response.json({ error: 'Buku sedang dirental sebagai ebook, tidak bisa dihapus' }, { status: 400 })

  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { bookId } }),
    prisma.booking.deleteMany({ where: { bookId } }),
    prisma.ebookRental.deleteMany({ where: { bookId } }),
    prisma.book.delete({ where: { id: bookId } }),
  ])
  return Response.json({ message: 'Buku berhasil dihapus' })
})
