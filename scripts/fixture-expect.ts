// Writes <file>.expected.json next to each given PDF from what the parser reads today.
// Check the JSON by hand before trusting it: it becomes the answer the tests compare against.
import { readFileSync, writeFileSync } from 'node:fs';
import { defaultMapping, rowsToCues } from '../src/lib/cues';
import { parseTextItems } from '../src/lib/parse';
import { extract } from '../tests/helpers/extract';

async function main() {
  for (const file of process.argv.slice(2)) {
    const { items, pages } = await extract(new Uint8Array(readFileSync(file)));
    const table = parseTextItems(items, pages);
    const rows = rowsToCues(table, defaultMapping(table)).map((c) => ({ number: c.srcNumber, start: c.time, name: c.name }));
    const out = file.replace(/\.pdf$/i, '.expected.json');
    writeFileSync(out, JSON.stringify({ rows }, null, 2) + '\n');
    console.log(`${out}: ${rows.length} rows`);
  }
}

void main();
