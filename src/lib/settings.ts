import { z } from 'zod';
import { DEFAULT_MA_VERSION, MA_VERSIONS } from './config/versions';
import type { MacroSettings } from './ma3/macro';
import { sequenceSchema } from './validation';

export interface Settings extends MacroSettings {
  maVersion: string;
}

export const DEFAULT_SETTINGS: Settings = {
  sequence: 101,
  sequenceName: '',
  numbering: 'follow',
  nameFormat: 'title',
  noteTime: true,
  noteText: true,
  clearFirst: true,
  maVersion: DEFAULT_MA_VERSION.id,
};

const KEY = 'kjoreplan-ma3:settings';

/**
 * Stored settings come from the browser and are untrusted: every field is validated on its own
 * and falls back to its default, so one bad value never breaks the others.
 */
const storedSettingsSchema = z.object({
  sequence: sequenceSchema.catch(DEFAULT_SETTINGS.sequence),
  numbering: z.enum(['follow', 'running']).catch(DEFAULT_SETTINGS.numbering),
  nameFormat: z.enum(['title', 'time-title']).catch(DEFAULT_SETTINGS.nameFormat),
  noteTime: z.boolean().catch(DEFAULT_SETTINGS.noteTime),
  noteText: z.boolean().catch(DEFAULT_SETTINGS.noteText),
  clearFirst: z.boolean().catch(DEFAULT_SETTINGS.clearFirst),
  maVersion: z
    .string()
    .refine((id) => MA_VERSIONS.some((v) => v.id === id))
    .catch(DEFAULT_SETTINGS.maVersion),
});

/** Turn whatever was stored into valid settings. The sequence name is per run sheet and never stored. */
export function parseStoredSettings(raw: unknown): Settings {
  const input = typeof raw === 'object' && raw !== null ? raw : {};
  return { ...storedSettingsSchema.parse(input), sequenceName: '' };
}

export function loadSettings(): Settings {
  try {
    return parseStoredSettings(JSON.parse(localStorage.getItem(KEY) ?? '{}'));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: Settings): void {
  try {
    const { sequenceName: _ignored, ...rest } = s;
    localStorage.setItem(KEY, JSON.stringify(rest));
  } catch {
    // Storage unavailable (private mode etc.) – settings just aren't remembered.
  }
}
