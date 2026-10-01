import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { documentTextItems } from '../../src/parse/pdf-items';

export async function extract(data: Uint8Array) {
  const task = getDocument({ data, disableFontFace: true, useSystemFonts: false });
  try {
    return await documentTextItems((await task.promise) as never);
  } finally {
    await task.destroy();
  }
}
