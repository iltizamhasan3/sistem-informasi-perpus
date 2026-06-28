import { cookies } from 'next/headers'
import { withSupabaseRoute } from '@/lib/supabase-server'

export const POST = withSupabaseRoute({ auth: 'none' }, async () => {
  const cookieStore = await cookies()
  cookieStore.set('token', '', { httpOnly: true, maxAge: 0, path: '/' })
  return Response.json({ message: 'Logout berhasil' })
})
