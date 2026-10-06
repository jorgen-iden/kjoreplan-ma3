/**
 * Minimal client for the Upstash Redis REST API, with plain fetch so we need no extra dependency.
 * Vercel's Upstash/KV marketplace integration sets KV_REST_API_URL and KV_REST_API_TOKEN; a
 * database created directly at Upstash uses the UPSTASH_REDIS_REST_* names. Both are accepted.
 */

export interface RedisConfig {
  url: string;
  token: string;
}

export type RedisCommand = (string | number)[];
export type RedisReply = { result?: unknown; error?: string };

/** The configured database, or null when none is set up (local dev, previews). */
export function redisConfig(env: Record<string, string | undefined> = process.env): RedisConfig | null {
  const url = env.KV_REST_API_URL ?? env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN ?? env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null;
}

/**
 * Sends several commands in one round trip (POST /pipeline). They are not atomic, which is fine
 * for counters. Throws on network errors or a non-2xx reply; callers decide whether that matters.
 */
export async function redisPipeline(config: RedisConfig, commands: RedisCommand[], timeoutMs = 3000): Promise<RedisReply[]> {
  const res = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`Redis pipeline failed: HTTP ${res.status}`);
  return (await res.json()) as RedisReply[];
}
