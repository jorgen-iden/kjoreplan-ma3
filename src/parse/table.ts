import { guessHeader, NUMBER_RE, TIME_RE } from './headers';
import { parseLines } from './lines';
import type { Column, PageInfo, ParsedTable, Role, TextItem } from './types';

interface Line {
  page: number;
  y: number;
  height: number;
  items: TextItem[];
}

interface HeaderCell {
  text: string;
  x: number;
  right: number;
}

const PAGE_NUMBER_RE = /^(?:page|side|s\.)?\s*\d+\s*(?:of|av|\/)\s*\d+$/i;
const METADATA_RE = /^(?:when|printed|by|date|dato|utskrevet|skrevet ut|av|tid)\s*:/i;
/** Fraction of the page height at the top and bottom treated as header/footer zone. */
const MARGIN = 0.1;

/** Group text items into visual lines (same page, roughly the same y), sorted top to bottom. */
export function groupLines(items: TextItem[]): Line[] {
  const sorted = items
    .filter((i) => i.str.trim() !== '')
    .sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x);
  const lines: Line[] = [];
  for (const item of sorted) {
    const last = lines[lines.length - 1];
    const tol = Math.max(2, 0.4 * (last?.height || item.height));
    if (last && last.page === item.page && Math.abs(item.y - last.y) <= tol) {
      last.items.push(item);
      last.height = Math.max(last.height, item.height);
    } else {
      lines.push({ page: item.page, y: item.y, height: item.height, items: [item] });
    }
  }
  for (const l of lines) l.items.sort((a, b) => a.x - b.x);
  return lines;
}

/** Join items on a line, inserting a space where there is a visible gap. */
export function lineText(items: TextItem[]): string {
  let out = '';
  let prevRight: number | null = null;
  for (const it of items) {
    if (prevRight !== null && it.x - prevRight > 0.15 * it.height && !out.endsWith(' ')) out += ' ';
    out += it.str;
    prevRight = it.x + it.width;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Merge items on a line that sit close together (e.g. "Start" "time") into header cells. */
function headerCells(line: Line): HeaderCell[] {
  const cells: HeaderCell[] = [];
  for (const it of line.items) {
    const last = cells[cells.length - 1];
    if (last && it.x - last.right < 0.6 * it.height) {
      last.text = `${last.text} ${it.str.trim()}`;
      last.right = it.x + it.width;
    } else {
      cells.push({ text: it.str.trim(), x: it.x, right: it.x + it.width });
    }
  }
  return cells;
}

function findHeader(lines: Line[]): { cells: HeaderCell[]; roles: Role[]; signature: string } | null {
  for (const line of lines) {
    const cells = headerCells(line);
    const roles = guessHeader(cells.map((c) => c.text));
    if (roles) return { cells, roles, signature: signatureOf(line) };
  }
  return null;
}

/** Text of a line with digits masked, so "Page 1 of 5" and "Page 2 of 5" compare equal. */
function signatureOf(line: Line): string {
  return lineText(line.items).toLowerCase().replace(/\d+/g, '#');
}

/**
 * Column-based parser: turns positioned PDF text into table rows.
 * Finds the header row, derives column boundaries from it, and starts a new row whenever the
 * number or start column has a value. Lines without one continue the row above, also across
 * page breaks. Falls back to line-based parsing when no header row is found.
 */
export function parseTextItems(items: TextItem[], pages: PageInfo[]): ParsedTable {
  const lines = groupLines(items);
  const pageHeight = new Map(pages.map((p) => [p.page, p.height]));
  const header = findHeader(lines);
  const title = findTitle(lines, header?.signature);

  if (!header) {
    const result = parseLines(dropMargins(lines, pageHeight).map((l) => lineText(l.items)));
    return { ...result, title };
  }

  // Column i owns x in [bounds[i], bounds[i+1]). Cell text is usually left aligned under its
  // header, so the boundary sits a little left of the next header's start.
  const { cells, roles } = header;
  const bounds = cells.map((c, i) => {
    if (i === 0) return -Infinity;
    const gap = Math.max(0, c.x - cells[i - 1].right);
    return c.x - Math.min(gap * 0.4, 8);
  });
  const columnOf = (x: number) => {
    let col = 0;
    for (let i = 0; i < bounds.length; i++) if (x >= bounds[i] - 0.5) col = i;
    return col;
  };
  const numberCol = roles.indexOf('number');
  const startCol = roles.indexOf('start');

  // On pages that repeat the header row, everything above it is page header / metadata.
  const headerYByPage = new Map<number, number>();
  for (const l of lines) {
    if (signatureOf(l) === header.signature && !headerYByPage.has(l.page)) headerYByPage.set(l.page, l.y);
  }

  const firstHeaderPage = Math.min(...headerYByPage.keys());
  const body = dropMargins(lines, pageHeight).filter((l) => {
    const hy = headerYByPage.get(l.page);
    if (hy !== undefined && l.y <= hy + 0.5) return false;
    // Nothing before the first header row counts (title, metadata).
    return l.page >= firstHeaderPage;
  });

  const rows: string[][] = [];
  for (const line of body) {
    const lineCells: string[] = cells.map(() => '');
    for (const it of line.items) {
      const c = columnOf(it.x);
      lineCells[c] = lineCells[c] ? `${lineCells[c]} ${it.str.trim()}` : it.str.trim();
    }
    const cleaned = lineCells.map((c) => c.replace(/\s+/g, ' ').trim());
    const startsRow =
      (numberCol >= 0 && NUMBER_RE.test(cleaned[numberCol])) ||
      (startCol >= 0 && TIME_RE.test(cleaned[startCol])) ||
      (numberCol < 0 && startCol < 0);

    if (startsRow) {
      rows.push(cleaned);
    } else if (rows.length) {
      const row = rows[rows.length - 1];
      cleaned.forEach((text, i) => {
        if (text) row[i] = row[i] ? `${row[i]}\n${text}` : text;
      });
    }
  }

  const columns: Column[] = cells.map((c, i) => ({ name: c.text, guess: roles[i] }));
  return { mode: 'columns', title, columns, rows };
}

/**
 * Remove page numbers, and lines in the top/bottom margin that repeat on several pages
 * (running headers and footers). Repeated lines in the body are kept: titles may repeat.
 */
function dropMargins(lines: Line[], pageHeight: Map<number, number>): Line[] {
  const pagesBySig = new Map<string, Set<number>>();
  for (const l of lines) {
    const sig = signatureOf(l);
    if (!pagesBySig.has(sig)) pagesBySig.set(sig, new Set());
    pagesBySig.get(sig)!.add(l.page);
  }
  return lines.filter((l) => {
    const text = lineText(l.items);
    if (PAGE_NUMBER_RE.test(text)) return false;
    const h = pageHeight.get(l.page);
    const inMargin = h !== undefined && (l.y < h * MARGIN || l.y > h * (1 - MARGIN));
    return !(inMargin && (pagesBySig.get(signatureOf(l))?.size ?? 0) > 1);
  });
}

/** Sequence name suggestion: the largest text on page 1 above the header row. */
function findTitle(lines: Line[], headerSignature?: string): string | undefined {
  const firstPage = lines[0]?.page;
  let best: Line | undefined;
  for (const l of lines) {
    if (l.page !== firstPage) break;
    if (headerSignature && signatureOf(l) === headerSignature) break;
    const text = lineText(l.items);
    if (!text || METADATA_RE.test(text) || PAGE_NUMBER_RE.test(text)) continue;
    if (!best || l.height > best.height + 0.5) best = l;
  }
  return best ? lineText(best.items) : undefined;
}
