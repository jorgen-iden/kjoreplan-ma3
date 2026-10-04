import { describe, expect, it } from 'vitest';
import { computeNumbers, formatTime, newId, splitIntoSubCues, type Cue } from '../src/cues';

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

  it('falls back to running numbers when # is missing or not increasing', () => {
    for (const src of [['1', '', '3'], ['1', '3', '2'], ['1', '1'], ['a', 'b']]) {
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
