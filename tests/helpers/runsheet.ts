import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * A synthetic run sheet shaped like the planning-system export described in the brief: columns # · Start · Duration · Title · Lyd · Kommentar, header repeated on every page,
 * running header/footer, metadata block, multi-line title cells, duplicate and long titles,
 * and a row split across a page break. Used until the real file is added to fixtures/.
 */
export interface SheetRow {
  n: number;
  start: string;
  duration: string;
  title: string[];
  lyd: string[];
  kommentar: string[];
}

/** A made-up event: the sample must not name real people or places. */
export const TITLE = 'Høstgalla 2026 - Strandhallen';

const setlist = ['SETTLISTE BEKREFTET', 'Fly høyt', 'Vinterland', 'Ingen andre', 'Hjem igjen', 'Nordlys', 'Bølger & sand', 'Siste dans'];

export const ROWS: SheetRow[] = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const minutes = 17 * 60 + 30 + i * 7;
  const start = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:00`;
  const titles: Record<number, string[]> = {
    1: ['Dørene åpner'],
    2: ['Velkommen ved programleder'],
    5: ['Samtale med Nils Nilsen'],
    11: ['Artist 1: Grim Spencer', 'Låt 1', 'Låt 2', 'Låt 3'],
    13: ['Prisutdeling «Årets ildsjel»', 'Vinner: Kari Nordmann', 'Vinner: Ola Nordmann'],
    15: ['Pause'],
    16: ['Artist 2: "Fjordbyen Brass"', 'Marsj', 'Hymne'],
    18: ['Innslag fra kommunen', 'Ordfører'],
    20: ['Pause'],
    21: ['Hilsen fra Sophie & Co', 'Video 1', 'Video 2'],
    22: ['Allsang – «Ja, vi elsker»', 'Alle reiser seg'],
    23: ['Konsert: Hovedartist', ...setlist],
    24: ['Takk for i kveld og vel hjem – vi sees neste år igjen i Strandhallen'],
  };
  return {
    n,
    start,
    duration: n === 1 ? '00:00:00' : '00:07:00',
    title: titles[n] ?? [`Programpunkt ${n}`],
    lyd: n === 5 ? ['HH1 + HH2', 'UT NILS'] : n % 4 === 0 ? ['Playback'] : [],
    kommentar: n === 5 ? ['Inn fra venstre'] : n % 3 === 0 ? ['Lys ned'] : [],
  };
});

const COLS = { n: 40, start: 70, duration: 130, title: 190, lyd: 400, kommentar: 480 };
const LINE = 13;

export async function makeRunSheetPdf(rows: SheetRow[] = ROWS): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595;
  const H = 842;
  const pages: ReturnType<typeof pdf.addPage>[] = [];
  let page = pdf.addPage([W, H]);
  pages.push(page);
  let y = 0; // from top

  const text = (s: string, x: number, yTop: number, size = 9, f = font) =>
    page.drawText(s, { x, y: H - yTop, size, font: f, color: rgb(0, 0, 0) });

  const pageTop = (first: boolean) => {
    text(TITLE, 40, 40, 8);
    y = 60;
    if (first) {
      text(TITLE, 40, y + 14, 18, bold);
      y += 30;
      text('When: 12.09.2026 17:30', 40, y, 9);
      text('Printed: 01.09.2026', 40, y + LINE, 9);
      text('By: Produksjon', 40, y + 2 * LINE, 9);
      y += 3 * LINE + 10;
    }
    const header: [keyof typeof COLS, string][] = [
      ['n', '#'], ['start', 'Start'], ['duration', 'Duration'], ['title', 'Title'], ['lyd', 'Lyd'], ['kommentar', 'Kommentar'],
    ];
    for (const [k, label] of header) text(label, COLS[k], y, 9, bold);
    y += LINE + 4;
  };

  pageTop(true);
  for (const r of rows) {
    const height = Math.max(r.title.length, r.lyd.length, r.kommentar.length, 1);
    // Split row 23 across a page break on purpose; otherwise keep rows together.
    const forceSplitAt = r.n === 23 ? 3 : 0;
    for (let line = 0; line < height; line++) {
      const breakNow = (line === 0 && y + height * LINE > H - 70 && !forceSplitAt) || (forceSplitAt && line === forceSplitAt) || y > H - 70;
      if (breakNow) {
        page = pdf.addPage([W, H]);
        pages.push(page);
        pageTop(false);
      }
      if (line === 0) {
        text(String(r.n), COLS.n, y);
        text(r.start, COLS.start, y);
        text(r.duration, COLS.duration, y);
      }
      if (r.title[line]) text(r.title[line], COLS.title, y);
      if (r.lyd[line]) text(r.lyd[line], COLS.lyd, y);
      if (r.kommentar[line]) text(r.kommentar[line], COLS.kommentar, y);
      y += LINE;
    }
    y += 4;
  }
  pages.forEach((p, i) =>
    p.drawText(`Page ${i + 1} of ${pages.length}`, { x: W / 2 - 25, y: 30, size: 8, font, color: rgb(0, 0, 0) }),
  );
  return pdf.save();
}
