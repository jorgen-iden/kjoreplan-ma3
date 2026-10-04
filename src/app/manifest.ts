import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CueSetter',
    short_name: 'CueSetter',
    description: 'Turn run sheets into grandMA3 cue lists.',
    start_url: '/app',
    display: 'standalone',
    background_color: '#f6f5f1',
    theme_color: '#f6f5f1',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
