/**
 * A drawn lighting console in the shape of a full-size grandMA3: a tall bridge with three large
 * screens on two posts and an LED strip below, a long low desk in slight perspective with two
 * small displays, key rows, fader banks, five encoders with two small colour displays, a keypad
 * and a padded armrest. Stylised on purpose, with no MA logo or product name (trademarks). The
 * left screen shows the sequence CueSetter built. Decorative: the surrounding text says what it shows.
 */

export interface ConsoleCue {
  n: string;
  name: string;
}

// The desk is a trapezoid: narrow at the back (y = BACK), wide at the front (y = FRONT).
const BACK = 262;
const FRONT = 430;
const left = (y: number) => 120 + ((y - BACK) / (FRONT - BACK)) * (40 - 120);
const right = (y: number) => 880 + ((y - BACK) / (FRONT - BACK)) * (960 - 880);
/** x position at a fraction u (0–1) across the desk, at depth y. */
const at = (u: number, y: number) => left(y) + u * (right(y) - left(y));
/** How much things shrink towards the back. */
const scale = (y: number) => (right(y) - left(y)) / (right(FRONT) - left(FRONT));

const POOL = [
  'fill-console-accent', 'fill-file-xlsx', 'fill-file-pdf', 'fill-[#f5c542]', 'fill-console-accent/50',
  'fill-[#c06cf0]', 'fill-console-line', 'fill-file-docx', 'fill-file-xlsx/70', 'fill-console-accent/70',
  'fill-file-pdf/70', 'fill-console-line', 'fill-[#f5c542]/70', 'fill-console-accent', 'fill-file-docx/70',
];
const FADERS = [0.2, 0.6, 0.85, 0.4, 0.7, 0.3, 0.9, 0.5, 0.65, 0.25];

/** A small key on the desk at fraction u and depth y. */
function Key({ u, y, w = 14, h = 7, lit = false }: { u: number; y: number; w?: number; h?: number; lit?: boolean }) {
  const s = scale(y);
  return <rect x={at(u, y) - (w * s) / 2} y={y} width={w * s} height={h * s} rx={1.5} className={lit ? 'fill-console-accent' : 'fill-[#2b313b]'} />;
}

