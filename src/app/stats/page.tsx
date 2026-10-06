import { createHash, timingSafeEqual } from 'node:crypto';
import { notFound } from 'next/navigation';
import { readDownloadStats, type DownloadStats } from '@/lib/downloads';
import { redisConfig } from '@/lib/redis';

// /stats?token=…: the owner's view of the download log (README, «Nedlastingslogg»). Not linked,
// not in the sitemap, disallowed in robots.txt, and a 404 without the right STATS_TOKEN.
export const dynamic = 'force-dynamic';

/** Constant-time comparison, so the token can't be guessed from response times. */
function tokenMatches(given: string | undefined, expected: string | undefined): boolean {
  if (!given || !expected) return false;
  const hash = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(hash(given), hash(expected));
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  if (!tokenMatches(typeof token === 'string' ? token : undefined, process.env.STATS_TOKEN)) notFound();

  const config = redisConfig();
  let stats: DownloadStats | null = null;
  let failed = false;
  if (config) {
    try {
      stats = await readDownloadStats(config);
    } catch {
      failed = true;
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
      <p className="font-mono text-xs font-semibold tracking-widest text-accent uppercase">CueSetter · internal</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Macro downloads</h1>
      <p className="mt-2 text-muted">ZIP downloads from the export step. Only time, cue count, grandMA3 version and site language are logged.</p>

      {!config && (
        <Panel title="Not set up">
          <p className="text-subtle">
            No database is connected. In Vercel, add <b>Upstash Redis</b> (Storage / Marketplace, free tier) and connect it to this project. That sets <Code>KV_REST_API_URL</Code> and{' '}
            <Code>KV_REST_API_TOKEN</Code>. Redeploy, and downloads are counted from then on. See the README, «Nedlastingslogg».
          </p>
        </Panel>
      )}
      {failed && (
        <Panel title="Could not read the log">
          <p className="text-subtle">The database did not answer. Reload the page in a moment.</p>
        </Panel>
      )}
      {stats && <StatsView stats={stats} />}
    </main>
  );
}

function StatsView({ stats }: { stats: DownloadStats }) {
  const last30 = stats.days.reduce((sum, d) => sum + d.count, 0);
  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Tile label="All time" value={stats.total} />
        <Tile label="Last 30 days" value={last30} />
      </div>

      <Panel title="Last 30 days">
        <DayChart days={stats.days} />
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-accent">Show as table</summary>
          <Table head={['Day (Oslo)', 'Downloads']} rows={[...stats.days].reverse().map((d) => [d.day, d.count])} />
        </details>
      </Panel>

      {/* Panels carry their own top margin, so the grid only needs a column gap. */}
      <div className="grid gap-x-4 md:grid-cols-2">
        <Panel title="By grandMA3 version">
          <Table head={['Version', 'Downloads']} rows={stats.versions.map((v) => [v.label, v.count])} />
        </Panel>
        <Panel title="By site language">
          <Table head={['Language', 'Downloads']} rows={stats.locales.map((l) => [l.locale, l.count])} />
        </Panel>
      </div>

      <Panel title="Latest downloads">
        {stats.latest.length === 0 ? (
          <p className="text-muted">No downloads logged yet.</p>
        ) : (
          <Table head={['Time (UTC)', 'Cues', 'Version', 'Language']} rows={stats.latest.map((e) => [e.t.replace('T', ' ').slice(0, 19), e.cues, e.version, e.locale])} />
        )}
      </Panel>
    </>
  );
}

/** One bar per day, single series in the accent colour; hover shows the exact count. */
function DayChart({ days }: { days: DownloadStats['days'] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const w = 600;
  const h = 160;
  const slot = w / days.length;
  const barW = slot - 2; // 2px surface gap between bars
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`Downloads per day, highest ${max}`}>
        <line x1={0} x2={w} y1={h} y2={h} className="stroke-line" strokeWidth={1} />
        {days.map((d, i) => {
          const bh = (d.count / max) * (h - 8);
          const x = i * slot + 1;
          return (
            <g key={d.day}>
              <title>{`${d.day}: ${d.count}`}</title>
              {/* Full-height hit target, larger than the bar */}
              <rect x={i * slot} y={0} width={slot} height={h} fill="transparent" />
              {d.count > 0 && <path d={roundedTop(x, h - bh, barW, bh, Math.min(4, bh, barW / 2))} className="fill-accent" />}
            </g>
          );
        })}
      </svg>
      {/* Axis labels as HTML, so they keep their size when the chart scales down on phones. */}
      <figcaption className="mt-1 flex justify-between font-mono text-xs text-muted">
        <span>{days[0]?.day}</span>
        <span>{days.at(-1)?.day}</span>
      </figcaption>
    </figure>
  );
}

/** A bar with rounded top corners, square on the baseline. */
function roundedTop(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-mono text-4xl font-bold tabular-nums">{value.toLocaleString('en-US')}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-2xl border border-line bg-card p-5 sm:p-6">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            {head.map((h, i) => (
              <th key={h} className={`py-2 pr-4 font-semibold ${i > 0 ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-line-soft last:border-0">
              {row.map((cell, i) => (
                <td key={i} className={`whitespace-nowrap py-1.5 pr-4 font-mono tabular-nums ${i > 0 ? 'text-right' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-xs">{children}</code>;
}
