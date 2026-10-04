import { z } from 'zod';

/** Limits that keep the browser responsive and reject things that can't be a run sheet. */
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_TEXT_CHARS = 200_000;
export const MAX_SEQUENCE = 99_999;

/** File types the converter reads. Old binary Office files are recognised so we can explain. */
export type FileKind = 'pdf' | 'docx' | 'xlsx';

const MIME: Record<string, FileKind> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

/** The kind of a chosen file, from its extension first and its MIME type second. */
export function fileKind(file: { name: string; type: string }): FileKind | 'old' | null {
  const ext = /\.([a-z0-9]+)$/i.exec(file.name)?.[1]?.toLowerCase();
  if (ext === 'pdf' || ext === 'docx' || ext === 'xlsx') return ext;
  if (ext === 'doc' || ext === 'xls') return 'old';
  return MIME[file.type] ?? null;
}

export const runSheetFileSchema = z
  .object({ name: z.string(), size: z.number(), type: z.string() })
  .refine((f) => fileKind(f) !== 'old', { message: 'oldFormat' })
  .refine((f) => fileKind(f) !== null, { message: 'unsupported' })
  .refine((f) => f.size <= MAX_FILE_BYTES, { message: 'tooLarge' });

export const pastedTextSchema = z
  .string()
  .refine((s) => s.trim().length > 0, { message: 'empty' })
  .refine((s) => s.length <= MAX_TEXT_CHARS, { message: 'tooLong' });

export const sequenceSchema = z.number().int().min(1).max(MAX_SEQUENCE);

export type FileProblem = 'oldFormat' | 'unsupported' | 'tooLarge';
export type TextProblem = 'empty' | 'tooLong';

/** First problem with a chosen file, or null if it can be read. */
export function checkRunSheetFile(file: { name: string; size: number; type: string }): FileProblem | null {
  const result = runSheetFileSchema.safeParse(file);
  return result.success ? null : (result.error.issues[0].message as FileProblem);
}

/** First problem with pasted text, or null if it can be parsed. */
export function checkPastedText(text: string): TextProblem | null {
  const result = pastedTextSchema.safeParse(text);
  return result.success ? null : (result.error.issues[0].message as TextProblem);
}

export function isValidSequence(n: number): boolean {
  return sequenceSchema.safeParse(n).success;
}
