/**
 * Small console-style pictures for the three proofs on the front page. They show the product
 * instead of describing it, in the same console colours as the hero demo. Decorative: the proof
 * text next to them says the same in words.
 */

const PANEL = 'relative flex h-48 flex-col justify-center overflow-hidden rounded-xl bg-console p-5 font-mono text-xs text-console-ink';

/** Three run sheet files in different formats flowing into one sequence. */
export function FormatsVisual({ files, sequence }: { files: string[]; sequence: string }) {
  const tilt = ['-rotate-6 translate-y-2', 'rotate-0', 'rotate-6 translate-y-2'];
  return (
    <div className={`${PANEL} group/files`} aria-hidden="true">
      <div className="flex justify-center gap-2">
        {files.map((f, i) => (
          <span key={f} className={`rounded-md border border-console-line bg-console-raised px-2.5 py-3 text-[11px] text-console-muted shadow-lg transition-transform duration-500 group-hover/files:rotate-0 group-hover/files:translate-y-0 ${tilt[i]}`}>
            {f}
          </span>
        ))}
      </div>
      <div className="mx-auto my-3 h-6 w-px bg-gradient-to-b from-console-line to-console-accent" />
      <span className="mx-auto rounded-full bg-console-accent px-3 py-1 font-semibold text-console">{sequence}</span>
    </div>
  );
}

/** A readout: nothing uploaded, everything read locally. */
export function PrivacyVisual({ uploaded, local }: { uploaded: string; local: string }) {
  return (
    <div className={PANEL} aria-hidden="true">
      <div className="flex items-baseline justify-between border-b border-console-line pb-3">
        <span className="text-console-muted">{uploaded}</span>
        <span className="text-3xl font-semibold text-console-ink">0 B</span>
      </div>
      <div className="flex items-baseline justify-between pt-3">
        <span className="text-console-muted">{local}</span>
        <span className="text-console-accent">100 %</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-console-line">
        <div className="h-full w-full origin-left rounded-full bg-console-accent transition-transform delay-300 duration-1000 ease-out-quint scale-x-0 group-data-[shown]:scale-x-100" />
      </div>
    </div>
  );
}

export interface NumberRow {
  n: string;
  name: string;
  /** Shown with a tag: the number was filled in between its neighbours. */
  filled?: boolean;
  sub?: boolean;
}

/** A mini cue list: numbers kept from the run sheet, sub-cues, and one filled-in number. */
export function NumbersVisual({ rows, filledTag }: { rows: NumberRow[]; filledTag: string }) {
  return (
    <div className={`${PANEL} justify-start`} aria-hidden="true">
      {rows.map((r) => (
        <div key={r.n} className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center border-b border-console-line py-1.5 text-[12px]">
          <span className={`font-semibold ${r.sub ? 'pl-2 text-console-muted' : 'text-console-accent'}`}>{r.n}</span>
          <span className={`font-sans ${r.sub ? 'pl-2 text-console-muted' : ''}`}>{r.name}</span>
          {r.filled && <span className="rounded bg-console-accent/15 px-1.5 text-[10px] text-console-accent">{filledTag}</span>}
        </div>
      ))}
    </div>
  );
}
