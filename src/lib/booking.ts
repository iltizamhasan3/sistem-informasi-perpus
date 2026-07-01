import { prisma } from '@/lib/prisma'

async function generateBookingCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = ''
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
    const existing = await prisma.booking.findUnique({ where: { code } })
    if (!existing) return code
  }
  throw new Error('Gagal menghasilkan kode booking')
}

async function expireExpiredBookings(): Promise<number> {
  const expired = await prisma.booking.findMany({
    where: { status: 'active', expiresAt: { lt: new Date() } },
  })
  if (expired.length === 0) return 0

  await prisma.$transaction(
    expired.map((b) => [
      prisma.booking.update({ where: { id: b.id }, data: { status: 'expired' } }),
      prisma.book.update({ where: { id: b.bookId }, data: { stock: { increment: 1 } } }),
    ]).flat()
  )
  return expired.length
}

export { generateBookingCode, expireExpiredBookings }
