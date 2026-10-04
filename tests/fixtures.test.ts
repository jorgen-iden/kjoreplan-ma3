// Real run sheets: put foo.pdf and foo.expected.json in fixtures/ (or fixtures/private/, which git
// ignores – for customer documents) and they are checked here. `npm run fixture:expect <pdf>`
// writes the expected JSON from the current parser output, for you to check by hand.
// Expected JSON: { "rows": [{ "number": "1", "start": "17:33", "name": "…" }, …] }
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { defaultMapping, rowsToCues } from '../src/lib/cues';
import { parseTextItems } from '../src/lib/parse';
import { extract } from './helpers/extract';

const root = fileURLToPath(new URL('../fixtures/', import.meta.url));
const dirs = [root, join(root, 'private')].filter((d) => existsSync(d));
const cases = dirs.flatMap((dir) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.pdf') && existsSync(join(dir, f.replace(/\.pdf$/, '.expected.json'))))
    .map((f) => join(dir, f)),
);

describe.skipIf(!cases.length)('fixtures', () => {
  for (const file of cases) {
    it(file.slice(root.length), async () => {
      const expected = JSON.parse(readFileSync(file.replace(/\.pdf$/, '.expected.json'), 'utf8'));
      const { items, pages } = await extract(new Uint8Array(readFileSync(file)));
      const table = parseTextItems(items, pages);
      const cues = rowsToCues(table, defaultMapping(table));
      expect(cues.map((c) => ({ number: c.srcNumber, start: c.time, name: c.name }))).toEqual(expected.rows);
    });
  }
});
