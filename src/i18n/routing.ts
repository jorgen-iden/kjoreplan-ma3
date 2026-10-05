import { defineRouting } from 'next-intl/routing';

/**
 * Supported languages. English is the default and lives at the root (/, /app);
 * other languages get a prefix (/no, /de/app). Add a locale here and a messages/<locale>.json file.
 */
export const routing = defineRouting({
  locales: ['en', 'no', 'de'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
