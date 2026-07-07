import { withSupabaseRoute } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { fileName, contentType } = await req.json()
  if (!fileName) return Response.json({ error: 'Nama file tidak ditemukan' }, { status: 400 })
  if (contentType !== 'application/pdf') return Response.json({ error: 'Hanya file PDF yang diizinkan' }, { status: 400 })

  const path = `ebooks/${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`

  const supabase = getSupabaseAdmin()

  // Generate signed upload URL valid for 1 hour
  const { data, error } = await supabase.storage.from('ebooks').createSignedUploadUrl(path)
  
  if (error || !data) return Response.json({ error: error?.message || 'Gagal membuat signed URL' }, { status: 500 })

  return Response.json({ 
    path, 
    uploadUrl: data.signedUrl 
  })
})
