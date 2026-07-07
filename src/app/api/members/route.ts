import { prisma } from '@/lib/prisma'
import { withSupabaseRoute } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { notifyUser } from '@/lib/notifications'
import type { Prisma } from '@/generated/prisma/client'

export const GET = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = searchParams.get('page')

  const where: Prisma.UserWhereInput = { role: 'member', deletedAt: null }
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
    return Response.json({ members, meta: { page: Number(page), total, totalPages: Math.ceil(total / limit) } })
  }

  const members = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true, _count: { select: { transactions: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json({ members })
})

export const POST = withSupabaseRoute({ auth: 'user' }, async (req, ctx) => {
  if (!ctx.user || ctx.user.role !== 'admin') return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const { name, email, password, phone, address } = await req.json()
  if (!name || !email || !password) return Response.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return Response.json({ error: 'Email sudah terdaftar' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (authError) return Response.json({ error: authError.message }, { status: 400 })

  try {
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    const member = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'member', phone, address },
      select: { id: true, name: true, email: true, role: true, phone: true, address: true },
    })

    await notifyUser(member.id, 'Akun Dibuat', `Akun perpustakaanmu telah dibuat oleh admin. Silakan login dengan email ${member.email}.`)

    return Response.json({ member }, { status: 201 })
  } catch (dbError) {
    if (authData?.user?.id) {
      await supabase.auth.admin.deleteUser(authData.user.id).catch((err) => {
        console.error('Failed to rollback Supabase user during member creation:', err)
      })
    }
    throw dbError
  }
})
