import { describe, expect, it } from 'vitest';
import en from '../messages/en.json';
import no from '../messages/no.json';
import de from '../messages/de.json';
import { FORMAT_PAGES, FORMAT_SLUGS } from '../src/lib/formats';
import { formatPageJsonLd, frontPageJsonLd, jsonLdScript } from '../src/lib/structured-data';

describe('front page JSON-LD', () => {
  for (const [locale, m] of [['en', en], ['no', no], ['de', de]] as const) {
    it(`has organisation, website, app and every FAQ item (${locale})`, () => {
      const data = frontPageJsonLd({ locale, name: m.meta.title, description: m.meta.description, faq: m.home.faq });
      const types = data['@graph'].map((n) => n['@type']);
      expect(types).toEqual(['Organization', 'WebSite', 'SoftwareApplication', 'FAQPage']);
      const faq = data['@graph'][3] as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
      expect(faq.mainEntity).toHaveLength(m.home.faq.length);
      expect(faq.mainEntity[0].name).toBe(m.home.faq[0].q);
    });
  }

  it('every language has the same FAQ questions, in the same order', () => {
    expect(no.home.faq.length).toBe(en.home.faq.length);
    expect(de.home.faq.length).toBe(en.home.faq.length);
  });

  it('can never close the script tag it is placed in', () => {
    expect(jsonLdScript({ a: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});

describe('format pages', () => {
  it('every format page has copy in both languages, with the same shape', () => {
    for (const slug of FORMAT_SLUGS) {
      const key = FORMAT_PAGES[slug].key;
      for (const field of ['reads', 'steps', 'faq'] as const) {
        expect(no.formats[key][field].length, `${key}.${field}`).toBe(en.formats[key][field].length);
      }
      expect(Object.keys(no.formats[key]).sort()).toEqual(Object.keys(en.formats[key]).sort());
    }
  });

  it('JSON-LD has the page with its breadcrumb and every FAQ item', () => {
    const f = en.formats.excel;
    const data = formatPageJsonLd({ locale: 'no', path: '/excel-to-grandma3', title: f.title, description: f.metaDescription, home: 'CueSetter', faq: f.faq });
    const [page, faq] = data['@graph'] as unknown as [{ url: string; breadcrumb: { itemListElement: unknown[] } }, { mainEntity: unknown[] }];
    expect(page.url).toMatch(/\/no\/excel-to-grandma3$/);
    expect(page.breadcrumb.itemListElement).toHaveLength(2);
    expect(faq.mainEntity).toHaveLength(f.faq.length);
  });
});

describe('content pages', () => {
  it('every content page has copy in every language, with the same shape', async () => {
    const { CONTENT_KEYS } = await import('../src/lib/content-pages');
    for (const key of CONTENT_KEYS) {
      const e = en.pages[key];
      expect(e, `en.pages.${key}`).toBeDefined();
      for (const [name, m] of [['no', no], ['de', de]] as const) {
        const n = m.pages[key];
        expect(n, `${name}.pages.${key}`).toBeDefined();
        expect(Object.keys(n).sort(), `${name}: ${key}`).toEqual(Object.keys(e).sort());
        expect(n.sections.length, `${name}: ${key}.sections`).toBe(e.sections.length);
        n.sections.forEach((s, i) => expect(Object.keys(s).sort(), `${name}: ${key}.sections[${i}]`).toEqual(Object.keys(e.sections[i]).sort()));
        expect(n.faq.length, `${name}: ${key}.faq`).toBe(e.faq.length);
      }
      for (const field of ['crumb', 'metaTitle', 'metaDescription', 'kicker', 'title', 'lead', 'linkLabel'] as const) {
        for (const m of [en, no, de]) expect(m.pages[key][field], `${key}.${field}`).toBeTruthy();
      }
    }
  });

  it('pages with a paste preview have its captions', async () => {
    const { CONTENT_KEYS, CONTENT_PAGES } = await import('../src/lib/content-pages');
    for (const key of CONTENT_KEYS.filter((k) => (CONTENT_PAGES[k] as { hero?: string }).hero === 'paste')) {
      for (const m of [en, no, de]) {
        const page = m.pages[key] as Record<string, unknown>;
        expect(page.heroFile, key).toBeTruthy();
        expect(page.heroFrom, key).toBeTruthy();
      }
    }
  });

  it('links in the copy point to pages that exist, in every language', async () => {
    const { PUBLIC_PAGES } = await import('../src/lib/public-pages');
    for (const m of [en, no, de]) {
      const links = [...JSON.stringify({ pages: m.pages, formats: m.formats }).matchAll(/\]\((\/[^)]*)\)/g)].map((x) => x[1]);
      expect(links.length).toBeGreaterThan(0);
      for (const l of links) expect(PUBLIC_PAGES, l).toContain(l);
    }
  });

  it('every page has its own path and its own title', async () => {
    const { PUBLIC_PAGES } = await import('../src/lib/public-pages');
    const { CONTENT_KEYS } = await import('../src/lib/content-pages');
    expect(new Set(PUBLIC_PAGES).size).toBe(PUBLIC_PAGES.length);
    for (const m of [en, no, de]) {
      const titles = CONTENT_KEYS.map((k) => m.pages[k].metaTitle);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it('the template variants don’t copy the run sheet template word for word', () => {
    for (const m of [en, no, de]) {
      const base = new Set(JSON.stringify(m.pages.template).match(/[^.!?"]{40,}[.!?]/g) ?? []);
      for (const key of ['runOfShow', 'runningOrder'] as const) {
        const shared = (JSON.stringify(m.pages[key]).match(/[^.!?"]{40,}[.!?]/g) ?? []).filter((s) => base.has(s));
        expect(shared, key).toEqual([]);
      }
    }
  });
});

/** Same keys and list lengths all the way down (table rows may differ: each language lists its own names). */
function shape(v: unknown, path = ''): string[] {
  if (Array.isArray(v)) return path.endsWith('table.rows') ? [path] : [`${path}[${v.length}]`, ...v.flatMap((x, i) => shape(x, `${path}[${i}]`))];
  if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => shape(x, `${path}.${k}`));
  return [path];
}

describe('translations', () => {
  for (const [name, m] of [['no', no], ['de', de]] as const) {
    it(`${name}.json has exactly the keys of en.json`, () => {
      expect(shape(m).sort()).toEqual(shape(en).sort());
    });
  }
});
