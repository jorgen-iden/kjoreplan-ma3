import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Card, LINK_PRIMARY } from '@/components/ui';
import { Link } from '@/i18n/navigation';

const STEPS = ['upload', 'review', 'console'] as const;
// Each card enters a little after the one before it.
const CARD_DELAYS = ['animate-delay-400', 'animate-delay-500', 'animate-delay-600'];

// Simple front page. The full landing page comes in phase 2.
export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  const t = useTranslations('home');
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-20">
        <p className="animate-entry mb-4 text-sm font-semibold uppercase tracking-wider text-accent">{t('kicker')}</p>
        <h1 className="animate-entry animate-delay-100 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{t('title')}</h1>
        <p className="animate-entry animate-delay-200 mt-6 max-w-2xl text-lg text-muted">{t('lead')}</p>
        <div className="animate-entry animate-delay-300 mt-10 flex flex-wrap items-center gap-5">
          <Link href="/app" className={LINK_PRIMARY}>
            {t('cta')} →
          </Link>
          <span className="text-sm text-muted">{t('privacy')}</span>
        </div>

        <section aria-labelledby="how-title" className="mt-20 sm:mt-28">
          <h2 id="how-title" className="animate-entry animate-delay-300 mb-6 text-2xl font-extrabold tracking-tight">
            {t('stepsTitle')}
          </h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step} className={`animate-entry ${CARD_DELAYS[i]}`}>
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

        <p className="mt-24 text-xs text-muted">{t('disclaimer')}</p>
      </main>
    </>
  );
}
