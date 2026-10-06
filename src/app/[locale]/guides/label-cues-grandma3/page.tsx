import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { ArticlePage } from '@/components/features/content/ArticlePage';
import type { Locale } from '@/i18n/routing';
import { contentMetadata } from '@/lib/content-metadata';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  return contentMetadata('labelCues', (await params).locale);
}

export default function Page({ params }: { params: Params }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <ArticlePage pageKey="labelCues" locale={locale as Locale} />;
}
