/**
 * Tells Bing (and the other IndexNow search engines) which pages exist, after a production build on
 * Vercel. ChatGPT search and Copilot use Bing's index, so this keeps them up to date. Never fails
 * the build: a failed ping only means the pages are found a little later by normal crawling.
 */
import { routing } from '../src/i18n/routing';
import { PUBLIC_PAGES } from '../src/lib/public-pages';
import { INDEXNOW_KEY, localePath } from '../src/lib/site';

const HOST = 'cuesetter.com';

async function main() {
  if (process.env.VERCEL_ENV !== 'production') {
    console.log('IndexNow: not a production build, skipped.');
    return;
  }
  const urlList = routing.locales.flatMap((l) => PUBLIC_PAGES.map((p) => `https://${HOST}${localePath(l, p) === '/' ? '' : localePath(l, p)}`));
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`, urlList }),
    signal: AbortSignal.timeout(10_000),
  });
  console.log(`IndexNow: ${urlList.length} URLs, HTTP ${res.status}`);
}

main().catch((e) => console.log(`IndexNow: failed (${e instanceof Error ? e.message : e}), skipped.`));
