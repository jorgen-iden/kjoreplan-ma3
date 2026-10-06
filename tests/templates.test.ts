import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { defaultMapping, rowsToCues } from '../src/lib/cues';
import { importOffice } from '../src/lib/import';
import { TEMPLATES } from '../src/lib/templates';

// The free templates on /run-sheet-template must read cleanly in CueSetter: one cue per item,
// with the set list as extra lines, the title as sequence name and the times as clock times.
describe('run sheet templates', () => {
  for (const t of Object.values(TEMPLATES)) {
    for (const ext of ['xlsx', 'docx'] as const) {
      it(`${t.file}.${ext}`, async () => {
        const buf = readFileSync(`public/templates/${t.file}.${ext}`);
        const [source] = await importOffice(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), `${t.file}.${ext}`);
        const { table } = source;
        expect(table.title).toBe(t.title);
        const mapping = defaultMapping(table);
        expect(Object.values(mapping).every((v) => v !== null)).toBe(true);
        const cues = rowsToCues(table, mapping);
        expect(cues.map((c) => c.name)).toEqual(t.rows.map((r) => r[3].split('\n')[0]));
        expect(cues[1].time).toBe(t.rows[1][1]);
        expect(cues[2].note).toBe(t.rows[2][3].split("\n").slice(1).join("\n"));
      });
    }
  }
});
