import { prisma } from '@/lib/prisma'

async function generateBookingCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = ''
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
    const existing = await prisma.booking.findFirst({ where: { code } })
    if (!existing) return code
  }
  throw new Error('Gagal menghasilkan kode booking')
}

async function expireExpiredBookings(): Promise<number> {
  const expired = await prisma.booking.findMany({
    where: { status: 'active', expiresAt: { lt: new Date() } },
  })
  if (expired.length === 0) return 0

  let successCount = 0
  await prisma.$transaction(async (tx) => {
    for (const b of expired) {
      const { count } = await tx.booking.updateMany({
        where: { id: b.id, status: 'active' },
        data: { status: 'expired' },
      })
      if (count > 0) {
        successCount++
        await tx.book.update({
          where: { id: b.bookId },
          data: { stock: { increment: 1 } },
        })
      }
    }
  })
  return successCount
}

export { generateBookingCode, expireExpiredBookings }
