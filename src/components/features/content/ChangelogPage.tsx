import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/features/landing/Reveal';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { CHANGELOG_PATH, changelogByDate } from '@/lib/changelog';
import { CONTACT_EMAIL } from '@/lib/site';
import { contentPageJsonLd, jsonLdScript } from '@/lib/structured-data';

const CONTAINER = 'mx-auto max-w-6xl px-5 sm:px-8';

/**
 * /changelog: what has shipped, newest first, from src/lib/changelog.ts. Dates in mono, like the
 * clock times on the console, on a line that runs down the page.
 */
export function ChangelogPage({ locale }: { locale: Locale }) {
  const t = useTranslations('changelog');
  const tp = useTranslations('pages');
  const groups = changelogByDate(locale);
  const jsonLd = contentPageJsonLd({ locale, path: CHANGELOG_PATH, type: 'WebPage', title: t('title'), description: t('metaDescription'), faq: [] });

  return (
    <>
      <SiteHeader />
      <main id="main" className="overflow-x-clip pb-24">
        <section className={`${CONTAINER} relative pt-10 sm:pt-16`}>
          <div aria-hidden="true" className="pointer-events-none absolute -top-20 right-0 -z-10 h-80 w-[40rem] rounded-full bg-accent/10 blur-3xl" />
          <nav aria-label={tp('breadcrumbLabel')} className="animate-rise mb-6 text-sm text-muted">
            <Link href="/" className="text-muted no-underline hover:text-accent">
              CueSetter
            </Link>
            <span aria-hidden="true"> / </span>
            <span>{t('crumb')}</span>
          </nav>
          <p className="animate-rise mb-4 font-mono text-sm font-semibold text-accent">{t('kicker')}</p>
          <h1 className="animate-rise animate-delay-100 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{t('title')}</h1>
          <p className="animate-rise animate-delay-200 mt-6 max-w-3xl text-xl leading-relaxed text-muted">{t('lead')}</p>
        </section>

        <ol className={`${CONTAINER} mt-16 sm:mt-20`}>
          {groups.map((g, gi) => (
            <li key={g.date} className="relative grid gap-4 pb-12 pl-8 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-10 sm:pl-0">
              {/* The line and the dot: on the left on phones, between the date and the entries from sm. */}
              <span aria-hidden="true" className={`absolute left-[5px] top-2 w-px bg-line sm:left-[10.75rem] ${gi === groups.length - 1 ? 'h-0' : 'bottom-0'}`} />
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1.5 size-[11px] rounded-full border-2 sm:left-[calc(10.75rem-5px)] ${gi === 0 ? 'border-accent bg-accent' : 'border-line bg-paper'}`}
              />
              <time dateTime={g.date} className="pt-0.5 font-mono text-sm font-semibold text-muted sm:text-right sm:pr-4">
                {g.date}
              </time>
              <Reveal className="space-y-4 sm:pl-6">
                {g.items.map((item) => (
                  <article key={item.title} className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                    <h2 className="text-lg font-bold tracking-tight">{item.title}</h2>
                    <p className="mt-2 leading-relaxed text-subtle">{item.text}</p>
                  </article>
                ))}
              </Reveal>
            </li>
          ))}
        </ol>

        <p className={`${CONTAINER} mt-4 text-muted`}>
          {t.rich('feedback', {
            email: CONTACT_EMAIL,
            mail: (chunks) => (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
              >
                {chunks}
              </a>
            ),
          })}
        </p>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      </main>
      <SiteFooter />
    </>
  );
}
