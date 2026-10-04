import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { documentTextItems } from '../../src/lib/parse/pdf-items';

export async function extract(data: Uint8Array) {
  const task = getDocument({ data, disableFontFace: true, useSystemFonts: false });
  try {
    return await documentTextItems(await task.promise);
  } finally {
    await task.destroy();
  }
}
