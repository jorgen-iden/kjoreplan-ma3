import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { HeroDemo, type DemoRow } from '@/components/features/landing/HeroDemo';
import { FormatsVisual, NumbersVisual, PrivacyVisual, type NumberRow } from '@/components/features/landing/ProofVisuals';
import { DemoVideo } from '@/components/features/landing/DemoVideo';
import { Faq } from '@/components/features/landing/Faq';
import { Reveal } from '@/components/features/landing/Reveal';
import { StepsBand } from '@/components/features/landing/StepsBand';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Card, LINK_PRIMARY } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { DEMO_VIDEO } from '@/lib/site';
import { frontPageJsonLd, jsonLdScript, type FaqItem } from '@/lib/structured-data';

const STEPS = ['upload', 'review', 'console'] as const;
// The order is part of the brand platform (docs/brand.md): what it reads, privacy, what it does.
const PROOFS = ['formats', 'private', 'numbers'] as const;

const CONTAINER = 'mx-auto max-w-6xl px-5 sm:px-8';
const KICKER = 'mb-3 font-mono text-sm font-semibold text-accent';
const H2 = 'text-3xl font-extrabold tracking-tight sm:text-4xl';

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('home');
  const tMeta = useTranslations('meta');
  const faq = t.raw('faq') as FaqItem[];
  const jsonLd = frontPageJsonLd({ locale: locale as Locale, name: tMeta('title'), description: tMeta('description'), faq });

  const visuals = {
    formats: <FormatsVisual sequence={t('visuals.sequence')} />,
    private: <PrivacyVisual machine={t('visuals.machine')} noUpload={t('visuals.noUpload')} />,
    numbers: <NumbersVisual rows={t.raw('visuals.numbers') as NumberRow[]} filledTag={t('visuals.filledTag')} />,
  };

  return (
    <>
      <SiteHeader />
      {/* overflow-x-clip: the glows reach past the edges, but must never cause sideways scrolling. */}
      <main id="main" className="overflow-x-clip pb-24">
        {/* Hero */}
        {/* Hero text only moves (animate-rise), never fades: it is the first paint (LCP). */}
        <section className={`${CONTAINER} grid items-center gap-12 pt-10 sm:pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
          <div>
            <p className="animate-rise mb-4 font-semibold text-accent">{t('kicker')}</p>
            <h1 className="animate-rise animate-delay-100 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{t('title')}</h1>
            <p className="animate-rise animate-delay-200 mt-6 text-lg text-muted">{t('lead')}</p>
            <div className="animate-rise animate-delay-300 mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/app" className={LINK_PRIMARY}>
                {t('cta')} →
              </Link>
              <span className="text-sm text-muted">{t('ctaSub')}</span>
            </div>
          </div>
          <div className="animate-entry animate-delay-300 relative">
            {/* A soft stage light behind the demo, for depth. */}
            <div aria-hidden="true" className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-accent/15 blur-3xl" />
            <HeroDemo
              rows={t.raw('demo.rows') as DemoRow[]}
              labels={{
                file: t('demo.file'),
                sequence: t('demo.sequence'),
                columns: { n: t('demo.columns.n'), time: t('demo.columns.time'), title: t('demo.columns.title'), extra: t('demo.columns.extra') },
                go: t('demo.go'),
                from: t('demo.from'),
                to: t('demo.to'),
              }}
            />
          </div>
        </section>

        {/* Demo video, once it is published (DEMO_VIDEO in src/lib/site.ts). */}
        {DEMO_VIDEO && (
          <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-40`}>
            <p className={KICKER}>{t('videoKicker')}</p>
            <h2 className={`${H2} mb-10 max-w-2xl`}>{t('videoTitle')}</h2>
            <DemoVideo youtubeId={DEMO_VIDEO.youtubeId} title={t('videoTitle')} play={t('videoPlay')} />
          </Reveal>
        )}

        {/* Proofs: each one shows the product in a small console picture. */}
        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-40`}>
          <p className={KICKER}>{t('proofsKicker')}</p>
          <h2 className={`${H2} mb-10 max-w-2xl`}>{t('proofsTitle')}</h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {PROOFS.map((p) => (
              <li key={p}>
                <Card as="article" glow className="flex h-full flex-col p-3">
                  {visuals[p]}
                  <div className="px-3 pb-4 pt-6">
                    <h3 className="mb-2 text-lg font-bold">{t(`proofs.${p}.title`)}</h3>
                    <p className="text-sm leading-relaxed text-muted">{t(`proofs.${p}.text`)}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Steps: a full-width console band, three cues with faders that run in order. */}
        <StepsBand
          id="how-title"
          kicker={t('stepsKicker')}
          title={t('stepsTitle')}
          steps={STEPS.map((s) => ({ title: t(`steps.${s}.title`), text: t(`steps.${s}.text`) }))}
          cueLabels={STEPS.map((_, i) => t('cueLabel', { n: i + 1 }))}
          sequence={t('demo.sequence')}
          cues={(t.raw('demo.rows') as DemoRow[]).map((r) => ({ n: r.n, name: r.title[0] }))}
        />

        {/* Story: one big line carries it, the rest is small. */}
        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-40`}>
          <p className={KICKER}>{t('storyKicker')}</p>
          <blockquote className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            «{t('storyQuote')}»
          </blockquote>
          <div className="mt-8 max-w-2xl space-y-3 text-lg text-muted">
            {(t.raw('story') as string[]).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>

        {/* FAQ: answers operators search for; the same items are in the JSON-LD below. */}
        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-40`}>
          <p className={KICKER}>{t('faqKicker')}</p>
          <h2 className={`${H2} mb-8`}>{t('faqTitle')}</h2>
          <Faq items={faq} />
        </Reveal>

        {/* Closing: the brand blue, the tagline and two ways in. */}
        <Reveal as="section" className={`${CONTAINER} mt-28 sm:mt-40`}>
          <div className="relative overflow-hidden rounded-3xl bg-accent px-6 py-16 text-center text-on-accent sm:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
            <h2 className="relative text-4xl font-extrabold tracking-tight sm:text-5xl">{t('tagline')}</h2>
            <p className="relative mt-4 opacity-80">{t('finalLead')}</p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
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
                {t('ctaSample')}
              </Link>
            </div>
          </div>
        </Reveal>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      </main>
      <SiteFooter />
    </>
  );
}
