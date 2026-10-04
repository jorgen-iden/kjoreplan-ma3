import type { Role } from './types';

const KEYWORDS: Record<Exclude<Role, 'other'>, string[]> = {
  number: ['#', 'nr', 'no', 'nummer', 'num', 'cue', 'pkt'],
  start: ['start', 'starttid', 'start time', 'tid', 'time', 'kl', 'klokke', 'klokkeslett', 'begin'],
  duration: ['duration', 'varighet', 'dur', 'lengde', 'length', 'tidsbruk'],
  title: ['title', 'tittel', 'program', 'programpost', 'innhold', 'beskrivelse', 'description', 'item', 'hva', 'punkt', 'event'],
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[:.]+$/, '').replace(/\s+/g, ' ').trim();
}

/** Role of a header cell, or null if the text is not a known header word. */
export function headerRole(text: string): Exclude<Role, 'other'> | null {
  const n = normalize(text);
  for (const role of Object.keys(KEYWORDS) as Exclude<Role, 'other'>[]) {
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
