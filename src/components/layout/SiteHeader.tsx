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
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:gap-4 sm:px-8 sm:py-5">
      <Link href="/" aria-label="CueSetter" className="rounded-lg text-ink no-underline">
        <Logo />
      </Link>
      <nav className="flex items-center gap-2 text-sm sm:gap-5">
        <Link href="/app" className="hidden rounded font-semibold text-ink no-underline transition-colors hover:text-accent sm:inline">
          {t('newRunSheet')}
        </Link>
        <ThemeToggle label={t('theme')} />
        <LocaleSwitcher label={t('language')} />
      </nav>
    </header>
    </>
  );
}
