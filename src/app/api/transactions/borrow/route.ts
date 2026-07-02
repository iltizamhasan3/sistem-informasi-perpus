import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { BORROW_DURATION_DAYS } from '@/lib/utils'
import { notifyUser, notifyAdmins } from '@/lib/notifications'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { bookId, memberId } = await req.json()
  const targetUserId = memberId || ctx.user.id

  const book = await prisma.book.findUnique({ where: { id: Number(bookId) } })
  if (!book) return Response.json({ error: 'Buku tidak ditemukan' }, { status: 404 })
  if (book.stock < 1) return Response.json({ error: 'Stok buku habis' }, { status: 400 })

  const activeCount = await prisma.transaction.count({
    where: { userId: targetUserId, status: 'borrowed' },
  })
  if (activeCount >= 3) return Response.json({ error: 'Anggota sudah meminjam maksimal 3 buku' }, { status: 400 })

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
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
    prisma.book.update({
      where: { id: Number(bookId) },
      data: { stock: { decrement: 1 } },
    }),
  ])

  await notifyUser(targetUserId, 'Peminjaman Buku', `Kamu meminjam "${transaction.book.title}". Kembalikan sebelum ${transaction.dueDate.toLocaleDateString('id-ID')}.`)
  await notifyAdmins('Peminjaman Baru', `${transaction.user.name} meminjam "${transaction.book.title}".`)

  return Response.json({ transaction }, { status: 201 })
})
