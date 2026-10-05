import type { Locale } from '@/i18n/routing';
import { CONTACT_EMAIL, localePath, SITE_NAME, SITE_URL } from './site';

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
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: CONTACT_EMAIL, availableLanguage: ['en', 'nb'] },
    brand: { '@type': 'Brand', name: SITE_NAME },
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      org,
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: ['en', 'nb'], publisher: { '@id': org['@id'] } },
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
        inLanguage: locale === 'no' ? 'nb' : 'en',
        featureList: ['PDF, Word (.docx) and Excel (.xlsx) run sheets', 'grandMA3 macro (XML in ZIP)', 'Runs in the browser, no upload'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free to try' },
        publisher: { '@id': org['@id'] },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };
}

/** Serialises JSON-LD for a <script> tag; "<" is escaped so content can never close the tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
