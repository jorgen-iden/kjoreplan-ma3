import { parseGrid } from '../parse/grid';
import { findTime } from '../parse/headers';
import { parseLines } from '../parse/lines';
import type { ParsedTable } from '../parse/types';
import { readDocx } from './docx';
import { readXlsx } from './xlsx';

/** One importable table: a sheet in a workbook or a table in a Word document. */
export interface Source {
  kind: OfficeKind;
  /** Sheet name, or the table's position in the document (1, 2 …). */
  name: string;
  table: ParsedTable;
}

export type OfficeKind = 'docx' | 'xlsx';
export type ImportProblem = 'oldFormat' | 'noTable' | 'unreadable';

export class ImportError extends Error {
  constructor(public problem: ImportProblem) {
    super(problem);
  }
}

/** Old binary Office files (.doc/.xls) start with the OLE signature D0 CF 11 E0. */
export function isOldOffice(bytes: Uint8Array): boolean {
  return bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
}

/** Sheet names Excel gives by default (Sheet1, Ark1, Tabelle1 …) say nothing about the show. */
const DEFAULT_SHEET_NAME = /^(sheet|ark|blad|tabelle|feuil|hoja|foglio)\s*\d+$/i;

/** Turn already unzipped .docx/.xlsx XML parts into importable tables, best candidate first. */
export function sourcesFromParts(kind: OfficeKind, files: Record<string, string>, fallbackTitle: string): Source[] {
  if (kind === 'xlsx') {
    const sources: Source[] = [];
    for (const sheet of readXlsx(files)) {
      const table = parseGrid(sheet.rows);
      const title = table?.title ?? (DEFAULT_SHEET_NAME.test(sheet.name.trim()) ? fallbackTitle : sheet.name);
      if (table && table.rows.length) sources.push({ kind, name: sheet.name, table: { ...table, title } });
    }
    return sources;
  }
  const doc = readDocx(files['word/document.xml'] ?? '');
  const title = doc.title ?? fallbackTitle;
  const sources: Source[] = [];
  doc.tables.forEach((t, i) => {
    const table = parseGrid(t.rows, title);
    if (table && table.rows.length) sources.push({ kind, name: `${i + 1}`, table });
  });
  if (!sources.length && doc.paragraphs.length) {
    // No usable table: read the document's lines like pasted text.
    const table = parseLines(doc.paragraphs.flatMap((p) => p.split('\n')));
    // Without a table the first paragraph may be the first item, not a heading.
    const heading = doc.title && !findTime(doc.title) ? doc.title : fallbackTitle;
    if (table.rows.length) sources.push({ kind, name: '1', table: { ...table, title: table.title ?? heading } });
  }
  return sources;
}

/** Unzip a .docx/.xlsx file (JSZip, loaded on demand) and read its tables. */
export async function importOffice(data: ArrayBuffer, fileName: string): Promise<Source[]> {
  const bytes = new Uint8Array(data);
  if (isOldOffice(bytes)) throw new ImportError('oldFormat');
  const { default: JSZip } = await import('jszip');
  let zip: InstanceType<typeof JSZip>;
  try {
    zip = await JSZip.loadAsync(bytes);
  } catch {
    throw new ImportError('unreadable');
  }
  const kind: OfficeKind | null = zip.file('xl/workbook.xml') ? 'xlsx' : zip.file('word/document.xml') ? 'docx' : null;
  if (!kind) throw new ImportError('unreadable');
  const wanted = Object.keys(zip.files).filter((p) =>
    kind === 'xlsx' ? /^xl\/(workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|styles\.xml|worksheets\/[^/]+\.xml)$/.test(p) : p === 'word/document.xml',
  );
  const files: Record<string, string> = {};
  for (const p of wanted) files[p] = await zip.file(p)!.async('string');
  const sources = sourcesFromParts(kind, files, fileName.replace(/\.(docx|xlsx)$/i, '').trim());
  if (!sources.length) throw new ImportError('noTable');
  return sources;
}
