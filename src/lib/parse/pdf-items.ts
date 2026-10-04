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
    getViewport(params: { scale: number }): { width: number; height: number; transform: number[] };
    getTextContent(): Promise<{ items: ReadonlyArray<PdfTextRun | object> }>;
  }>;
}

/** 2D affine matrix product m × t, both as [a, b, c, d, e, f] (same as pdf.js Util.transform). */
function multiply(m: number[], t: number[]): number[] {
  return [
    m[0] * t[0] + m[2] * t[1],
    m[1] * t[0] + m[3] * t[1],
    m[0] * t[2] + m[2] * t[3],
    m[1] * t[2] + m[3] * t[3],
    m[0] * t[4] + m[2] * t[5] + m[4],
    m[1] * t[4] + m[3] * t[5] + m[5],
  ];
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
      // Map text space to the page as displayed. The viewport transform includes the page's
      // rotation, so landscape pages (/Rotate 90) come out with rows as rows. y is from the top.
      const [, , c, d, e, f] = multiply(viewport.transform, raw.transform);
      const height = Math.hypot(c, d) || raw.height;
      items.push({ str: raw.str, x: e, y: f, width: raw.width, height, page: n });
    }
  }
  return { items, pages };
}
