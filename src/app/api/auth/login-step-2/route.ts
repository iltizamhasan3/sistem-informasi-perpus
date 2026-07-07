import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { allowed } = checkRateLimit(ip)
    if (!allowed) return Response.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 })

    const { email, otp } = await req.json()
    if (!email || !otp) return Response.json({ error: 'Email dan OTP wajib diisi' }, { status: 400 })

    const otpRecord = await prisma.otp.findUnique({ where: { email } })
    
    if (!otpRecord) return Response.json({ error: 'OTP tidak valid atau tidak ditemukan' }, { status: 400 })
    if (otpRecord.code !== otp) return Response.json({ error: 'OTP salah' }, { status: 400 })
    if (new Date() > otpRecord.expiresAt) return Response.json({ error: 'OTP telah kadaluarsa' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return Response.json({ error: 'User tidak ditemukan' }, { status: 404 })

    const cookieStore = await cookies()
    cookieStore.set('token', otpRecord.accessToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    // Remove OTP record since it has been used
    await prisma.otp.delete({ where: { id: otpRecord.id } })

    return Response.json({
      message: 'Login berhasil',
      session: { access_token: otpRecord.accessToken },
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('Login step 2 error:', err)
    return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
