import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { FORMAT_PAGES, FORMAT_SLUGS } from '@/lib/formats';
import { CONTACT_EMAIL } from '@/lib/site';

/** Links to the format pages (so search engines and people find them), contact and the trademark note. */
export function SiteFooter({ className = '' }: { className?: string }) {
  const t = useTranslations('home');
  const tf = useTranslations('formats');
  return (
    <footer className={`flex flex-col gap-2 text-xs text-muted ${className}`}>
      <nav aria-label={tf('footerLabel')} className="mb-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {FORMAT_SLUGS.map((slug) => (
          <Link key={slug} href={`/${slug}`} className="font-semibold text-ink no-underline hover:text-accent">
            {tf(`${FORMAT_PAGES[slug].key}.linkLabel`)}
          </Link>
        ))}
      </nav>
      <p>
        {t.rich('contact', {
          email: CONTACT_EMAIL,
          mail: (chunks) => (
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-ink underline underline-offset-2 hover:text-accent">
              {chunks}
            </a>
          ),
        })}
      </p>
      <p>{t('disclaimer')}</p>
    </footer>
  );
}
