import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Rate limiter para APIs de IA.
 * Limite: 10 requisições por 60 segundos por usuário.
 *
 * Requer UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN no .env.
 * Se as env vars não existirem, o rate limiting é desabilitado (dev/beta).
 */

let ratelimit: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
    prefix: 'synclife:ai',
  })
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  if (!ratelimit) {
    return { allowed: true, remaining: -1 }
  }

  const { success, remaining } = await ratelimit.limit(userId)
  return { allowed: success, remaining }
}