export function ConsoleIllustration({ sequence, cues }: { sequence: string; cues: ConsoleCue[] }) {
  return (
    <svg viewBox="0 0 1000 500" className="h-auto w-full" aria-hidden="true">
      <defs>
        <linearGradient id="desk-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d2128" />
          <stop offset="1" stopColor="#262b33" />
        </linearGradient>
        <linearGradient id="armrest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#30353e" />
          <stop offset="1" stopColor="#121418" />
        </linearGradient>
        <linearGradient id="led" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Posts that carry the screen bridge. */}
      <rect x="104" y="70" width="22" height="210" rx="8" fill="#0d0f12" className="stroke-console-line" />
      <rect x="874" y="70" width="22" height="210" rx="8" fill="#0d0f12" className="stroke-console-line" />

      {/* Screen bridge with three large screens. */}
      <rect x="126" y="14" width="748" height="222" rx="10" fill="#07080a" className="stroke-console-line" strokeWidth="2" />
      {/* Left: the sequence CueSetter built. */}
      <rect x="142" y="30" width="226" height="186" rx="3" fill="#0b0e13" />
      <text x="154" y="52" className="fill-console-accent font-mono text-[12px] font-semibold">{sequence}</text>
      {cues.slice(0, 6).map((c, i) => (
        <g key={c.n}>
          {i === 1 && <rect x="146" y={62 + i * 25} width="218" height="22" rx="3" className="fill-console-accent/25" />}
          <text x="154" y={78 + i * 25} className="fill-console-accent font-mono text-[11px] font-semibold">{c.n}</text>
          <text x="180" y={78 + i * 25} className="fill-console-ink font-sans text-[11px]">{c.name}</text>
          <line x1="152" x2="358" y1={84 + i * 25} y2={84 + i * 25} className="stroke-console-line" />
        </g>
      ))}
      {/* Centre: a sheet of fixture values. */}
      <rect x="387" y="30" width="226" height="186" rx="3" fill="#0b0e13" />
      {Array.from({ length: 9 }, (_, r) => (
        <g key={r}>
          <rect x="397" y={42 + r * 19} width="40" height="11" rx="1" className="fill-console-line" />
          {[0, 1, 2, 3].map((c) => (
            <rect key={c} x={444 + c * 40} y={42 + r * 19} width="34" height="11" rx="1" className={(r + c) % 5 === 0 ? 'fill-console-accent/60' : 'fill-[#1a1f27]'} />
          ))}
        </g>
      ))}
      {/* Right: a colourful pool. */}
      <rect x="632" y="30" width="226" height="186" rx="3" fill="#0b0e13" />
      {POOL.map((cls, i) => (
        <rect key={i} x={644 + (i % 5) * 42} y={44 + Math.floor(i / 5) * 40} width="36" height="34" rx="4" className={cls} />
      ))}
      <rect x="644" y="168" width="204" height="36" rx="4" className="fill-[#1a1f27]" />

      {/* LED strip under the screens. */}
      <rect x="140" y="244" width="720" height="4" rx="2" fill="url(#led)" />

      {/* Desk top in perspective. */}
      <path d={`M${left(BACK)} ${BACK} H${right(BACK)} L${right(FRONT)} ${FRONT} H${left(FRONT)} Z`} fill="url(#desk-top)" className="stroke-console-line" strokeWidth="1.5" />

      {/* Two small displays at the back, and the key panel on the right. */}
      {[
        [0.06, 0.27],
        [0.29, 0.5],
      ].map(([a, b], i) => (
        <g key={i}>
          <path d={`M${at(a, 270)} 270 H${at(b, 270)} L${at(b, 288)} 288 H${at(a, 288)} Z`} fill="#0b0e13" />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={at(a + 0.012 + k * ((b - a) / 4), 274)} y="274" width={((b - a) / 4 - 0.01) * (right(274) - left(274))} height="10" rx="1" className={k === 1 ? 'fill-console-accent/60' : 'fill-[#1f3b3f]'} />
          ))}
        </g>
      ))}
      {Array.from({ length: 16 }, (_, i) => <Key key={`p${i}`} u={0.56 + (i % 8) * 0.05} y={i < 8 ? 270 : 280} w={16} />)}

      {/* Key rows across the desk. */}
      {[298, 308].map((y) => Array.from({ length: 30 }, (_, i) => <Key key={`${y}-${i}`} u={0.03 + i * 0.017} y={y} w={11} />))}

      {/* Fader banks with lit executor keys. */}
      {FADERS.map((level, i) => {
        const u = 0.06 + i * 0.045 + (i >= 5 ? 0.02 : 0);
        const y0 = 330;
        const travel = 60;
        const s = scale(y0 + travel);
        const x = at(u, y0 + travel / 2);
        return (
          <g key={`f${i}`}>
            <Key u={u} y={320} w={20} lit={i === 1 || i === 6} />
            <rect x={x - 2} y={y0} width="4" height={travel} rx="2" fill="#07080a" />
            <rect x={x - 11 * s} y={y0 + travel * (1 - level) - 5} width={22 * s} height="10" rx="2" className={i === 1 ? 'fill-console-accent' : 'fill-[#9aa3ae]'} />
          </g>
        );
      })}

      {/* Five encoders with two small colour displays, keypad and GO. */}
      {[0, 1, 2, 3, 4].map((i) => {
        const u = 0.6 + i * 0.07;
        const s = scale(330);
        return (
          <g key={`e${i}`}>
            <circle cx={at(u, 330)} cy="330" r={15 * s} fill="#0a0b0d" className="stroke-[#3a404a]" strokeWidth="2" />
            <circle cx={at(u, 330)} cy="330" r={6 * s} fill="#1b1f25" />
          </g>
        );
      })}
      <path d={`M${at(0.555, 352)} 352 H${at(0.655, 352)} L${at(0.655, 392)} 392 H${at(0.555, 392)} Z`} fill="#0b0e13" />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <rect key={k} x={at(0.565 + k * 0.014, 360)} y="360" width="8" height="24" className={['fill-file-pdf', 'fill-[#f5c542]', 'fill-file-xlsx', 'fill-console-accent', 'fill-file-docx', 'fill-[#c06cf0]'][k]} />
      ))}
      <path d={`M${at(0.87, 352)} 352 H${at(0.97, 352)} L${at(0.97, 392)} 392 H${at(0.87, 392)} Z`} fill="#0b0e13" />
      <path d={`M${at(0.885, 386)} 386 L${at(0.93, 358)} 358 L${at(0.955, 386)} 386 Z`} className="fill-console-accent/70" />
      {Array.from({ length: 12 }, (_, i) => <Key key={`k${i}`} u={0.69 + (i % 4) * 0.042} y={354 + Math.floor(i / 4) * 13} w={20} h={9} />)}
      <rect x={at(0.505, 352)} y="352" width={40 * scale(352)} height="38" rx="4" className="animate-cue-standby fill-console-accent" />
      <text x={at(0.505, 352) + 20 * scale(352)} y="376" textAnchor="middle" className="fill-console font-mono text-[12px] font-bold">GO</text>

      {/* Key rows at the front. */}
      {[402, 414].map((y) => Array.from({ length: 34 }, (_, i) => <Key key={`${y}-${i}`} u={0.03 + i * 0.0285} y={y} w={14} />))}

      {/* Padded armrest in three parts along the front edge. */}
      {[
        [0, 0.33],
        [0.335, 0.665],
        [0.67, 1],
      ].map(([a, b], i) => (
        <path key={i} d={`M${at(a, FRONT) + 2} ${FRONT} H${at(b, FRONT) - 2} L${at(b, FRONT) + (b === 1 ? 6 : 0) - 2} 470 Q${at(b, FRONT) - 2} 484 ${at(b, FRONT) - 16} 484 H${at(a, FRONT) + 16} Q${at(a, FRONT) + 2} 484 ${at(a, FRONT) + 2 - (a === 0 ? 6 : 0)} 470 Z`} fill="url(#armrest)" />
      ))}
    </svg>
  );
}
