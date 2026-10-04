// Real run sheets: put foo.pdf and foo.expected.json in fixtures/ and they are checked here.
// Expected JSON: { "rows": [{ "number": "1", "start": "17:33", "name": "…" }, …] }
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { defaultMapping, rowsToCues } from '../src/lib/cues';
import { parseTextItems } from '../src/lib/parse';
import { extract } from './helpers/extract';

const dir = new URL('../fixtures/', import.meta.url);
const cases = readdirSync(dir)
  .filter((f) => f.endsWith('.pdf') && existsSync(new URL(f.replace(/\.pdf$/, '.expected.json'), dir)));

describe.skipIf(!cases.length)('fixtures', () => {
  for (const file of cases) {
    it(file, async () => {
      const expected = JSON.parse(readFileSync(new URL(file.replace(/\.pdf$/, '.expected.json'), dir), 'utf8'));
      const { items, pages } = await extract(new Uint8Array(readFileSync(new URL(file, dir))));
      const table = parseTextItems(items, pages);
      const cues = rowsToCues(table, defaultMapping(table));
      expect(cues.map((c) => ({ number: c.srcNumber, start: c.time, name: c.name }))).toEqual(expected.rows);
    });
  }
});
