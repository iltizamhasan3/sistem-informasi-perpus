import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const PATCH = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { rentalId, page } = await req.json()
  if (!rentalId || !page) return Response.json({ error: 'rentalId dan page wajib diisi' }, { status: 400 })

  const rental = await prisma.ebookRental.findUnique({ where: { id: Number(rentalId) } })
  if (!rental) return Response.json({ error: 'Sewa tidak ditemukan' }, { status: 404 })
  if (rental.userId !== ctx.user.id) return Response.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.ebookRental.update({
    where: { id: rental.id },
    data: { currentPage: Number(page) },
  })

  return Response.json({ ok: true })
})
