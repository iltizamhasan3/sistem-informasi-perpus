import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { notifyUser } from '@/lib/notifications'

export const GET = withSupabaseRoute<{ id: string }>({ auth: 'user' }, async (_req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await ctx.params
  const member = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true, name: true, email: true, phone: true, address: true, isActive: true, role: true },
  })
  if (!member || member.role !== 'member') return Response.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })
  return Response.json({ member })
})

export const PUT = withSupabaseRoute<{ id: string }>({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await ctx.params
  const { name, email, phone, address, isActive } = await req.json()

  const prevMember = await prisma.user.findUnique({ where: { id: Number(id) }, select: { isActive: true } })

  const member = await prisma.user.update({
    where: { id: Number(id) },
    data: { name, email, phone, address, isActive },
    select: { id: true, name: true, email: true, phone: true, address: true, isActive: true },
  })

  if (prevMember && prevMember.isActive !== isActive) {
    const statusMsg = isActive ? 'diaktifkan kembali' : 'dinonaktifkan'
    await notifyUser(member.id, 'Status Akun Berubah', `Akun perpustakaanmu telah ${statusMsg} oleh admin.`)
  }

  return Response.json({ member })
})

export const DELETE = withSupabaseRoute<{ id: string }>({ auth: 'user' }, async (_req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await ctx.params
  const active = await prisma.transaction.findFirst({
    where: { userId: Number(id), status: 'borrowed' },
  })
  if (active) return Response.json({ error: 'Anggota masih memiliki peminjaman aktif' }, { status: 400 })

  await prisma.user.delete({ where: { id: Number(id) } })
  return Response.json({ message: 'Anggota berhasil dihapus' })
})
