import { motion, useReducedMotion } from 'framer-motion';
import { PILLAR_CHART_COLORS } from '@/lib/pillarColors.js';
import { SERIES, WEEKS, valueAt } from './TrendCard';

// One half-circle meter per core pillar, in the same colours as the trend lines.
// The needles move with the same analysis the trend chart is on. Example data.

const MONO = "'Geist Mono', ui-monospace, monospace";
const EASE = [0.22, 1, 0.36, 1] as const;

// Same bands the app uses: Good from 75, Fair from 50, Needs Work below that.
function scoreBand(s: number) {
  if (s >= 75) return 'Good';
  if (s >= 50) return 'Fair';
  return 'Needs Work';
}

function Gauge({ label, value, color, mini }: { label: string; value: number; color: string; mini?: boolean }) {
  const reduce = useReducedMotion();
  const cx = 60;
  const cy = 64;
  const r = 48;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const angle = -90 + value * 1.8; // -90 = left end (0), +90 = right end (100)
  const transition = reduce ? { duration: 0 } : { duration: 0.9, ease: EASE };
  const shown = Math.round(value);
  return (
    <figure className="min-w-0 text-center">
      {!mini && <div className="text-[11px] text-neutral-400 mb-1 leading-tight">{label}</div>}
      <svg viewBox="0 0 120 76" className="w-full h-auto block" role="img" aria-label={`${label}: ${shown} out of 100`}>
        <path d={arc} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} strokeLinecap="round" />
        <motion.path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: value / 100 }}
          transition={transition}
        />
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={false}
          animate={{ rotate: angle }}
          transition={transition}
        >
          <path d={`M ${cx - 2.5} ${cy} L ${cx} ${cy - (r - 6)} L ${cx + 2.5} ${cy} Z`} fill={color} />
        </motion.g>
        <circle cx={cx} cy={cy} r={3.5} fill={color} />
        <text x={cx - r} y={cy + 9} textAnchor="middle" fontSize={6} fill="#737373" style={{ fontFamily: MONO }}>0</text>
        <text x={cx + r} y={cy + 9} textAnchor="middle" fontSize={6} fill="#737373" style={{ fontFamily: MONO }}>100</text>
      </svg>
      <div className={`-mt-1 font-semibold text-white tabular-nums ${mini ? 'text-[14px]' : 'text-[20px]'}`}>{shown}</div>
      {!mini && <div className="text-[11px] text-neutral-400">{scoreBand(value)}</div>}
    </figure>
  );
}

const CORE = SERIES.map((s, i) => ({ s, i })).filter(({ s }) => s.key !== 'product_discoverability' && s.key !== 'local_presence');
const LANE_NOTES = [
  { key: 'product_discoverability' as const, text: 'Product Discoverability is an extra gauge for online sellers.' },
  { key: 'local_presence' as const, text: 'Local Presence is an extra gauge for local businesses.' },
];

export default function PillarGauges({ week = WEEKS - 1 }: { week?: number }) {
  const reduce = useReducedMotion();
  const current = reduce ? WEEKS - 1 : week;
  return (
    <div className="flex h-full flex-col rounded-md border border-white/[0.07] bg-black p-4">
      <div className="mb-3 text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>LATEST SCORE BY PILLAR</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {CORE.map(({ s, i }) => (
          <Gauge key={s.key} label={s.label} value={valueAt(s.start, s.end, current, i)} color={PILLAR_CHART_COLORS[s.key]} />
        ))}
      </div>
      <ul className="mt-4 space-y-2 border-t border-white/[0.07] pt-3">
        {LANE_NOTES.map(n => {
          const i = SERIES.findIndex(x => x.key === n.key);
          const s = SERIES[i];
          return (
            <li key={n.key} className="flex items-center gap-3 text-[12px] leading-relaxed text-neutral-300">
              <div className="w-14 shrink-0">
                <Gauge label={s.label} value={valueAt(s.start, s.end, current, i)} color={PILLAR_CHART_COLORS[s.key]} mini />
              </div>
              <span>{n.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
