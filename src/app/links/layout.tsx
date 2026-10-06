import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { JetBrains_Mono, Schibsted_Grotesk } from 'next/font/google';
import { SITE_URL } from '@/lib/site';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import '../globals.css';

// The link-in-bio page for Instagram and TikTok, outside [locale]: one page for every language.
const sans = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-schibsted' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'CueSetter · Links',
  description: 'Run sheet in. Cue list out. PDF, Word or Excel to a named grandMA3 cue list.',
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f5f1' },
    { media: '(prefers-color-scheme: dark)', color: '#121316' },
  ],
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
