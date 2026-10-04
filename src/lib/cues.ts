import { labelledDurationIn, startTimeIn, trailingNumberIn } from './parse/headers';
import type { ParsedTable, Role } from './parse/types';

/** Which column holds what. null = not used. */
export interface Mapping {
  number: number | null;
  start: number | null;
  duration: number | null;
  title: number | null;
}

export interface Cue {
  id: string;
  /** Number from the run sheet's # column (editable). Empty for sub-cues. */
  srcNumber: string;
  name: string;
  time: string;
  duration: string;
  note: string;
  /** Set for sub-cues created by "split into sub-cues". */
  parentId?: string;
}

export type NumberingMode = 'follow' | 'running';

let nextId = 1;
export const newId = () => `c${nextId++}`;

export function defaultMapping(table: ParsedTable): Mapping {
  const find = (role: Role) => {
    const i = table.columns.findIndex((c) => c.guess === role);
    return i >= 0 ? i : null;
  };
  return { number: find('number'), start: find('start'), duration: find('duration'), title: find('title') };
}

/** HH:MM:SS, H.MM etc. → HH:MM. Anything else is returned trimmed. */
export function formatTime(raw: string): string {
  const m = /^(\d{1,2})[:.](\d{2})(?:[:.]\d{2})?$/.exec(raw.trim());
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : raw.trim();
}

/** Remove a leading list marker such as "- ", "• " or "– " from a line. */
export function stripBullet(line: string): string {
  return line.trim().replace(/^[-–—•*·]\s*/, '').trim();
}

const NUMBER_LINE = /^\d+(?:\.\d+)?$/;
const LEADING_NUMBER = /^(\d+)\s+(\S.*)$/;

function splitLines(s: string): string[] {
  return s.split('\n').map((l) => l.trim()).filter(Boolean);
}

/** Turn table rows into cues: name is the title cell's first line, note the rest. */
export function rowsToCues(table: ParsedTable, mapping: Mapping): Cue[] {
  const cell = (row: string[], col: number | null) => (col === null ? '' : (row[col] ?? '').trim());
  const cues: Cue[] = [];
  let lastNumber = 0;
  for (const row of table.rows) {
    let lines = splitLines(cell(row, mapping.title));
    const startCell = cell(row, mapping.start);
    const time = formatTime(startTimeIn(startCell) ?? '');
    let srcNumber = splitLines(cell(row, mapping.number))[0] ?? '';
    // Without a number column, layouts put the item number in other places:
    if (!srcNumber) {
      const leading = lines.length ? LEADING_NUMBER.exec(lines[0]) : null;
      if (lines.length && NUMBER_LINE.test(lines[0])) {
        // on its own line at the top of the title cell,
        srcNumber = lines[0];
        lines = lines.slice(1);
      } else if (trailingNumberIn(startCell)) {
        // after the start time ("Start 9:30:00 1"),
        srcNumber = trailingNumberIn(startCell)!;
      } else if (leading && Number(leading[1]) === lastNumber + 1) {
        // or in front of the title ("20 Heine intro"), only when it is the next number, so a title
        // like "2 x marimba" is left alone.
        srcNumber = leading[1];
        lines = [leading[2], ...lines.slice(1)];
      }
    }
    if (NUMBER_LINE.test(srcNumber)) lastNumber = Math.floor(Number(srcNumber));
    // Rows with neither a name nor a number are end markers or stray lines, not items.
    if (!lines.length && !srcNumber) continue;
    cues.push({
      id: newId(),
      srcNumber,
      name: lines[0] ?? '',
      time,
      duration: splitLines(cell(row, mapping.duration))[0] ?? labelledDurationIn(startCell) ?? '',
      note: lines.slice(1).join('\n'),
    });
  }
  return cues;
}

