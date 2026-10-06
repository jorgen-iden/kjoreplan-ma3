/**
 * Content pages for search and AI answers (docs/seo-keywords.md): a guide, a definition and the free
 * templates. Each owns one keyword group. Copy lives in messages/*.json under pages.<key>.
 */
export const CONTENT_PAGES = {
  template: { path: '/run-sheet-template', type: 'WebPage' },
  whatIs: { path: '/what-is-a-run-sheet', type: 'Article' },
  importMacro: { path: '/guides/import-macro-grandma3', type: 'TechArticle' },
} as const;

export type ContentKey = keyof typeof CONTENT_PAGES;
export const CONTENT_KEYS = Object.keys(CONTENT_PAGES) as ContentKey[];

/** One block of an article. Text may contain [links](/path). */
export interface Section {
  h: string;
  p?: string[];
  list?: string[];
  /** Numbered steps instead of bullets. */
  steps?: string[];
  code?: string;
  table?: { head: string[]; rows: string[][] };
  /** Text after the list, table or code. */
  after?: string[];
}

/** The template files per language, in public/templates (made by scripts/make-templates.ts). */
export const TEMPLATE_FILES: Record<string, string> = { en: 'run-sheet-template', no: 'kjoreplan-mal' };
