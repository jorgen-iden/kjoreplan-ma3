import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Faq } from '@/components/features/landing/Faq';
import { HeroDemo, type DemoRow } from '@/components/features/landing/HeroDemo';
import { FileIcon } from '@/components/features/landing/ProofVisuals';
import { Reveal } from '@/components/features/landing/Reveal';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { logoMarkSvg } from '@/lib/logo';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { contentPage, TEMPLATE_FILES, type ContentKey, type Section } from '@/lib/content-pages';
import { TEMPLATES } from '@/lib/templates';
import { contentPageJsonLd, jsonLdScript, type FaqItem } from '@/lib/structured-data';
import { TrackedDownload } from './TrackedDownload';

const CONTAINER = 'mx-auto max-w-6xl px-5 sm:px-8';
const LINK = 'font-semibold text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent';

/** Text with [links](/path): internal paths become locale-aware links. */
function rich(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
    const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (!m) return part;
    return m[2].startsWith('/') ? (
      <Link key={i} href={m[2]} className={LINK}>
        {m[1]}
      </Link>
    ) : (
      <a key={i} href={m[2]} className={LINK}>
        {m[1]}
      </a>
    );
  });
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function Body({ s }: { s: Section }) {
  return (
    <div className="space-y-5 text-lg leading-relaxed text-subtle">
      {s.p?.map((p, i) => <p key={i}>{rich(p)}</p>)}
      {s.list && (
        <ul className="space-y-3">
          {s.list.map((l, i) => (
            <li key={i} className="relative pl-6">
              <span aria-hidden="true" className="absolute left-0 top-[0.7em] size-2 rounded-full bg-accent" />
              {rich(l)}
            </li>
          ))}
        </ul>
      )}
      {s.steps && (
        <ol className="space-y-4">
          {s.steps.map((l, i) => (
            <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4">
              <span className="grid size-8 place-items-center rounded-full bg-accent font-mono text-sm font-bold text-on-accent">{i + 1}</span>
              <span className="pt-0.5">{rich(l)}</span>
            </li>
          ))}
        </ol>
      )}
      {s.code && (
        <pre className="overflow-x-auto rounded-2xl bg-console p-5 font-mono text-sm leading-relaxed text-console-ink shadow-xl dark:border dark:border-console-line dark:bg-console-raised">
          <code>{s.code}</code>
        </pre>
      )}
      {s.table && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-card">
          <table className="w-full text-left text-base">
            <thead className="bg-line-soft">
              <tr>
                {s.table.head.map((h) => (
                  <th key={h} className="px-4 py-3 font-bold text-ink">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((r, i) => (
                <tr key={i} className="border-t border-line-soft">
                  {r.map((c, j) => (
                    <td key={j} className={`px-4 py-3 align-top ${j === 0 ? 'font-semibold text-ink' : 'text-muted'}`}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {s.after?.map((p, i) => <p key={i}>{rich(p)}</p>)}
    </div>
  );
}

/** The free templates as two download cards (Excel and Word), in the console style of the front page. */
function Downloads({ locale }: { locale: Locale }) {
  const t = useTranslations('pages');
  const file = TEMPLATE_FILES[locale] ?? TEMPLATE_FILES.en;
  return (
    <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:max-w-md">
      {(['xlsx', 'docx'] as const).map((ext) => (
        <li key={ext}>
          <TrackedDownload
            href={`/templates/${file}.${ext}`}
            file={`${file}.${ext}`}
            className="group flex items-center gap-4 rounded-2xl bg-console p-5 text-console-ink no-underline shadow-xl transition duration-300 ease-out-back hover:-translate-y-1 dark:border dark:border-console-line dark:bg-console-raised"
          >
            <span className="transition-transform duration-500 ease-out-back group-hover:-rotate-6">
              <FileIcon type={ext} size={40} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{t(`download.${ext}`)}</span>
              <span className="block truncate font-mono text-xs text-console-muted">
                {file}.{ext}
              </span>
            </span>
            <span className="rounded-full bg-console-accent px-3 py-1.5 text-sm font-semibold text-console">{t('download.button')} ↓</span>
          </TrackedDownload>
        </li>
      ))}
    </ul>
  );
}

/**
 * A content page: a direct answer first (what AI search quotes), then sections with a table of
 * contents and a CueSetter card beside them, an optional FAQ and the closing call to action.
 */
export function ArticlePage({ pageKey, locale }: { pageKey: ContentKey; locale: Locale }) {
  const t = useTranslations(`pages.${pageKey}`);
  const tp = useTranslations('pages');
  const th = useTranslations('home');
  const sections = t.raw('sections') as Section[];
  const faq = (t.has('faq') ? t.raw('faq') : []) as FaqItem[];
  const { path, type, hero, icon } = contentPage(pageKey);
  const template = hero === 'template' ? (TEMPLATES[locale as keyof typeof TEMPLATES] ?? TEMPLATES.en) : null;
  const jsonLd = contentPageJsonLd({ locale, path, type, title: t('title'), description: t('metaDescription'), faq });

  return (
    <>
      <SiteHeader />
      <main id="main" className="overflow-x-clip pb-24">
        <section className={`${CONTAINER} relative pt-10 sm:pt-16 ${hero ? 'grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]' : ''}`}>
          <div aria-hidden="true" className="pointer-events-none absolute -top-20 right-0 -z-10 h-80 w-[40rem] rounded-full bg-accent/10 blur-3xl" />
          <div>
            <nav aria-label={tp('breadcrumbLabel')} className="animate-rise mb-6 text-sm text-muted">
              <Link href="/" className="text-muted no-underline hover:text-accent">
                CueSetter
              </Link>
              <span aria-hidden="true"> / </span>
              <span>{t('crumb')}</span>
            </nav>
            {icon ? (
              <div className="animate-rise mb-4 flex items-center gap-3">
                <FileIcon type={icon} size={28} />
                <p className="font-mono text-sm font-semibold text-accent">{t('kicker')}</p>
              </div>
            ) : (
              <p className="animate-rise mb-4 font-mono text-sm font-semibold text-accent">{t('kicker')}</p>
            )}
            <h1 className="animate-rise animate-delay-100 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{t('title')}</h1>
            <p className="animate-rise animate-delay-200 mt-6 max-w-3xl text-xl leading-relaxed text-muted">{rich(t('lead'))}</p>
            {template && <Downloads locale={locale} />}
          </div>
          {template && (
            /* The template as it reads into CueSetter: its own example rows becoming a cue list. */
            <div className="animate-entry animate-delay-300 relative">
              <HeroDemo
                source="xlsx"
                rows={template.rows.slice(0, 5).map(([n, time, , title]) => ({ n, time, title: title.split('\n'), extra: '' }))}
                labels={{
                  file: `${template.file}.xlsx`,
                  sequence: th('demo.sequence'),
                  columns: { n: template.headers[0], time: template.headers[1], title: template.headers[3], extra: template.headers[4] },
                  go: th('demo.go'),
                  from: tp('templatePreview'),
                  to: th('demo.to'),
                }}
              />
            </div>
          )}
          {hero === 'paste' && (
            /* Rows copied from a spreadsheet and pasted as text: the same plain table, becoming a cue list. */
            <div className="animate-entry animate-delay-300 relative">
              <HeroDemo
                rows={th.raw('demo.rows') as DemoRow[]}
                labels={{
                  file: t('heroFile'),
                  sequence: th('demo.sequence'),
                  columns: { n: th('demo.columns.n'), time: th('demo.columns.time'), title: th('demo.columns.title'), extra: th('demo.columns.extra') },
                  go: th('demo.go'),
                  from: t('heroFrom'),
                  to: th('demo.to'),
                }}
              />
            </div>
          )}
        </section>

        <div className={`${CONTAINER} mt-20 grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1fr)_18rem]`}>
          <article className="max-w-3xl space-y-16">
            {sections.map((s, i) => (
              <Reveal as="section" key={s.h}>
                <div id={slug(s.h)} className="scroll-mt-8">
                  <p className="mb-2 font-mono text-sm font-semibold text-accent">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-3xl">{s.h}</h2>
                </div>
                <Body s={s} />
              </Reveal>
            ))}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-5">
              <nav aria-label={tp('toc')} className="rounded-2xl border border-line bg-card p-5">
                <p className="mb-3 font-mono text-xs font-semibold text-muted">{tp('toc')}</p>
                <ol className="space-y-2 text-sm">
                  {sections.map((s, i) => (
                    <li key={s.h}>
                      <a href={`#${slug(s.h)}`} className="flex gap-2 text-subtle no-underline hover:text-accent">
                        <span className="font-mono text-muted">{String(i + 1).padStart(2, '0')}</span>
                        {s.h}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="rounded-2xl bg-console p-5 text-console-ink shadow-xl dark:border dark:border-console-line dark:bg-console-raised">
                {logoMarkSvg(36)}
                <p className="mt-4 font-bold">{tp('cardTitle')}</p>
                <p className="mt-2 text-sm text-console-muted">{tp('cardText')}</p>
                <Link href="/app" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-console-accent px-4 text-sm font-bold text-console no-underline transition hover:scale-105">
                  {th('cta')} →
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {faq.length > 0 && (
          <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-36`}>
            <p className="mb-3 font-mono text-sm font-semibold text-accent">{th('faqKicker')}</p>
            <h2 className="mb-8 text-3xl font-extrabold tracking-tight sm:text-4xl">{th('faqTitle')}</h2>
            <Faq items={faq} />
          </Reveal>
        )}

        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-36`}>
          <div className="relative overflow-hidden rounded-3xl bg-accent px-6 py-16 text-center text-on-accent sm:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
            <h2 className="relative text-4xl font-extrabold tracking-tight sm:text-5xl">{th('tagline')}</h2>
            <p className="relative mt-4 opacity-80">{th('finalLead')}</p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/app"
                className="inline-flex min-h-13 items-center justify-center rounded-xl bg-on-accent px-6 font-bold text-accent no-underline transition duration-300 ease-out-back hover:scale-105 active:scale-95"
              >
                {th('cta')} →
              </Link>
              <Link
                href={{ pathname: '/app', query: { sample: '1' } }}
                className="inline-flex min-h-13 items-center justify-center rounded-xl border border-on-accent/40 px-6 font-semibold text-on-accent no-underline transition duration-150 hover:border-on-accent hover:bg-on-accent/10 active:scale-[0.98]"
              >
                {th('ctaSample')}
              </Link>
            </div>
          </div>
        </Reveal>

        <SiteFooter className={`${CONTAINER} mt-16`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      </main>
    </>
  );
}
