import * as pdfjs from 'pdfjs-dist';
// Bundled locally so no network request is made after the page has loaded.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { documentTextItems } from './pdf-items';
import type { PageInfo, TextItem } from './types';

// Started at page load so nothing is fetched later, when a file is opened.
pdfjs.GlobalWorkerOptions.workerPort = new Worker(workerUrl, { type: 'module' });

export async function extractPdfText(file: File): Promise<{ items: TextItem[]; pages: PageInfo[] }> {
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), disableFontFace: true });
  try {
    return await documentTextItems(await task.promise);
  } finally {
    // Destroys the document only; the shared worker port stays alive for the next file.
    await task.destroy();
  }
}
