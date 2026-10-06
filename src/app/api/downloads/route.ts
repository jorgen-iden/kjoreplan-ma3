import { isAllowedOrigin, MAX_EVENT_BYTES, parseDownloadEvent, recordDownload } from '@/lib/downloads';
import { SITE_URL } from '@/lib/site';

// POST /api/downloads: counts one macro ZIP download (sent with sendBeacon from the export step).
// The body is only {cues, version, locale}; see the privacy note in src/lib/downloads.ts. Nothing
// about the request itself (IP address, user agent, referrer) is read or stored.
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  // Other sites may not post here. Not authentication, just a cheap filter against casual abuse.
  if (process.env.NODE_ENV === 'production' && !isAllowedOrigin(request.headers.get('origin'), SITE_URL)) {
    return new Response(null, { status: 403 });
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_EVENT_BYTES) {
    return new Response(null, { status: 413 });
  }
  const raw = await request.text();
  if (raw.length > MAX_EVENT_BYTES) return new Response(null, { status: 413 });

  const event = parseDownloadEvent(raw);
  if (!event) return new Response(null, { status: 400 });

  // No-op without a database; never fails the request on storage errors.
  await recordDownload(event);
  return new Response(null, { status: 204 });
}
