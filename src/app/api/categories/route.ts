import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const GET = withSupabaseRoute({ auth: 'user' }, async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { books: true } } },
  })
  return Response.json({ categories }, { headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=300' } })
})

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { name } = await req.json()
  if (!name) return Response.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })

  const category = await prisma.category.create({ data: { name } })
  return Response.json({ category }, { status: 201 })
})
