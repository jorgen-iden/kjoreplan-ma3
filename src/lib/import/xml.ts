/** Tiny helpers for the well-formed XML inside .docx/.xlsx files (no DOM needed, works in tests). */

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

export function decodeXml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e.toLowerCase()] ?? _;
  });
}

/** Value of an attribute in a start tag, e.g. attr('<c r="A1" t="s">', 'r') → 'A1'. */
export function attr(tag: string, name: string): string | undefined {
  const m = new RegExp(`\\s${name.replace(':', '\\:')}="([^"]*)"`).exec(tag);
  return m ? decodeXml(m[1]) : undefined;
}

/**
 * Top-level elements named `name` inside `xml`, as full source strings. Handles nesting of the
 * same element (a table inside a table cell) by counting open/close tags.
 */
export function elements(xml: string, name: string): string[] {
  const out: string[] = [];
  const open = new RegExp(`<${name}(?=[\\s>/])[^>]*?(/?)>|</${name}>`, 'g');
  let depth = 0;
  let start = -1;
  for (let m = open.exec(xml); m; m = open.exec(xml)) {
    const isClose = m[0].startsWith('</');
    const selfClosing = !isClose && m[1] === '/';
    if (!isClose) {
      if (depth === 0) start = m.index;
      if (selfClosing) {
        if (depth === 0) out.push(m[0]);
        continue;
      }
      depth++;
    } else if (depth > 0) {
      depth--;
      if (depth === 0) out.push(xml.slice(start, m.index + m[0].length));
    }
  }
  return out;
}

/** The start tag of an element source string. */
export function startTag(element: string): string {
  return element.slice(0, element.indexOf('>') + 1);
}
