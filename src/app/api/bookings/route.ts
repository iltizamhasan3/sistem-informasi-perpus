import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { generateBookingCode } from '@/lib/booking'
import { notifyUser, notifyAdmins } from '@/lib/notifications'
import type { Prisma } from '@/generated/prisma/client'
import { MAX_BORROW } from '@/lib/utils'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = ctx.user.id
  const { bookId } = await req.json()
  const code = await generateBookingCode()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const result = await prisma.$transaction(async (tx) => {
    const userDb = await tx.user.findUnique({ where: { id: userId } })
    if (!userDb || !userDb.isActive) return { error: 'Akun kamu tidak aktif', status: 403 }

    const book = await tx.book.findUnique({ where: { id: Number(bookId) } })
    if (!book) return { error: 'Buku tidak ditemukan', status: 404 }

    const existingBooking = await tx.booking.findFirst({
      where: { userId, bookId: Number(bookId), status: 'active' },
    })
    if (existingBooking) return { error: 'Kamu sudah booking buku ini', status: 400 }

    const activeCount = await tx.booking.count({
      where: { userId, status: 'active' },
    })
    const borrowedCount = await tx.transaction.count({
      where: { userId, status: 'borrowed' },
    })
    if (activeCount + borrowedCount >= MAX_BORROW) {
      return { error: `Kamu sudah mencapai batas maksimal ${MAX_BORROW} buku (booking + pinjaman)`, status: 400 }
    }

    const { count } = await tx.book.updateMany({
      where: { id: Number(bookId), stock: { gt: 0 } },
      data: { stock: { decrement: 1 } },
    })
    if (count === 0) return { error: 'Stok buku habis', status: 400 }

    const [booking] = await Promise.all([
      tx.booking.create({
        data: { code, userId, bookId: Number(bookId), expiresAt },
        include: { book: { select: { id: true, title: true, coverImage: true } } },
      }),
    ])

    return { booking }
  })

  if ('error' in result) {
    return Response.json({ error: result.error }, { status: result.status })
  }

  await notifyUser(ctx.user.id, 'Booking Berhasil', `Kode booking "${result.booking.code}" untuk "${result.booking.book.title}". Segera ambil buku di perpustakaan sebelum ${result.booking.expiresAt.toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}.`)

  return Response.json({ booking: { code: result.booking.code, book: { title: result.booking.book.title }, expiresAt: result.booking.expiresAt.toISOString() } }, { status: 201 })
})

export const GET = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || undefined
  const where: Prisma.BookingWhereInput = {}
  if (status) where.status = status
  if (ctx.user.role !== 'admin') where.userId = ctx.user.id

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      book: { select: { id: true, title: true, author: true, coverImage: true } },
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
