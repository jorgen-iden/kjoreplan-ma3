import type { Metadata } from 'next';
import { JetBrains_Mono, Schibsted_Grotesk } from 'next/font/google';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import '../globals.css';

// Internal page outside [locale]: its own shell with the site's fonts and theme, but no analytics.
const sans = Schibsted_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-schibsted' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'Downloads · CueSetter',
  robots: { index: false, follow: false },
  // The token is in the URL: never send it on as a referrer.
  referrer: 'no-referrer',
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
