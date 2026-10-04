import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { alternates, SITE_URL } from '@/lib/site';

const PAGES = ['/', '/app'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => {
    const { canonical, languages } = alternates(routing.defaultLocale, path);
    return {
      url: `${SITE_URL}${canonical === '/' ? '' : canonical}`,
      alternates: { languages: Object.fromEntries(Object.entries(languages).map(([l, p]) => [l, `${SITE_URL}${p === '/' ? '' : p}`])) },
    };
  });
}
