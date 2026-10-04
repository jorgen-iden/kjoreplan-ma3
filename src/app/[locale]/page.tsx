import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { HeroDemo, type DemoRow } from '@/components/features/landing/HeroDemo';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Card, LINK_PRIMARY } from '@/components/ui';
import { Link } from '@/i18n/navigation';

const STEPS = ['upload', 'review', 'console'] as const;
// The order is part of the brand platform (docs/brand.md): what it reads, privacy, what it does, origin.
const PROOFS = ['formats', 'private', 'numbers', 'industry'] as const;
// Each card enters a little after the one before it.
const CARD_DELAYS = ['animate-delay-100', 'animate-delay-200', 'animate-delay-300', 'animate-delay-400'];

const PROOF_ICONS: Record<(typeof PROOFS)[number], string> = {
  formats: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5',
  private: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5zM12 15v2',
  numbers: 'M5 9h14M5 15h14M10 3 8 21M16 3l-2 18',
  industry: 'M12 3v4M5.6 5.6l2.8 2.8M18.4 5.6l-2.8 2.8M8 21h8M9 17h6l1-5a4 4 0 1 0-8 0z',
};

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  const t = useTranslations('home');

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div>
            <p className="animate-entry mb-4 text-sm font-semibold uppercase tracking-wider text-accent">{t('kicker')}</p>
            <h1 className="animate-entry animate-delay-100 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{t('title')}</h1>
            <p className="animate-entry animate-delay-200 mt-6 text-lg text-muted">{t('lead')}</p>
            <div className="animate-entry animate-delay-300 mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/app" className={LINK_PRIMARY}>
                {t('cta')} →
              </Link>
              <span className="text-sm text-muted">{t('ctaSub')}</span>
            </div>
            <p className="animate-entry animate-delay-400 mt-4 text-sm text-muted">{t('privacy')}</p>
          </div>
          <div className="animate-entry animate-delay-300">
            <HeroDemo
              rows={t.raw('demo.rows') as DemoRow[]}
              labels={{
                file: t('demo.file'),
                sequence: t('demo.sequence'),
                columns: { n: t('demo.columns.n'), time: t('demo.columns.time'), title: t('demo.columns.title'), extra: t('demo.columns.extra') },
                caption: t('demo.caption'),
              }}
            />
          </div>
        </section>

        <section aria-labelledby="proofs-title" className="mt-24 sm:mt-32">
          <h2 id="proofs-title" className="mb-6 text-2xl font-extrabold tracking-tight">
            {t('proofsTitle')}
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROOFS.map((p, i) => (
              <li key={p} className={`animate-entry ${CARD_DELAYS[i]}`}>
                <Card as="article" className="h-full p-6">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-accent" aria-hidden="true">
                    <path d={PROOF_ICONS[p]} />
                  </svg>
                  <h3 className="mb-2 font-bold">{t(`proofs.${p}.title`)}</h3>
                  <p className="text-sm text-muted">{t(`proofs.${p}.text`)}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-title" className="mt-24 sm:mt-32">
          <h2 id="how-title" className="mb-6 text-2xl font-extrabold tracking-tight">
            {t('stepsTitle')}
          </h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step}>
                <Card as="article" glow className="h-full p-7">
                  <span className="mb-4 inline-flex size-9 items-center justify-center rounded-full bg-accent-soft font-mono text-sm font-semibold text-accent">
                    {i + 1}
                  </span>
                  <h3 className="mb-2 text-xl font-bold">{t(`steps.${step}.title`)}</h3>
                  <p className="text-muted">{t(`steps.${step}.text`)}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="story-title" className="mt-24 grid gap-6 sm:mt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <h2 id="story-title" className="text-2xl font-extrabold tracking-tight">
            {t('storyTitle')}
          </h2>
          <div className="max-w-2xl">
            {(t.raw('story') as string[]).map((p, i) => (
              <p key={i} className="mb-4 text-lg leading-relaxed text-subtle">
                {p}
              </p>
            ))}
            <p className="mt-6 font-semibold">{t('storySign')}</p>
          </div>
        </section>

        <section aria-labelledby="final-title" className="mt-24 rounded-3xl border border-line bg-card px-6 py-14 text-center sm:mt-32">
          <h2 id="final-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t('tagline')}
          </h2>
          <p className="mt-4 text-muted">{t('finalLead')}</p>
          <Link href="/app" className={`${LINK_PRIMARY} mt-8`}>
            {t('cta')} →
          </Link>
        </section>

        <p className="mt-16 text-xs text-muted">{t('disclaimer')}</p>
      </main>
    </>
  );
}
