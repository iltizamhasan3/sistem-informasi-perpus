import { prisma } from '@/lib/prisma'

export async function notifyUser(userId: number, title: string, message: string, type = 'in-app') {
  await prisma.notification.create({ data: { userId, title, message, type } })
}

export async function notifyAdmins(title: string, message: string, type = 'in-app') {
  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } })
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({ userId: a.id, title, message, type })),
    })
  }
}
