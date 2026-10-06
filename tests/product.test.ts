import { describe, expect, it } from 'vitest';
import en from '../messages/en.json';
import no from '../messages/no.json';
import de from '../messages/de.json';
import { CHANGELOG, CHANGELOG_PATH, changelogByDate } from '../src/lib/changelog';
import { feedbackMail, fillPlaceholders, handoffMail, mailtoHref } from '../src/lib/mailto';
import { PUBLIC_PAGES } from '../src/lib/public-pages';

const LOCALES = [['en', en], ['no', no], ['de', de]] as const;

describe('changelog', () => {
  it('every entry has a real date, and the list is sorted newest first', () => {
    for (const e of CHANGELOG) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${e.date}T00:00:00Z`).toISOString().slice(0, 10), e.date).toBe(e.date);
    }
    const dates = CHANGELOG.map((e) => e.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('every entry is written in every language, in the brand voice', () => {
    for (const e of CHANGELOG) {
      for (const [locale] of LOCALES) {
        expect(e[locale].title.trim(), `${e.date} ${locale}`).not.toBe('');
        expect(e[locale].text.trim(), `${e.date} ${locale}`).not.toBe('');
        expect(`${e[locale].title} ${e[locale].text}`, `${e.date} ${locale}`).not.toMatch(/!|Arpeggio|\bAI\b/);
      }
    }
  });

  it('groups by day without losing or reordering entries', () => {
    const groups = changelogByDate('en');
    expect(groups.flatMap((g) => g.items)).toEqual(CHANGELOG.map((e) => e.en));
    expect(new Set(groups.map((g) => g.date)).size).toBe(groups.length);
  });

  it('is a public page (sitemap, IndexNow)', () => {
    expect(PUBLIC_PAGES).toContain(CHANGELOG_PATH);
  });
});

describe('mailto links', () => {
  it('fills placeholders and leaves unknown ones visible', () => {
    expect(fillPlaceholders('{a} and {b}', { a: 1 })).toBe('1 and {b}');
  });

  it('encodes subject and body, with CRLF line breaks', () => {
    const href = mailtoHref({ to: 'hello@cuesetter.com', subject: 'A & B', body: 'one\ntwo' });
    expect(href).toBe('mailto:hello@cuesetter.com?subject=A%20%26%20B&body=one%0D%0Atwo');
  });

  for (const [locale, m] of LOCALES) {
    it(`feedback e-mail has the version and cue count, nothing left unfilled (${locale})`, () => {
      const mail = feedbackMail(m.feedback, { to: 'hello@cuesetter.com', version: '2.5', cues: 12 });
      expect(mail.body).toContain('2.5');
      expect(mail.body).toContain('12');
      expect(`${mail.subject}${mail.body}`).not.toMatch(/[{}]/);
      expect(mail.href.startsWith('mailto:hello@cuesetter.com?subject=')).toBe(true);
      expect(m.feedback.line).toContain('<mail>{email}</mail>');
      expect(m.feedback.line).not.toContain('!');
    });

    it(`note to the lighting operator links the converter and the template, nothing left unfilled (${locale})`, () => {
      const appUrl = `https://cuesetter.com${locale === 'en' ? '' : `/${locale}`}/app`;
      const templateUrl = `https://cuesetter.com${locale === 'en' ? '' : `/${locale}`}/run-sheet-template`;
      const mail = handoffMail(m.handoff, { appUrl, templateUrl });
      expect(mail.body).toContain(appUrl);
      expect(mail.body).toContain(templateUrl);
      expect(mail.body).toContain('grandMA3');
      expect(`${mail.subject}${mail.body}`).not.toMatch(/[{}]/);
      expect(`${mail.subject}${mail.body}`).not.toContain('!');
      expect(mail.href).toContain(encodeURIComponent(appUrl));
    });
  }
});
