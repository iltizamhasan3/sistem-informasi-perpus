import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const POST = withSupabaseRoute({ auth: 'none' }, async (req) => {
  const { email, password } = await req.json()
  if (!email || !password) return Response.json({ error: 'Email dan password wajib diisi' }, { status: 400 })

  const supabase = (await import('@supabase/supabase-js')).createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
  )

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError) return Response.json({ error: 'Email atau password salah' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return Response.json({ error: 'User tidak ditemukan' }, { status: 404 })
  if (!user.isActive) return Response.json({ error: 'Akun Anda telah dinonaktifkan' }, { status: 403 })

  const cookieStore = await cookies()
  cookieStore.set('token', authData.session!.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return Response.json({
    message: 'Login berhasil',
    session: { access_token: authData.session!.access_token },
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
})
