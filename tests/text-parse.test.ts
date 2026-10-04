import { describe, expect, it } from 'vitest';
import { defaultMapping, rowsToCues } from '../src/lib/cues';
import { parsePastedText, parseTextItems } from '../src/lib/parse';
import type { TextItem } from '../src/lib/parse';

const cuesOf = (text: string) => {
  const t = parsePastedText(text);
  return rowsToCues(t, defaultMapping(t));
};

describe('pasted text', () => {
  it('reads time-prefixed lines and attaches following lines as notes', () => {
    const cues = cuesOf('17:30 Dørene åpner\n17:45:00 Velkommen\nmed programleder\n18.00 Artist 1');
    expect(cues.map((c) => [c.time, c.name, c.note])).toEqual([
      ['17:30', 'Dørene åpner', ''],
      ['17:45', 'Velkommen', 'med programleder'],
      ['18:00', 'Artist 1', ''],
    ]);
  });

  it('reads a leading item number before the time', () => {
    const cues = cuesOf('1 17:30 Dørene åpner\n2. 17:45 Velkommen');
    expect(cues.map((c) => c.srcNumber)).toEqual(['1', '2']);
  });

  it('reads numbered lists without times', () => {
    const cues = cuesOf('1. Intro\n2. Tale\n3) Konsert');
    expect(cues.map((c) => [c.srcNumber, c.name])).toEqual([['1', 'Intro'], ['2', 'Tale'], ['3', 'Konsert']]);
  });

  it('treats each line as a cue when there are no times or numbers', () => {
    expect(cuesOf('Intro\n\nTale\nKonsert').map((c) => c.name)).toEqual(['Intro', 'Tale', 'Konsert']);
  });

  it('reads tab-separated text with a header row by column', () => {
    const t = parsePastedText('#\tStart\tTittel\tLyd\n1\t17:30:00\tVelkommen\tHH1\n\t\tmed Kari\tHH2\n2\t17:40:00\tTale\t');
    expect(t.mode).toBe('columns');
    const cues = rowsToCues(t, defaultMapping(t));
    expect(cues.map((c) => [c.srcNumber, c.time, c.name, c.note])).toEqual([
      ['1', '17:30', 'Velkommen', 'med Kari'],
      ['2', '17:40', 'Tale', ''],
    ]);
  });
});

describe('PDF without a header row', () => {
  it('falls back to line-based parsing', () => {
    const item = (str: string, x: number, y: number): TextItem => ({ str, x, y, width: str.length * 5, height: 10, page: 1 });
    const t = parseTextItems(
      [item('Program', 40, 50), item('17:30', 40, 200), item('Velkommen', 80, 200), item('18:00', 40, 215), item('Konsert', 80, 215)],
      [{ page: 1, width: 595, height: 842 }],
    );
    expect(t.mode).toBe('lines');
    expect(rowsToCues(t, defaultMapping(t)).map((c) => c.name)).toEqual(['Velkommen', 'Konsert']);
  });
});
