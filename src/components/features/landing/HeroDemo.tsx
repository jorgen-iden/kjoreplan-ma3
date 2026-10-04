'use client';

import { useEffect, useState } from 'react';
import { cueGo } from '@/components/ui';

export interface DemoRow {
  /** Number in the run sheet. */
  n: string;
  time: string;
  /** Title lines: the first becomes the cue, the rest become sub-cues. */
  title: string[];
  /** A column CueSetter ignores (production notes), shown greyed out. */
  extra: string;
}

export interface HeroDemoLabels {
  file: string;
  sequence: string;
  columns: { n: string; time: string; title: string; extra: string };
  go: string;
}

const STEP_MS = 650;
const HOLD_MS = 2600;

/** Cue rows built from the run sheet: one per item, sub-cues .1, .2 … for the extra title lines. */
function toCues(rows: DemoRow[]) {
  return rows.flatMap((r, i) => [
    { key: `${i}`, source: i, number: r.n, name: r.title[0], time: r.time.slice(0, 5), sub: false },
    ...r.title.slice(1).map((t, j) => ({ key: `${i}.${j}`, source: i, number: `${r.n}.${j + 1}`, name: t, time: '', sub: true })),
  ]);
}

/**
 * The front page's "aha" in one picture: a run sheet on the left turns into a grandMA3 cue list on
 * the right, row by row, then starts over. With reduced motion it shows the finished list.
 */
export function HeroDemo({ rows, labels }: { rows: DemoRow[]; labels: HeroDemoLabels }) {
  const cues = toCues(rows);
  const [shown, setShown] = useState(cues.length);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Start from the finished list (what the server rendered), clear it, then build it up.
    let n = cues.length;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      n = n >= cues.length ? 0 : n + 1;
      setShown(n);
      // The list is complete: the cue light in the logo flashes GO, as on the export step.
      if (n === cues.length) cueGo();
      timer = setTimeout(tick, n >= cues.length ? HOLD_MS : n === 0 ? 500 : STEP_MS);
    };
    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [cues.length]);

  const active = shown > 0 && shown <= cues.length ? cues[shown - 1].source : -1;

  return (
    <div>
      <div className="grid overflow-hidden rounded-2xl border border-line shadow-xl sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* The run sheet, as it arrives from production. */}
        <div className="bg-card p-4 text-xs sm:p-5" aria-hidden="true">
          <p className="mb-3 font-mono text-[11px] text-muted">{labels.file}</p>
          <div className="grid grid-cols-[1.25rem_2.75rem_minmax(0,1fr)_4rem] gap-x-2 border-b border-line pb-1.5 font-bold">
            <span>{labels.columns.n}</span>
            <span>{labels.columns.time}</span>
            <span>{labels.columns.title}</span>
            <span className="text-muted line-through decoration-muted/60">{labels.columns.extra}</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1.25rem_2.75rem_minmax(0,1fr)_4rem] gap-x-2 border-b border-line-soft py-1.5 transition-colors duration-300 ${
                active === i ? 'bg-accent-soft' : ''
              }`}
            >
              <span className="font-mono">{r.n}</span>
              <span className="font-mono">{r.time}</span>
              <span className="whitespace-pre-line">{r.title.join('\n')}</span>
              <span className="text-muted">{r.extra}</span>
            </div>
          ))}
        </div>

        {/* The sequence on the console. */}
        <div className="flex min-h-72 flex-col bg-console p-4 text-console-ink sm:p-5" aria-hidden="true">
          <p className="mb-3 flex items-center justify-between font-mono text-[11px] text-console-muted">
            <span>{labels.sequence}</span>
            {shown >= cues.length ? (
              <span key="go" className="animate-pop-in rounded bg-console-accent px-1.5 font-semibold text-console">{labels.go}</span>
            ) : (
              <span className="tabular-nums">
                {shown}/{cues.length}
              </span>
            )}
          </p>
          <ol className="flex flex-col">
            {cues.slice(0, shown).map((c) => (
              <li
                key={c.key}
                className="grid animate-cue-row-in grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-x-2 border-b border-console-line py-1.5 text-sm"
              >
                <span className={`font-mono font-semibold ${c.sub ? 'pl-2 text-console-muted' : 'text-console-accent'}`}>{c.number}</span>
                <span className={`leading-snug ${c.sub ? 'pl-3 text-console-muted' : ''}`}>{c.name}</span>
                <span className="text-right font-mono text-xs text-console-muted">{c.time}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
