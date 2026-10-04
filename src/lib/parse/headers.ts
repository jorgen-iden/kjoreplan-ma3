import type { Column, Role } from './types';

type KnownRole = Exclude<Role, 'other'>;

/** Header words per role, lower case. Norwegian and English, as seen in real run sheets. */
const KEYWORDS: Record<KnownRole, string[]> = {
  number: ['#', 'nr', 'no', 'nummer', 'num', 'cue', 'pkt'],
  start: ['start', 'starttid', 'start time', 'tid', 'tid fra', 'fra', 'from', 'time', 'kl', 'klokke', 'klokken', 'klokkeslett', 'klokkeslag', 'tidspunkt', 'begin'],
  end: ['slutt', 'sluttid', 'tid til', 'til', 'to', 'end', 'end time', 'stopp', 'ferdig'],
  duration: ['duration', 'varighet', 'dur', 'durata', 'lengde', 'length', 'tidsbruk'],
  title: ['title', 'tittel', 'program', 'programpost', 'innhold', 'beskrivelse', 'description', 'item', 'hva', 'punkt', 'event', 'aktivitet', 'agenda', 'stage', 'scene', 'what', 'segment', 'innslag', 'programpunkt', 'hendelse'],
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[:.]+$/, '').replace(/\s+/g, ' ').trim();
}

/** Role of a header cell, or null if the text is not a known header word. */
export function headerRole(text: string): KnownRole | null {
  const n = normalize(text);
  for (const role of Object.keys(KEYWORDS) as KnownRole[]) {
    if (KEYWORDS[role].includes(n)) return role;
  }
  return null;
}

/**
 * Guess roles for a list of header cells. Each role is used at most once (first match wins);
 * everything else becomes 'other'. Returns null if the cells do not look like a header row.
 */
export function guessHeader(cells: string[]): Role[] | null {
  const used = new Set<Role>();
  const roles: Role[] = cells.map((c) => {
    const r = headerRole(c);
    if (!r || used.has(r)) return 'other';
    used.add(r);
    return r;
  });
  const known = roles.filter((r) => r !== 'other').length;
  if (known < 2 || cells.length < 2) return null;
  if (!used.has('title') && !used.has('start')) return null;
  return roles;
}

export const TIME_RE = /^\d{1,2}[:.]\d{2}(?:[:.]\d{2})?$/;
export const NUMBER_RE = /^\d+(?:\.\d+)?$/;
/** A clock time anywhere in a text, e.g. "Start 9:30:00" → "9:30:00". */
const TIME_FIND = /(?:^|[^\d])(\d{1,2}[:.]\d{2}(?:[:.]\d{2})?)(?!\d)/;
/** Labels that put a time in the start column without starting a new item (block layouts). */
const NOT_START_LABEL = /^(?:varighet|duration|dur|slutt|end|stopp|til)\b/i;
const DURATION_LABEL = /^(?:varighet|duration|dur|durata)\b/i;

export function findTime(text: string): string | null {
  return TIME_FIND.exec(text)?.[1] ?? null;
}

/** Start time in a start cell: the first line with a time that isn't labelled as duration or end. */
export function startTimeIn(cell: string): string | null {
  for (const line of cell.split('\n')) {
    if (NOT_START_LABEL.test(line.trim())) continue;
    const t = findTime(line);
    if (t) return t;
  }
  return null;
}

/** Item number written after the start time on the same line ("Start 9:30:00 1"), if any. */
export function trailingNumberIn(cell: string): string | null {
  for (const line of cell.split('\n')) {
    if (NOT_START_LABEL.test(line.trim())) continue;
    const m = /\d{1,2}[:.]\d{2}(?:[:.]\d{2})?\s+(\d+)\s*$/.exec(line);
    if (m) return m[1];
    if (findTime(line)) return null;
  }
  return null;
}

/** Duration written inside the start cell ("Varighet 0:30:00"), used when there is no duration column. */
export function labelledDurationIn(cell: string): string | null {
  for (const line of cell.split('\n')) {
    if (DURATION_LABEL.test(line.trim())) return findTime(line);
  }
  return null;
}

/** Column indexes the row logic needs; -1 when the column doesn't exist. */
export interface KeyColumns {
  number: number;
  start: number;
  end: number;
}

export function keyColumns(roles: Role[]): KeyColumns {
  return { number: roles.indexOf('number'), start: roles.indexOf('start'), end: roles.indexOf('end') };
}

/**
 * Does this line start a new item? Yes when the number column has a number, the start column has
 * a time (not a "Varighet"/"Slutt" line), or the end column has a time while the start is empty.
 * Tables without any of these columns start an item on every line.
 */
export function startsRow(cells: string[], k: KeyColumns): boolean {
  if (k.number < 0 && k.start < 0 && k.end < 0) return true;
  if (k.number >= 0 && NUMBER_RE.test(cells[k.number] ?? '')) return true;
  const start = k.start >= 0 ? (cells[k.start] ?? '') : '';
  if (start && !NOT_START_LABEL.test(start) && findTime(start)) return true;
  return k.end >= 0 && !start && findTime(cells[k.end] ?? '') !== null;
}

/**
 * If no column was recognised as the title, use the 'other' column with the most text. Real run
 * sheets call it many things ("Stage", "Agenda" …), and the title is nearly always the wordiest.
 */
export function ensureTitleColumn(columns: Column[], rows: string[][]): Column[] {
  if (columns.some((c) => c.guess === 'title')) return columns;
  let best = -1;
  let bestLength = 0;
  columns.forEach((c, i) => {
    if (c.guess !== 'other') return;
    const length = rows.reduce((sum, r) => sum + (r[i] ?? '').length, 0);
    if (length > bestLength) {
      best = i;
      bestLength = length;
    }
  });
  return best < 0 ? columns : columns.map((c, i) => (i === best ? { ...c, guess: 'title' } : c));
}
