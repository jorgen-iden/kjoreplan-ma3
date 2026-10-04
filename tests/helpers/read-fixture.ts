import { readFileSync } from 'node:fs';
import { defaultMapping, rowsToCues } from '../../src/lib/cues';
import { importOffice } from '../../src/lib/import';
import { parseTextItems } from '../../src/lib/parse';
import { extract } from './extract';

export const FIXTURE_EXT = /\.(pdf|docx|xlsx)$/i;

export interface FixtureRow {
  number: string;
  start: string;
  name: string;
}

/** The cues the app shows for a run sheet file: for Word/Excel, the first sheet or table that gives cues. */
export async function readFixture(file: string): Promise<FixtureRow[]> {
  const bytes = new Uint8Array(readFileSync(file));
  const tables = file.toLowerCase().endsWith('.pdf')
    ? [await extract(bytes).then(({ items, pages }) => parseTextItems(items, pages))]
    : (await importOffice(bytes.buffer as ArrayBuffer, file)).map((s) => s.table);
  for (const table of tables) {
    const cues = rowsToCues(table, defaultMapping(table));
    if (cues.length) return cues.map((c) => ({ number: c.srcNumber, start: c.time, name: c.name }));
  }
  return [];
}
