import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  if (!email || !password) {
    return Response.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  // Fetch user role from prisma
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true, id: true, name: true, email: true }
  })

  if (!user) {
    return Response.json({ error: 'Pengguna tidak ditemukan di database' }, { status: 404 })
  }

  return Response.json({ message: 'Login berhasil', user }, { status: 200 })
}