/** Each note line of the cue becomes its own sub-cue (13 → 13.1, 13.2 …), placed right after it. */
export function splitIntoSubCues(cues: Cue[], id: string): Cue[] {
  const i = cues.findIndex((c) => c.id === id);
  if (i < 0) return cues;
  const parent = cues[i];
  const subs: Cue[] = splitLines(parent.note).map(stripBullet).filter(Boolean).map((line) => ({
    id: newId(),
    srcNumber: '',
    name: line,
    time: '',
    duration: '',
    note: '',
    parentId: parent.id,
  }));
  if (!subs.length) return cues;
  // Skip past sub-cues the parent already has.
  let end = i + 1;
  while (end < cues.length && cues[end].parentId === parent.id) end++;
  return [...cues.slice(0, i), { ...parent, note: '' }, ...cues.slice(i + 1, end), ...subs, ...cues.slice(end)];
}

const CUE_NUMBER_RE = /^\d+(?:\.\d{1,3})?$/;

export interface Numbering {
  numbers: Map<string, string>;
  /** True when 'follow' was asked for but the # column could not be used. */
  fellBack: boolean;
  /** Cues without a # that got a number between their neighbours. */
  filled: number;
}

/**
 * Cue numbers. 'follow' uses the # column when every top-level cue has a valid, strictly
 * increasing number; otherwise (and for 'running') top-level cues are numbered 1, 2, 3 …
 * Sub-cues get parent.1, parent.2 … (parent.01 … when there are more than nine).
 */
export function computeNumbers(cues: Cue[], mode: NumberingMode): Numbering {
  if (mode === 'follow') {
    const filled = fillMissingNumbers(cues);
    const result = filled && tryNumbers(cues, (c) => filled.numbers.get(c.id)!);
    if (filled && result) return { numbers: result, fellBack: false, filled: filled.count };
  }
  let n = 0;
  const running = tryNumbers(cues, () => String(++n))!;
  return { numbers: running, fellBack: mode === 'follow', filled: 0 };
}

const validSrc = (c: Cue): number | null => {
  const s = c.srcNumber.trim().replace(',', '.');
  return CUE_NUMBER_RE.test(s) && Number(s) > 0 ? Number(s) : null;
};

const formatNumber = (n: number) => String(Math.round(n * 1000) / 1000);

/**
 * Top-level cues keep their # from the run sheet. Cues without one get a number between their
 * neighbours (1 → 2 → 3 when there is room, otherwise 28 → 28.5 → 29; several in a row are spread evenly), so one missing # doesn't throw
 * away the numbering of the whole list. Null when the run sheet has no usable numbers at all.
 */
function fillMissingNumbers(cues: Cue[]): { numbers: Map<string, string>; count: number } | null {
  const tops = cues.filter((c) => !c.parentId);
  const values = tops.map(validSrc);
  if (!values.some((v) => v !== null)) return null;
  const numbers = new Map<string, string>();
  let count = 0;
  for (let i = 0; i < tops.length; ) {
    if (values[i] !== null) {
      numbers.set(tops[i].id, formatNumber(values[i]!));
      i++;
      continue;
    }
    let end = i;
    while (end < tops.length && values[end] === null) end++;
    const lo = i > 0 ? values[i - 1]! : 0;
    const hi = end < tops.length ? values[end]! : Infinity;
    const run = end - i;
    // Whole numbers when they fit (1, _, 3 → 2), otherwise evenly spaced decimals (28, _, 29 → 28.5).
    const wholeFits = Number.isInteger(lo) && hi - lo - 1 >= run;
    const step = wholeFits ? 1 : Math.min(0.5, (hi - lo) / (run + 1));
    for (let k = 0; k < run; k++) numbers.set(tops[i + k].id, formatNumber(lo + step * (k + 1)));
    count += run;
    i = end;
  }
  return { numbers, count };
}

