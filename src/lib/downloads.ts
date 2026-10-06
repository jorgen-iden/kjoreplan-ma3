import { z } from 'zod';
import { routing } from '@/i18n/routing';
import { MA_VERSIONS } from '@/lib/config/versions';
import { redisConfig, redisPipeline, type RedisCommand } from '@/lib/redis';

/*
 * Download log: one counter bump per macro ZIP downloaded in the browser.
 *
 * PRIVACY: "Run sheets never leave the machine" (docs/brand.md, «Påstander»). The log may only hold
 * the time, the number of cues, the grandMA3 version label and the UI locale. Never names, notes,
 * titles, file names, IP addresses (not even hashed) or user agents. Don't add fields here without
 * updating that claim and the README section «Nedlastingslogg».
 */

/** Largest request body we read. A valid event is well under 100 bytes. */
export const MAX_EVENT_BYTES = 512;
/** How many raw log lines are kept (newest first). */
export const LOG_LENGTH = 5000;

export const KEYS = {
  total: 'downloads:total',
  day: (day: string) => `downloads:day:${day}`,
  version: (id: string) => `downloads:version:${id}`,
  locale: (locale: string) => `downloads:locale:${locale}`,
  log: 'downloads:log',
} as const;

const VERSION_LABELS = MA_VERSIONS.map((v) => v.label) as [string, ...string[]];

export const downloadEventSchema = z
  .object({
    cues: z.number().int().min(1).max(5000),
    version: z.enum(VERSION_LABELS),
    locale: z.enum(routing.locales),
  })
  .strict();

export type DownloadEvent = z.infer<typeof downloadEventSchema>;

/** Parses a raw request body. Returns null for anything oversized, malformed or unexpected. */
export function parseDownloadEvent(raw: string): DownloadEvent | null {
  if (raw.length > MAX_EVENT_BYTES) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = downloadEventSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

/** Calendar day in Norway (the owner reads the numbers there), as YYYY-MM-DD. */
export function dayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** The Redis commands that record one download. */
export function downloadCommands(event: DownloadEvent, now: Date): RedisCommand[] {
  const versionId = MA_VERSIONS.find((v) => v.label === event.version)?.id ?? 'unknown';
  // Only these four fields, by construction: nothing else from the request is copied.
  const line = JSON.stringify({ t: now.toISOString(), cues: event.cues, version: event.version, locale: event.locale });
  return [
    ['INCR', KEYS.total],
    ['INCR', KEYS.day(dayKey(now))],
    ['INCR', KEYS.version(versionId)],
    ['INCR', KEYS.locale(event.locale)],
    ['LPUSH', KEYS.log, line],
    ['LTRIM', KEYS.log, 0, LOG_LENGTH - 1],
  ];
}

/**
 * Records a download. A silent no-op without a configured database, and never throws: logging
 * must not break or slow down anything for the user.
 */
export async function recordDownload(event: DownloadEvent, now = new Date(), env: Record<string, string | undefined> = process.env): Promise<boolean> {
  const config = redisConfig(env);
  if (!config) return false;
  try {
    await redisPipeline(config, downloadCommands(event, now));
    return true;
  } catch (err) {
    // Only the error, never the event.
    console.error('Download log: could not write to Redis', err instanceof Error ? err.message : err);
    return false;
  }
}

/** Whether a request's Origin header is our own site (CSRF-style abuse filter, not authentication). */
export function isAllowedOrigin(origin: string | null, siteUrl: string): boolean {
  if (!origin) return false;
  try {
    const site = new URL(siteUrl);
    const o = new URL(origin);
    if (o.protocol !== site.protocol) return false;
    const bare = site.hostname.replace(/^www\./, '');
    return o.host === site.host || o.hostname === bare || o.hostname === `www.${bare}`;
  } catch {
    return false;
  }
}

export interface DownloadStats {
  total: number;
  days: { day: string; count: number }[];
  versions: { label: string; count: number }[];
  locales: { locale: string; count: number }[];
  latest: { t: string; cues: number; version: string; locale: string }[];
}

const toNumber = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? Number(v) || 0 : 0);

/** Reads totals, the last `dayCount` days (oldest first) and the newest `logCount` log lines. */
export async function readDownloadStats(config: NonNullable<ReturnType<typeof redisConfig>>, now = new Date(), dayCount = 30, logCount = 50): Promise<DownloadStats> {
  const days = Array.from({ length: dayCount }, (_, i) => dayKey(new Date(now.getTime() - (dayCount - 1 - i) * 86_400_000)));
  const replies = await redisPipeline(config, [
    ['GET', KEYS.total],
    ['MGET', ...days.map(KEYS.day)],
    ['MGET', ...MA_VERSIONS.map((v) => KEYS.version(v.id))],
    ['MGET', ...routing.locales.map(KEYS.locale)],
    ['LRANGE', KEYS.log, 0, logCount - 1],
  ]);
  const failed = replies.find((r) => r.error);
  if (failed) throw new Error(`Redis error: ${failed.error}`);
  const list = (i: number) => (Array.isArray(replies[i]?.result) ? (replies[i].result as unknown[]) : []);
  return {
    total: toNumber(replies[0]?.result),
    days: days.map((day, i) => ({ day, count: toNumber(list(1)[i]) })),
    versions: MA_VERSIONS.map((v, i) => ({ label: v.label, count: toNumber(list(2)[i]) })),
    locales: routing.locales.map((locale, i) => ({ locale, count: toNumber(list(3)[i]) })),
    latest: list(4).flatMap((raw) => {
      try {
        const e = JSON.parse(String(raw)) as DownloadStats['latest'][number];
        return [{ t: String(e.t), cues: toNumber(e.cues), version: String(e.version), locale: String(e.locale) }];
      } catch {
        return [];
      }
    }),
  };
}
