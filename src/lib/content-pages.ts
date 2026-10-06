import type { FileType } from '@/components/features/landing/ProofVisuals';

/**
 * Content pages for search and AI answers (docs/seo-keywords.md): guides, a definition, a comparison
 * and the free templates. Each owns one keyword group. Copy lives in messages/*.json under pages.<key>.
 *
 * - group: where the page is listed in the footer (formats next to the format pages, then guides, then templates).
 * - hero: 'template' shows the template downloads and a preview of the template becoming a cue list;
 *   'paste' shows rows pasted from a spreadsheet becoming a cue list.
 * - icon: a file icon next to the kicker, as on the format pages.
 */
export interface ContentPage {
  path: string;
  type: 'WebPage' | 'Article' | 'TechArticle';
  group: 'formats' | 'guides' | 'templates';
  hero?: 'template' | 'paste';
  icon?: FileType;
}

export const CONTENT_PAGES = {
  csv: { path: '/csv-to-grandma3', type: 'TechArticle', group: 'formats', hero: 'paste', icon: 'csv' },
  whatIs: { path: '/what-is-a-run-sheet', type: 'Article', group: 'guides' },
  importMacro: { path: '/guides/import-macro-grandma3', type: 'TechArticle', group: 'guides' },
  labelCues: { path: '/guides/label-cues-grandma3', type: 'TechArticle', group: 'guides' },
  subCues: { path: '/guides/sub-cues-grandma3', type: 'TechArticle', group: 'guides' },
  alternatives: { path: '/alternatives', type: 'Article', group: 'guides' },
  template: { path: '/run-sheet-template', type: 'WebPage', group: 'templates', hero: 'template' },
  runOfShow: { path: '/run-of-show-template', type: 'WebPage', group: 'templates', hero: 'template' },
  runningOrder: { path: '/running-order-template', type: 'WebPage', group: 'templates', hero: 'template' },
} as const satisfies Record<string, ContentPage>;

export type ContentKey = keyof typeof CONTENT_PAGES;
export const CONTENT_KEYS = Object.keys(CONTENT_PAGES) as ContentKey[];

/** A page's settings with every optional field visible (CONTENT_PAGES itself keeps the literal types). */
export const contentPage = (key: ContentKey): ContentPage => CONTENT_PAGES[key];

/** The content pages in one footer group, in the order above. */
export const contentKeysIn = (group: ContentPage['group']) => CONTENT_KEYS.filter((k) => CONTENT_PAGES[k].group === group);

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
export const TEMPLATE_FILES: Record<string, string> = { en: 'run-sheet-template', no: 'kjoreplan-mal', de: 'ablaufplan-vorlage' };
