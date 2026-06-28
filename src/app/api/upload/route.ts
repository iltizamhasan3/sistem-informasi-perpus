import { withSupabaseRoute } from '@/lib/supabase-server'

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'File tidak ditemukan' }, { status: 400 })

  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = (await import('@supabase/supabase-js')).createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: bucket } = await supabase.storage.getBucket('covers')
  if (!bucket) {
    await supabase.storage.createBucket('covers', { public: true })
  }

  const { error } = await supabase.storage.from('covers').upload(fileName, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: publicUrl } = supabase.storage.from('covers').getPublicUrl(fileName)
  return Response.json({ url: publicUrl.publicUrl })
})
