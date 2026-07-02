import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const DELETE = withSupabaseRoute<{ id: string }>({ auth: 'user' }, async (_req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await ctx.params
  const bookCount = await prisma.book.count({ where: { categoryId: Number(id) } })
  if (bookCount > 0) return Response.json({ error: 'Kategori masih memiliki buku (termasuk buku terarsip/soft-deleted)' }, { status: 400 })

  await prisma.category.delete({ where: { id: Number(id) } })
  return Response.json({ message: 'Kategori berhasil dihapus' })
})
