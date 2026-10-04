// Layouts seen in real run sheets (Kiwiaden, Grieghallen/UiB). The files themselves are customer
// documents and stay out of the repo; these synthetic versions keep the same geometry.
import { describe, expect, it } from 'vitest';
import { defaultMapping, rowsToCues } from '../src/lib/cues';
import { parseTextItems, type TextItem } from '../src/lib/parse';
import { ensureTitleColumn } from '../src/lib/parse/headers';

type Cell = [x: number, str: string];
/** Build positioned text: one entry per line, 13pt apart, items 5pt wide per character. */
function page(lines: Cell[][], startY = 120): { items: TextItem[]; pages: { page: number; width: number; height: number }[] } {
  const items: TextItem[] = [];
  lines.forEach((cells, i) =>
    cells.forEach(([x, str]) => items.push({ str, x, y: startY + i * 13, width: str.length * 5, height: 9, page: 1 })),
  );
  return { items, pages: [{ page: 1, width: 595, height: 842 }] };
}
const cuesOf = (lines: Cell[][]) => {
  const { items, pages } = page(lines);
  const table = parseTextItems(items, pages);
  return { table, cues: rowsToCues(table, defaultMapping(table)) };
};

describe('"Tid fra / Tid til" table (Kiwiaden total)', () => {
  const H: Cell[] = [[40, 'Dato'], [90, 'Tid fra'], [140, 'Tid til'], [190, 'Hva'], [330, 'Lokasjon'], [420, 'Merknad']];
  const { table, cues } = cuesOf([
    H,
    [[40, '13.sep'], [90, '09:00'], [140, '15:00'], [190, 'Rigg Spissen'], [330, 'Spissen'], [420, 'Bright']],
    [[90, '17:00'], [140, '19:00'], [190, 'Prøver Arme riddere'], [330, 'Konf.rom'], [420, 'Booket rom']],
    [[40, '14.sep'], [90, '06:00'], [190, 'Get in teknikk'], [330, 'Griegsalen'], [420, 'Bright']],
    [[190, 'Siste prerig'], [330, 'Griegsalen']],
    [[140, '15:00'], [190, 'Rigg teknikk'], [330, 'Peer Gynt']],
  ]);

  it('recognises start, end and title columns', () => {
    expect(table.columns.map((c) => c.guess)).toEqual(['other', 'start', 'end', 'title', 'other', 'other']);
  });

  it('starts a row on a start time, or on an end time when the start is empty', () => {
    expect(cues.map((c) => [c.time, c.name])).toEqual([
      ['09:00', 'Rigg Spissen'],
      ['17:00', 'Prøver Arme riddere'],
      ['06:00', 'Get in teknikk'],
      ['', 'Rigg teknikk'],
    ]);
    expect(cues[2].note).toBe('Siste prerig');
  });
});

describe('Start / Varighet / Slutt blocks (Kiwiaden program)', () => {
  const H: Cell[] = [[60, 'TID'], [140, 'INNHOLD'], [380, 'BILDE / PRAKTISK INFO'], [500, 'Lyd']];
  const { cues } = cuesOf([
    H,
    [[10, 'Start'], [60, '9:30:00'], [140, '1']],
    [[10, 'Varighet'], [60, '0:30:00'], [140, 'Siste forberedelser']],
    [[10, 'Slutt'], [60, '10:00:00']],
    [[10, 'Start'], [60, '10:00:00'], [140, '2']],
    [[10, 'Varighet'], [60, '0:30:00'], [140, 'DØRENE ÅPNER']],
    [[140, 'Velkomstbrev deles ut'], [500, 'DJ Spotify']],
    [[10, 'Slutt'], [60, '10:30:00']],
    [[10, 'Start'], [60, '15:30:00']],
  ]);

  it('reads one item per block, with number, time, duration and name', () => {
    expect(cues.map((c) => [c.srcNumber, c.time, c.duration, c.name, c.note])).toEqual([
      ['1', '09:30', '0:30:00', 'Siste forberedelser', ''],
      ['2', '10:00', '0:30:00', 'DØRENE ÅPNER', 'Velkomstbrev deles ut'],
    ]);
  });
});

describe('Block layout with the number after the start time', () => {
  const H: Cell[] = [[60, 'TID'], [140, 'INNHOLD']];
  const { cues } = cuesOf([
    H,
    [[10, 'Start'], [60, '20:43:00'], [110, '18']],
    [[10, 'Varighet'], [60, '0:04:00'], [140, 'Musikalsk innslag']],
    [[10, 'Start'], [60, '20:47:00'], [110, '19']],
    [[140, '20 Heine intro Jan Paul']],
    [[10, 'Start'], [60, '20:53:00'], [140, '2 x marimba']],
  ]);

  it('finds numbers after the time or in front of the title, but only when they follow on', () => {
    expect(cues.map((c) => [c.srcNumber, c.name])).toEqual([
      ['18', 'Musikalsk innslag'],
      ['19', '20 Heine intro Jan Paul'],
      ['', '2 x marimba'],
    ]);
  });
});

describe('NR / KL / DURATA / STAGE (Grieghallen minute plan)', () => {
  const H: Cell[] = [[33, 'NR'], [60, 'KL'], [95, 'DURATA'], [145, 'STAGE'], [478, 'TEKNIKK']];
  const { table, cues } = cuesOf([
    H,
    [[39, '8'], [60, '16:26'], [96, '2:00'], [138, 'Konferansier - Frode'], [478, 'Lyd: Bøyle 2']],
    // The PDF splits the first letter off: "K" + "onferansier" must join without a space.
    [[36, '10'], [60, '16:34'], [96, '2:00'], [138, 'K'], [143, 'onferansier - Aashild'], [478, 'Lyd: Bøyle 1']],
  ]);

  it('uses STAGE as the title and keeps text that starts left of its header in the right column', () => {
    expect(table.columns.map((c) => c.guess)).toEqual(['number', 'start', 'duration', 'title', 'other']);
    expect(cues.map((c) => [c.srcNumber, c.name])).toEqual([
      ['8', 'Konferansier - Frode'],
      ['10', 'Konferansier - Aashild'],
    ]);
  });
});

describe('Wide gap after the title column', () => {
  it('keeps the end of a long title in the title column', () => {
    const { cues } = cuesOf([
      [[60, 'TID'], [140, 'INNHOLD'], [400, 'BILDE / PRAKTISK INFO']],
      [[60, '10:50'], [140, 'Runar'], [175, '"Markedet - Ny hverdag i bransjen"'], [400, 'Logo']],
    ]);
    expect(cues[0].name).toBe('Runar "Markedet - Ny hverdag i bransjen"');
  });
});

describe('ensureTitleColumn', () => {
  it('picks the wordiest unrecognised column when no title header was found', () => {
    const cols = ensureTitleColumn(
      [
        { name: 'NR', guess: 'number' },
        { name: 'Sted', guess: 'other' },
        { name: 'Opplegg', guess: 'other' },
      ],
      [
        ['1', 'Sal', 'Velkommen ved programleder'],
        ['2', 'Sal', 'Tale fra ordføreren'],
      ],
    );
    expect(cols.map((c) => c.guess)).toEqual(['number', 'other', 'title']);
  });
});
