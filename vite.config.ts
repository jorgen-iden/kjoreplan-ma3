import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base so the build works from any static host or subfolder (GitHub Pages etc.).
  base: './',
  // pdf.js is large by nature; it is loaded once and cached.
  build: { chunkSizeWarningLimit: 1500 },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
