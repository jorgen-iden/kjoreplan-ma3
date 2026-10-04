import { defaultMapping, rowsToCues, type Cue, type Mapping } from '@/lib/cues';
import type { Source } from '@/lib/import';
import type { ParsedTable } from '@/lib/parse';
import { DEFAULT_SETTINGS, type Settings } from '@/lib/settings';

export const STEPS = ['upload', 'columns', 'review', 'settings', 'export'] as const;
export type Step = 0 | 1 | 2 | 3 | 4;

/** A message shown in the upload step, as a translation key under "upload". */
export interface Notice {
  kind: 'info' | 'warn' | 'error';
  key:
    | 'pdfError'
    | 'noTextLayer'
    | 'noRows'
    | 'linesMode'
    | 'sampleError'
    | 'tooLarge'
    | 'oldFormat'
    | 'unsupported'
    | 'noTable'
    | 'unreadable';
  values?: Record<string, string>;
}

export interface State {
  step: Step;
  table: ParsedTable | null;
  /** Sheets or tables of an Excel/Word file to choose between (empty for PDF and text). */
  sources: Source[];
  sourceIndex: number;
  mapping: Mapping;
  cues: Cue[];
  /** The user has edited the cue list since it was derived from the table. */
  edited: boolean;
  notice: Notice | null;
  /** A file is being read. */
  busy: boolean;
  settings: Settings;
}

export type Action =
  | { type: 'busy' }
  | { type: 'error'; notice: Notice }
  | { type: 'loaded'; table: ParsedTable; sources?: Source[] }
  | { type: 'source'; index: number }
  | { type: 'mapping'; mapping: Mapping }
  | { type: 'cues'; cues: Cue[] }
  | { type: 'goto'; step: Step }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'reset' };

export const initialState: State = {
  step: 0,
  table: null,
  sources: [],
  sourceIndex: 0,
  mapping: { number: null, start: null, duration: null, title: null },
  cues: [],
  edited: false,
  notice: null,
  busy: false,
  settings: DEFAULT_SETTINGS,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'busy':
      return { ...state, busy: true, notice: null };
    case 'error':
      return { ...state, busy: false, notice: action.notice };
    case 'loaded': {
      // A workbook can start with a cover sheet: open the first sheet or table that gives cues.
      const sources = action.sources ?? [];
      let sourceIndex = 0;
      let table = action.table;
      let mapping = defaultMapping(table);
      let cues = rowsToCues(table, mapping);
      for (let i = 1; !cues.length && i < sources.length; i++) {
        sourceIndex = i;
        table = sources[i].table;
        mapping = defaultMapping(table);
        cues = rowsToCues(table, mapping);
      }
      if (!cues.length) {
        return { ...state, busy: false, notice: { kind: 'warn', key: 'noRows' } };
      }
      return {
        ...state,
        table,
        sources,
        sourceIndex,
        mapping,
        cues,
        edited: false,
        busy: false,
        notice: table.mode === 'lines' ? { kind: 'warn', key: 'linesMode' } : null,
        settings: { ...state.settings, sequenceName: table.title ?? '' },
        // Line-based results have nothing to map, so skip straight to review.
        step: table.mode === 'lines' ? 2 : 1,
      };
    }
    case 'source': {
      const source = state.sources[action.index];
      if (!source) return state;
      const mapping = defaultMapping(source.table);
      return {
        ...state,
        sourceIndex: action.index,
        table: source.table,
        mapping,
        cues: rowsToCues(source.table, mapping),
        edited: false,
        settings: { ...state.settings, sequenceName: source.table.title ?? state.settings.sequenceName },
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
