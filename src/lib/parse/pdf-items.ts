import type { PageInfo, TextItem } from './types';

/** The parts of a pdf.js document we use. Both the browser and the legacy (Node) build fit it. */
interface PdfTextRun {
  str: string;
  transform: number[];
  width: number;
  height: number;
}
export interface PdfDocumentLike {
  numPages: number;
  getPage(n: number): Promise<{
    getViewport(params: { scale: number }): { width: number; height: number };
    getTextContent(): Promise<{ items: ReadonlyArray<PdfTextRun | object> }>;
  }>;
}

const isTextRun = (item: PdfTextRun | object): item is PdfTextRun => 'str' in item;

/** Positioned text from every page of an opened pdf.js document. y is converted to "from the top". */
export async function documentTextItems(doc: PdfDocumentLike): Promise<{ items: TextItem[]; pages: PageInfo[] }> {
  const items: TextItem[] = [];
  const pages: PageInfo[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const viewport = page.getViewport({ scale: 1 });
    pages.push({ page: n, width: viewport.width, height: viewport.height });
    const content = await page.getTextContent();
    for (const raw of content.items) {
      if (!isTextRun(raw)) continue;
      const [, , c, d, e, f] = raw.transform;
      const height = raw.height || Math.hypot(c, d);
      items.push({ str: raw.str, x: e, y: viewport.height - f, width: raw.width, height, page: n });
    }
  }
  return { items, pages };
}
