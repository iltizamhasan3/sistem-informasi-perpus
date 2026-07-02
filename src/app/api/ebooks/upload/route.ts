import { withSupabaseRoute } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'File tidak ditemukan' }, { status: 400 })
  if (file.type !== 'application/pdf') return Response.json({ error: 'Hanya file PDF yang diizinkan' }, { status: 400 })

  const fileName = `ebooks/${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`

  const supabase = getSupabaseAdmin()

  const { error } = await supabase.storage.from('ebooks').upload(fileName, file, {
    contentType: 'application/pdf',
    upsert: false,
  })
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ path: fileName })
})
