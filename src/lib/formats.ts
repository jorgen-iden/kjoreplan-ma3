import type { FileType } from '@/components/features/landing/ProofVisuals';

/**
 * Landing pages per run sheet format (docs/seo-keywords.md, cluster 2). Each page owns one
 * keyword group, so the slug is the search phrase. Copy lives in messages/*.json under formats.<key>.
 */
export const FORMAT_PAGES = {
  'excel-to-grandma3': { key: 'excel', file: 'xlsx' },
  'pdf-to-grandma3': { key: 'pdf', file: 'pdf' },
  'word-to-grandma3': { key: 'word', file: 'docx' },
} as const satisfies Record<string, { key: string; file: FileType }>;

export type FormatSlug = keyof typeof FORMAT_PAGES;
export const FORMAT_SLUGS = Object.keys(FORMAT_PAGES) as FormatSlug[];

export function isFormatSlug(s: string): s is FormatSlug {
  return Object.hasOwn(FORMAT_PAGES, s);
}
