import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { CONTACT_EMAIL, DEMO_VIDEO, languageTag, localePath, SITE_NAME, SITE_URL, SOCIAL_PROFILES } from './site';

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * schema.org data for the front page (JSON-LD): who makes CueSetter, what it is, what it costs,
 * and the FAQ. Search engines and AI answers read this. Every claim here must also be visible on
 * the page and true (docs/brand.md, «Påstander»).
 */
export function frontPageJsonLd({ locale, name, description, faq }: { locale: Locale; name: string; description: string; faq: FaqItem[] }) {
  const url = `${SITE_URL}${localePath(locale, '/') === '/' ? '' : localePath(locale, '/')}`;
  const org = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#org`,
    name: 'Arpeggio AS',
    url: SITE_URL,
    email: CONTACT_EMAIL,
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: CONTACT_EMAIL, availableLanguage: routing.locales.map(languageTag) },
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
  const video = DEMO_VIDEO && {
    '@type': 'VideoObject',
    '@id': `${url}#video`,
    name: name,
    description,
    thumbnailUrl: `https://i.ytimg.com/vi/${DEMO_VIDEO.youtubeId}/maxresdefault.jpg`,
    uploadDate: DEMO_VIDEO.uploadDate,
    duration: DEMO_VIDEO.duration,
    embedUrl: `https://www.youtube-nocookie.com/embed/${DEMO_VIDEO.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${DEMO_VIDEO.youtubeId}`,
    publisher: { '@id': org['@id'] },
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      org,
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: routing.locales.map(languageTag), publisher: { '@id': org['@id'] } },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#app`,
        name: SITE_NAME,
        alternateName: name,
        description,
        url: `${SITE_URL}${localePath(locale, '/app')}`,
        applicationCategory: 'UtilitiesApplication',
        applicationSubCategory: 'Lighting console tools',
        operatingSystem: 'Web browser',
        inLanguage: languageTag(locale),
        featureList: ['PDF, Word (.docx) and Excel (.xlsx) run sheets', 'grandMA3 macro (XML in ZIP)', 'Runs in the browser, no upload'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free to try' },
        publisher: { '@id': org['@id'] },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      ...(video ? [video] : []),
    ],
  };
}

/**
 * schema.org data for a format page (e.g. /excel-to-grandma3): the page, its place under the front
 * page (breadcrumb) and its FAQ. The organisation and app are described on the front page.
 */
export function formatPageJsonLd({ locale, path, title, description, home, faq }: { locale: Locale; path: string; title: string; description: string; home: string; faq: FaqItem[] }) {
  const url = `${SITE_URL}${localePath(locale, path)}`;
  const homeUrl = `${SITE_URL}${localePath(locale, '/') === '/' ? '' : localePath(locale, '/')}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: title,
        description,
        inLanguage: languageTag(locale),
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#app` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: home, item: homeUrl },
            { '@type': 'ListItem', position: 2, name: title, item: url },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
}

/** schema.org data for a content page (guide, definition, templates): the page, breadcrumb and FAQ. */
export function contentPageJsonLd({
  locale,
  path,
  type,
  title,
  description,
  faq,
}: {
  locale: Locale;
  path: string;
  type: 'WebPage' | 'Article' | 'TechArticle';
  title: string;
  description: string;
  faq: FaqItem[];
}) {
  const data = formatPageJsonLd({ locale, path, title, description, home: SITE_NAME, faq });
  const [page, faqPage] = data['@graph'];
  const article =
    type === 'WebPage'
      ? page
      : { ...page, '@type': ['WebPage', type], headline: title, author: { '@id': `${SITE_URL}/#org` }, publisher: { '@id': `${SITE_URL}/#org` } };
  return { ...data, '@graph': faq.length ? [article, faqPage] : [article] };
}

/** Serialises JSON-LD for a <script> tag; "<" is escaped so content can never close the tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
