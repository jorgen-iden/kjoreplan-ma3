import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Cuesetter';

/** Share image (og:image) per language, drawn from the design tokens. */
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 80, background: '#f6f5f1', color: '#15171a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 40, fontWeight: 800 }}>
          Cuesetter
          <div style={{ width: 14, height: 14, borderRadius: 7, background: '#2140c4' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>{t('title')}</div>
          <div style={{ fontSize: 30, color: '#5d636b', maxWidth: 900 }}>{t('privacy')}</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['1 · PDF', '2 · Cues', '3 · grandMA3'].map((s, i) => (
            <div key={s} style={{ padding: '10px 22px', borderRadius: 999, fontSize: 24, background: i === 2 ? '#15171a' : '#e7e5df', color: i === 2 ? '#ffffff' : '#3d4249' }}>
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
