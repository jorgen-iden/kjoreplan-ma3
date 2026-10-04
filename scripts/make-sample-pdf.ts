// Writes the synthetic sample run sheet: public/sample-run-sheet.pdf (the app's «Prøv med en
// eksempel-kjøreplan») and fixtures/eksempel-kjoreplan.pdf (for trying the app by hand).
import { writeFileSync } from 'node:fs';
import { makeRunSheetPdf } from '../tests/helpers/runsheet';

const pdf = await makeRunSheetPdf();
for (const path of ['../public/sample-run-sheet.pdf', '../fixtures/eksempel-kjoreplan.pdf']) {
  writeFileSync(new URL(path, import.meta.url), pdf);
  console.log(`Skrev ${path.slice(3)}`);
}
