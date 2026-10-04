import type * as Pdfjs from 'pdfjs-dist';
import { documentTextItems } from './pdf-items';
import type { PageInfo, TextItem } from './types';

let pdfjs: Promise<typeof Pdfjs> | null = null;

/**
 * Load pdf.js and start its worker. Called when the app mounts, so nothing is fetched later
 * when a file is opened. The worker is served from our own origin (public/pdf.worker.min.mjs).
 */
export function preloadPdf(): Promise<typeof Pdfjs> {
  pdfjs ??= import('pdfjs-dist').then((lib) => {
    lib.GlobalWorkerOptions.workerPort = new Worker('/pdf.worker.min.mjs', { type: 'module' });
    return lib;
  });
  return pdfjs;
}

export async function extractPdfText(data: ArrayBuffer): Promise<{ items: TextItem[]; pages: PageInfo[] }> {
  const lib = await preloadPdf();
  const task = lib.getDocument({ data: new Uint8Array(data), disableFontFace: true });
  try {
    return await documentTextItems(await task.promise);
  } finally {
    // Destroys the document only; the shared worker stays alive for the next file.
    await task.destroy();
  }
}
