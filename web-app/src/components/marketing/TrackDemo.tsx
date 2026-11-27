import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { PILLAR_CHART_COLORS } from '@/lib/pillarColors.js';
import { SERIES, WEEKS, valueAt } from './TrendCard';

// The card plays once: each core pillar's line climbs and its gauge moves from its start
// score to its end score, one pillar at a time, then the card holds. Example data,
// labelled as such on the page.
const SLOT_MS = 1400;
const MOVE_S = 1.8; // lines and gauges move over the same time
const CORE = [0, 1, 2, 4]; // the four core pillars get gauges and lines
const LANE_ONLY = [3, 5]; // online sellers and local business: shown faint, not drawn
const PER_CYCLE = CORE.length + 1; // one slot per core pillar, then a hold
// Start and end score for each core pillar's climb.
const RANGE: Record<number, [number, number]> = { 0: [36, 91], 1: [44, 84], 2: [34, 79], 4: [30, 73] };
const W = 560;
const H = 200;
const PAD = 12;
const MONO = "'Geist Mono', ui-monospace, monospace";

const valueFor = (i: number, w: number) => valueAt(RANGE[i][0], RANGE[i][1], w, i);
const x = (w: number) => PAD + (w / (WEEKS - 1)) * (W - PAD * 2);
const y = (v: number) => PAD + (1 - v / 100) * (H - PAD * 2);
const linePath = (i: number) =>
  Array.from({ length: WEEKS }, (_, w) => `${w === 0 ? 'M' : 'L'} ${x(w)} ${y(valueFor(i, w))}`).join(' ');

const bandLabel = (v: number) => (v >= 75 ? 'Good' : v >= 50 ? 'Fair' : 'Needs Work');

export function Gauge({ label, value, color = '#ffffff', dim = false }: { label: string; value: number; color?: string; dim?: boolean }) {
  const reduce = useReducedMotion();
  const cx = 60;
  const cy = 64;
  const r = 48;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const transition = reduce ? { duration: 0 } : { duration: MOVE_S, ease: 'easeInOut' as const };
  const t = Math.PI * (1 - value / 100);
  return (
    <figure className={`min-w-0 text-center ${dim ? 'opacity-30' : ''}`}>
      <svg viewBox="0 0 120 76" className="block h-auto w-full" role="img" aria-label={dim ? `${label}: not used in this example` : `${label}: ${Math.round(value)} out of 100`}>
        <path d={arc} fill="none" stroke="#262626" strokeWidth={2} strokeLinecap="round" />
        {!dim && (
          <>
            <motion.path d={arc} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" animate={{ pathLength: value / 100 }} transition={transition} />
            <motion.circle
              cx={cx - r}
              cy={cy}
              r={3.5}
              fill={color}
              initial={false}
              animate={{ x: r * Math.cos(t) + r, y: -r * Math.sin(t) }}
              transition={transition}
            />
          </>
        )}
      </svg>
      <div className="-mt-1 text-[20px] font-semibold tabular-nums text-white">{dim ? '—' : Math.round(value)}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-500" style={{ fontFamily: MONO }}>
        {dim ? 'Not used here' : bandLabel(value)}
      </div>
      <div className="mt-1 text-[11px] leading-tight text-neutral-400">{label}</div>
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
    const id = window.setInterval(() => setTick(n => Math.min(n + 1, PER_CYCLE)), SLOT_MS);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const loaded = reduce ? CORE.length : Math.min(tick + 1, CORE.length); // pillars on screen so far
  const gaugeValue = (i: number) => (CORE.indexOf(i) < loaded ? valueFor(i, WEEKS - 1) : valueFor(i, 0));
  // The general scoring weights the four core pillars equally, so overall is their average.
  const overall = Math.round(CORE.reduce((n, i) => n + gaugeValue(i), 0) / CORE.length);

  return (
    <div
      ref={ref}
      className="rounded-md border border-white/[0.07] bg-black p-5"
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        backgroundPosition: '-4px -4px',
      }}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_200px] lg:gap-0 items-stretch">
        <div className="min-w-0 lg:pr-8">
          <div className="mb-4 text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>PILLAR SCORES</div>
          <div className="mb-5 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums text-white">{overall}</span>
            <span className="text-[13px] text-neutral-500">/100 overall</span>
          </div>
          <div className="relative pl-7">
            {[0, 25, 50, 75, 100].map(v => (
              <span
                key={v}
                className="absolute left-0 -translate-y-1/2 text-[10px] text-neutral-600 tabular-nums"
                style={{ fontFamily: MONO, top: `${(y(v) / H) * 100}%` }}
              >
                {v}
              </span>
            ))}
            <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Score lines for each core pillar over eight analyses">
              {[0, 25, 50, 75, 100].map(v => (
                <line key={v} x1={PAD} x2={W - PAD} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.06)" />
              ))}
              <defs>
                {CORE.map(i => (
                  <clipPath key={`clip-${i}`} id={`track-clip-${i}`}>
                    <motion.rect
                      x={0}
                      y={0}
                      height={H}
                      initial={{ width: reduce ? W : 0 }}
                      animate={{ width: CORE.indexOf(i) < loaded ? W : 0 }}
                      transition={{ duration: MOVE_S, ease: 'easeInOut' }}
                    />
                  </clipPath>
                ))}
              </defs>
              {CORE.map(i => (
                <path
                  key={SERIES[i].key}
                  d={linePath(i)}
                  fill="none"
                  stroke={PILLAR_CHART_COLORS[SERIES[i].key]}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  clipPath={`url(#track-clip-${i})`}
                />
              ))}
            </svg>
            <div className="mt-2 flex justify-between text-[10px] text-neutral-600" style={{ fontFamily: MONO }}>
              <span>Analysis 1</span>
              <span>Analysis {WEEKS}</span>
            </div>
          </div>
        </div>
        <div className="min-w-0 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="mb-4 text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>LATEST SCORE BY PILLAR</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            {CORE.map(i => (
              <Gauge key={SERIES[i].key} label={SERIES[i].label} value={gaugeValue(i)} color={PILLAR_CHART_COLORS[SERIES[i].key]} />
            ))}
            {LANE_ONLY.map(i => (
              <Gauge key={SERIES[i].key} label={SERIES[i].label} value={0} color={PILLAR_CHART_COLORS[SERIES[i].key]} dim />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
