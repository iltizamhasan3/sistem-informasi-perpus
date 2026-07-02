import { createSupabaseContext } from '@supabase/server'
import { prisma } from './prisma'

type Config = Parameters<typeof createSupabaseContext>[1]
type Ctx = Awaited<ReturnType<typeof createSupabaseContext>>['data']
type UserRow = { id: number; name: string; email: string; role: string; isActive: boolean } | null

type NextCtx<T = Record<string, never>> = { params: Promise<T> }
type ExtendedCtx<T> = NonNullable<Ctx> & { user: UserRow } & NextCtx<T>

function extractTokenFromCookie(req: Request): string | null {
  const cookie = req.headers.get('cookie')
  if (!cookie) return null
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/)
  return match ? match[1] : null
}

function isValidOrigin(req: Request): boolean {
  if (process.env.NODE_ENV === 'development') return true
  const method = req.method
  if (method === 'GET' || method === 'HEAD') return true
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  if (!origin && !referer) return false
  const ALLOWED = process.env.ALLOWED_ORIGIN || ''
  if (!ALLOWED) return true
  const check = (url: string) => url.startsWith(ALLOWED)
  return !!(origin && check(origin)) || !!(referer && check(referer))
}

export function withSupabaseRoute<T extends Record<string, string> = Record<string, never>>(
  config: Config,
  handler: (req: Request, ctx: ExtendedCtx<T>) => Response | Promise<Response>,
) {
  return async (req: Request, routeCtx: NextCtx<T>) => {
    if (!isValidOrigin(req)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    let proxyReq: Request = req

    if (!req.headers.get('authorization')) {
      const cookieToken = extractTokenFromCookie(req)
      if (cookieToken) {
        const url = req.url
        const method = req.method
        const headers = Object.fromEntries(req.headers)
        const contentType = req.headers.get('content-type') || ''
        let body: BodyInit | undefined
        const forwardedHeaders: Record<string, string> = { ...headers, authorization: `Bearer ${cookieToken}` }
        if (contentType.includes('multipart/form-data')) {
          body = await req.formData()
          delete forwardedHeaders['content-type']
        } else if (method !== 'GET' && method !== 'HEAD') {
          body = await req.text()
        }
        proxyReq = new Request(url, {
          method,
          headers: forwardedHeaders,
          ...(body !== undefined ? { body } : {}),
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

    try {
      return await handler(proxyReq, { ...ctx!, user, params: routeCtx.params })
    } catch (e) {
      console.error('withSupabaseRoute handler error:', e)
      return Response.json({ error: e instanceof Error ? e.message : 'Internal server error' }, { status: 500 })
    }
  }
}
