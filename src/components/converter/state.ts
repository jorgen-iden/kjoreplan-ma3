import { defaultMapping, rowsToCues, type Cue, type Mapping } from '@/lib/cues';
import type { ParsedTable } from '@/lib/parse';
import { DEFAULT_SETTINGS, type Settings } from '@/lib/settings';

export const STEPS = ['upload', 'columns', 'review', 'settings', 'export'] as const;
export type Step = 0 | 1 | 2 | 3 | 4;

/** A message shown in the upload step, as a translation key under "upload". */
export interface Notice {
  kind: 'info' | 'warn' | 'error';
  key: 'reading' | 'pdfError' | 'noTextLayer' | 'noRows' | 'linesMode';
  values?: Record<string, string>;
}

export interface State {
  step: Step;
  table: ParsedTable | null;
  mapping: Mapping;
  cues: Cue[];
  /** The user has edited the cue list since it was derived from the table. */
  edited: boolean;
  notice: Notice | null;
  settings: Settings;
}

export type Action =
  | { type: 'busy' }
  | { type: 'error'; notice: Notice }
  | { type: 'loaded'; table: ParsedTable }
  | { type: 'mapping'; mapping: Mapping }
  | { type: 'cues'; cues: Cue[] }
  | { type: 'goto'; step: Step }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'reset' };

export const initialState: State = {
  step: 0,
  table: null,
  mapping: { number: null, start: null, duration: null, title: null },
  cues: [],
  edited: false,
  notice: null,
  settings: DEFAULT_SETTINGS,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'busy':
      return { ...state, notice: { kind: 'info', key: 'reading' } };
    case 'error':
      return { ...state, notice: action.notice };
    case 'loaded': {
      const mapping = defaultMapping(action.table);
      const cues = rowsToCues(action.table, mapping);
      if (!cues.length) {
        return { ...state, notice: { kind: 'warn', key: 'noRows' } };
      }
      return {
        ...state,
        table: action.table,
        mapping,
        cues,
        edited: false,
        notice: action.table.mode === 'lines' ? { kind: 'warn', key: 'linesMode' } : null,
        settings: { ...state.settings, sequenceName: action.table.title ?? '' },
        // Line-based results have nothing to map, so skip straight to review.
        step: action.table.mode === 'lines' ? 2 : 1,
      };
    }
    case 'mapping':
      if (!state.table) return state;
      return { ...state, mapping: action.mapping, cues: rowsToCues(state.table, action.mapping), edited: false };
    case 'cues':
      return { ...state, cues: action.cues, edited: true };
    case 'goto':
      return { ...state, step: action.step };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'reset':
      return { ...initialState, settings: { ...state.settings, sequenceName: '' } };
  }
}
