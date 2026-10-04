import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { HeroDemo, type DemoRow } from '@/components/features/landing/HeroDemo';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { LINK_PRIMARY, LINK_SECONDARY } from '@/components/ui';
import { Link } from '@/i18n/navigation';

const STEPS = ['upload', 'review', 'console'] as const;
// The order is part of the brand platform (docs/brand.md): what it reads, privacy, what it does.
const PROOFS = ['formats', 'private', 'numbers'] as const;

/** Section headings share one style. */
const H2 = 'text-2xl font-extrabold tracking-tight sm:text-3xl';

export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  const t = useTranslations('home');

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <p className="animate-entry mb-4 font-semibold text-accent">{t('kicker')}</p>
            <h1 className="animate-entry animate-delay-100 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{t('title')}</h1>
            <p className="animate-entry animate-delay-200 mt-6 text-lg text-muted">{t('lead')}</p>
            <div className="animate-entry animate-delay-300 mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/app" className={LINK_PRIMARY}>
                {t('cta')} →
              </Link>
              <span className="text-sm text-muted">{t('ctaSub')}</span>
            </div>
          </div>
          <div className="animate-entry animate-delay-300">
            <HeroDemo
              rows={t.raw('demo.rows') as DemoRow[]}
              labels={{
                file: t('demo.file'),
                sequence: t('demo.sequence'),
                columns: { n: t('demo.columns.n'), time: t('demo.columns.time'), title: t('demo.columns.title'), extra: t('demo.columns.extra') },
                go: t('demo.go'),
              }}
            />
          </div>
        </section>

        {/* Set as a cue list, not as feature cards: numbers in mono, one row per point. */}
        <section aria-labelledby="proofs-title" className="mt-24 sm:mt-32">
          <h2 id="proofs-title" className={`${H2} mb-8`}>
            {t('proofsTitle')}
          </h2>
          <ol className="border-t border-line">
            {PROOFS.map((p, i) => (
              <li key={p} className="grid gap-x-8 gap-y-2 border-b border-line py-6 sm:grid-cols-[3rem_minmax(0,2fr)_minmax(0,3fr)] sm:py-8">
                <span className="font-mono text-lg font-semibold text-accent">{i + 1}</span>
                <h3 className="text-xl font-bold">{t(`proofs.${p}.title`)}</h3>
                <p className="text-muted">{t(`proofs.${p}.text`)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Three steps as a sequence: a line runs through them like cues on a timeline. */}
        <section aria-labelledby="how-title" className="mt-24 sm:mt-32">
          <h2 id="how-title" className={`${H2} mb-8`}>
            {t('stepsTitle')}
          </h2>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <li key={step} className="border-t-2 border-accent pt-5">
                <span className="font-mono text-sm font-semibold text-accent">{t('cueLabel', { n: i + 1 })}</span>
                <h3 className="mt-2 mb-2 text-xl font-bold">{t(`steps.${step}.title`)}</h3>
                <p className="text-muted">{t(`steps.${step}.text`)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="story-title" className="mt-24 grid gap-6 sm:mt-32 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-x-8">
          <h2 id="story-title" className={H2}>
            {t('storyTitle')}
          </h2>
          <div className="max-w-2xl">
            {(t.raw('story') as string[]).map((p, i) => (
              <p key={i} className="mb-4 text-lg leading-relaxed text-subtle">
                {p}
              </p>
            ))}
          </div>
        </section>

        <section aria-labelledby="final-title" className="mt-24 rounded-3xl bg-console px-6 py-14 text-center text-console-ink sm:mt-32 dark:border dark:border-console-line">
          <h2 id="final-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t('tagline')}
          </h2>
          <p className="mt-4 text-console-muted">{t('finalLead')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/app" className={LINK_PRIMARY}>
              {t('cta')} →
            </Link>
            <Link href={{ pathname: '/app', query: { sample: '1' } }} className={LINK_SECONDARY}>
              {t('ctaSample')}
            </Link>
          </div>
        </section>

        <p className="mt-16 text-xs text-muted">{t('disclaimer')}</p>
      </main>
    </>
  );
}
