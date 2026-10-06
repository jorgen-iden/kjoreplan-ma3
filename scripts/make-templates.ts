/**
 * Builds the free run sheet templates in public/templates (Excel and Word, English and Norwegian).
 * Run with `npm run templates` after changing the content. The files are plain Office Open XML,
 * made with JSZip, and tests/templates.test.ts checks that CueSetter reads them.
 */
import { writeFileSync } from 'node:fs';
import JSZip from 'jszip';
import { TEMPLATES, type Template } from '../src/lib/templates';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
// A fixed date keeps the files byte-for-byte the same between runs.
const DATE = new Date('2026-01-01T00:00:00Z');

async function save(zip: JSZip, path: string) {
  for (const f of Object.values(zip.files)) f.date = DATE;
  writeFileSync(path, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

function minutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return (h * 60 + m) / (24 * 60);
}

async function xlsx(t: Template, path: string) {
  const zip = new JSZip();
  const col = (i: number) => 'ABCDE'[i];
  const str = (ref: string, s: string, style = 0) => `<c r="${ref}" t="inlineStr"${style ? ` s="${style}"` : ''}><is><t xml:space="preserve">${esc(s)}</t></is></c>`;
  const rows: string[] = [];
  rows.push(`<row r="1">${str('A1', t.title, 1)}</row>`);
  rows.push(`<row r="2">${str('A2', t.info, 4)}</row>`);
  rows.push(`<row r="4">${t.headers.map((h, i) => str(`${col(i)}4`, h, 2)).join('')}</row>`);
  t.rows.forEach(([n, start, dur, title, notes], i) => {
    const r = i + 5;
    rows.push(
      `<row r="${r}">${str(`A${r}`, n, 5)}<c r="B${r}" s="3"><v>${minutes(start)}</v></c><c r="C${r}" s="5"><v>${dur}</v></c>${str(`D${r}`, title, 5)}${notes ? str(`E${r}`, notes, 5) : ''}</row>`,
    );
  });
  zip.file(
    '[Content_Types].xml',
    `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
  );
  zip.file('_rels/.rels', `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  zip.file(
    'xl/workbook.xml',
    `${XML}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${esc(t.headers[3] === 'Tittel' ? 'Kjøreplan' : 'Run sheet')}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  );
  zip.file(
    'xl/_rels/workbook.xml.rels',
    `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
  );
  // Styles: 0 default, 1 title, 2 header (bold, filled, border), 3 time (h:mm, border), 4 muted info, 5 body (wrap, border).
  zip.file(
    'xl/styles.xml',
    `${XML}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="hh:mm"/></numFmts><fonts count="4"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="16"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><sz val="10"/><color rgb="FF5D636B"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEEF1FD"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"><color rgb="FFE2E0DA"/></left><right style="thin"><color rgb="FFE2E0DA"/></right><top style="thin"><color rgb="FFE2E0DA"/></top><bottom style="thin"><color rgb="FFE2E0DA"/></bottom></border></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="6"><xf/><xf fontId="1" applyFont="1"/><xf fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="164" borderId="1" applyNumberFormat="1" applyBorder="1"><alignment vertical="top"/></xf><xf fontId="3" applyFont="1"/><xf borderId="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs></styleSheet>`,
  );
  zip.file(
    'xl/worksheets/sheet1.xml',
    `${XML}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="6" customWidth="1"/><col min="2" max="2" width="9" customWidth="1"/><col min="3" max="3" width="10" customWidth="1"/><col min="4" max="4" width="44" customWidth="1"/><col min="5" max="5" width="36" customWidth="1"/></cols><sheetData>${rows.join('')}</sheetData></worksheet>`,
  );
  await save(zip, path);
}

async function docx(t: Template, path: string) {
  const zip = new JSZip();
  const run = (s: string, props = '') =>
    s
      .split('\n')
      .map((line, i) => `${i ? '<w:r><w:br/></w:r>' : ''}<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ''}<w:t xml:space="preserve">${esc(line)}</w:t></w:r>`)
      .join('');
  const widths = [700, 1100, 1200, 3900, 3100];
  const cell = (s: string, i: number, header = false) =>
    `<w:tc><w:tcPr><w:tcW w:w="${widths[i]}" w:type="dxa"/>${header ? '<w:shd w:val="clear" w:color="auto" w:fill="EEF1FD"/>' : ''}</w:tcPr><w:p>${run(s, header ? '<w:b/>' : '')}</w:p></w:tc>`;
  const rows = [
    `<w:tr><w:trPr><w:tblHeader/></w:trPr>${t.headers.map((h, i) => cell(h, i, true)).join('')}</w:tr>`,
    ...t.rows.map(([n, start, dur, title, notes]) => `<w:tr>${[n, start, String(dur), title, notes].map((v, i) => cell(v, i)).join('')}</w:tr>`),
  ];
  const border = '<w:top w:val="single" w:sz="4" w:color="C9CFF2"/><w:left w:val="single" w:sz="4" w:color="C9CFF2"/><w:bottom w:val="single" w:sz="4" w:color="C9CFF2"/><w:right w:val="single" w:sz="4" w:color="C9CFF2"/><w:insideH w:val="single" w:sz="4" w:color="C9CFF2"/><w:insideV w:val="single" w:sz="4" w:color="C9CFF2"/>';
  const body = [
    `<w:p><w:pPr><w:spacing w:after="80"/></w:pPr>${run(t.title, '<w:b/><w:sz w:val="36"/>')}</w:p>`,
    `<w:p><w:pPr><w:spacing w:after="240"/></w:pPr>${run(t.info, '<w:color w:val="5D636B"/><w:sz w:val="20"/>')}</w:p>`,
    `<w:tbl><w:tblPr><w:tblW w:w="10000" w:type="dxa"/><w:tblBorders>${border}</w:tblBorders><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>${rows.join('')}</w:tbl>`,
    '<w:p/>',
    `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="950" w:bottom="1000" w:left="950" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr>`,
  ];
  zip.file(
    '[Content_Types].xml',
    `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
  );
  zip.file('_rels/.rels', `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file(
    'word/document.xml',
    `${XML}<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join('')}</w:body></w:document>`,
  );
  await save(zip, path);
}

if (process.argv[1]?.endsWith('make-templates.ts')) {
  for (const t of Object.values(TEMPLATES)) {
    await xlsx(t, `public/templates/${t.file}.xlsx`);
    await docx(t, `public/templates/${t.file}.docx`);
    console.log(`public/templates/${t.file}.xlsx, .docx`);
  }
}
