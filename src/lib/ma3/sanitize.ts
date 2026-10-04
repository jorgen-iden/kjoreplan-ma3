export const MAX_NAME_LENGTH = 40;
export const MAX_NOTE_LENGTH = 250;

export interface Sanitized {
  value: string;
  truncated: boolean;
}

/**
 * Make text safe inside a quoted MA command argument: double quotes would end the argument
 * and semicolons separate commands on the command line, so both are replaced. Whitespace is
 * collapsed and the result cut at `max` characters.
 */
export function sanitizeText(raw: string, max = MAX_NAME_LENGTH): Sanitized {
  const clean = raw
    .replace(/["“”„«»]/g, "'")
    .replace(/;/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
  const chars = [...clean];
  if (chars.length <= max) return { value: clean, truncated: false };
  return { value: chars.slice(0, max).join('').trimEnd(), truncated: true };
}

/** File name: a–z, 0–9 and hyphens only. */
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'kjoreplan';
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
