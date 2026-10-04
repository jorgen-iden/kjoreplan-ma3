// Copies the pdf.js worker into public/ so it is served from our own origin (no CDN, no network
// request to third parties). Runs on every npm install.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const src = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs');
mkdirSync(new URL('../public/', import.meta.url), { recursive: true });
copyFileSync(src, new URL('../public/pdf.worker.min.mjs', import.meta.url));
