import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { BORROW_DURATION_DAYS } from '@/lib/utils'
import { expireExpiredBookings } from '@/lib/booking'
import { notifyUser, notifyAdmins } from '@/lib/notifications'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.user.role !== 'admin') return Response.json({ error: 'Hanya admin yang bisa konfirmasi booking' }, { status: 403 })

  await expireExpiredBookings()

  const { bookingCode } = await req.json()
  if (!bookingCode) return Response.json({ error: 'Kode booking wajib diisi' }, { status: 400 })

  const booking = await prisma.booking.findUnique({
    where: { code: bookingCode },
    include: { book: { select: { title: true } } },
  })
  if (!booking) return Response.json({ error: 'Kode booking tidak ditemukan' }, { status: 404 })
  if (booking.status !== 'active') {
    if (booking.status === 'expired') return Response.json({ error: 'Booking sudah expired' }, { status: 400 })
    if (booking.status === 'completed') return Response.json({ error: 'Booking sudah digunakan' }, { status: 400 })
    return Response.json({ error: `Booking sudah ${booking.status}` }, { status: 400 })
  }
  if (booking.expiresAt < new Date()) {
    await prisma.booking.update({ where: { id: booking.id }, data: { status: 'expired' } })
    await prisma.book.update({ where: { id: booking.bookId }, data: { stock: { increment: 1 } } })
    return Response.json({ error: 'Booking sudah expired' }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const { count } = await tx.booking.updateMany({
      where: { id: booking.id, status: 'active' },
      data: { status: 'completed' },
    })
    if (count === 0) return { error: 'Booking sudah tidak aktif' }

    const now = new Date()
    const dueDate = new Date(now.getTime() + BORROW_DURATION_DAYS * 24 * 60 * 60 * 1000)

    const [transaction] = await Promise.all([
      tx.transaction.create({
        data: {
          userId: booking.userId,
          bookId: booking.bookId,
          bookingId: booking.id,
          borrowDate: now,
          dueDate,
        },
        include: {
          user: { select: { id: true, name: true } },
          book: { select: { id: true, title: true } },
        },
      }),
    ])

    return { transaction, dueDate }
  })

  if ('error' in result) {
    const status = result.error === 'Booking sudah tidak aktif' ? 400 : 500
    return Response.json({ error: result.error }, { status })
  }

  await notifyUser(booking.userId, 'Peminjaman Berhasil', `"${booking.book.title}" berhasil dipinjam. Kembalikan sebelum ${result.dueDate.toLocaleDateString('id-ID')}.`)
  await notifyAdmins('Transaksi Baru', `Booking ${bookingCode} dikonfirmasi, "${booking.book.title}" dipinjam oleh ${result.transaction.user.name}.`)

  return Response.json({ transaction: result.transaction }, { status: 201 })
})
