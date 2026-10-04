import { parseGrid } from './grid';
import { parseLines } from './lines';
import type { ParsedTable } from './types';

/**
 * Parse pasted text. Tab-separated text with a header row (e.g. copied from a spreadsheet or a
 * Word table) is read column by column; anything else uses the line-based fallback.
 */
export function parsePastedText(text: string): ParsedTable {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (lines.filter((l) => l.includes('\t')).length >= 2) {
    const table = parseGrid(lines.map((l) => l.split('\t')));
    if (table) return { ...table, title: undefined };
  }
  return parseLines(lines.map((l) => l.replace(/\t/g, ' ')));
}
