import { describe, expect, it } from 'vitest';
import { computeNumbers, formatTime, moveCue, moveCueBefore, newId, removeCue, splitIntoSubCues, type Cue } from '../src/lib/cues';

const cue = (srcNumber: string, name = 'x', note = ''): Cue => ({ id: newId(), srcNumber, name, time: '', duration: '', note });

describe('formatTime', () => {
  it('shows HH:MM', () => {
    expect(formatTime('17:33:00')).toBe('17:33');
    expect(formatTime('9.05')).toBe('09:05');
    expect(formatTime('')).toBe('');
  });
});

describe('computeNumbers', () => {
  it('follows the # column', () => {
    const cues = [cue('1'), cue('2'), cue('5')];
    const { numbers, fellBack } = computeNumbers(cues, 'follow');
    expect(cues.map((c) => numbers.get(c.id))).toEqual(['1', '2', '5']);
    expect(fellBack).toBe(false);
  });

  it('gives cues without a # a number between their neighbours', () => {
    const cases: [string[], string[]][] = [
      [['1', '', '3'], ['1', '2', '3']],
      [['28', '', '29'], ['28', '28.5', '29']],
      [['28', '', '', '29'], ['28', '28.333', '28.667', '29']],
      [['32', '', ''], ['32', '33', '34']],
      [['10', '', '20'], ['10', '11', '20']],
      [['', '1'], ['0.5', '1']],
    ];
    for (const [src, want] of cases) {
      const cues = src.map((s) => cue(s));
      const { numbers, fellBack, filled } = computeNumbers(cues, 'follow');
      expect(fellBack).toBe(false);
      expect(filled).toBe(src.filter((s) => !s).length);
      expect(cues.map((c) => numbers.get(c.id))).toEqual(want);
    }
  });

  it('falls back to running numbers when # is missing everywhere or not increasing', () => {
    for (const src of [['', '', ''], ['1', '3', '2'], ['1', '1'], ['a', 'b']]) {
      const cues = src.map((s) => cue(s));
      const { numbers, fellBack } = computeNumbers(cues, 'follow');
      expect(fellBack).toBe(true);
      expect(cues.map((c) => numbers.get(c.id))).toEqual(src.map((_, i) => String(i + 1)));
    }
  });

  it('numbers sub-cues parent.1, parent.2 …', () => {
    let cues = [cue('12'), cue('13', 'Konsert', 'A\nB\nC'), cue('14')];
    cues = splitIntoSubCues(cues, cues[1].id);
    const { numbers } = computeNumbers(cues, 'follow');
    expect(cues.map((c) => numbers.get(c.id))).toEqual(['12', '13', '13.1', '13.2', '13.3', '14']);
    expect(cues[1].note).toBe('');
  });

  it('uses two digits when there are more than nine sub-cues, so 13.10 never equals 13.1', () => {
    let cues = [cue('13', 'Konsert', Array.from({ length: 11 }, (_, i) => `Låt ${i + 1}`).join('\n')), cue('14')];
    cues = splitIntoSubCues(cues, cues[0].id);
    const { numbers, fellBack } = computeNumbers(cues, 'follow');
    expect(fellBack).toBe(false);
    expect(numbers.get(cues[1].id)).toBe('13.01');
    expect(numbers.get(cues[11].id)).toBe('13.11');
  });

  it('strips list markers from sub-cue names', () => {
    let cues = [cue('1', 'Konsert', '- Lost in the Woods\n• Nordlys\n– Siste dans')];
    cues = splitIntoSubCues(cues, cues[0].id);
    expect(cues.slice(1).map((c) => c.name)).toEqual(['Lost in the Woods', 'Nordlys', 'Siste dans']);
  });

  it('keeps sub-cues under their parent in running mode', () => {
    let cues = [cue('10'), cue('20', 'K', 'A\nB')];
    cues = splitIntoSubCues(cues, cues[1].id);
    const { numbers } = computeNumbers(cues, 'running');
    expect(cues.map((c) => numbers.get(c.id))).toEqual(['1', '2', '2.1', '2.2']);
  });
});

describe('moving cues', () => {
  const setup = () => {
    let cues = [cue('1', 'A'), cue('2', 'B', 'x\ny'), cue('3', 'C')];
    cues = splitIntoSubCues(cues, cues[1].id);
    return cues; // A, B, B.x, B.y, C
  };
  const names = (cs: Cue[]) => cs.map((c) => c.name);

  it('moves a top-level cue together with its sub-cues', () => {
    const cues = setup();
    expect(names(moveCue(cues, cues[1].id, -1))).toEqual(['B', 'x', 'y', 'A', 'C']);
    expect(names(moveCue(cues, cues[1].id, 1))).toEqual(['A', 'C', 'B', 'x', 'y']);
    expect(names(moveCue(cues, cues[0].id, 1))).toEqual(['B', 'x', 'y', 'A', 'C']);
    expect(names(moveCue(cues, cues[4].id, -1))).toEqual(['A', 'C', 'B', 'x', 'y']);
  });

  it('keeps sub-cues within their parent', () => {
    const cues = setup();
    expect(names(moveCue(cues, cues[3].id, -1))).toEqual(['A', 'B', 'y', 'x', 'C']);
    expect(moveCue(cues, cues[2].id, -1)).toBe(cues);
    expect(moveCue(cues, cues[3].id, 1)).toBe(cues);
  });

  it('does nothing at the edges', () => {
    const cues = setup();
    expect(moveCue(cues, cues[0].id, -1)).toBe(cues);
    expect(moveCue(cues, cues[4].id, 1)).toBe(cues);
  });

  it('drops a block before another block, or at the end', () => {
    const cues = setup();
    expect(names(moveCueBefore(cues, cues[4].id, cues[3].id))).toEqual(['A', 'C', 'B', 'x', 'y']);
    expect(names(moveCueBefore(cues, cues[0].id, null))).toEqual(['B', 'x', 'y', 'C', 'A']);
  });

  it('removes a cue with its sub-cues', () => {
    const cues = setup();
    expect(names(removeCue(cues, cues[1].id))).toEqual(['A', 'C']);
  });
});
