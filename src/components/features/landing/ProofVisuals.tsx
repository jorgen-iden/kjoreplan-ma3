import { logoMarkSvg } from '@/lib/logo';

/**
 * Small console-style pictures for the three proofs on the front page. They show the product
 * instead of describing it, in the same console colours as the hero demo. Decorative: the proof
 * text next to them says the same in words.
 */

const PANEL = 'relative flex h-48 flex-col justify-center overflow-hidden rounded-xl bg-console p-5 font-mono text-xs text-console-ink';

const FILE_COLOR = { pdf: 'fill-file-pdf', docx: 'fill-file-docx', xlsx: 'fill-file-xlsx', csv: 'fill-file-csv', zip: 'fill-console-accent' } as const;
export type FileType = keyof typeof FILE_COLOR;

/**
 * A generic file icon (a page with a folded corner and a coloured type label), the way operating
 * systems show file types. Deliberately not the Adobe or Microsoft logos, which are trademarks.
 */
export function FileIcon({ type, size = 44 }: { type: FileType; size?: number }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" className="shrink-0 drop-shadow-lg">
      <path d="M4 2h22l10 10v34a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" className="fill-console-raised stroke-console-line" strokeWidth="1.5" />
      <path d="M26 2v8a2 2 0 0 0 2 2h8" className="fill-none stroke-console-line" strokeWidth="1.5" />
      <path d="M9 18h18M9 23h14M9 28h18" className="stroke-console-line" strokeWidth="2" strokeLinecap="round" />
      <rect x="0" y="33" width="30" height="12" rx="2.5" className={FILE_COLOR[type]} />
      <text x="15" y="41.8" textAnchor="middle" className="fill-white font-mono text-[7.5px] font-bold tracking-wide">
        {type.toUpperCase()}
      </text>
    </svg>
  );
}

/** A thin line with dashes running along it. */
function Flow({ d, className = '' }: { d: string; className?: string }) {
  return (
    <path d={d} fill="none" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" className={`animate-dash-flow stroke-console-accent ${className}`} />
  );
}

/** Three run sheet formats flowing into one sequence. */
export function FormatsVisual({ sequence }: { sequence: string }) {
  return (
    <div className={`${PANEL} group/files justify-between`} aria-hidden="true">
      <div className="grid grid-cols-3 justify-items-center">
        {(['pdf', 'docx', 'xlsx'] as const).map((type, i) => (
          <span key={type} className={`transition-transform duration-500 ease-out-back group-hover/files:-translate-y-1 ${['-rotate-6', '', 'rotate-6'][i]}`}>
            <FileIcon type={type} />
          </span>
        ))}
      </div>
      <svg viewBox="0 0 300 36" preserveAspectRatio="none" className="h-9 w-full">
        <Flow d="M50 0 C50 22 150 14 150 36" />
        <Flow d="M150 0 L150 36" />
        <Flow d="M250 0 C250 22 150 14 150 36" />
      </svg>
      <span className="mx-auto rounded-full bg-console-accent px-3 py-1 font-semibold text-console">{sequence}</span>
    </div>
  );
}

/** Everything happens inside "your computer": file → CueSetter → macro. The cloud stays out. */
export function PrivacyVisual({ machine, noUpload }: { machine: string; noUpload: string }) {
  return (
    <div className={`${PANEL} gap-4`} aria-hidden="true">
      <div className="relative rounded-lg border border-dashed border-console-accent/60 px-4 pb-4 pt-5">
        <span className="absolute -top-2 left-3 bg-console px-1.5 text-[10px] font-semibold text-console-accent">{machine}</span>
        <div className="flex items-center">
          <FileIcon type="pdf" size={30} />
          <svg viewBox="0 0 40 4" preserveAspectRatio="none" className="h-1 flex-1">
            <Flow d="M0 2 L40 2" />
          </svg>
          <span className="shrink-0">{logoMarkSvg(30)}</span>
          <svg viewBox="0 0 40 4" preserveAspectRatio="none" className="h-1 flex-1">
            <Flow d="M0 2 L40 2" />
          </svg>
          <FileIcon type="zip" size={30} />
        </div>
      </div>
      <div className="flex items-center gap-2.5 text-console-muted">
        <svg width="26" height="18" viewBox="0 0 26 18" className="shrink-0 opacity-60">
          <path d="M7 16h12a5 5 0 0 0 .6-9.96A7 7 0 0 0 6.2 7.1 4.5 4.5 0 0 0 7 16z" className="fill-none stroke-console-muted" strokeWidth="1.5" />
          <path d="M3 2l20 14" className="stroke-file-pdf" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>{noUpload}</span>
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