function tryNumbers(cues: Cue[], topNumber: (c: Cue) => string): Map<string, string> | null {
  const numbers = new Map<string, string>();
  const subCount = new Map<string, number>();
  for (const c of cues) if (c.parentId) subCount.set(c.parentId, (subCount.get(c.parentId) ?? 0) + 1);
  const subIndex = new Map<string, number>();
  let prev = -Infinity;
  for (const c of cues) {
    let num: string;
    if (c.parentId && numbers.has(c.parentId)) {
      const k = (subIndex.get(c.parentId) ?? 0) + 1;
      subIndex.set(c.parentId, k);
      const digits = subCount.get(c.parentId)! > 9 ? 2 : 1;
      const parent = numbers.get(c.parentId)!;
      num = parent.includes('.') ? `${parent}${String(k).padStart(digits, '0')}` : `${parent}.${String(k).padStart(digits, '0')}`;
    } else {
      num = topNumber(c);
    }
    if (!CUE_NUMBER_RE.test(num) || Number(num) <= 0 || Number(num) <= prev) return null;
    prev = Number(num);
    numbers.set(c.id, num);
  }
  return numbers;
}

/** Index range [start, end) of a top-level cue and its sub-cues. */
function blockRange(cues: Cue[], start: number): [number, number] {
  let end = start + 1;
  while (end < cues.length && cues[end].parentId === cues[start].id) end++;
  return [start, end];
}

/** Start index of the top-level block that contains index i. */
function blockStart(cues: Cue[], i: number): number {
  while (i > 0 && cues[i].parentId) i--;
  return i;
}

/**
 * Move a cue one step up or down. A top-level cue moves together with its sub-cues, past the
 * neighbouring block; a sub-cue only swaps with its siblings.
 */
export function moveCue(cues: Cue[], id: string, dir: -1 | 1): Cue[] {
  const i = cues.findIndex((c) => c.id === id);
  if (i < 0) return cues;
  const cue = cues[i];
  if (cue.parentId) {
    const j = i + dir;
    if (j < 0 || j >= cues.length || cues[j].parentId !== cue.parentId) return cues;
    const next = [...cues];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  }
  const [s, e] = blockRange(cues, i);
  if (dir === -1) {
    if (s === 0) return cues;
    const ps = blockStart(cues, s - 1);
    return [...cues.slice(0, ps), ...cues.slice(s, e), ...cues.slice(ps, s), ...cues.slice(e)];
  }
  if (e >= cues.length) return cues;
  const [, ne] = blockRange(cues, e);
  return [...cues.slice(0, s), ...cues.slice(e, ne), ...cues.slice(s, e), ...cues.slice(ne)];
}

/**
 * Move a top-level cue (with its sub-cues) so it lands right before the block containing
 * `targetId`, or at the end when `targetId` is null. Used for drag and drop.
 */
export function moveCueBefore(cues: Cue[], id: string, targetId: string | null): Cue[] {
  const i = cues.findIndex((c) => c.id === id);
  if (i < 0 || cues[i].parentId) return cues;
  const [s, e] = blockRange(cues, i);
  const block = cues.slice(s, e);
  const rest = [...cues.slice(0, s), ...cues.slice(e)];
  if (targetId === null) return [...rest, ...block];
  const t = rest.findIndex((c) => c.id === targetId);
  if (t < 0) return cues;
  const ts = blockStart(rest, t);
  return [...rest.slice(0, ts), ...block, ...rest.slice(ts)];
}

/**
 * Move a top-level cue (with its sub-cues) right before or right after the block containing
 * `targetId`. Used while dragging, so the list can show where the cue will land.
 */
export function moveCueNextTo(cues: Cue[], id: string, targetId: string, side: 'before' | 'after'): Cue[] {
  if (side === 'before') return moveCueBefore(cues, id, targetId);
  const t = cues.findIndex((c) => c.id === targetId);
  if (t < 0) return cues;
  const [, end] = blockRange(cues, blockStart(cues, t));
  return moveCueBefore(cues, id, cues[end]?.id ?? null);
}

/** Remove a cue; removing a top-level cue also removes its sub-cues. */
export function removeCue(cues: Cue[], id: string): Cue[] {
  return cues.filter((c) => c.id !== id && c.parentId !== id);
}
