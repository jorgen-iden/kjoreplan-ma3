import { beforeAll, describe, expect, it } from 'vitest';
import { defaultMapping, rowsToCues, splitIntoSubCues, type Cue } from '../src/lib/cues';
import { parseTextItems, type ParsedTable } from '../src/lib/parse';
import { extract } from './helpers/extract';
import { makeRunSheetPdf, ROWS } from './helpers/runsheet';

describe('PDF run sheet (synthetic Hjertebank layout)', () => {
  let table: ParsedTable;
  let cues: Cue[];

  beforeAll(async () => {
    const { items, pages } = await extract(await makeRunSheetPdf());
    expect(pages.length).toBeGreaterThan(1);
    table = parseTextItems(items, pages);
    cues = rowsToCues(table, defaultMapping(table));
  });

  it('finds the header columns', () => {
    expect(table.mode).toBe('columns');
    expect(table.columns.map((c) => c.name)).toEqual(['#', 'Start', 'Duration', 'Title', 'Lyd', 'Kommentar']);
    expect(table.columns.map((c) => c.guess)).toEqual(['number', 'start', 'duration', 'title', 'other', 'other']);
  });

  it('takes the sequence name from the largest heading on page 1', () => {
    expect(table.title).toBe('Hjertebank 2026 - Bjørnafjorden');
  });

  it('gives 24 rows with the right # and start time', () => {
    expect(cues).toHaveLength(24);
    expect(cues.map((c) => c.srcNumber)).toEqual(ROWS.map((r) => String(r.n)));
    expect(cues.map((c) => c.time)).toEqual(ROWS.map((r) => r.start.slice(0, 5)));
  });

  it('uses the first title line as name and the rest as note', () => {
    expect(cues.map((c) => c.name)).toEqual(ROWS.map((r) => r.title[0]));
    expect(cues.map((c) => c.note)).toEqual(ROWS.map((r) => r.title.slice(1).join('\n')));
  });

  it('keeps Lyd and Kommentar out of the titles', () => {
    expect(cues[4].name).toBe('Samtale med Tarjei');
    const all = cues.map((c) => `${c.name}\n${c.note}`).join('\n');
    expect(all).not.toMatch(/HH1|UT TARJEI|Boge|Playback|Lys ned/);
  });

  it('drops running header/footer, repeated headers and metadata', () => {
    const all = cues.map((c) => `${c.name}\n${c.note}`).join('\n');
    expect(all).not.toMatch(/Page \d|When:|Printed:|By:|Kommentar|Duration/);
    expect(all.match(/Hjertebank/g)).toBeNull();
  });

  it('merges a row split across a page break', () => {
    expect(cues[22].note.split('\n')).toEqual(ROWS[22].title.slice(1));
  });

  it('splits row 23 into one sub-cue per line, and deleting the non-song line leaves 7 songs', () => {
    let list = splitIntoSubCues(cues, cues[22].id);
    let subs = list.filter((c) => c.parentId === cues[22].id);
    expect(subs.map((c) => c.name)[0]).toBe('SETTLISTE BEKREFTET');
    list = list.filter((c) => c.id !== subs[0].id);
    subs = list.filter((c) => c.parentId === cues[22].id);
    expect(subs).toHaveLength(7);
  });
});
