import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { LINK_PRIMARY } from '@/components/ui';
import { Link } from '@/i18n/navigation';

// Placeholder front page. The real landing page comes in phase 2.
export default function Home({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  const t = useTranslations('home');
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pt-20">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">{t('kicker')}</p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">{t('title')}</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">{t('lead')}</p>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Link
            href="/app"
            className={LINK_PRIMARY}
          >
            {t('cta')} →
          </Link>
          <span className="text-sm text-muted">{t('privacy')}</span>
        </div>
        <p className="mt-24 text-xs text-muted">{t('disclaimer')}</p>
      </main>
    </>
  );
}
