import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { createSupabaseContext } from '@supabase/server'

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null

    const req = new Request('http://localhost', {
      headers: { authorization: `Bearer ${token}` },
    })

    const { data: ctx, error } = await createSupabaseContext(req, { auth: 'user' })
    if (error || !ctx?.userClaims?.email) return null

    const user = await prisma.user.findUnique({
      where: { email: ctx.userClaims.email },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })

    return user
  } catch (e) {
    console.error('getCurrentUser error:', e)
    return null
  }
}
