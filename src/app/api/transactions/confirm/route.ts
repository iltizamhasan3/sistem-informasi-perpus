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

  const bookings = await prisma.booking.findMany({
    where: { code: bookingCode },
    include: { book: { select: { title: true } }, user: { select: { id: true, name: true } } },
  })

  if (bookings.length === 0) {
    return Response.json({ error: 'Kode booking tidak ditemukan' }, { status: 404 })
  }

  const activeBookings = bookings.filter(b => b.status === 'active' && b.expiresAt >= new Date())
  
  if (activeBookings.length === 0) {
    // Determine the error from the first booking found
    const b = bookings[0]
    if (b.status === 'expired' || b.expiresAt < new Date()) {
       if (b.status !== 'expired') {
          await prisma.booking.update({ where: { id: b.id }, data: { status: 'expired' } })
          await prisma.book.update({ where: { id: b.bookId }, data: { stock: { increment: 1 } } })
       }
       return Response.json({ error: 'Booking sudah expired' }, { status: 400 })
    }
    if (b.status === 'completed') return Response.json({ error: 'Booking sudah digunakan' }, { status: 400 })
    return Response.json({ error: `Booking sudah ${b.status}` }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const activeIds = activeBookings.map(b => b.id)
    
    const { count } = await tx.booking.updateMany({
      where: { id: { in: activeIds }, status: 'active' },
      data: { status: 'completed' },
    })
    
    if (count !== activeBookings.length) return { error: 'Gagal mengkonfirmasi sebagian booking' }

    const now = new Date()
    const dueDate = new Date(now.getTime() + BORROW_DURATION_DAYS * 24 * 60 * 60 * 1000)

    const transactions = await Promise.all(
      activeBookings.map(b => 
        tx.transaction.create({
          data: {
            userId: b.userId,
            bookId: b.bookId,
            bookingId: b.id,
            borrowDate: now,
            dueDate,
          },
          include: {
            user: { select: { id: true, name: true } },
            book: { select: { id: true, title: true } },
          },
        })
      )
    )

    return { transactions, dueDate }
  })

  if ('error' in result) {
    return Response.json({ error: result.error }, { status: 500 })
  }

  const user = activeBookings[0].user
  const bookTitles = activeBookings.map(b => b.book.title).join(', ')
  
  await notifyUser(user.id, 'Peminjaman Berhasil', `${activeBookings.length} buku (${bookTitles}) berhasil dipinjam. Kembalikan sebelum ${result.dueDate.toLocaleDateString('id-ID')}.`)
  await notifyAdmins('Transaksi Baru', `Booking ${bookingCode} dikonfirmasi, ${activeBookings.length} buku dipinjam oleh ${user.name}.`)

  return Response.json({ transactions: result.transactions }, { status: 201 })
})
