const attempts = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60_000
const MAX_ATTEMPTS = 10

// Pembersihan berkala entri usang untuk mencegah memory leak
if (typeof globalThis !== 'undefined') {
  const globalAny = globalThis as unknown as { __rateLimitInterval?: ReturnType<typeof setInterval> }
  if (!globalAny.__rateLimitInterval) {
    globalAny.__rateLimitInterval = setInterval(() => {
      const now = Date.now()
      for (const [ip, entry] of attempts.entries()) {
        if (now > entry.resetAt) {
          attempts.delete(ip)
        }
      }
    }, 5 * 60 * 1000) // Setiap 5 menit
    const intervalObj = globalAny.__rateLimitInterval
    if (intervalObj && typeof intervalObj === 'object' && 'unref' in intervalObj) {
      (intervalObj as unknown as { unref: () => void }).unref()
    }
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }

  entry.count++
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count }
}
