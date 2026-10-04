// Writes <file>.expected.json next to each given run sheet (PDF, Word or Excel) from what the parser reads today.
// Check the JSON by hand before trusting it: it becomes the answer the tests compare against.
import { writeFileSync } from 'node:fs';
import { FIXTURE_EXT, readFixture } from '../tests/helpers/read-fixture';

async function main() {
  for (const file of process.argv.slice(2)) {
    const rows = await readFixture(file);
    const out = file.replace(FIXTURE_EXT, '.expected.json');
    writeFileSync(out, JSON.stringify({ rows }, null, 2) + '\n');
    console.log(`${out}: ${rows.length} rows`);
  }
}

void main();
