import { prisma } from '@/lib/prisma'
import { calculateFine } from '@/lib/utils'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { notifyUser, notifyAdmins } from '@/lib/notifications'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { transactionId } = await req.json()

  const transaction = await prisma.transaction.findUnique({
    where: { id: Number(transactionId) },
    include: { book: true },
  })
  if (!transaction) return Response.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
  if (transaction.status === 'returned') return Response.json({ error: 'Buku sudah dikembalikan' }, { status: 400 })
  if (ctx.user.role === 'member' && transaction.userId !== ctx.user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const now = new Date()
  const fine = calculateFine(transaction.dueDate, now)

  const [updated] = await prisma.$transaction([
    prisma.transaction.update({
      where: { id: Number(transactionId) },
      data: { returnDate: now, fine, status: fine > 0 ? 'overdue' : 'returned' },
      include: {
        user: { select: { id: true, name: true } },
        book: { select: { id: true, title: true } },
      },
    }),
    prisma.book.update({
      where: { id: transaction.bookId },
      data: { stock: { increment: 1 } },
    }),
  ])

  const fineMsg = fine > 0 ? ` dengan denda Rp ${fine.toLocaleString('id-ID')}` : ''
  await notifyUser(transaction.userId, 'Pengembalian Buku', `Buku "${updated.book.title}" berhasil dikembalikan${fineMsg}.`)
  await notifyAdmins('Pengembalian Buku', `${updated.user.name} mengembalikan "${updated.book.title}"${fineMsg}.`)

  return Response.json({ transaction: updated })
})
