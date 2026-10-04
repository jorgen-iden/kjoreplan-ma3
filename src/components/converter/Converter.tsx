'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useReducer, useRef } from 'react';
import { parsePastedText, parseTextItems } from '@/lib/parse';
import { extractPdfText, preloadPdf } from '@/lib/parse/pdf';
import { loadSettings, saveSettings } from '@/lib/settings';
import { ColumnsStep } from './ColumnsStep';
import { ExportStep } from './ExportStep';
import { ReviewStep } from './ReviewStep';
import { SettingsStep } from './SettingsStep';
import { initialState, reducer, STEPS, type Step } from './state';
import { UploadStep } from './UploadStep';

export function Converter() {
  const t = useTranslations('steps');
  const [state, dispatch] = useReducer(reducer, initialState);
  const loadedSettings = useRef(false);

  useEffect(() => {
    // Start pdf.js now so nothing is fetched later, when a file is opened.
    void preloadPdf();
    dispatch({ type: 'settings', patch: loadSettings() });
    loadedSettings.current = true;
  }, []);

  useEffect(() => {
    if (loadedSettings.current) saveSettings(state.settings);
  }, [state.settings]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [state.step]);

  async function loadPdf(data: ArrayBuffer, fileName: string) {
    dispatch({ type: 'busy' });
    try {
      const { items, pages } = await extractPdfText(data);
      if (!items.some((i) => i.str.trim())) {
        dispatch({ type: 'error', notice: { kind: 'error', key: 'noTextLayer' } });
        return;
      }
      const table = parseTextItems(items, pages);
      table.title ??= fileName.replace(/\.pdf$/i, '');
      dispatch({ type: 'loaded', table });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'error', notice: { kind: 'error', key: 'pdfError', values: { error } } });
    }
  }

  const reachable = (i: number) => i === 0 || state.table !== null;
  const goto = (step: Step) => dispatch({ type: 'goto', step });

  return (
    <main className="mx-auto max-w-[1180px] px-5 pb-16 pt-2 sm:px-8">
      <nav aria-label={t('label')} className="mb-7 flex flex-wrap items-center gap-2 text-[13px]">
        {STEPS.map((key, i) => {
          const active = state.step === i;
          const done = i < state.step;
          return (
            <button
              key={key}
              type="button"
              disabled={!reachable(i)}
              aria-current={active ? 'step' : undefined}
              onClick={() => goto(i as Step)}
              className={
                active
                  ? 'rounded-full bg-ink px-3 py-1.5 font-semibold text-paper'
                  : done
                    ? 'rounded-full bg-chip px-3 py-1.5 text-subtle hover:bg-line'
                    : 'rounded-full border border-line px-3 py-1.5 text-muted enabled:hover:border-muted disabled:opacity-60'
              }
            >
              {i + 1} · {t(key)}
            </button>
          );
        })}
        {state.table && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'reset' })}
            className="ml-auto text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            {t('startOver')}
          </button>
        )}
      </nav>

      {state.step === 0 && (
        <UploadStep
          notice={state.notice}
          onPdf={loadPdf}
          onText={(text) => dispatch({ type: 'loaded', table: parsePastedText(text) })}
        />
      )}
      {state.step === 1 && state.table && (
        <ColumnsStep
          table={state.table}
          mapping={state.mapping}
          edited={state.edited}
          onMapping={(mapping) => dispatch({ type: 'mapping', mapping })}
          onNext={() => goto(2)}
        />
      )}
      {state.step === 2 && state.table && (
        <ReviewStep
          title={state.settings.sequenceName}
          items={state.table.rows.length}
          cues={state.cues}
          settings={state.settings}
          notice={state.notice}
          onCues={(cues) => dispatch({ type: 'cues', cues })}
          onNext={() => goto(3)}
        />
      )}
      {state.step === 3 && (
        <SettingsStep
          settings={state.settings}
          onChange={(patch) => dispatch({ type: 'settings', patch })}
          onNext={() => goto(4)}
        />
      )}
      {state.step === 4 && <ExportStep cues={state.cues} settings={state.settings} />}

      {state.step > 0 && (
        <div className="mt-10">
          <button
            type="button"
            onClick={() => goto((state.step - 1) as Step)}
            className="min-h-11 rounded-lg px-1 text-sm font-semibold text-muted hover:text-ink"
          >
            ← {t('back')}
          </button>
        </div>
      )}
    </main>
  );
}
