import { ImageResponse } from 'next/og';
import { LOGO_BLUE, logoMarkSvg } from '@/lib/logo';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// iOS rounds the corners itself, so the mark fills the whole square.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: LOGO_BLUE }}>
        {logoMarkSvg(180)}
      </div>
    ),
    size,
  );
}
