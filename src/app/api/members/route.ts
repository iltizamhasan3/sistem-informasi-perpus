import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { notifyUser } from '@/lib/notifications'
import type { Prisma } from '@/generated/prisma'

export const GET = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = searchParams.get('page')

  const where: Prisma.UserWhereInput = { role: 'member' }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (page) {
    const limit = 20
    const skip = (Number(page) - 1) * limit
    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true, _count: { select: { transactions: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])
    return Response.json({ members, meta: { page: Number(page), total, totalPages: Math.ceil(total / limit) } }, { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=120' } })
  }

  const members = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true, _count: { select: { transactions: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json({ members }, { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=120' } })
})

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { name, email, password, phone, address } = await req.json()
  if (!name || !email || !password) return Response.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return Response.json({ error: 'Email sudah terdaftar' }, { status: 400 })

  const supabase = (await import('@supabase/supabase-js')).createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { error: authError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (authError) return Response.json({ error: authError.message }, { status: 400 })

  const member = await prisma.user.create({
    data: { name, email, password: '', role: 'member', phone, address },
    select: { id: true, name: true, email: true, role: true, phone: true, address: true },
  })

  await notifyUser(member.id, 'Akun Dibuat', `Akun perpustakaanmu telah dibuat oleh admin. Silakan login dengan email ${member.email}.`)

  return Response.json({ member }, { status: 201 })
})
