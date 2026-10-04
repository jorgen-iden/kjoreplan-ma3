import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { defaultMapping, rowsToCues } from '../src/lib/cues';
import { ImportError, importOffice, isOldOffice } from '../src/lib/import';
import { formatSerial } from '../src/lib/import/xlsx';

async function zip(files: Record<string, string>): Promise<ArrayBuffer> {
  const z = new JSZip();
  for (const [path, body] of Object.entries(files)) z.file(path, body);
  return z.generateAsync({ type: 'arraybuffer' });
}

const cell = (ref: string, v: string | number, extra = '') =>
  typeof v === 'number' ? `<c r="${ref}"${extra}><v>${v}</v></c>` : `<c r="${ref}" t="inlineStr"><is><t>${v}</t></is></c>`;

function workbook(sheets: { name: string; xml: string; hidden?: boolean }[], shared: string[] = []) {
  const files: Record<string, string> = {
    'xl/workbook.xml': `<workbook xmlns:r="r"><sheets>${sheets
      .map((s, i) => `<sheet name="${s.name}" sheetId="${i + 1}" r:id="rId${i + 1}"${s.hidden ? ' state="hidden"' : ''}/>`)
      .join('')}</sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `<Relationships>${sheets
      .map((_, i) => `<Relationship Id="rId${i + 1}" Target="worksheets/sheet${i + 1}.xml"/>`)
      .join('')}</Relationships>`,
    // Style 1 is built-in format 20 (h:mm).
    'xl/styles.xml': '<styleSheet><cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="20"/></cellXfs></styleSheet>',
    'xl/sharedStrings.xml': `<sst>${shared.map((s) => `<si><t>${s}</t><rPh><t>x</t></rPh></si>`).join('')}</sst>`,
  };
  sheets.forEach((s, i) => (files[`xl/worksheets/sheet${i + 1}.xml`] = `<worksheet><sheetData>${s.xml}</sheetData></worksheet>`));
  return files;
}

describe('formatSerial', () => {
  it('formats times, dates and both', () => {
    expect(formatSerial(0.75, 'time')).toBe('18:00');
    expect(formatSerial(0.7708333333, 'time')).toBe('18:30');
    expect(formatSerial(45000, 'date')).toBe('15.03.2023');
    expect(formatSerial(45000.5, 'datetime')).toBe('15.03.2023 12:00');
  });
});

describe('importOffice: Excel', () => {
  it('finds the header below a title, reads shared strings and time cells, and skips hidden sheets', async () => {
    const plan = [
      `<row r="1">${cell('A1', 'Gallamiddag 2024')}</row>`,
      `<row r="3"><c r="A3" t="s"><v>0</v></c><c r="B3" t="s"><v>1</v></c><c r="C3" t="s"><v>2</v></c></row>`,
      `<row r="4">${cell('A4', 1)}${cell('B4', 0.75, ' s="1"')}${cell('C4', 'Dørene åpner')}</row>`,
      `<row r="5">${cell('A5', 2)}${cell('B5', 0.7708333333, ' s="1"')}${cell('C5', 'Velkommen &amp; tale')}</row>`,
    ].join('');
    const data = await zip(
      workbook(
        [
          { name: 'Skjult', xml: `<row r="1">${cell('A1', 'Tid')}${cell('B1', 'Hva')}</row>`, hidden: true },
          { name: 'Program', xml: plan },
        ],
        ['#', 'Tid', 'Innhold'],
      ),
    );
    const sources = await importOffice(data, 'plan.xlsx');
    expect(sources.map((s) => s.name)).toEqual(['Program']);
    const { table } = sources[0];
    expect(table.title).toBe('Gallamiddag 2024');
    const cues = rowsToCues(table, defaultMapping(table));
    expect(cues.map((c) => [c.srcNumber, c.time, c.name])).toEqual([
      ['1', '18:00', 'Dørene åpner'],
      ['2', '18:30', 'Velkommen & tale'],
    ]);
  });

  it('uses the file name instead of a default sheet name like "Ark1"', async () => {
    const xml = `<row r="1">${cell('A1', 'Tid')}${cell('B1', 'Hva')}</row><row r="2">${cell('A2', '18:00')}${cell('B2', 'Dører')}</row>`;
    const [source] = await importOffice(await zip(workbook([{ name: 'Ark1', xml }])), 'Julekonsert 2024.xlsx');
    expect(source.table.title).toBe('Julekonsert 2024');
  });

  it('reports a workbook without a run sheet table', async () => {
    const data = await zip(workbook([{ name: 'Budsjett', xml: `<row r="1">${cell('A1', 'Sum')}${cell('B1', 1200)}</row>` }]));
    await expect(importOffice(data, 'budsjett.xlsx')).rejects.toMatchObject({ problem: 'noTable' });
  });
});

const p = (text: string) => `<w:p><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
const tc = (body: string, props = '') => `<w:tc>${props ? `<w:tcPr>${props}</w:tcPr>` : ''}${body}</w:tc>`;
const tr = (...cells: string[]) => `<w:tr>${cells.join('')}</w:tr>`;
const docx = (body: string) => zip({ 'word/document.xml': `<w:document><w:body>${body}</w:body></w:document>` });

describe('importOffice: Word', () => {
  it('reads every table, keeps lines inside a cell, and handles merged cells', async () => {
    const info = `<w:tbl>${tr(tc(p('Sted')), tc(p('Grieghallen')))}</w:tbl>`;
    const plan = `<w:tbl>${[
      tr(tc(p('Kl.')), tc(p('Innslag')), tc(p('Lys'))),
      tr(tc(p('19:00')), tc(p('Konsert') + p('Låt 1') + p('Låt 2')), tc(p('Blått'))),
      tr(tc(p('19:45')), tc(p('Pause'), '<w:gridSpan w:val="2"/>')),
    ].join('')}</w:tbl>`;
    const data = await docx(`${p('Kjøreplan Vårkonsert')}${info}${p('')}${plan}`);
    const sources = await importOffice(data, 'vår.docx');
    const planSource = sources.find((s) => s.table.rows.length === 2)!;
    expect(planSource.kind).toBe('docx');
    expect(planSource.table.title).toBe('Kjøreplan Vårkonsert');
    const cues = rowsToCues(planSource.table, defaultMapping(planSource.table));
    expect(cues.map((c) => [c.time, c.name])).toEqual([
      ['19:00', 'Konsert'],
      ['19:45', 'Pause'],
    ]);
    expect(cues[0].note).toContain('Låt 1');
  });

  it('falls back to reading lines when the document has no table', async () => {
    const data = await docx(`${p('18:00 Dørene åpner')}${p('18:30 Velkommen')}`);
    const [source] = await importOffice(data, 'Min plan .docx');
    expect(source.table.title).toBe('Min plan');
    expect(rowsToCues(source.table, defaultMapping(source.table)).map((c) => c.name)).toEqual(['Dørene åpner', 'Velkommen']);
  });
});

describe('importOffice: errors', () => {
  it('recognises old .doc/.xls files', async () => {
    const bytes = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    expect(isOldOffice(bytes)).toBe(true);
    await expect(importOffice(bytes.buffer, 'gammel.doc')).rejects.toMatchObject({ problem: 'oldFormat' });
  });

  it('rejects files that are not Office documents', async () => {
    const err = await importOffice(new TextEncoder().encode('hei').buffer as ArrayBuffer, 'x.docx').catch((e) => e);
    expect(err).toBeInstanceOf(ImportError);
    expect(err.problem).toBe('unreadable');
  });
});
