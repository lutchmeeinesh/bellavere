/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * ⚠️ In-memory limits are PER SERVER INSTANCE. On Vercel (serverless), each
 * lambda instance keeps its own Map, instances are recycled at will, and a
 * burst of requests can be spread across many instances — so this only
 * offers best-effort protection. For production, use a shared store such as
 * Upstash Redis with `@upstash/ratelimit`, keeping the same call signature:
 *
 *   const ratelimit = new Ratelimit({
 *     redis: Redis.fromEnv(),
 *     limiter: Ratelimit.slidingWindow(5, "10 m"),
 *   });
 *   const { success, reset } = await ratelimit.limit(key);
 */

type RateLimitOptions = {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /**
   * false = only check whether the key is currently blocked, without
   * recording a hit (e.g. to count failed logins only). Defaults to true.
   */
  consume?: boolean;
};

type RateLimitResult = {
  ok: boolean;
  /** Seconds until the next request would be allowed (0 when ok). */
  retryAfter: number;
};

const hits = new Map<string, number[]>();

/** Drop stale keys occasionally so the Map cannot grow without bound. */
const MAX_KEYS = 5000;

export function rateLimit(
  key: string,
  { limit, windowMs, consume = true }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= limit) {
    hits.set(key, recent);
    const retryAfter = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
    return { ok: false, retryAfter };
  }

  if (!consume) return { ok: true, retryAfter: 0 };

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_KEYS) {
    for (const [k, times] of hits) {
      if (times.every((t) => t <= windowStart)) hits.delete(k);
    }
  }

  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client IP: first entry of x-forwarded-for, then x-real-ip,
 * then "unknown" (all unknown clients then share one bucket).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}
