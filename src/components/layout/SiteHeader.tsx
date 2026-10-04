import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/ui';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader() {
  const t = useTranslations('nav');
  return (
    <>
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
    >
      {t('skip')}
    </a>
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Link href="/" aria-label="CueSetter" className="rounded-lg text-ink no-underline">
        <Logo />
      </Link>
      <nav className="flex flex-wrap items-center gap-5 text-sm">
        <Link href="/app" className="rounded font-semibold text-ink no-underline transition-colors hover:text-accent">
          {t('newRunSheet')}
        </Link>
        <ThemeToggle label={t('theme')} />
        <LocaleSwitcher label={t('language')} />
      </nav>
    </header>
    </>
  );
}
