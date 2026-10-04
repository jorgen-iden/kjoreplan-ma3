import type { ParsedTable } from './types';

const TIME_LINE =
  /^(?:(\d+(?:\.\d+)?)[.)]?\s+)?(\d{1,2}[:.]\d{2}(?:[:.]\d{2})?)(?:\s*[-–]\s*\d{1,2}[:.]\d{2}(?:[:.]\d{2})?)?\s+(.+)$/;
const NUMBERED_LINE = /^(\d+(?:\.\d+)?)[.)]?\s+(.+)$/;

/**
 * Line-based fallback: used when no header row is found. Lines starting with a time become items;
 * if there are no times, numbered lines do; otherwise every line is an item. Other lines are
 * appended to the item above (they end up in the note).
 */
export function parseLines(input: string[]): ParsedTable {
  const lines = input.map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const hasTimes = lines.some((l) => TIME_LINE.test(l));
  const hasNumbers = !hasTimes && lines.filter((l) => NUMBERED_LINE.test(l)).length >= 2;
  const rows: string[][] = [];

  for (const line of lines) {
    let row: string[] | null = null;
    if (hasTimes) {
      const m = TIME_LINE.exec(line);
      if (m) row = [m[1] ?? '', m[2], m[3]];
    } else if (hasNumbers) {
      const m = NUMBERED_LINE.exec(line);
      if (m) row = [m[1], '', m[2]];
    } else {
      row = ['', '', line];
    }
    if (row) rows.push(row);
    else if (rows.length) rows[rows.length - 1][2] += '\n' + line;
  }

  return {
    mode: 'lines',
    columns: [
      { name: '#', guess: 'number' },
      { name: 'Start', guess: 'start' },
      { name: 'Tittel', guess: 'title' },
    ],
    rows,
  };
}
