import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { CONTENT_KEYS, CONTENT_PAGES } from '@/lib/content-pages';
import { FORMAT_PAGES, FORMAT_SLUGS } from '@/lib/formats';
import { logoMarkSvg } from '@/lib/logo';
import { CONTACT_EMAIL } from '@/lib/site';

const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', no: 'Norsk', de: 'Deutsch' };
const HEADING = 'mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-muted';
const LINK = 'text-subtle no-underline transition-colors hover:text-accent';

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <nav aria-label={title}>
      <p className={HEADING}>{title}</p>
      <ul className="space-y-3 text-sm">{children}</ul>
    </nav>
  );
}

/**
 * The site footer, full width under the page: what CueSetter is and how to reach us, then links to
 * the format pages, guides and templates (so people and search engines find them) and the
 * languages, and a bottom line with the company and the trademark note.
 */
export function SiteFooter() {
  const t = useTranslations('footer');
  const th = useTranslations('home');
  const tf = useTranslations('formats');
  const tp = useTranslations('pages');
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
        <div className="col-span-2 lg:col-span-1 lg:pr-8">
          <Link href="/" aria-label="CueSetter" className="inline-flex items-center gap-2.5 text-ink no-underline">
            {logoMarkSvg(28)}
            <span className="text-xl font-extrabold tracking-tight">CueSetter</span>
          </Link>
          <p className="mt-5 text-lg font-bold">{th('tagline')}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{t('about')}</p>
          <p className={`${HEADING} mt-8 mb-2`}>{t('contact')}</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm font-semibold text-ink underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent">
            {CONTACT_EMAIL}
          </a>
        </div>

        <Column title={tf('footerLabel')}>
          {FORMAT_SLUGS.map((slug) => (
            <li key={slug}>
              <Link href={`/${slug}`} className={LINK}>
                {tf(`${FORMAT_PAGES[slug].key}.linkLabel`)}
              </Link>
            </li>
          ))}
        </Column>

        <Column title={tp('footerLabel')}>
          {CONTENT_KEYS.map((key) => (
            <li key={key}>
              <Link href={CONTENT_PAGES[key].path} className={LINK}>
                {tp(`${key}.linkLabel`)}
              </Link>
            </li>
          ))}
        </Column>

        <div className="col-span-2 grid grid-cols-2 gap-x-6 lg:col-span-1 lg:block lg:space-y-10">
          <Column title={t('product')}>
            <li>
              <Link href="/app" className={LINK}>
                {t('converter')}
              </Link>
            </li>
            <li>
              <Link href={{ pathname: '/app', query: { sample: '1' } }} className={LINK}>
                {t('sample')}
              </Link>
            </li>
          </Column>
          <Column title={t('languages')}>
            {routing.locales.map((l) => (
              <li key={l}>
                <Link href="/" locale={l} hrefLang={l === 'no' ? 'nb' : l} className={LINK}>
                  {LANGUAGE_NAMES[l]}
                </Link>
              </li>
            ))}
          </Column>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>
            {t('copyright', { year: new Date().getFullYear() })} · {th('storyKicker')}
          </p>
          <p>{th('disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}
