import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, parseStoredSettings } from '../src/lib/settings';
import { checkPastedText, checkRunSheetFile, fileKind, isValidSequence, MAX_FILE_BYTES, MAX_TEXT_CHARS } from '../src/lib/validation';

describe('file and text validation', () => {
  it('accepts PDF, Word and Excel files by extension or type', () => {
    expect(checkRunSheetFile({ name: 'a.pdf', size: 1000, type: '' })).toBeNull();
    expect(checkRunSheetFile({ name: 'a', size: 1000, type: 'application/pdf' })).toBeNull();
    expect(checkRunSheetFile({ name: 'Plan.DOCX', size: 1000, type: '' })).toBeNull();
    expect(checkRunSheetFile({ name: 'plan.xlsx', size: 1000, type: '' })).toBeNull();
    expect(fileKind({ name: 'plan.xlsx', type: '' })).toBe('xlsx');
  });

  it('explains old Office files, rejects other files and files that are too large', () => {
    expect(checkRunSheetFile({ name: 'a.doc', size: 1000, type: 'application/msword' })).toBe('oldFormat');
    expect(checkRunSheetFile({ name: 'a.xls', size: 1000, type: '' })).toBe('oldFormat');
    expect(checkRunSheetFile({ name: 'a.png', size: 1000, type: 'image/png' })).toBe('unsupported');
    expect(checkRunSheetFile({ name: 'a.pdf', size: MAX_FILE_BYTES + 1, type: 'application/pdf' })).toBe('tooLarge');
  });

  it('rejects empty and very long pasted text', () => {
    expect(checkPastedText('  \n ')).toBe('empty');
    expect(checkPastedText('x'.repeat(MAX_TEXT_CHARS + 1))).toBe('tooLong');
    expect(checkPastedText('17:30 Doors')).toBeNull();
  });

  it('validates sequence numbers', () => {
    expect(isValidSequence(101)).toBe(true);
    for (const n of [0, -1, 1.5, Number.NaN, 100_000]) expect(isValidSequence(n)).toBe(false);
  });
});

describe('stored settings', () => {
  it('keeps valid values and replaces bad ones with defaults', () => {
    const s = parseStoredSettings({ sequence: 'abc', numbering: 'running', maVersion: '9.9', noteTime: false, extra: '<script>' });
    expect(s.sequence).toBe(DEFAULT_SETTINGS.sequence);
    expect(s.numbering).toBe('running');
    expect(s.maVersion).toBe(DEFAULT_SETTINGS.maVersion);
    expect(s.noteTime).toBe(false);
    expect('extra' in s).toBe(false);
    expect(s.sequenceName).toBe('');
  });

  it('handles junk', () => {
    expect(parseStoredSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseStoredSettings('nope')).toEqual(DEFAULT_SETTINGS);
  });
});
