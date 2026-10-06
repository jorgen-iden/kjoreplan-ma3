import { LogoMark } from '@/components/ui/Logo';

// /links: the link in bio. /links is for Instagram, /links?from=tiktok for TikTok, so each
// button carries the right UTM source and visits can be told apart in Vercel Analytics.
type Source = 'instagram' | 'tiktok';

const LINKS: { label: string; note?: string; path: string; primary?: boolean }[] = [
  { label: 'Try it with the sample run sheet', note: 'No sign-up. Runs in your browser.', path: '/app?sample=1', primary: true },
  { label: 'Convert your own run sheet', note: 'PDF, Word or Excel', path: '/app' },
  { label: 'Free run sheet template', note: 'Excel and Word', path: '/run-sheet-template' },
  { label: 'How to import a macro into grandMA3', path: '/guides/import-macro-grandma3' },
  { label: 'På norsk', note: 'Kjøreplan inn. Cueliste ut.', path: '/no' },
  { label: 'Auf Deutsch', note: 'Ablaufplan rein. Cueliste raus.', path: '/de' },
];

function withUtm(path: string, source: Source): string {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}utm_source=${source}&utm_medium=social&utm_campaign=bio`;
}

export default async function LinksPage({ searchParams }: { searchParams: Promise<{ from?: string | string[] }> }) {
  const { from } = await searchParams;
  const source: Source = from === 'tiktok' ? 'tiktok' : 'instagram';

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-12">
      <div className="flex flex-col items-center text-center">
        <LogoMark size={64} />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">CueSetter</h1>
        <p className="mt-1 text-lg font-semibold">Run sheet in. Cue list out.</p>
        <p className="mt-2 text-muted">PDF, Word or Excel to a named grandMA3 cue list.</p>
      </div>

      <ul className="mt-8 flex flex-col gap-3">
        {LINKS.map((link) => (
          <li key={link.path}>
            <a
              href={withUtm(link.path, source)}
              className={`block rounded-2xl border px-5 py-4 text-center transition-colors ${
                link.primary
                  ? 'border-accent bg-accent text-on-accent hover:bg-accent-strong'
                  : 'border-line bg-card hover:border-accent-line hover:bg-accent-soft'
              }`}
            >
              <span className="block font-bold">{link.label}</span>
              {link.note && <span className={`mt-0.5 block text-sm ${link.primary ? 'opacity-85' : 'text-muted'}`}>{link.note}</span>}
            </a>
          </li>
        ))}
      </ul>

      <footer className="mt-auto pt-10 text-center font-mono text-xs text-muted">
        <a href={withUtm('/', source)} className="hover:text-accent">cuesetter.com</a>
        <p className="mt-2">Laget av bransjen, for bransjen · Not affiliated with MA Lighting.</p>
      </footer>
    </main>
  );
}
