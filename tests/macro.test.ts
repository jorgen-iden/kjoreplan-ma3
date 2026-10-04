import { describe, expect, it } from 'vitest';
import { newId, type Cue } from '../src/lib/cues';
import { buildCommandLine, buildCommands, buildMacroXml, prepareCues, type MacroSettings } from '../src/lib/ma3/macro';
import { escapeXml, sanitizeText, slugify } from '../src/lib/ma3/sanitize';

const settings: MacroSettings = {
  sequence: 101,
  sequenceName: 'Kjøreplan dag 1',
  numbering: 'follow',
  nameFormat: 'title',
  noteTime: false,
  noteText: false,
  clearFirst: true,
};
const cue = (srcNumber: string, name: string, extra: Partial<Cue> = {}): Cue => ({
  id: newId(), srcNumber, name, time: '', duration: '', note: '', ...extra,
});

describe('buildCommands', () => {
  it('produces the commands in the expected order', () => {
    const { cues } = prepareCues([cue('1', 'Velkommen'), cue('2', 'Keynote')], settings);
    expect(buildCommands(cues, settings)).toEqual([
      'ClearAll',
      'Store Sequence 101 Cue 1',
      'Label Sequence 101 Cue 1 "Velkommen"',
      'Store Sequence 101 Cue 2',
      'Label Sequence 101 Cue 2 "Keynote"',
      'Label Sequence 101 "Kjøreplan dag 1"',
    ]);
  });

  it('omits ClearAll when turned off', () => {
    const s = { ...settings, clearFirst: false };
    expect(buildCommands(prepareCues([cue('1', 'A')], s).cues, s)[0]).toBe('Store Sequence 101 Cue 1');
  });

  it('can prefix the time to the name', () => {
    const s = { ...settings, nameFormat: 'time-title' as const };
    const { cues } = prepareCues([cue('1', 'Artist 2: Grim Spencer', { time: '18:45' })], s);
    expect(cues[0].label).toBe('18:45 Artist 2: Grim Spencer');
  });

  it('adds a Note command with start, duration and the rest of the title', () => {
    const s = { ...settings, noteTime: true, noteText: true };
    const { cues } = prepareCues([cue('1', 'Konsert', { time: '20:00', duration: '00:30:00', note: 'Låt 1\nLåt 2' })], s);
    expect(buildCommands(cues, s)).toContain(
      'Set Sequence 101 Cue 1 Property "Note" "Start 20:00, Duration 00:30:00 / Låt 1 / Låt 2"',
    );
  });

  it('skips a zero duration in the note', () => {
    const s = { ...settings, noteTime: true, noteText: true };
    const { cues } = prepareCues([cue('1', 'A', { time: '17:30', duration: '00:00:00' })], s);
    expect(cues[0].note).toBe('Start 17:30');
  });
});

describe('note options', () => {
  const c = () => cue('1', 'Konsert', { time: '18:39', duration: '00:05:00', note: 'Artist 1: Nils\n- Lost in the Woods' });

  it('can include only the rest of the title, without list markers', () => {
    const s = { ...settings, noteTime: false, noteText: true };
    expect(prepareCues([c()], s).cues[0].note).toBe('Artist 1: Nils / Lost in the Woods');
  });

  it('can include only start and duration', () => {
    const s = { ...settings, noteTime: true, noteText: false };
    expect(prepareCues([c()], s).cues[0].note).toBe('Start 18:39, Duration 00:05:00');
    expect(prepareCues([c()], s, { start: 'Start', duration: 'Varighet' }).cues[0].note).toBe('Start 18:39, Varighet 00:05:00');
  });

  it('skips the Note command when both are off', () => {
    const cmds = buildCommands(prepareCues([c()], settings).cues, settings);
    expect(cmds.some((x) => x.includes('Note'))).toBe(false);
  });
});

describe('sanitizing', () => {
  it('replaces double quotes and semicolons, collapses whitespace', () => {
    expect(sanitizeText('  Artist  "Brass";\tdel 2 “x” ').value).toBe("Artist 'Brass', del 2 'x'");
  });

  it('cuts names over 40 characters and flags it', () => {
    const r = sanitizeText('Takk for i kveld og vel hjem – vi sees neste år igjen på Os');
    expect([...r.value].length).toBeLessThanOrEqual(40);
    expect(r.truncated).toBe(true);
  });

  it('keeps æøå, apostrophes, ampersands and dashes', () => {
    expect(sanitizeText("Sophie & Co – Kari's «æøå»").value).toBe("Sophie & Co – Kari's 'æøå'");
  });

  it('escapes XML attribute values', () => {
    expect(escapeXml(`a & b < c > d " e ' f`)).toBe('a &amp; b &lt; c &gt; d &quot; e &apos; f');
  });

  it('slugifies file names', () => {
    expect(slugify('Høstgalla 2026 – Strandhallen')).toBe('hostgalla-2026-strandhallen');
    expect(slugify('Ærlig talt på Ås!')).toBe('aerlig-talt-pa-as');
    expect(slugify('***')).toBe('kjoreplan');
  });
});

describe('buildMacroXml', () => {
  it('wraps one MacroLine per command with escaped attributes', () => {
    const xml = buildMacroXml('Kjøreplan & co', ['ClearAll', 'Label Sequence 101 Cue 1 "A & B"'], '2.2.0.0');
    expect(xml).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<GMA3 DataVersion="2.2.0.0">',
        '  <Macro Name="Kjøreplan &amp; co">',
        '    <MacroLine Command="ClearAll"/>',
        '    <MacroLine Command="Label Sequence 101 Cue 1 &quot;A &amp; B&quot;"/>',
        '  </Macro>',
        '</GMA3>',
        '',
      ].join('\n'),
    );
  });

  it('builds the command-line fallback with semicolons', () => {
    expect(buildCommandLine(['ClearAll', 'Store Sequence 1 Cue 1'])).toBe('ClearAll; Store Sequence 1 Cue 1');
  });
});
