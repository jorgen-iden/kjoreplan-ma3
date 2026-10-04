'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useReducer, useRef } from 'react';
import { parsePastedText, parseTextItems } from '@/lib/parse';
import { extractPdfText, preloadPdf } from '@/lib/parse/pdf';
import { loadSettings, saveSettings } from '@/lib/settings';
import { ImportError, importOffice } from '@/lib/import';
import { checkRunSheetFile, fileKind, isValidSequence, MAX_FILE_BYTES } from '@/lib/validation';
import { Button } from '@/components/ui';
import { ColumnsStep } from './ColumnsStep';
import { ExportStep } from './ExportStep';
import { ReviewStep } from './ReviewStep';
import { SettingsStep } from './SettingsStep';
import { initialState, reducer, STEPS, type Step } from './state';
import { Stepper } from './Stepper';
import { UploadStep } from './UploadStep';

export function Converter() {
  const t = useTranslations('steps');
  const tc = useTranslations('columns');
  const [state, dispatch] = useReducer(reducer, initialState);
  const settingsLoaded = useRef(false);
  const hasWork = state.table !== null;

  // Start pdf.js now so nothing is fetched later, and restore the last used settings.
  useEffect(() => {
    void preloadPdf();
    dispatch({ type: 'settings', patch: loadSettings() });
    settingsLoaded.current = true;
    // ?sample=1 (from the front page) opens the sample run sheet straight away.
    const wantsSample = new URLSearchParams(window.location.search).get('sample') === '1';
    // A reload loses the run sheet, so drop a stale ?step= (or ?sample=) from the URL.
    window.history.replaceState({ step: 0 }, '', window.location.pathname);
    if (wantsSample) void openSample();
  }, []);

  useEffect(() => {
    if (settingsLoaded.current) saveSettings(state.settings);
  }, [state.settings]);

  // Each step is a history entry, so the browser's back and forward buttons move between steps.
  useEffect(() => {
    const current = (window.history.state as { step?: number } | null)?.step ?? 0;
    if (current !== state.step) {
      const url = state.step === 0 ? window.location.pathname : `${window.location.pathname}?step=${STEPS[state.step]}`;
      window.history.pushState({ step: state.step }, '', url);
    }
    window.scrollTo({ top: 0 });
  }, [state.step]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const step = ((e.state as { step?: number } | null)?.step ?? 0) as Step;
      dispatch({ type: 'goto', step: hasWork ? step : 0 });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [hasWork]);

  // The run sheet only lives in this tab: warn before closing it.
  useEffect(() => {
    if (!hasWork) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasWork]);

  async function loadPdf(read: () => Promise<{ data: ArrayBuffer; name: string }>, failure: 'pdfError' | 'sampleError') {
    dispatch({ type: 'busy' });
    let file: { data: ArrayBuffer; name: string };
    try {
      file = await read();
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'error', notice: { kind: 'error', key: failure, values: { error } } });
      return;
    }
    try {
      const { items, pages } = await extractPdfText(file.data);
      if (!items.some((i) => i.str.trim())) {
        dispatch({ type: 'error', notice: { kind: 'error', key: 'noTextLayer' } });
        return;
      }
      const table = parseTextItems(items, pages);
      table.title ??= file.name.replace(/\.pdf$/i, '');
      dispatch({ type: 'loaded', table });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'error', notice: { kind: 'error', key: 'pdfError', values: { error } } });
    }
  }

  async function loadOffice(f: File) {
    dispatch({ type: 'busy' });
    try {
      const sources = await importOffice(await f.arrayBuffer(), f.name);
      dispatch({ type: 'loaded', table: sources[0].table, sources });
    } catch (err) {
      const key = err instanceof ImportError ? err.problem : 'unreadable';
      dispatch({ type: 'error', notice: { kind: 'error', key } });
    }
  }

  const openFile = (f: File) => {
    const problem = checkRunSheetFile(f);
    if (problem) {
      const values = problem === 'tooLarge' ? { max: String(MAX_FILE_BYTES / 1024 / 1024) } : undefined;
      dispatch({ type: 'error', notice: { kind: 'error', key: problem, values } });
      return;
    }
    if (fileKind(f) === 'pdf') void loadPdf(async () => ({ data: await f.arrayBuffer(), name: f.name }), 'pdfError');
    else void loadOffice(f);
  };
  const openSample = () =>
    loadPdf(async () => {
      const res = await fetch('/sample-run-sheet.pdf');
      if (!res.ok) throw new Error(String(res.status));
      return { data: await res.arrayBuffer(), name: 'sample-run-sheet.pdf' };
    }, 'sampleError');

  const goto = (step: Step) => dispatch({ type: 'goto', step });
  // The next step from the current one, for the bottom bar on phones (null on the last step).
  const canContinue = state.step === 2 ? state.cues.length > 0 : state.step === 3 ? isValidSequence(state.settings.sequence) : true;
  const nextStep = state.step > 0 && state.step < 4 ? ((state.step + 1) as Step) : null;
  const reset = () => dispatch({ type: 'reset' });

  return (
    <main id="main" className={`mx-auto max-w-6xl px-5 pt-2 sm:px-8 sm:pb-16 ${state.step > 0 ? 'pb-28' : 'pb-16'}`}>
      <Stepper step={state.step} reachable={(s) => s === 0 || hasWork} onGoto={goto} onReset={hasWork ? reset : undefined} />

      <div key={state.step} className="animate-entry">
        {state.step === 0 && (
          <UploadStep
            busy={state.busy}
            notice={state.notice}
            onFile={openFile}
            onSample={openSample}
            onText={(text) => dispatch({ type: 'loaded', table: parsePastedText(text) })}
          />
        )}
        {state.step === 1 && state.table && (
          <ColumnsStep
            table={state.table}
            sources={state.sources}
            sourceIndex={state.sourceIndex}
            onSource={(index) => {
              if (state.edited && !window.confirm(tc('confirmReset'))) return;
              dispatch({ type: 'source', index });
            }}
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
            linesMode={state.table.mode === 'lines'}
            onCues={(cues) => dispatch({ type: 'cues', cues })}
            onNext={() => goto(3)}
            onReset={reset}
          />
        )}
        {state.step === 3 && (
          <SettingsStep settings={state.settings} onChange={(patch) => dispatch({ type: 'settings', patch })} onNext={() => goto(4)} />
        )}
        {state.step === 4 && <ExportStep cues={state.cues} settings={state.settings} />}
      </div>

      {state.step > 0 && (
        <div className="mt-10 hidden sm:block">
          <Button variant="ghost" onClick={() => goto((state.step - 1) as Step)}>
            ← {t('back')}
          </Button>
        </div>
      )}

      {/* Phones: back and continue stay within thumb reach, however long the cue list is. */}
      {state.step > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-paper/90 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          <Button variant="ghost" onClick={() => goto((state.step - 1) as Step)}>
            ← {t('back')}
          </Button>
          {nextStep !== null && (
            <Button variant="primary" className="flex-1" disabled={!canContinue} onClick={() => goto(nextStep)}>
              {t('nextTo', { step: t(STEPS[nextStep]) })}
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
