import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { logoMarkSvg } from '@/lib/logo';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'CueSetter';

/** Share image (og:image) per language, drawn from the design tokens. */
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  // The brand font, so the wordmark and headline look like the site (the default font has no bold).
  // Literal paths, so Vercel's file tracing ships the fonts with the function.
  const [regular, extraBold] = await Promise.all([
    readFile(join(process.cwd(), 'src/assets/fonts/SchibstedGrotesk-Regular.ttf')),
    readFile(join(process.cwd(), 'src/assets/fonts/SchibstedGrotesk-ExtraBold.ttf')),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 80, background: '#f6f5f1', color: '#15171a', fontFamily: 'Schibsted Grotesk' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 44, fontWeight: 800 }}>
          {logoMarkSvg(56)}
          CueSetter
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>{t('title')}</div>
          <div style={{ fontSize: 30, color: '#5d636b', maxWidth: 900 }}>{t('tagline')}</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['PDF · Word · Excel', 'Cues', 'grandMA3'].map((s, i) => (
            <div key={s} style={{ padding: '10px 22px', borderRadius: 999, fontSize: 24, background: i === 2 ? '#15171a' : '#e7e5df', color: i === 2 ? '#ffffff' : '#3d4249' }}>
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Schibsted Grotesk', data: regular, weight: 400, style: 'normal' },
        { name: 'Schibsted Grotesk', data: extraBold, weight: 800, style: 'normal' },
      ],
    },
  );
}
