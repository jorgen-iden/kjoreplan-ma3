import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { HeroDemo, type DemoRow } from '@/components/features/landing/HeroDemo';
import { FileIcon } from '@/components/features/landing/ProofVisuals';
import { Faq } from '@/components/features/landing/Faq';
import { Reveal } from '@/components/features/landing/Reveal';
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
              rows={th.raw('demo.rows') as DemoRow[]}
              labels={{
                file: t('file'),
                sequence: th('demo.sequence'),
                columns: { n: th('demo.columns.n'), time: th('demo.columns.time'), title: th('demo.columns.title'), extra: th('demo.columns.extra') },
                go: th('demo.go'),
                from: th('demo.from'),
                to: th('demo.to'),
              }}
            />
          </div>
        </section>

        {/* What CueSetter reads in this format. */}
        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-36`}>
          <p className={KICKER}>{tf('readsKicker')}</p>
          <h2 className={`${H2} mb-10 max-w-2xl`}>{t('readsTitle')}</h2>
          <ul className="grid gap-5 sm:grid-cols-2">
            {(t.raw('reads') as Point[]).map((p) => (
              <li key={p.title}>
                <Card as="article" className="h-full p-6">
                  <h3 className="mb-2 text-lg font-bold">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{p.text}</p>
                </Card>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* From the file to the console, as numbered cues. */}
        <section aria-labelledby="steps-title" className="mt-28 bg-console py-20 text-console-ink sm:mt-36 sm:py-24 dark:border-y dark:border-console-line dark:bg-console-raised [background-image:radial-gradient(var(--color-console-line)_1px,transparent_1px)] [background-size:22px_22px]">
          <Reveal className={CONTAINER}>
            <p className="mb-3 font-mono text-sm font-semibold text-console-accent">{tf('stepsKicker')}</p>
            <h2 id="steps-title" className={`${H2} mb-12 max-w-2xl`}>
              {t('stepsTitle')}
            </h2>
            <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <p className="mb-4 font-mono text-sm font-semibold text-console-accent">{th('cueLabel', { n: i + 1 })}</p>
                  <h3 className="mb-2 text-xl font-bold">{s.title}</h3>
                  <p className="text-console-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-36`}>
          <p className={KICKER}>{th('faqKicker')}</p>
          <h2 className={`${H2} mb-8`}>{th('faqTitle')}</h2>
          <Faq items={faq} />
        </Reveal>

        {/* Closing: try it, or read about the other formats. */}
        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-36`}>
          <div className="relative overflow-hidden rounded-3xl bg-accent px-6 py-14 text-center text-on-accent sm:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">{th('tagline')}</h2>
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
            <p className="relative mt-8 text-sm opacity-90">
              {tf('others')}{' '}
              {others.map((s, i) => (
                <span key={s}>
                  {i > 0 && ' · '}
                  <Link href={`/${s}`} className="font-semibold text-on-accent underline underline-offset-2">
                    {tf(`${FORMAT_PAGES[s].key}.linkLabel`)}
                  </Link>
                </span>
              ))}
            </p>
          </div>
        </Reveal>

        <SiteFooter className={`${CONTAINER} mt-16`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      </main>
    </>
  );
}
