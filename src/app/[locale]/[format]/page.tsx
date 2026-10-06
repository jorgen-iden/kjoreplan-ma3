import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { HeroDemo, type DemoRow } from '@/components/features/landing/HeroDemo';
import { FormatAnatomy, type AnatomyLabels } from '@/components/features/landing/FormatAnatomy';
import { FileIcon, NumbersVisual, PrivacyVisual, type NumberRow } from '@/components/features/landing/ProofVisuals';
import { Faq } from '@/components/features/landing/Faq';
import { Reveal } from '@/components/features/landing/Reveal';
import { StepsBand } from '@/components/features/landing/StepsBand';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Card, LINK_PRIMARY } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { FORMAT_PAGES, FORMAT_SLUGS, isFormatSlug, type FormatSlug } from '@/lib/formats';
import { alternates, ogImages } from '@/lib/site';
import { formatPageJsonLd, jsonLdScript, type FaqItem } from '@/lib/structured-data';

// Only the format pages exist under this segment; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => FORMAT_SLUGS.map((format) => ({ locale, format })));
}

type Params = Promise<{ locale: string; format: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, format } = await params;
  if (!isFormatSlug(format)) return {};
  const t = await getTranslations({ locale, namespace: `formats.${FORMAT_PAGES[format].key}` });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: alternates(locale as Locale, `/${format}`),
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), images: ogImages(locale as Locale) },
  };
}

const CONTAINER = 'mx-auto max-w-6xl px-5 sm:px-8';
const KICKER = 'mb-3 font-mono text-sm font-semibold text-accent';
const H2 = 'text-3xl font-extrabold tracking-tight sm:text-4xl';

interface Point {
  title: string;
  text: string;
}

/**
 * A page per run sheet format (Excel, PDF, Word): the search phrase in the title, a direct answer
 * first, what CueSetter reads in that format, how to get it onto the console, and a short FAQ.
 * Every claim must match what the importer does (src/lib/import, src/lib/parse).
 */
