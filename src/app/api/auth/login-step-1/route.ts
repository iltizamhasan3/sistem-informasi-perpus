import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { allowed } = checkRateLimit(ip)
    if (!allowed) return Response.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 })

    const { email, password } = await req.json()
    if (!email || !password) return Response.json({ error: 'Email dan password wajib diisi' }, { status: 400 })

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return Response.json({ error: 'Hanya email @gmail.com yang diizinkan' }, { status: 400 })
    }

    const supabase = (await import('@supabase/supabase-js')).createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    )

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) return Response.json({ error: 'Email atau password salah' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return Response.json({ error: 'User tidak ditemukan' }, { status: 404 })
    if (!user.isActive) return Response.json({ error: 'Akun Anda telah dinonaktifkan' }, { status: 403 })

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Save to DB
    await prisma.otp.upsert({
      where: { email },
      update: {
        code: otp,
        accessToken: authData.session!.access_token,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
      },
      create: {
        email,
        code: otp,
        accessToken: authData.session!.access_token,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      }
    })

    // Send via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'SiPustaka <onboarding@resend.dev>',
        to: email,
        subject: 'Kode OTP Login SiPustaka',
        html: `<p>Kode OTP Anda adalah: <strong>${otp}</strong></p><p>Kode ini berlaku selama 5 menit.</p>`
      })
    } else {
      // For development if no API key is provided
      console.log('OTP for', email, 'is', otp)
    }

    return Response.json({
      message: 'OTP telah dikirim ke email Anda',
      requireOtp: true
    })
  } catch (err) {
    console.error('Login step 1 error:', err)
    return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
