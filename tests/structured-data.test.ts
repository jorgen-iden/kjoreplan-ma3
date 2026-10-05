import { describe, expect, it } from 'vitest';
import en from '../messages/en.json';
import no from '../messages/no.json';
import { frontPageJsonLd, jsonLdScript } from '../src/lib/structured-data';

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
