import type { Metadata } from 'next';
import { JetBrains_Mono, Schibsted_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '../globals.css';

// Fonts are downloaded at build time and served from our own domain.
const sans = Schibsted_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-schibsted' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-jetbrains' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('title'), description: t('description') };
}

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

  return (
    <html lang={locale === 'no' ? 'nb' : locale} className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
