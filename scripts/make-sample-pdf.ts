// Writes fixtures/eksempel-kjoreplan.pdf – a synthetic run sheet for trying the app by hand.
import { writeFileSync } from 'node:fs';
import { makeRunSheetPdf } from '../tests/helpers/runsheet';

writeFileSync(new URL('../fixtures/eksempel-kjoreplan.pdf', import.meta.url), await makeRunSheetPdf());
console.log('Skrev fixtures/eksempel-kjoreplan.pdf');
