import { ensureTitleColumn, guessHeader, keyColumns, startsRow } from './headers';
import type { ParsedTable } from './types';

/** How far down a sheet or table the header row may be (title and info rows come first). */
const HEADER_SEARCH_ROWS = 20;

const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();
/** Keep line breaks inside a cell (Word cells with several paragraphs), tidy the rest. */
const tidy = (s: string) =>
  s
    .split('\n')
    .map(oneLine)
    .filter(Boolean)
    .join('\n');

/**
 * Turn a grid of cells (spreadsheet rows, Word table rows, tab-separated text) into a table.
 * Finds the header row, then starts a new item whenever the number/start/end column has a value;
 * other rows continue the item above. Returns null when no header row is found.
 */
export function parseGrid(grid: string[][], title?: string): ParsedTable | null {
  const rows = grid.map((r) => r.map((c) => tidy(c ?? '')));
  const headerIndex = rows.findIndex((r, i) => i < HEADER_SEARCH_ROWS && guessHeader(r.map(oneLine)) !== null);
  if (headerIndex < 0) return null;

  const header = rows[headerIndex].map(oneLine);
  const width = Math.max(header.length, ...rows.slice(headerIndex + 1).map((r) => lastFilled(r) + 1));
  const names = Array.from({ length: width }, (_, i) => header[i] ?? '');
  const roles = guessHeader(names) ?? guessHeader(header)!.concat(Array(width - header.length).fill('other'));
  const keys = keyColumns(roles);
  const signature = names.join('\t').toLowerCase();

  const out: string[][] = [];
  for (const raw of rows.slice(headerIndex + 1)) {
    const cells = names.map((_, i) => raw[i] ?? '');
    if (!cells.some(Boolean)) continue;
    if (cells.map(oneLine).join('\t').toLowerCase() === signature) continue; // repeated header
    if (startsRow(cells.map((c) => c.split('\n')[0]), keys) || !out.length) {
      out.push(cells);
    } else {
      const row = out[out.length - 1];
      cells.forEach((c, i) => {
        if (c) row[i] = row[i] ? `${row[i]}\n${c}` : c;
      });
    }
  }

  const columns = ensureTitleColumn(
    names.map((name, i) => ({ name, guess: roles[i] })),
    out,
  );
  return { mode: 'columns', title: title ?? titleAbove(rows, headerIndex), columns, rows: out };
}

function lastFilled(row: string[]): number {
  for (let i = row.length - 1; i >= 0; i--) if (row[i]) return i;
  return -1;
}

/** The first text above the header row, e.g. "Kjøreplan Bryggen scene Program søndag". */
function titleAbove(rows: string[][], headerIndex: number): string | undefined {
  for (const r of rows.slice(0, headerIndex)) {
    const first = r.find((c) => c.trim());
    if (first) return oneLine(first);
  }
  return undefined;
}
