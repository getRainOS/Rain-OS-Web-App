import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { PILLAR_CHART_COLORS } from '@/lib/pillarColors.js';
import { SERIES, WEEKS, valueAt } from './TrendCard';

// Each pillar loads in turn: its line draws and its gauge moves to the score. After all
// of them have loaded, the set holds, then loads again. Each later run scores higher.
// Example data, labelled as such on the page.
const SLOT_MS = 1400;
const PER_CYCLE = SERIES.length + 1; // one slot per pillar, then a short hold
const GAIN = [7, 6, 8, 5, 7, 6]; // how far each pillar rises per run
const CORE = [0, 1, 2, 4]; // the four core pillars get gauges
const W = 560;
const H = 200;
const PAD = 12;
const MONO = "'Geist Mono', ui-monospace, monospace";
const EASE = [0.22, 1, 0.36, 1] as const;

const valueFor = (i: number, w: number, run: number) =>
  Math.min(100, valueAt(SERIES[i].start, SERIES[i].end, w, i) + run * GAIN[i]);
const x = (w: number) => PAD + (w / (WEEKS - 1)) * (W - PAD * 2);
const y = (v: number) => PAD + (1 - v / 100) * (H - PAD * 2);
const linePath = (i: number, run: number) =>
  Array.from({ length: WEEKS }, (_, w) => `${w === 0 ? 'M' : 'L'} ${x(w)} ${y(valueFor(i, w, run))}`).join(' ');

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  const reduce = useReducedMotion();
  const cx = 60;
  const cy = 64;
  const r = 48;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const angle = -90 + value * 1.8;
  const transition = reduce ? { duration: 0 } : { duration: 1.1, ease: EASE };
  return (
    <figure className="min-w-0 text-center">
      <div className="mb-1 text-[11px] leading-tight text-neutral-400">{label}</div>
      <svg viewBox="0 0 120 76" className="block h-auto w-full" role="img" aria-label={`${label}: ${Math.round(value)} out of 100`}>
        <path d={arc} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} strokeLinecap="round" />
        <motion.path d={arc} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" animate={{ pathLength: value / 100 }} transition={transition} />
        <motion.g style={{ transformOrigin: `${cx}px ${cy}px` }} animate={{ rotate: angle }} transition={transition}>
          <path d={`M ${cx - 2.5} ${cy} L ${cx} ${cy - (r - 6)} L ${cx + 2.5} ${cy} Z`} fill={color} />
        </motion.g>
        <circle cx={cx} cy={cy} r={3.5} fill={color} />
      </svg>
      <div className="-mt-1 text-[20px] font-semibold tabular-nums text-white">{Math.round(value)}</div>
    </figure>
  );
}

export default function TrackDemo() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setInterval(() => setTick(n => n + 1), SLOT_MS);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const run = Math.floor(tick / PER_CYCLE);
  const step = tick % PER_CYCLE;
  const loaded = reduce ? SERIES.length : step + 1; // how many pillars are on screen this run

  return (
    <div ref={ref} className="grid grid-cols-1 gap-4 md:grid-cols-2 items-stretch">
      <div className="flex h-full flex-col rounded-md border border-white/[0.07] bg-black p-4">
        <div className="mb-3 text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>LATEST SCORE BY PILLAR</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {CORE.map(i => {
            const shown = i < loaded ? valueFor(i, WEEKS - 1, run) : run > 0 ? valueFor(i, WEEKS - 1, run - 1) : valueFor(i, 0, 0);
            return <Gauge key={SERIES[i].key} label={SERIES[i].label} value={shown} color={PILLAR_CHART_COLORS[SERIES[i].key]} />;
          })}
        </div>
      </div>
      <div className="flex h-full flex-col rounded-md border border-white/[0.07] bg-black p-4">
        <div className="mb-3 flex items-center justify-between text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>
          <span>LAST {WEEKS} ANALYSES</span>
          <span>RUN {run + 1}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="min-h-[180px] w-full flex-1" role="img" aria-label="Score lines for each pillar over eight analyses">
          {[0, 50, 100].map(v => (
            <line key={v} x1={PAD} x2={W - PAD} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.06)" />
          ))}
          {SERIES.map((s, i) => (
            <motion.path
              key={`${run}-${s.key}`}
              d={linePath(i, run)}
              fill="none"
              stroke={PILLAR_CHART_COLORS[s.key]}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: i < loaded ? 1 : 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          ))}
        </svg>
        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] text-neutral-400 sm:grid-cols-3">
          {SERIES.map(s => (
            <li key={s.key} className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: PILLAR_CHART_COLORS[s.key] }} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
