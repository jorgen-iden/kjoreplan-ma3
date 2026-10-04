import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageInfo, TextItem } from './types';

/** Positioned text from every page of an opened pdf.js document. y is converted to "from the top". */
export async function documentTextItems(doc: PDFDocumentProxy): Promise<{ items: TextItem[]; pages: PageInfo[] }> {
  const items: TextItem[] = [];
  const pages: PageInfo[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const viewport = page.getViewport({ scale: 1 });
    pages.push({ page: n, width: viewport.width, height: viewport.height });
    const content = await page.getTextContent();
    for (const raw of content.items) {
      if (!('str' in raw)) continue;
      const [, , c, d, e, f] = raw.transform as number[];
      const height = raw.height || Math.hypot(c, d);
      items.push({ str: raw.str, x: e, y: viewport.height - f, width: raw.width, height, page: n });
    }
  }
  return { items, pages };
}
