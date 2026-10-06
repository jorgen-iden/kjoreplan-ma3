import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../src/app/api/downloads/route';
import { dayKey, downloadCommands, isAllowedOrigin, MAX_EVENT_BYTES, parseDownloadEvent, readDownloadStats, recordDownload } from '../src/lib/downloads';
import { redisConfig } from '../src/lib/redis';

const good = { cues: 24, version: 'grandMA3 2.5', locale: 'no' };
const KV = { KV_REST_API_URL: 'https://example.upstash.io/', KV_REST_API_TOKEN: 'secret' };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(new Request('http://localhost/api/downloads', { method: 'POST', body, headers: { 'Content-Type': 'application/json', ...headers } }));

describe('download event validation', () => {
  it('accepts a good event', () => {
    expect(parseDownloadEvent(JSON.stringify(good))).toEqual(good);
    expect(parseDownloadEvent(JSON.stringify({ cues: 1, version: 'grandMA3 1.9', locale: 'en' }))).not.toBeNull();
    expect(parseDownloadEvent(JSON.stringify({ cues: 5000, version: 'grandMA3 2.0', locale: 'de' }))).not.toBeNull();
  });

  it('rejects bad cue counts, unknown versions and locales, extra fields and junk', () => {
    for (const cues of [0, -1, 1.5, 5001, '24']) expect(parseDownloadEvent(JSON.stringify({ ...good, cues }))).toBeNull();
    expect(parseDownloadEvent(JSON.stringify({ ...good, version: 'grandMA2' }))).toBeNull();
    expect(parseDownloadEvent(JSON.stringify({ ...good, version: '2.5' }))).toBeNull();
    expect(parseDownloadEvent(JSON.stringify({ ...good, locale: 'sv' }))).toBeNull();
    // Anything beyond the four allowed fields is refused, so run sheet content can't sneak in.
    expect(parseDownloadEvent(JSON.stringify({ ...good, name: 'Velkommen' }))).toBeNull();
    expect(parseDownloadEvent('not json')).toBeNull();
    expect(parseDownloadEvent('null')).toBeNull();
  });

  it('rejects oversized bodies', () => {
    const padded = JSON.stringify(good) + ' '.repeat(MAX_EVENT_BYTES);
    expect(parseDownloadEvent(padded)).toBeNull();
  });
});

describe('POST /api/downloads', () => {
  it('returns 204 for a good event and is a silent no-op without a database', async () => {
    vi.stubEnv('KV_REST_API_URL', '');
    vi.stubEnv('KV_REST_API_TOKEN', '');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await post(JSON.stringify(good))).status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 for bad events and 413 for oversized ones', async () => {
    expect((await post(JSON.stringify({ ...good, version: 'x' }))).status).toBe(400);
    expect((await post('x'.repeat(MAX_EVENT_BYTES + 1))).status).toBe(413);
  });

  it('rejects other origins in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect((await post(JSON.stringify(good), { Origin: 'https://evil.example' })).status).toBe(403);
    expect((await post(JSON.stringify(good))).status).toBe(403);
  });

  it('checks origins against the site URL', () => {
    expect(isAllowedOrigin('https://cuesetter.com', 'https://cuesetter.com')).toBe(true);
    expect(isAllowedOrigin('https://www.cuesetter.com', 'https://cuesetter.com')).toBe(true);
    expect(isAllowedOrigin('http://cuesetter.com', 'https://cuesetter.com')).toBe(false);
    expect(isAllowedOrigin('https://cuesetter.com.evil.example', 'https://cuesetter.com')).toBe(false);
    expect(isAllowedOrigin(null, 'https://cuesetter.com')).toBe(false);
  });
});

describe('Redis commands', () => {
  const now = new Date('2026-10-06T22:30:00Z'); // already 7 October in Oslo

  it('reads either set of env var names, and nothing without both', () => {
    expect(redisConfig(KV)).toEqual({ url: 'https://example.upstash.io', token: 'secret' });
    expect(redisConfig({ UPSTASH_REDIS_REST_URL: 'https://u.io', UPSTASH_REDIS_REST_TOKEN: 't' })).toEqual({ url: 'https://u.io', token: 't' });
    expect(redisConfig({ KV_REST_API_URL: 'https://u.io' })).toBeNull();
    expect(redisConfig({})).toBeNull();
  });

  it('counts by day (Oslo), version and locale, and logs only the four allowed fields', () => {
    expect(dayKey(now)).toBe('2026-10-07');
    const cmds = downloadCommands({ cues: 24, version: 'grandMA3 2.5', locale: 'no' }, now);
    expect(cmds).toEqual([
      ['INCR', 'downloads:total'],
      ['INCR', 'downloads:day:2026-10-07'],
      ['INCR', 'downloads:version:2.5'],
      ['INCR', 'downloads:locale:no'],
      ['LPUSH', 'downloads:log', JSON.stringify({ t: '2026-10-06T22:30:00.000Z', cues: 24, version: 'grandMA3 2.5', locale: 'no' })],
      ['LTRIM', 'downloads:log', 0, 4999],
    ]);
    expect(Object.keys(JSON.parse(cmds[4][2] as string))).toEqual(['t', 'cues', 'version', 'locale']);
  });

  it('sends one pipeline request with the token', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([{ result: 1 }]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await recordDownload({ cues: 3, version: 'grandMA3 1.9', locale: 'de' }, now, KV)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://example.upstash.io/pipeline');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secret');
    const body = JSON.parse(init.body as string) as unknown[][];
    expect(body.map((c) => c[0])).toEqual(['INCR', 'INCR', 'INCR', 'INCR', 'LPUSH', 'LTRIM']);
    expect(body[2]).toEqual(['INCR', 'downloads:version:1.9']);
  });

  it('never throws when Redis fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('down', { status: 500 })),
    );
    expect(await recordDownload(good as never, now, KV)).toBe(false);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('offline'))),
    );
    expect(await recordDownload(good as never, now, KV)).toBe(false);
  });

  it('reads stats back into totals, days, versions, locales and log lines', async () => {
    const line = JSON.stringify({ t: '2026-10-06T10:00:00.000Z', cues: 12, version: 'grandMA3 2.5', locale: 'en' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json([{ result: '7' }, { result: [...Array(29).fill(null), '2'] }, { result: ['5', '2', null, null, null, null] }, { result: ['4', '3', null] }, { result: [line, 'broken'] }]),
      ),
    );
    const stats = await readDownloadStats(redisConfig(KV)!, now);
    expect(stats.total).toBe(7);
    expect(stats.days).toHaveLength(30);
    expect(stats.days.at(-1)).toEqual({ day: '2026-10-07', count: 2 });
    expect(stats.versions[0]).toEqual({ label: 'grandMA3 2.5', count: 5 });
    expect(stats.locales).toEqual([
      { locale: 'en', count: 4 },
      { locale: 'no', count: 3 },
      { locale: 'de', count: 0 },
    ]);
    expect(stats.latest).toEqual([{ t: '2026-10-06T10:00:00.000Z', cues: 12, version: 'grandMA3 2.5', locale: 'en' }]);
  });
});
