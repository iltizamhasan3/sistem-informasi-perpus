import { withSupabaseRoute } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'File tidak ditemukan' }, { status: 400 })
  if (!file.type.startsWith('image/')) {
    return Response.json({ error: 'Hanya file gambar yang diizinkan' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = getSupabaseAdmin()

  const { error } = await supabase.storage.from('covers').upload(fileName, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: publicUrl } = supabase.storage.from('covers').getPublicUrl(fileName)
  return Response.json({ url: publicUrl.publicUrl })
})
