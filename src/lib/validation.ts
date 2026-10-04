import { z } from 'zod';

/** Limits that keep the browser responsive and reject things that can't be a run sheet. */
export const MAX_PDF_BYTES = 25 * 1024 * 1024;
export const MAX_TEXT_CHARS = 200_000;
export const MAX_SEQUENCE = 99_999;

export const pdfFileSchema = z
  .object({ name: z.string(), size: z.number(), type: z.string() })
  .refine((f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name), { message: 'notPdf' })
  .refine((f) => f.size <= MAX_PDF_BYTES, { message: 'tooLarge' });

export const pastedTextSchema = z
  .string()
  .refine((s) => s.trim().length > 0, { message: 'empty' })
  .refine((s) => s.length <= MAX_TEXT_CHARS, { message: 'tooLong' });

export const sequenceSchema = z.number().int().min(1).max(MAX_SEQUENCE);

export type FileProblem = 'notPdf' | 'tooLarge';
export type TextProblem = 'empty' | 'tooLong';

/** First problem with a chosen file, or null if it can be read. */
export function checkPdfFile(file: { name: string; size: number; type: string }): FileProblem | null {
  const result = pdfFileSchema.safeParse(file);
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
