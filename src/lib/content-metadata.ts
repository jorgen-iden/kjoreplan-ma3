import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { CONTENT_PAGES, type ContentKey } from './content-pages';
import { alternates, ogImages } from './site';

/** Title, description, canonical and hreflang for a content page. */
export async function contentMetadata(key: ContentKey, locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `pages.${key}` });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: alternates(locale as Locale, CONTENT_PAGES[key].path),
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), images: ogImages(locale as Locale) },
  };
}
