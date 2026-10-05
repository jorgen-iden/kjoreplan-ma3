import type { ReactNode } from 'react';
import type { DemoRow } from './HeroDemo';

/**
 * A run sheet file drawn the way it looks in Excel, a PDF viewer or Word, with numbered markers on
 * the parts CueSetter reads. The numbers match the list next to it on the format page. Decorative:
 * the list says the same in words.
 */

export interface AnatomyLabels {
  /** The show's name, at the top of the document. */
  title: string;
  /** Sheet tabs (Excel) or table headings (Word): the first is the show. */
  days: [string, string];
  /** Heading for the part written as lines, without a table (Word). */
  linesHeading: string;
  lines: [string, string];
  /** "Page {n} of 2" for the PDF footer, already filled in per page. */
  pages: [string, string];
  scanned: string;
  columns: { n: string; time: string; title: string; extra: string };
}

/** The numbered marker, matching the list item with the same number. */
function Marker({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span
      className={`absolute z-10 grid size-6 place-items-center rounded-full bg-accent font-sans text-[11px] font-bold text-on-accent shadow-md ring-4 ring-accent/20 ${className}`}
    >
      {n}
    </span>
  );
}

/** The dark panel around the document, with the console's dot grid. */
function Stage({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-3xl bg-console p-5 shadow-2xl sm:p-10 dark:border dark:border-console-line dark:bg-console-raised [background-image:radial-gradient(var(--color-console-line)_1px,transparent_1px)] [background-size:22px_22px]"
    >
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-56 w-[80%] -translate-x-1/2 rounded-full bg-console-accent/25 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

const PAGE = 'relative rounded-lg bg-card text-ink shadow-xl';

/** Run sheet rows as separate lines: the extra title lines (a set list) on rows of their own. */
function lines(rows: DemoRow[]) {
  return rows.flatMap((r) => [
    { n: r.n, time: r.time, title: r.title[0], extra: r.extra, cont: false },
    ...r.title.slice(1).map((t) => ({ n: '', time: '', title: t, extra: '', cont: true })),
  ]);
}

function ExcelSheet({ rows, labels }: { rows: DemoRow[]; labels: AnatomyLabels }) {
  const GRID = 'grid grid-cols-[1.75rem_1.75rem_3.25rem_minmax(0,1fr)_4.5rem]';
  const CELL = 'border-l border-line px-1.5 py-1 truncate';
  const body = lines(rows).slice(0, 7);
  let firstCont = true;
  return (
    <div className={`${PAGE} overflow-visible text-[11px]`}>
      <div className="flex items-center gap-2 rounded-t-lg border-b border-line bg-line-soft px-3 py-2 font-mono text-[10px] text-muted">
        <span className="size-2.5 rounded-sm bg-file-xlsx" />
        <span className="rounded border border-line bg-card px-1.5">fx</span>
        <span className="truncate">{labels.title}</span>
      </div>
      <div className={`${GRID} border-b border-line bg-line-soft text-center font-mono text-[10px] text-muted`}>
        <span />
        {['A', 'B', 'C', 'D'].map((c) => (
          <span key={c} className="border-l border-line py-0.5">
            {c}
          </span>
        ))}
      </div>
      {/* Title row and an empty row above the header. */}
      <div className={`${GRID} border-b border-line-soft`}>
        <span className="bg-line-soft py-1 text-center font-mono text-[10px] text-muted">1</span>
        <span className={`${CELL} col-span-4 font-bold`}>{labels.title}</span>
      </div>
      <div className={`${GRID} border-b border-line-soft`}>
        <span className="bg-line-soft py-1 text-center font-mono text-[10px] text-muted">2</span>
        <span className={`${CELL} col-span-4`}>&nbsp;</span>
      </div>
      <div className={`relative ${GRID} border-b border-line bg-accent-soft font-bold`}>
        <Marker n={2} className="-left-8 top-1/2 -translate-y-1/2" />
        <span className="bg-line-soft py-1 text-center font-mono text-[10px] font-normal text-muted">3</span>
        <span className={CELL}>{labels.columns.n}</span>
        <span className={CELL}>{labels.columns.time}</span>
        <span className={CELL}>{labels.columns.title}</span>
        <span className={CELL}>{labels.columns.extra}</span>
      </div>
      {body.map((l, i) => {
        const markCont = l.cont && firstCont;
        if (l.cont) firstCont = false;
        return (
          <div key={i} className={`relative ${GRID} border-b border-line-soft ${l.cont ? 'text-subtle' : ''}`}>
            {markCont && <Marker n={4} className="-left-8 top-1/2 -translate-y-1/2" />}
            <span className="bg-line-soft py-1 text-center font-mono text-[10px] text-muted">{i + 4}</span>
            <span className={`${CELL} font-mono`}>{l.n}</span>
            <span className={`relative border-l border-line px-1.5 py-1 font-mono ${i === 1 ? 'outline-2 -outline-offset-2 outline-file-xlsx' : ''}`}>
              {l.time}
              {i === 1 && <Marker n={3} className="-right-2.5 -top-3" />}
            </span>
            <span className={CELL}>{l.title}</span>
            <span className={`${CELL} text-muted`}>{l.extra}</span>
          </div>
        );
      })}
      {/* Sheet tabs. */}
      <div className="relative flex items-end gap-1 rounded-b-lg border-t border-line bg-line-soft px-8 pt-1.5 text-[10px]">
        <Marker n={1} className="-left-8 top-1/2 -translate-y-1/2" />
        <span className="rounded-t border-x border-t border-line bg-card px-3 py-1 font-semibold text-file-xlsx">{labels.days[0]}</span>
        <span className="px-3 py-1 text-muted">{labels.days[1]}</span>
        <span className="px-2 py-1 text-muted">+</span>
      </div>
    </div>
  );
}

function PdfPages({ rows, labels }: { rows: DemoRow[]; labels: AnatomyLabels }) {
  const GRID = 'grid grid-cols-[1.5rem_3.25rem_minmax(0,1fr)_4.5rem]';
  // The dashed lines show the column boundaries CueSetter finds from where the text sits.
  const COL = 'border-l border-dashed border-accent/50 px-1.5';
  const all = lines(rows);
  const split = all.findIndex((l, i) => i > 0 && !l.cont && l.n === rows[3]?.n);
  const header = (dim = false) => (
    <div className={`${GRID} border-b border-ink/70 py-1 font-bold ${dim ? 'text-muted line-through decoration-muted/70' : ''}`}>
      <span className="px-1">{labels.columns.n}</span>
      <span className={COL}>{labels.columns.time}</span>
      <span className={COL}>{labels.columns.title}</span>
      <span className={COL}>{labels.columns.extra}</span>
    </div>
  );
  const row = (l: ReturnType<typeof lines>[number], i: number) => (
    <div key={i} className={`${GRID} py-0.5 ${l.cont ? 'text-subtle' : ''}`}>
      <span className="px-1 font-mono">{l.n}</span>
      <span className={`${COL} font-mono`}>{l.time}</span>
      <span className={`${COL} truncate`}>{l.title}</span>
      <span className={`${COL} truncate text-muted`}>{l.extra}</span>
    </div>
  );
  return (
    <div className="relative pr-6 text-[11px] sm:pr-16">
      <div className={`${PAGE} px-6 pb-3 pt-5`}>
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] text-muted">
          <span className="size-2.5 rounded-sm bg-file-pdf" />
          PDF
        </div>
        <p className="relative mb-3 text-base font-extrabold tracking-tight">
          <Marker n={3} className="-left-9 top-1/2 -translate-y-1/2" />
          {labels.title}
        </p>
        <div className="relative">
          <Marker n={1} className="-left-9 top-0" />
          {header()}
          {all.slice(0, split).map(row)}
        </div>
        <p className="mt-3 text-right font-mono text-[9px] text-muted">{labels.pages[0]}</p>
      </div>
      {/* Page 2: the repeated header and the page header above it are skipped. */}
      <div className={`${PAGE} mt-3 px-6 pb-4 pt-3`}>
        <div className="relative">
          <Marker n={2} className="-left-9 top-1" />
          <p className="mb-1 font-mono text-[9px] text-muted line-through decoration-muted/70">
            {labels.title} · {labels.pages[1]}
          </p>
          {header(true)}
        </div>
        {all.slice(split).map(row)}
      </div>
      {/* A scanned page: an image, no text to read. */}
      <div className="absolute -bottom-4 right-0 w-24 rotate-6 rounded-md bg-[#e9e6dd] p-2.5 shadow-xl sm:w-28">
        <Marker n={4} className="-left-3 -top-3" />
        {[90, 70, 85, 60, 80].map((w, i) => (
          <span key={i} className="mb-1.5 block h-1 rounded-full bg-[#9c978b] blur-[0.6px]" style={{ width: `${w}%` }} />
        ))}
        <span className="mt-2 block text-center font-mono text-[9px] font-semibold text-[#6b665b]">{labels.scanned}</span>
      </div>
    </div>
  );
}

function WordDoc({ rows, labels }: { rows: DemoRow[]; labels: AnatomyLabels }) {
  const GRID = 'grid grid-cols-[1.5rem_3.25rem_minmax(0,1fr)_4.5rem]';
  const CELL = 'border-l border-t border-ink/25 px-1.5 py-1';
  const [a, b, c] = rows;
  return (
    <div className={`${PAGE} px-6 pb-6 pt-5 text-[11px]`}>
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] text-muted">
        <span className="size-2.5 rounded-sm bg-file-docx" />
        DOCX
      </div>
      <p className="relative mb-4 text-lg font-extrabold tracking-tight text-file-docx">
        <Marker n={4} className="-left-9 top-1/2 -translate-y-1/2" />
        {labels.title}
      </p>
      <p className="mb-1 font-bold">{labels.days[0]}</p>
      <div className={`relative ${GRID} border-b border-r border-ink/25`}>
        <Marker n={1} className="-left-9 top-10" />
        {[labels.columns.n, labels.columns.time, labels.columns.title, labels.columns.extra].map((h) => (
          <span key={h} className={`${CELL} bg-line-soft font-bold`}>
            {h}
          </span>
        ))}
        {[a, b].map((r) => (
          <div key={r.n} className="contents">
            <span className={`${CELL} font-mono`}>{r.n}</span>
            <span className={`${CELL} font-mono`}>{r.time}</span>
            <span className={CELL}>{r.title[0]}</span>
            {r === a && <span className={`${CELL} row-span-2 bg-accent-soft text-muted`}>{b.extra}</span>}
          </div>
        ))}
        <span className={`${CELL} font-mono`}>{c.n}</span>
        <span className={`${CELL} font-mono`}>{c.time}</span>
        <span className={`${CELL} whitespace-pre-line`}>{c.title.join('\n')}</span>
        <span className={`${CELL} text-muted`}>{c.extra}</span>
      </div>
      <div className="relative mt-4 opacity-60">
        <Marker n={2} className="-left-9 top-0" />
        <p className="mb-1 font-bold">{labels.days[1]}</p>
        <div className={`${GRID} border-b border-r border-ink/25`}>
          {[labels.columns.n, labels.columns.time, labels.columns.title, labels.columns.extra].map((h) => (
            <span key={h} className={`${CELL} bg-line-soft font-bold`}>
              {h}
            </span>
          ))}
        </div>
      </div>
      <div className="relative mt-4">
        <Marker n={3} className="-left-9 top-0" />
        <p className="mb-1 font-bold">{labels.linesHeading}</p>
        {labels.lines.map((l) => (
          <p key={l} className="py-0.5">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

export function FormatAnatomy({ file, rows, labels }: { file: 'xlsx' | 'pdf' | 'docx'; rows: DemoRow[]; labels: AnatomyLabels }) {
  return (
    <Stage>
      <div className="pl-5">
        {file === 'xlsx' && <ExcelSheet rows={rows} labels={labels} />}
        {file === 'pdf' && <PdfPages rows={rows} labels={labels} />}
        {file === 'docx' && <WordDoc rows={rows} labels={labels} />}
      </div>
    </Stage>
  );
}
