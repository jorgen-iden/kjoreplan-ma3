import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Converter } from '@/components/features/converter/Converter';
import type { Locale } from '@/i18n/routing';
import { alternates, ogImages } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('appTitle'),
    description: t('appDescription'),
    alternates: alternates(locale as Locale, '/app'),
    openGraph: { title: t('appTitle'), description: t('appDescription'), images: ogImages(locale as Locale) },
  };
}

export default function AppPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  return (
    <>
      <SiteHeader />
      <Converter />
    </>
  );
}
