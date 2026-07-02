import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { generateBookingCode, expireExpiredBookings } from '@/lib/booking'
import { notifyUser, notifyAdmins } from '@/lib/notifications'
import type { Prisma } from '@/generated/prisma'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookId } = await req.json()

  const book = await prisma.book.findUnique({ where: { id: Number(bookId) } })
  if (!book) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
  if (book.stock < 1) return Response.json({ error: 'Stok buku habis' }, { status: 400 })

  const existingBooking = await prisma.booking.findFirst({
    where: { userId: ctx.user.id, bookId: Number(bookId), status: 'active' },
  })
  if (existingBooking) return Response.json({ error: 'Kamu sudah booking buku ini' }, { status: 400 })

  const activeCount = await prisma.booking.count({
    where: { userId: ctx.user.id, status: 'active' },
  })
  const borrowedCount = await prisma.transaction.count({
    where: { userId: ctx.user.id, status: 'borrowed' },
  })
  if (activeCount + borrowedCount >= 3) {
    return Response.json({ error: 'Kamu sudah mencapai batas maksimal 3 buku (booking + pinjaman)' }, { status: 400 })
  }

  const code = await generateBookingCode()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const [booking] = await prisma.$transaction([
    prisma.booking.create({
      data: { code, userId: ctx.user.id, bookId: Number(bookId), expiresAt },
      include: { book: { select: { id: true, title: true } } },
    }),
    prisma.book.update({
      where: { id: Number(bookId) },
      data: { stock: { decrement: 1 } },
    }),
  ])

  await notifyUser(ctx.user.id, 'Booking Berhasil', `Kode booking "${booking.code}" untuk "${booking.book.title}". Segera ambil buku di perpustakaan sebelum ${booking.expiresAt.toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}.`)

  return Response.json({ booking: { code: booking.code, book: { title: booking.book.title }, expiresAt: booking.expiresAt.toISOString() } }, { status: 201 })
})

export const GET = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  await expireExpiredBookings()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const where: Prisma.BookingWhereInput = {}
  if (status) where.status = status
  if (ctx.user.role !== 'admin') where.userId = ctx.user.id

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      book: { select: { id: true, title: true, author: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({ bookings })
})

export const PATCH = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, action } = await req.json()
  if (action !== 'cancel') return Response.json({ error: 'Aksi tidak valid' }, { status: 400 })

  const booking = await prisma.booking.findUnique({
    where: { id: Number(id) },
    include: { book: { select: { title: true } }, user: { select: { name: true } } },
  })
  if (!booking) return Response.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
  if (booking.status !== 'active') return Response.json({ error: 'Booking sudah tidak aktif' }, { status: 400 })
  if (booking.userId !== ctx.user.id && ctx.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.$transaction([
    prisma.booking.update({ where: { id: booking.id }, data: { status: 'cancelled' } }),
    prisma.book.update({ where: { id: booking.bookId }, data: { stock: { increment: 1 } } }),
  ])

  if (booking.userId !== ctx.user.id) {
    await notifyUser(booking.userId, 'Booking Dibatalkan', `Booking "${booking.book.title}" telah dibatalkan oleh admin.`)
  }
  await notifyAdmins('Booking Dibatalkan', `${booking.user.name} membatalkan booking "${booking.book.title}".`)

  return Response.json({ message: 'Booking dibatalkan' })
})
