// Real run sheets: put foo.pdf (or .docx/.xlsx) and foo.expected.json in fixtures/ (or fixtures/private/, which git
// ignores – for customer documents) and they are checked here. `npm run fixture:expect <file>`
// writes the expected JSON from the current parser output, for you to check by hand.
// Expected JSON: { "rows": [{ "number": "1", "start": "17:33", "name": "…" }, …] }
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FIXTURE_EXT, readFixture } from './helpers/read-fixture';

const root = fileURLToPath(new URL('../fixtures/', import.meta.url));
const dirs = [root, join(root, 'private')].filter((d) => existsSync(d));
const cases = dirs.flatMap((dir) =>
  readdirSync(dir)
    .filter((f) => FIXTURE_EXT.test(f) && existsSync(join(dir, f.replace(FIXTURE_EXT, '.expected.json'))))
    .map((f) => join(dir, f)),
);

describe.skipIf(!cases.length)('fixtures', () => {
  for (const file of cases) {
    it(file.slice(root.length), async () => {
      const expected = JSON.parse(readFileSync(file.replace(FIXTURE_EXT, '.expected.json'), 'utf8'));
      expect(await readFixture(file)).toEqual(expected.rows);
    });
  }
});
