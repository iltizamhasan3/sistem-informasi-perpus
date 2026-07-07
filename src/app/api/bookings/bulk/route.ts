import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { generateBookingCode } from '@/lib/booking'
import { notifyUser } from '@/lib/notifications'
import { MAX_BORROW } from '@/lib/utils'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = ctx.user.id
  const { bookIds } = await req.json()
  
  if (!Array.isArray(bookIds) || bookIds.length === 0) {
    return Response.json({ error: 'Tidak ada buku yang dipilih' }, { status: 400 })
  }
  
  if (bookIds.length > MAX_BORROW) {
    return Response.json({ error: `Maksimal meminjam ${MAX_BORROW} buku sekaligus` }, { status: 400 })
  }

  const baseCode = await generateBookingCode()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const result = await prisma.$transaction(async (tx) => {
    const userDb = await tx.user.findUnique({ where: { id: userId } })
    if (!userDb || !userDb.isActive) return { error: 'Akun kamu tidak aktif', status: 403 }

    // Check existing active bookings + borrowed
    const activeCount = await tx.booking.count({
      where: { userId, status: 'active' },
    })
    const borrowedCount = await tx.transaction.count({
      where: { userId, status: 'borrowed' },
    })
    
    if (activeCount + borrowedCount + bookIds.length > MAX_BORROW) {
      return { error: `Batas maksimal ${MAX_BORROW} buku. Kamu sudah memiliki ${activeCount + borrowedCount} buku aktif.`, status: 400 }
    }

    const createdBookings = []

    for (let i = 0; i < bookIds.length; i++) {
      const bookId = Number(bookIds[i])
      
      const book = await tx.book.findUnique({ where: { id: bookId } })
      if (!book) return { error: `Buku dengan ID ${bookId} tidak ditemukan`, status: 404 }

      const existingBooking = await tx.booking.findFirst({
        where: { userId, bookId, status: 'active' },
      })
      if (existingBooking) return { error: `Kamu sudah mem-booking buku "${book.title}"`, status: 400 }

      const { count } = await tx.book.updateMany({
        where: { id: bookId, stock: { gt: 0 } },
        data: { stock: { decrement: 1 } },
      })
      if (count === 0) return { error: `Stok buku "${book.title}" habis`, status: 400 }

      const booking = await tx.booking.create({
        data: { code: baseCode, userId, bookId, expiresAt },
        include: { book: { select: { title: true } } }
      })
      
      createdBookings.push(booking)
    }

    return { bookings: createdBookings }
  })

  if ('error' in result) {
    return Response.json({ error: result.error }, { status: result.status })
  }

  const bookTitles = result.bookings.map(b => b.book.title).join(', ')

  await notifyUser(
    ctx.user.id, 
    'Booking Berhasil', 
    `Kode booking "${baseCode}" untuk ${result.bookings.length} buku (${bookTitles}). Segera ambil di perpustakaan.`
  )

  return Response.json({ bookingCode: baseCode }, { status: 201 })
})
