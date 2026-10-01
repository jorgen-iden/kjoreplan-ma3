import { computeNumbers, type Cue, type NumberingMode } from '../cues';
import { escapeXml, MAX_NOTE_LENGTH, sanitizeText } from './sanitize';

export interface MacroSettings {
  sequence: number;
  sequenceName: string;
  numbering: NumberingMode;
  nameFormat: 'title' | 'time-title';
  includeNotes: boolean;
  clearFirst: boolean;
}

export interface MacroCue {
  id: string;
  number: string;
  label: string;
  note: string;
  /** The label was cut to fit the maximum length. */
  truncated: boolean;
}

export interface PreparedCues {
  cues: MacroCue[];
  /** 'follow' numbering was asked for but the # column could not be used. */
  numberingFellBack: boolean;
}

/** Work out the number, label and note each cue will get on the console. */
export function prepareCues(cues: Cue[], s: MacroSettings): PreparedCues {
  const { numbers, fellBack } = computeNumbers(cues, s.numbering);
  const prepared = cues.map((c) => {
    const base = s.nameFormat === 'time-title' && c.time ? `${c.time} ${c.name}` : c.name;
    const label = sanitizeText(base);
    const noteParts: string[] = [];
    if (c.time) noteParts.push(`Start ${c.time}`);
    if (c.duration && !/^0{1,2}[:.]00(?:[:.]00)?$/.test(c.duration)) noteParts.push(`Varighet ${c.duration}`);
    const head = noteParts.join(', ');
    const body = c.note.split('\n').map((l) => l.trim()).filter(Boolean).join(' / ');
    const note = sanitizeText([head, body].filter(Boolean).join(' / '), MAX_NOTE_LENGTH).value;
    return { id: c.id, number: numbers.get(c.id)!, label: label.value, note, truncated: label.truncated };
  });
  return { cues: prepared, numberingFellBack: fellBack };
}

/**
 * The MA command lines, in order. The syntax for the Note property is NOT verified yet
 * (see README: Verifisering).
 */
export function buildCommands(cues: MacroCue[], s: MacroSettings): string[] {
  const seq = `Sequence ${s.sequence}`;
  const cmds: string[] = [];
  if (s.clearFirst) cmds.push('ClearAll');
  for (const c of cues) {
    cmds.push(`Store ${seq} Cue ${c.number}`);
    if (c.label) cmds.push(`Label ${seq} Cue ${c.number} "${c.label}"`);
    if (s.includeNotes && c.note) cmds.push(`Set ${seq} Cue ${c.number} Property "Note" "${c.note}"`);
  }
  const seqName = sanitizeText(s.sequenceName).value;
  if (seqName) cmds.push(`Label ${seq} "${seqName}"`);
  return cmds;
}

/**
 * Macro XML for the grandMA3 macro pool. The structure is an UNVERIFIED assumption and must be
 * checked against a real export from the console (see README: Verifisering).
 */
export function buildMacroXml(macroName: string, commands: string[], dataVersion: string): string {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<GMA3 DataVersion="${escapeXml(dataVersion)}">`,
    `  <Macro Name="${escapeXml(sanitizeText(macroName).value)}">`,
    ...commands.map((c) => `    <MacroLine Command="${escapeXml(c)}"/>`),
    '  </Macro>',
    '</GMA3>',
  ];
  return lines.join('\n') + '\n';
}

/** Fallback: all commands on one line, separated by semicolons, for pasting into the command line. */
export function buildCommandLine(commands: string[]): string {
  return commands.join('; ');
}
