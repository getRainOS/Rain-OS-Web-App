import { motion, useReducedMotion } from 'framer-motion';
import { PILLAR_CHART_COLORS } from '@/lib/pillarColors.js';

// Dashboard snapshot: twelve separate analyses. Each one is a run of bars, one bar per
// pillar, that climbs to that analysis's score. Runs alternate the direction the bars fill
// from. Example data, labelled as such.
export const WEEKS = 12;
export const SERIES: { key: keyof typeof PILLAR_CHART_COLORS; label: string; start: number; end: number }[] = [
  { key: 'ai_readability', label: 'AI Readability', start: 48, end: 74 },
  { key: 'digital_authority', label: 'Digital Authority', start: 55, end: 70 },
  { key: 'conversion_readiness', label: 'Conversion Readiness', start: 40, end: 61 },
  { key: 'product_discoverability', label: 'Product Discoverability', start: 52, end: 66 },
  { key: 'rag_readiness', label: 'Easy to Quote', start: 36, end: 58 },
  { key: 'local_presence', label: 'Local Presence', start: 60, end: 79 },
];

const MONO = "'Geist Mono', ui-monospace, monospace";
const EASE = [0.22, 1, 0.36, 1] as const;

// SCORES[run][pillar]: each run climbs from the first analysis towards the last, with a
// small variation between runs. The twelfth run's average is above the average of the
// eleven before it.
export const SCORES: number[][] = Array.from({ length: WEEKS }, (_, r) =>
  SERIES.map((s, i) => {
    const t = r / (WEEKS - 1);
    const wiggle = Math.sin(r * 1.3 + i * 2) * 3;
    return Math.round(Math.min(100, Math.max(0, s.start + (s.end - s.start) * t + wiggle)));
  }),
);

export function runAverage(r: number) {
  return SCORES[r].reduce((a, b) => a + b, 0) / SERIES.length;
}

export default function TrendCard({ week = 0 }: { week?: number }) {
  const reduce = useReducedMotion();
  const current = reduce ? WEEKS - 1 : week;
  const fromRight = current % 2 === 1;
  const scores = SCORES[current];

  return (
    <div className="flex h-full flex-col rounded-md border border-white/[0.07] bg-black p-4">
      <div className="mb-3 flex items-center justify-between text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>
        <span>SCORE BY AREA</span>
        <span>ANALYSIS {current + 1} OF {WEEKS}</span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-2">
        {SERIES.map((s, i) => (
          <div key={s.key}>
            <div className="mb-1 flex items-baseline justify-between text-[11px]">
              <span className="text-neutral-400">{s.label}</span>
              <span className="tabular-nums text-white" style={{ fontFamily: MONO }}>{scores[i]}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full w-full rounded-full"
                style={{ background: PILLAR_CHART_COLORS[s.key], transformOrigin: fromRight ? 'right' : 'left' }}
                initial={false}
                animate={{ scaleX: scores[i] / 100 }}
                transition={reduce ? { duration: 0 } : { duration: 1.2, delay: i * 0.04, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
