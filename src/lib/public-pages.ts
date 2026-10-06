import { CONTENT_KEYS, CONTENT_PAGES } from './content-pages';
import { FORMAT_SLUGS } from './formats';

/** Every public page (path without locale), for the sitemap and IndexNow. */
export const PUBLIC_PAGES = ['/', '/app', ...FORMAT_SLUGS.map((s) => `/${s}`), ...CONTENT_KEYS.map((k) => CONTENT_PAGES[k].path)];
