import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#15171a', borderRadius: 40 }}>
        <div style={{ width: 84, height: 84, borderRadius: 42, border: '16px solid #f6f5f1', borderRightColor: 'transparent', display: 'flex' }} />
        <div style={{ position: 'absolute', right: 40, bottom: 40, width: 36, height: 36, borderRadius: 18, background: '#2140c4' }} />
      </div>
    ),
    size,
  );
}
