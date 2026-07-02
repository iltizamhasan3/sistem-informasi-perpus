import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const GET = withSupabaseRoute<{ rentalId: string }>({ auth: 'user' }, async (_req, ctx) => {
  if (!ctx.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { rentalId } = await ctx.params
  const rental = await prisma.ebookRental.findUnique({
    where: { id: Number(rentalId) },
    include: { book: { select: { ebookFile: true } } },
  })
  if (!rental) return Response.json({ error: 'Sewa tidak ditemukan' }, { status: 404 })
  if (rental.userId !== ctx.user.id) return Response.json({ error: 'Unauthorized' }, { status: 403 })
  if (rental.status !== 'active') return Response.json({ error: 'Sewa sudah tidak aktif' }, { status: 410 })
  if (rental.expiresAt < new Date()) {
    await prisma.ebookRental.update({ where: { id: rental.id }, data: { status: 'expired' } })
    return Response.json({ error: 'Sewa sudah expired' }, { status: 410 })
  }
  if (!rental.book.ebookFile) return Response.json({ error: 'File e-book tidak ditemukan' }, { status: 404 })

  const supabase = getSupabaseAdmin()

  const { data: signedUrl, error } = await supabase.storage
    .from('ebooks')
    .createSignedUrl(rental.book.ebookFile, 300)
  if (error || !signedUrl) return Response.json({ error: error?.message || 'Gagal mengambil file e-book' }, { status: 500 })

  return Response.json({ url: signedUrl.signedUrl })
})
