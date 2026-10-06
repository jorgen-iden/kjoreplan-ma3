import en from '../../../messages/en.json';
import { CHANGELOG, CHANGELOG_PATH } from '@/lib/changelog';
import { CONTENT_KEYS, CONTENT_PAGES } from '@/lib/content-pages';
import { FORMAT_PAGES, FORMAT_SLUGS } from '@/lib/formats';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site';

// /llms.txt: a plain-text summary for AI assistants and AI search (https://llmstxt.org).
// Built from the same English copy as the site, so the two never drift apart.
export const dynamic = 'force-static';

export function GET() {
  const faq = en.home.faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n');
  const formats = FORMAT_SLUGS.map((s) => {
    const f = en.formats[FORMAT_PAGES[s].key];
    return `- [${f.title}](${SITE_URL}/${s}): ${f.metaDescription}`;
  }).join('\n');
  const guides = CONTENT_KEYS.map((k) => `- [${en.pages[k].title}](${SITE_URL}${CONTENT_PAGES[k].path}): ${en.pages[k].metaDescription}`).join('\n');
  const body = `# CueSetter

> ${en.meta.description}

CueSetter is a web tool for lighting operators on grandMA3 consoles. It reads the run sheet from production (PDF with text, Word .docx or Excel .xlsx, or pasted text), finds the columns for number, start time, duration and title, and creates a grandMA3 macro (XML in a ZIP). Run once on the console, the macro builds a sequence with one empty, named cue per item, in the right order, with cue numbers that follow the run sheet. It is made by Arpeggio AS (Norway), in English, Norwegian and German.

Key facts:
- Runs entirely in the browser. Run sheets are never uploaded to a server.
- Tested on most recent grandMA3 versions; should in theory work on every grandMA3 version. Not for grandMA2.
- Cues are empty (names, numbers, optional note with start time and duration); the operator programs the lighting.
- Free to try, no account needed.
- Contact: ${CONTACT_EMAIL} (questions, feedback, grandMA3 versions that don’t work).
- Not affiliated with MA Lighting. grandMA3 is a trademark of MA Lighting Technology GmbH.

## Pages

- [CueSetter (English)](${SITE_URL}/): what it does and how it works
- [CueSetter (Norsk)](${SITE_URL}/no): the same in Norwegian
- [CueSetter (Deutsch)](${SITE_URL}/de): the same in German (Ablaufplan zur grandMA3-Cueliste)
- [Converter](${SITE_URL}/app): upload a run sheet and download the grandMA3 macro
${formats}
${guides}
- [${en.changelog.title}](${SITE_URL}${CHANGELOG_PATH}): ${en.changelog.lead} Latest: ${CHANGELOG[0].date}.

## FAQ

${faq}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
