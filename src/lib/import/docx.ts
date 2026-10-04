import { attr, decodeXml, elements } from './xml';

export interface DocTable {
  rows: string[][];
}

export interface DocContent {
  /** First line of text before the first table – usually the document's title. */
  title?: string;
  tables: DocTable[];
  /** All paragraphs outside tables, for documents that list the programme without a table. */
  paragraphs: string[];
}

/** Text of one paragraph: text runs, tabs as spaces, line breaks kept. */
function paragraphText(p: string): string {
  let out = '';
  for (const m of p.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br(?:\s[^>]*)?\/>|<w:cr\/>/g)) {
    if (m[1] !== undefined) out += decodeXml(m[1]);
    else if (m[0].startsWith('<w:tab')) out += ' ';
    else out += '\n';
  }
  return out;
}

function cellText(tc: string): string {
  // A nested table's text is included as plain lines.
  return elements(tc, 'w:p')
    .map(paragraphText)
    .map((t) => t.trim())
    .filter(Boolean)
    .join('\n');
}

/** Read the tables (and loose paragraphs) of a .docx file's word/document.xml. */
export function readDocx(documentXml: string): DocContent {
  const body = /<w:body>([\s\S]*)<\/w:body>/.exec(documentXml)?.[1] ?? documentXml;
  const tables: DocTable[] = [];
  const paragraphs: string[] = [];
  let title: string | undefined;

  // Walk the body's top-level blocks in order, so the title is the text before the first table.
  const blocks = /<w:tbl[\s>]|<w:p[\s>]/g;
  let pos = 0;
  for (let m = blocks.exec(body); m; m = blocks.exec(body)) {
    if (m.index < pos) continue;
    const isTable = m[0].startsWith('<w:tbl');
    const el = elements(body.slice(m.index), isTable ? 'w:tbl' : 'w:p')[0];
    if (!el) break;
    pos = m.index + el.length;
    blocks.lastIndex = pos;
    if (isTable) {
      const rows = elements(el, 'w:tr').map((tr) => {
        const cells: string[] = [];
        for (const tc of elements(tr, 'w:tc')) {
          const props = /<w:tcPr>[\s\S]*?<\/w:tcPr>/.exec(tc)?.[0] ?? '';
          const span = Number(attr(/<w:gridSpan[^>]*>/.exec(props)?.[0] ?? '', 'w:val') ?? 1);
          const continued = /<w:vMerge(?![^>]*w:val="restart")[^>]*\/>/.test(props);
          cells.push(continued ? '' : cellText(tc));
          for (let i = 1; i < span; i++) cells.push('');
        }
        return cells;
      });
      tables.push({ rows });
    } else {
      const text = paragraphText(el).trim();
      if (text) {
        paragraphs.push(text);
        if (!tables.length && title === undefined) title = text.split('\n')[0];
      }
    }
  }
  return { title, tables, paragraphs };
}
