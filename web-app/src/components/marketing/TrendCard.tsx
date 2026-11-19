import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PILLAR_CHART_COLORS } from '@/lib/pillarColors.js';

// Trend chart for the dashboard snapshot: one line per pillar over twelve analyses.
// A marker steps along the lines, one analysis at a time. Each pass the lines draw in
// again, alternate pillars from the left and from the right.
// Example data, labelled as such.
export const WEEKS = 12;
export const SERIES: { key: keyof typeof PILLAR_CHART_COLORS; label: string; start: number; end: number }[] = [
  { key: 'ai_readability', label: 'AI Readability', start: 48, end: 74 },
  { key: 'digital_authority', label: 'Digital Authority', start: 55, end: 70 },
  { key: 'conversion_readiness', label: 'Conversion Readiness', start: 40, end: 61 },
  { key: 'product_discoverability', label: 'Product Discoverability', start: 52, end: 66 },
  { key: 'rag_readiness', label: 'Easy to Quote', start: 36, end: 58 },
  { key: 'local_presence', label: 'Local Presence', start: 60, end: 79 },
];

const W = 560;
const H = 150;
const PAD = 12;
const MONO = "'Geist Mono', ui-monospace, monospace";
const EASE = [0.22, 1, 0.36, 1] as const;

// A gentle, deterministic wiggle so each line rises with small changes between analyses.
export function valueAt(start: number, end: number, week: number, seed: number) {
  const t = week / (WEEKS - 1);
  const wiggle = Math.sin(week * 1.7 + seed) * 2.5;
  return start + (end - start) * t + wiggle * (week === 0 || week === WEEKS - 1 ? 0 : 1);
}

export default function TrendCard({ week = 0, cycle = 0 }: { week?: number; cycle?: number }) {
  const reduce = useReducedMotion();
  const uid = useId();
  const current = reduce ? WEEKS - 1 : week;
  const x = (w: number) => PAD + (w / (WEEKS - 1)) * (W - PAD * 2);
  const y = (v: number) => PAD + (1 - v / 100) * (H - PAD * 2);

  return (
    <div className="flex h-full flex-col rounded-md border border-white/[0.07] bg-black p-4">
      <div className="mb-3 flex items-center justify-between text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>
        <span>LAST {WEEKS} ANALYSES</span>
        <span>ANALYSIS {current + 1} OF {WEEKS}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full flex-1 min-h-[140px]" role="img" aria-label="Trend lines for each pillar over twelve analyses">
        <defs>
          {SERIES.map((s, i) => (
            <clipPath key={`clip-${s.key}`} id={`${uid}-${i}`}>
              <motion.rect
                key={`pass-${cycle}`}
                y={0}
                height={H}
                initial={{ x: i % 2 === 1 ? W : 0, width: 0 }}
                animate={{ x: 0, width: W }}
                transition={{ duration: 2.2, delay: 0.1 * i, ease: EASE }}
              />
            </clipPath>
          ))}
        </defs>
        {[0, 50, 100].map(v => (
          <line key={v} x1={PAD} x2={W - PAD} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.06)" />
        ))}
        <line x1={x(current)} x2={x(current)} y1={PAD} y2={H - PAD} stroke="rgba(255,255,255,0.16)" strokeDasharray="3 4" />
        {SERIES.map((s, i) => {
          const d = Array.from({ length: WEEKS }, (_, w) => `${w === 0 ? 'M' : 'L'} ${x(w)} ${y(valueAt(s.start, s.end, w, i))}`).join(' ');
          return (
            <g key={s.key} clipPath={reduce ? undefined : `url(#${uid}-${i})`}>
              <path
                d={d}
                fill="none"
                stroke={PILLAR_CHART_COLORS[s.key]}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          );
        })}
        {SERIES.map((s, i) => (
          <motion.circle
            key={`dot-${s.key}`}
            r={3.5}
            fill={PILLAR_CHART_COLORS[s.key]}
            animate={{ cx: x(current), cy: y(valueAt(s.start, s.end, current, i)) }}
            transition={{ duration: 1.2, ease: EASE }}
          />
        ))}
      </svg>
      <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-[12px] text-neutral-400">
        {SERIES.map(s => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: PILLAR_CHART_COLORS[s.key] }} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
