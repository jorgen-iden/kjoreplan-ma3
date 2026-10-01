import { guessHeader, NUMBER_RE, TIME_RE } from './headers';
import { parseLines } from './lines';
import type { ParsedTable } from './types';

/**
 * Parse pasted text. Tab-separated text with a header row (e.g. copied from a spreadsheet)
 * is read column by column; anything else uses the line-based fallback.
 */
export function parsePastedText(text: string): ParsedTable {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const tabbed = lines.filter((l) => l.includes('\t'));
  if (tabbed.length >= 2) {
    const headerIndex = lines.findIndex((l, i) => i < 10 && l.includes('\t') && guessHeader(splitTabs(l)));
    if (headerIndex >= 0) {
      const names = splitTabs(lines[headerIndex]);
      const roles = guessHeader(names)!;
      const numberCol = roles.indexOf('number');
      const startCol = roles.indexOf('start');
      const rows: string[][] = [];
      for (const line of lines.slice(headerIndex + 1)) {
        if (!line.trim()) continue;
        const cells = names.map((_, i) => splitTabs(line)[i] ?? '');
        if (cells.join('\t') === names.join('\t')) continue; // repeated header
        const startsRow =
          (numberCol >= 0 && NUMBER_RE.test(cells[numberCol])) ||
          (startCol >= 0 && TIME_RE.test(cells[startCol])) ||
          (numberCol < 0 && startCol < 0);
        if (startsRow || !rows.length) rows.push(cells);
        else
          cells.forEach((c, i) => {
            if (c) rows[rows.length - 1][i] = rows[rows.length - 1][i] ? `${rows[rows.length - 1][i]}\n${c}` : c;
          });
      }
      return { mode: 'columns', columns: names.map((name, i) => ({ name, guess: roles[i] })), rows };
    }
  }
  return parseLines(lines.map((l) => l.replace(/\t/g, ' ')));
}

function splitTabs(line: string): string[] {
  return line.split('\t').map((c) => c.replace(/\s+/g, ' ').trim());
}
