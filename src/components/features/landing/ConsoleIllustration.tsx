/**
 * A drawn lighting console in the grandMA3 style: three touchscreens, encoders under the centre
 * screen, two fader banks with executor buttons, a keypad and GO keys. Stylised on purpose, with
 * no MA logo or product name (trademarks). The left screen shows the sequence CueSetter built.
 * Decorative: the surrounding text says what it shows.
 */

export interface ConsoleCue {
  n: string;
  name: string;
}

const FADER_LEVELS = [0.15, 0.55, 0.85, 0.35, 0.7, 0.5, 0.9, 0.25, 0.6, 0.45, 0.8, 0.3];
const POOL = [
  'fill-console-accent', 'fill-console-accent/40', 'fill-file-xlsx/60', 'fill-console-line', 'fill-file-pdf/60', 'fill-console-accent/70',
  'fill-console-line', 'fill-file-docx/60', 'fill-console-accent/40', 'fill-console-line', 'fill-console-accent', 'fill-file-xlsx/40',
  'fill-console-accent/70', 'fill-console-line', 'fill-file-pdf/40', 'fill-console-accent/40', 'fill-console-line', 'fill-file-docx/40',
  'fill-console-line', 'fill-console-accent/40', 'fill-console-line', 'fill-console-accent/70', 'fill-file-xlsx/60', 'fill-console-line',
];

export function ConsoleIllustration({ sequence, cues }: { sequence: string; cues: ConsoleCue[] }) {
  return (
    <svg viewBox="0 0 1000 470" className="h-auto w-full" aria-hidden="true">
      <defs>
        <linearGradient id="console-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a303a" />
          <stop offset="1" stopColor="#14171c" />
        </linearGradient>
      </defs>
      {/* Body (brushed metal) with a light top edge, and the raised screen bridge. */}
      <rect x="10" y="30" width="980" height="430" rx="30" fill="url(#console-body)" className="stroke-console-line" strokeWidth="2" />
      <path d="M40 31 H960" className="stroke-white/15" strokeWidth="2" strokeLinecap="round" />
      <rect x="30" y="48" width="940" height="200" rx="18" className="fill-console stroke-console-line" strokeWidth="1.5" />

      {/* Left screen: the sequence CueSetter built. */}
      <rect x="48" y="64" width="290" height="168" rx="8" className="fill-[#07090c] stroke-console-line" />
      <text x="64" y="88" className="fill-console-accent font-mono text-[12px] font-semibold">{sequence}</text>
      {cues.slice(0, 5).map((c, i) => (
        <g key={c.n}>
          {i === 1 && <rect x="56" y={98 + i * 26} width="274" height="24" rx="4" className="fill-console-accent/20" />}
          <text x="66" y={115 + i * 26} className="fill-console-accent font-mono text-[12px] font-semibold">{c.n}</text>
          <text x="104" y={115 + i * 26} className="fill-console-ink font-sans text-[12px]">{c.name}</text>
          <line x1="64" x2="322" y1={122 + i * 26} y2={122 + i * 26} className="stroke-console-line" />
        </g>
      ))}

      {/* Centre screen: a pool of coloured tiles. */}
      <rect x="355" y="64" width="290" height="168" rx="8" className="fill-[#07090c] stroke-console-line" />
      {POOL.map((cls, i) => (
        <rect key={i} x={371 + (i % 6) * 44} y={80 + Math.floor(i / 6) * 36} width="38" height="30" rx="4" className={cls} />
      ))}

      {/* Right screen: a fixture sheet with intensity bars. */}
      <rect x="662" y="64" width="290" height="168" rx="8" className="fill-[#07090c] stroke-console-line" />
      {[0.8, 0.45, 1, 0.3, 0.65, 0.9].map((v, i) => (
        <g key={i}>
          <rect x="678" y={82 + i * 24} width="30" height="12" rx="2" className="fill-console-line" />
          <rect x="718" y={84 + i * 24} width={210 * v} height="8" rx="4" className="fill-console-accent/60" />
        </g>
      ))}

      {/* Encoders under the centre screen. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${410 + i * 45} 288)`}>
          <rect x="-16" y="-24" width="32" height="10" rx="2" className="fill-[#07090c]" />
          <circle r="15" className="fill-console stroke-console-line" strokeWidth="2" />
          <line x1="0" y1="-11" x2="0" y2="-4" className="stroke-console-muted" strokeWidth="2" strokeLinecap="round" transform={`rotate(${-60 + i * 35})`} />
        </g>
      ))}

      {/* Two banks of six executors: two buttons with LEDs above each fader. */}
      {FADER_LEVELS.map((level, i) => {
        const x = i < 6 ? 62 + i * 52 : 678 + (i - 6) * 52;
        const top = 340;
        const travel = 92;
        const active = i === 1;
        return (
          <g key={i}>
            {[264, 290].map((y, row) => (
              <g key={y}>
                <rect x={x - 17} y={y} width="34" height="20" rx="3" className="fill-console stroke-console-line" />
                <circle cx={x} cy={y + 10} r="3" className={active && row === 1 ? 'fill-console-accent' : 'fill-console-line'} />
              </g>
            ))}
            <rect x={x - 3} y={top} width="6" height={travel} rx="3" className="fill-[#07090c]" />
            <rect x={x - 15} y={top + travel * (1 - level) - 8} width="30" height="16" rx="3" className={active ? 'fill-console-accent' : 'fill-[#9aa3ae]'} />
          </g>
        );
      })}

      {/* Keypad. */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={372 + (i % 4) * 42} y={330 + Math.floor(i / 4) * 34} width="36" height="28" rx="4" className="fill-console stroke-console-line" />
      ))}

      {/* GO keys: the one that matters. */}
      <rect x="550" y="330" width="88" height="62" rx="8" className="animate-cue-standby fill-console-accent" />
      <text x="594" y="368" textAnchor="middle" className="fill-console font-mono text-[18px] font-bold">GO</text>
      <rect x="550" y="398" width="42" height="28" rx="4" className="fill-console stroke-console-line" />
      <rect x="596" y="398" width="42" height="28" rx="4" className="fill-console stroke-console-line" />
    </svg>
  );
}