export default function FormatPage({ params }: { params: Params }) {
  const { locale, format } = use(params);
  if (!isFormatSlug(format)) notFound();
  setRequestLocale(locale);
  const { key, file } = FORMAT_PAGES[format];
  const t = useTranslations(`formats.${key}`);
  const tf = useTranslations('formats');
  const th = useTranslations('home');
  const faq = t.raw('faq') as FaqItem[];
  const steps = t.raw('steps') as Point[];
  const rows = th.raw('demo.rows') as DemoRow[];
  const anatomy = { ...(tf.raw('anatomy') as Omit<AnatomyLabels, 'columns'>), columns: th.raw('demo.columns') as AnatomyLabels['columns'] };
  const others = FORMAT_SLUGS.filter((s): s is FormatSlug => s !== format);
  const jsonLd = formatPageJsonLd({
    locale: locale as Locale,
    path: `/${format}`,
    title: t('title'),
    description: t('metaDescription'),
    home: 'CueSetter',
    faq,
  });

  return (
    <>
      <SiteHeader />
      <main id="main" className="overflow-x-clip pb-24">
        <section className={`${CONTAINER} grid items-center gap-12 pt-10 sm:pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
          <div>
            <nav aria-label={tf('breadcrumbLabel')} className="animate-rise mb-6 text-sm text-muted">
              <Link href="/" className="text-muted no-underline hover:text-accent">
                CueSetter
              </Link>
              <span aria-hidden="true"> / </span>
              <span>{t('linkLabel')}</span>
            </nav>
            <div className="animate-rise mb-4 flex items-center gap-3">
              <FileIcon type={file} size={28} />
              <p className="font-semibold text-accent">{t('kicker')}</p>
            </div>
            <h1 className="animate-rise animate-delay-100 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{t('title')}</h1>
            <p className="animate-rise animate-delay-200 mt-6 text-lg text-muted">{t('lead')}</p>
            <div className="animate-rise animate-delay-300 mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/app" className={LINK_PRIMARY}>
                {t('cta')} →
              </Link>
              <span className="text-sm text-muted">{th('ctaSub')}</span>
            </div>
          </div>
          <div className="animate-entry animate-delay-300 relative">
            <div aria-hidden="true" className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-accent/15 blur-3xl" />
            <HeroDemo
              rows={rows}
              source={file}
              labels={{
                file: t('file'),
                docTitle: anatomy.title,
                page: anatomy.pages[0],
                sequence: th('demo.sequence'),
                columns: { n: th('demo.columns.n'), time: th('demo.columns.time'), title: th('demo.columns.title'), extra: th('demo.columns.extra') },
                go: th('demo.go'),
                from: th('demo.from'),
                to: th('demo.to'),
              }}
            />
          </div>
        </section>

        {/* What CueSetter reads in this format: the file drawn with numbered markers, the list beside it. */}
        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-40`}>
          <p className={KICKER}>{tf('readsKicker')}</p>
          <h2 className={`${H2} mb-12 max-w-2xl`}>{t('readsTitle')}</h2>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <FormatAnatomy file={file} rows={rows} labels={anatomy} />
            <ol className="flex flex-col gap-8">
              {(t.raw('reads') as Point[]).map((p, i) => (
                <li key={p.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4">
                  <span className="grid size-8 place-items-center rounded-full bg-accent text-sm font-bold text-on-accent shadow-md ring-4 ring-accent/15">{i + 1}</span>
                  <div>
                    <h3 className="mb-1.5 text-lg font-bold">{p.title}</h3>
                    <p className="leading-relaxed text-muted">{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <StepsBand
          id="steps-title"
          kicker={tf('stepsKicker')}
          title={t('stepsTitle')}
          steps={steps}
          cueLabels={steps.map((_, i) => th('cueLabel', { n: i + 1 }))}
          sequence={th('demo.sequence')}
          cues={rows.map((r) => ({ n: r.n, name: r.title[0] }))}
        />

        {/* The same promises as on the front page, whatever the format. */}
        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-40`}>
          <p className={KICKER}>{tf('alsoKicker')}</p>
          <h2 className={`${H2} mb-10 max-w-2xl`}>{th('proofsTitle')}</h2>
          <ul className="grid gap-5 md:grid-cols-2">
            {(['private', 'numbers'] as const).map((p) => (
              <li key={p}>
                <Card as="article" glow className="flex h-full flex-col p-3">
                  {p === 'private' ? (
                    <PrivacyVisual machine={th('visuals.machine')} noUpload={th('visuals.noUpload')} />
                  ) : (
                    <NumbersVisual rows={th.raw('visuals.numbers') as NumberRow[]} filledTag={th('visuals.filledTag')} />
                  )}
                  <div className="px-3 pb-4 pt-6">
                    <h3 className="mb-2 text-lg font-bold">{th(`proofs.${p}.title`)}</h3>
                    <p className="text-sm leading-relaxed text-muted">{th(`proofs.${p}.text`)}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-40`}>
          <p className={KICKER}>{th('faqKicker')}</p>
          <h2 className={`${H2} mb-8`}>{th('faqTitle')}</h2>
          <Faq items={faq} />
        </Reveal>

        {/* Closing: try it, or read about the other formats. */}
        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-40`}>
          <div className="relative overflow-hidden rounded-3xl bg-accent px-6 py-16 text-center text-on-accent sm:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
            <h2 className="relative text-4xl font-extrabold tracking-tight sm:text-5xl">{th('tagline')}</h2>
            <p className="relative mt-4 opacity-80">{th('finalLead')}</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/app"
                className="inline-flex min-h-13 items-center justify-center rounded-xl bg-on-accent px-6 font-bold text-accent no-underline transition duration-300 ease-out-back hover:scale-105 active:scale-95"
              >
                {t('cta')} →
              </Link>
              <Link
                href={{ pathname: '/app', query: { sample: '1' } }}
                className="inline-flex min-h-13 items-center justify-center rounded-xl border border-on-accent/40 px-6 font-semibold text-on-accent no-underline transition duration-150 hover:border-on-accent hover:bg-on-accent/10 active:scale-[0.98]"
              >
                {th('ctaSample')}
              </Link>
            </div>
            <div className="relative mx-auto mt-12 max-w-xl border-t border-on-accent/25 pt-8">
              <p className="mb-4 text-sm font-semibold opacity-80">{tf('otherFormatsTitle')}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {others.map((s) => (
                  <li key={s}>
                    <Link
                      href={`/${s}`}
                      className="flex items-center gap-3 rounded-2xl bg-on-accent/10 px-4 py-3 text-left font-semibold text-on-accent no-underline ring-1 ring-on-accent/25 transition duration-200 hover:-translate-y-0.5 hover:bg-on-accent/15 hover:ring-on-accent/50"
                    >
                      <FileIcon type={FORMAT_PAGES[s].file} size={26} />
                      <span>{tf(`${FORMAT_PAGES[s].key}.linkLabel`)} →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      </main>
      <SiteFooter />
    </>
  );
}
