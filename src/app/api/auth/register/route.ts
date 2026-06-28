import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const POST = withSupabaseRoute({ auth: 'none' }, async (req) => {
  const { name, email, password } = await req.json()
  if (!name || !email || !password) return Response.json({ error: 'Semua field wajib diisi' }, { status: 400 })
  if (password.length < 6) return Response.json({ error: 'Password minimal 6 karakter' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return Response.json({ error: 'Email sudah terdaftar' }, { status: 400 })

  const supabase = (await import('@supabase/supabase-js')).createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authError) return Response.json({ error: authError.message }, { status: 400 })

  const user = await prisma.user.create({
    data: { name, email, password: '', role: 'member' },
    select: { id: true, name: true, email: true, role: true },
  })

  return Response.json({ message: 'Registrasi berhasil', user }, { status: 201 })
})
