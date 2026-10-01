import { DEFAULT_MA_VERSION } from './config/versions';
import type { MacroSettings } from './ma3/macro';

export interface Settings extends MacroSettings {
  maVersion: string;
}

export const DEFAULT_SETTINGS: Settings = {
  sequence: 101,
  sequenceName: '',
  numbering: 'follow',
  nameFormat: 'title',
  includeNotes: true,
  clearFirst: true,
  maVersion: DEFAULT_MA_VERSION.id,
};

const KEY = 'kjoreplan-ma3:settings';

/** Last used choices. The sequence name belongs to each run sheet and is not remembered. */
export function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return { ...DEFAULT_SETTINGS, ...saved, sequenceName: '' };
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
