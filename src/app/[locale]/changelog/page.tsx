import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { ChangelogPage } from '@/components/features/content/ChangelogPage';
import { CHANGELOG_PATH } from '@/lib/changelog';
import type { Locale } from '@/i18n/routing';
import { alternates, ogImages } from '@/lib/site';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'changelog' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: alternates(locale as Locale, CHANGELOG_PATH),
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), images: ogImages(locale as Locale) },
  };
}

export default function Page({ params }: { params: Params }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ChangelogPage locale={locale as Locale} />;
}
