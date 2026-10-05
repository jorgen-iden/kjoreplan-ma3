import { describe, expect, it } from 'vitest';
import en from '../messages/en.json';
import no from '../messages/no.json';
import { FORMAT_PAGES, FORMAT_SLUGS } from '../src/lib/formats';
import { formatPageJsonLd, frontPageJsonLd, jsonLdScript } from '../src/lib/structured-data';

describe('front page JSON-LD', () => {
  for (const [locale, m] of [['en', en], ['no', no]] as const) {
    it(`has organisation, website, app and every FAQ item (${locale})`, () => {
      const data = frontPageJsonLd({ locale, name: m.meta.title, description: m.meta.description, faq: m.home.faq });
      const types = data['@graph'].map((n) => n['@type']);
      expect(types).toEqual(['Organization', 'WebSite', 'SoftwareApplication', 'FAQPage']);
      const faq = data['@graph'][3] as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
      expect(faq.mainEntity).toHaveLength(m.home.faq.length);
      expect(faq.mainEntity[0].name).toBe(m.home.faq[0].q);
    });
  }

  it('the Norwegian and English FAQ have the same number of questions', () => {
    expect(no.home.faq.length).toBe(en.home.faq.length);
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
  it('every content page has copy in both languages, with the same shape', async () => {
    const { CONTENT_KEYS } = await import('../src/lib/content-pages');
    for (const key of CONTENT_KEYS) {
      const [e, n] = [en.pages[key], no.pages[key]];
      expect(Object.keys(n).sort(), key).toEqual(Object.keys(e).sort());
      expect(n.sections.length, `${key}.sections`).toBe(e.sections.length);
      n.sections.forEach((s, i) => expect(Object.keys(s).sort(), `${key}.sections[${i}]`).toEqual(Object.keys(e.sections[i]).sort()));
      expect(n.faq.length, `${key}.faq`).toBe(e.faq.length);
    }
  });

  it('links in the copy point to pages that exist', async () => {
    const { PUBLIC_PAGES } = await import('../src/lib/public-pages');
    for (const m of [en, no]) {
      const links = [...JSON.stringify(m.pages).matchAll(/\]\((\/[^)]*)\)/g)].map((x) => x[1]);
      expect(links.length).toBeGreaterThan(0);
      for (const l of links) expect(PUBLIC_PAGES, l).toContain(l);
    }
  });
});
