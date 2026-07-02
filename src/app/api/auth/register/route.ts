import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { notifyAdmins } from '@/lib/notifications'
import { checkRateLimit } from '@/lib/rate-limit'

export const POST = withSupabaseRoute({ auth: 'none' }, async (req) => {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed } = checkRateLimit(ip)
  if (!allowed) return Response.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 })

  const { name, email, password, phone, address } = await req.json()
  if (!name || !email || !password) return Response.json({ error: 'Semua field wajib diisi' }, { status: 400 })
  if (password.length < 6) return Response.json({ error: 'Password minimal 6 karakter' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return Response.json({ error: 'Email sudah terdaftar' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authError) return Response.json({ error: authError.message }, { status: 400 })

  try {
    const user = await prisma.user.create({
      data: { name, email, role: 'member', phone: phone || null, address: address || null },
      select: { id: true, name: true, email: true, role: true },
    })

    await notifyAdmins('Pendaftaran Baru', `${user.name} (${user.email}) mendaftar sebagai anggota.`)

    return Response.json({ message: 'Registrasi berhasil', user }, { status: 201 })
  } catch (dbError) {
    if (authData?.user?.id) {
      await supabase.auth.admin.deleteUser(authData.user.id).catch((err) => {
        console.error('Failed to rollback Supabase user during registration:', err)
      })
    }
    throw dbError
  }
})
