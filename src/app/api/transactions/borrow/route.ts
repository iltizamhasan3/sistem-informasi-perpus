import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { BORROW_DURATION_DAYS, MAX_BORROW } from '@/lib/utils'
import { notifyUser, notifyAdmins } from '@/lib/notifications'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.user.role !== 'admin') {
    return Response.json({ error: 'Hanya admin yang dapat memproses peminjaman langsung' }, { status: 403 })
  }

  const { bookId, memberId } = await req.json()
  const targetUserId = memberId || ctx.user.id

  const result = await prisma.$transaction(async (tx) => {
    const userDb = await tx.user.findUnique({ where: { id: targetUserId } })
    if (!userDb || !userDb.isActive) return { error: 'Anggota tidak aktif' }

    const borrowedCount = await tx.transaction.count({
      where: { userId: targetUserId, status: 'borrowed' },
    })
    const bookingCount = await tx.booking.count({
      where: { userId: targetUserId, status: 'active' },
    })
    if (borrowedCount + bookingCount >= MAX_BORROW) {
      return { error: `Anggota sudah mencapai batas maksimal ${MAX_BORROW} buku (booking + pinjaman)` }
    }

    const { count } = await tx.book.updateMany({
      where: { id: Number(bookId), stock: { gt: 0 } },
      data: { stock: { decrement: 1 } },
    })
    if (count === 0) return { error: 'Stok buku habis' }

    const [transaction] = await Promise.all([
      tx.transaction.create({
        data: {
          userId: targetUserId,
          bookId: Number(bookId),
          dueDate: new Date(Date.now() + BORROW_DURATION_DAYS * 24 * 60 * 60 * 1000),
        },
        include: {
          user: { select: { id: true, name: true } },
          book: { select: { id: true, title: true } },
        },
      }),
    ])

    return { transaction }
  })

  if ('error' in result) {
    return Response.json({ error: result.error }, { status: 400 })
  }

  await notifyUser(targetUserId, 'Peminjaman Buku', `Kamu meminjam "${result.transaction.book.title}". Kembalikan sebelum ${result.transaction.dueDate.toLocaleDateString('id-ID')}.`)
  await notifyAdmins('Peminjaman Baru', `${result.transaction.user.name} meminjam "${result.transaction.book.title}".`)

  return Response.json({ transaction: result.transaction }, { status: 201 })
})
