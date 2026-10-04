import { attr, decodeXml, elements, startTag } from './xml';

export interface Sheet {
  name: string;
  rows: string[][];
}

type Kind = 'time' | 'date' | 'datetime' | 'number';

/** Built-in Excel number formats: 14–17 dates, 18–21 and 45–47 times, 22 date + time. */
function builtinKind(id: number): Kind {
  if (id >= 14 && id <= 17) return 'date';
  if ((id >= 18 && id <= 21) || (id >= 45 && id <= 47)) return 'time';
  if (id === 22) return 'datetime';
  return 'number';
}

function customKind(code: string): Kind {
  const c = code.replace(/"[^"]*"|\[[^\]]*\]|\\./g, '').toLowerCase();
  const hasDate = /[dy]/.test(c);
  const hasTime = /h|ss/.test(c) || /m{1,2}:/.test(c);
  if (hasDate && hasTime) return 'datetime';
  if (hasTime) return 'time';
  if (hasDate) return 'date';
  return 'number';
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Excel serial number → "HH:MM", "dd.mm.yyyy" or both. Day 0 is 1899-12-30. */
export function formatSerial(value: number, kind: Kind): string {
  const minutes = Math.round((value - Math.floor(value)) * 24 * 60) % (24 * 60);
  const time = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
  const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86_400_000);
  const date = `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
  if (kind === 'time') return time;
  if (kind === 'date') return date;
  return `${date} ${time}`;
}

/** "AB12" → 27 (zero-based column index). */
function columnIndex(ref: string): number {
  let n = 0;
  for (const ch of ref.replace(/\d+$/, '').toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** Text of a <si> or <is> element: all <t> runs, without phonetic hints (<rPh>). */
function richText(xml: string): string {
  const plain = xml.replace(/<rPh[\s\S]*?<\/rPh>/g, '');
  return [...plain.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((m) => decodeXml(m[1])).join('');
}

/** Read every visible sheet of an .xlsx file into rows of display text. */
export function readXlsx(files: Record<string, string>): Sheet[] {
  const shared = files['xl/sharedStrings.xml'] ? elements(files['xl/sharedStrings.xml'], 'si').map(richText) : [];

  const styles = files['xl/styles.xml'] ?? '';
  const custom = new Map<number, Kind>();
  for (const f of elements(styles, 'numFmt')) custom.set(Number(attr(f, 'numFmtId')), customKind(attr(f, 'formatCode') ?? ''));
  const cellXfs = elements(styles, 'cellXfs')[0] ?? '';
  const xfKinds = elements(cellXfs, 'xf').map((xf) => {
    const id = Number(attr(startTag(xf), 'numFmtId') ?? 0);
    return custom.get(id) ?? builtinKind(id);
  });

  const rels = new Map<string, string>();
  for (const r of elements(files['xl/_rels/workbook.xml.rels'] ?? '', 'Relationship')) {
    const target = attr(r, 'Target') ?? '';
    rels.set(attr(r, 'Id') ?? '', target.startsWith('/') ? target.slice(1) : `xl/${target}`);
  }

  const sheets: Sheet[] = [];
  for (const s of elements(files['xl/workbook.xml'] ?? '', 'sheet')) {
    if (attr(s, 'state') === 'hidden' || attr(s, 'state') === 'veryHidden') continue;
    const xml = files[rels.get(attr(s, 'r:id') ?? '') ?? ''];
    if (!xml) continue;
    const rows: string[][] = [];
    for (const row of elements(xml, 'row')) {
      const r = Number(attr(startTag(row), 'r') ?? rows.length + 1) - 1;
      const cells: string[] = [];
      for (const c of elements(row, 'c')) {
        const tag = startTag(c);
        const type = attr(tag, 't');
        const v = /<v>([\s\S]*?)<\/v>/.exec(c)?.[1];
        let text = '';
        if (type === 's' && v !== undefined) text = shared[Number(v)] ?? '';
        else if (type === 'inlineStr') text = richText(c);
        else if (type === 'str' || type === 'e') text = v !== undefined ? decodeXml(v) : '';
        else if (type === 'b') text = v === '1' ? 'TRUE' : 'FALSE';
        else if (v !== undefined) {
          const kind = xfKinds[Number(attr(tag, 's') ?? 0)] ?? 'number';
          const num = Number(v);
          text = kind === 'number' || Number.isNaN(num) ? v.replace(/\.0+$/, '') : formatSerial(num, kind);
        }
        cells[columnIndex(attr(tag, 'r') ?? '')] = text;
      }
      rows[r] = Array.from(cells, (c) => c ?? '');
    }
    sheets.push({ name: attr(s, 'name') ?? `Sheet ${sheets.length + 1}`, rows: Array.from(rows, (r) => r ?? []) });
  }
  return sheets;
}
