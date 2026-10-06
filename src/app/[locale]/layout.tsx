import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { JetBrains_Mono, Schibsted_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { alternates, languageTag, ogImages, SITE_NAME, SITE_URL } from '@/lib/site';

const OG_LOCALES: Record<Locale, string> = { en: 'en_US', no: 'nb_NO', de: 'de_DE' };
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import '../globals.css';

// Fonts are downloaded at build time and served from our own domain.
// Only the basic Latin files are preloaded: they cover English, Norwegian and German. The other
// subsets are still declared (unicode-range), so the browser fetches them only if a page needs them.
const sans = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-schibsted' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: t('title'),
    description: t('description'),
    applicationName: SITE_NAME,
    alternates: alternates(locale as Locale, '/'),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: t('title'),
      description: t('description'),
      locale: OG_LOCALES[locale as Locale] ?? 'en_US',
      images: ogImages(locale as Locale),
    },
    twitter: { card: 'summary_large_image', title: t('title'), description: t('description') },
  };
}

export const viewport: Viewport = {
  // Lets the bottom bar on phones sit above the home indicator (env(safe-area-inset-bottom)).
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f5f1' },
    { media: '(prefers-color-scheme: dark)', color: '#121316' },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // Client components only get the texts they use: the error boundary here, the converter on /app.
  // Server components read every text on the server, so the rest never ships to the browser.
  const { errors } = await getMessages();

  return (
    // suppressHydrationWarning: the theme script may set data-theme on <html> before React loads.
    <html lang={languageTag(locale as Locale)} className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={{ errors }}>{children}</NextIntlClientProvider>
        {/* Cookieless page-view counting (Vercel Web Analytics). Only page addresses are sent, never run sheet content. */}
        <Analytics />
        {/* Core Web Vitals from real visits (Vercel Speed Insights). Also cookieless, no run sheet content. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
