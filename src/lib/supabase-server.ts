import { createSupabaseContext } from '@supabase/server'
import { prisma } from './prisma'

type Config = Parameters<typeof createSupabaseContext>[1]
type Ctx = Awaited<ReturnType<typeof createSupabaseContext>>['data']
type UserRow = { id: number; name: string; email: string; role: string; isActive: boolean } | null

type NextCtx<T = {}> = { params: Promise<T> }
type ExtendedCtx<T> = NonNullable<Ctx> & { user: UserRow } & NextCtx<T>

function extractTokenFromCookie(req: Request): string | null {
  const cookie = req.headers.get('cookie')
  if (!cookie) return null
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/)
  return match ? match[1] : null
}

export function withSupabaseRoute<T extends Record<string, string> = {}>(
  config: Config,
  handler: (req: Request, ctx: ExtendedCtx<T>) => Response | Promise<Response>,
) {
  return async (req: Request, routeCtx: NextCtx<T>) => {
    const authReq = req.clone()

    let proxyReq: Request = authReq
    if (!proxyReq.headers.get('authorization')) {
      const cookieToken = extractTokenFromCookie(proxyReq)
      if (cookieToken) {
        proxyReq = new Request(proxyReq, {
          headers: { ...Object.fromEntries(proxyReq.headers), authorization: `Bearer ${cookieToken}` },
        })
      }
    }

    const { data: ctx, error } = await createSupabaseContext(proxyReq, config)
    if (error) {
      return Response.json({ message: error.message, code: error.code }, { status: error.status })
    }

    let user: UserRow = null
    if (ctx!.userClaims?.email) {
      user = await prisma.user.findUnique({
        where: { email: ctx!.userClaims.email },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      })
    }

    return handler(req, { ...ctx!, user, params: routeCtx.params })
  }
}
