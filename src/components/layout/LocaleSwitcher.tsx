'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

const NAMES: Record<Locale, string> = { en: 'English', no: 'Norsk', de: 'Deutsch' };

export function LocaleSwitcher({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-muted">
      <span className="sr-only">{label}</span>
      <select
        value={locale}
        onChange={(e) => router.replace(pathname, { locale: e.target.value as Locale })}
        className="min-h-9 rounded-lg border border-line bg-card px-2 text-sm text-ink transition-colors hover:border-muted"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
