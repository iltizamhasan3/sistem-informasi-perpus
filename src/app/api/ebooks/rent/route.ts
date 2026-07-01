import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { notifyAdmins } from '@/lib/notifications'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.user.role !== 'member') return Response.json({ error: 'Hanya member yang bisa sewa e-book' }, { status: 403 })

  const { bookId } = await req.json()

  const book = await prisma.book.findUnique({ where: { id: Number(bookId) } })
  if (!book) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
  if (!book.isEbook || !book.ebookFile) return Response.json({ error: 'Buku ini tidak memiliki e-book' }, { status: 400 })

  const activeRental = await prisma.ebookRental.findFirst({
    where: { userId: ctx.user.id, status: 'active' },
  })
  if (activeRental) return Response.json({ error: 'Kamu sudah memiliki sewa e-book aktif. Selesaikan atau tunggu expired dahulu.' }, { status: 400 })

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

  const rental = await prisma.ebookRental.create({
    data: {
      userId: ctx.user.id,
      bookId: Number(bookId),
      rentedAt: now,
      expiresAt,
    },
    include: { book: { select: { id: true, title: true } } },
  })

  await notifyAdmins('Sewa E-book Baru', `${ctx.user.name} menyewa e-book "${rental.book.title}".`)

  return Response.json({ rental: { id: rental.id, expiresAt: rental.expiresAt.toISOString(), book: { title: rental.book.title } } }, { status: 201 })
})
