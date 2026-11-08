import { motion, useReducedMotion } from 'framer-motion';
import { PILLAR_CHART_COLORS } from '@/lib/pillarColors.js';
import { SERIES } from './TrendCard';

// One half-circle meter per core pillar, in the same colours as the trend lines.
// Each meter's needle and arc move to the pillar's latest value, timed to draw
// just after its trend line. Example data.

const MONO = "'Geist Mono', ui-monospace, monospace";
const EASE = [0.22, 1, 0.36, 1] as const;

function Gauge({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  const reduce = useReducedMotion();
  const cx = 60;
  const cy = 64;
  const r = 48;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const needleAngle = -90 + value * 1.8; // -90 = left end (0), +90 = right end (100)
  const transition = { duration: 1.4, delay, ease: EASE };
  return (
    <figure className="min-w-0 text-center">
      <div className="text-[11px] text-neutral-400 mb-1 truncate">{label}</div>
      <svg viewBox="0 0 120 76" className="w-full h-auto block" role="img" aria-label={`${label}: ${value} out of 100`}>
        <path d={arc} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} strokeLinecap="round" />
        <motion.path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: value / 100 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={transition}
        />
        <motion.g
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={reduce ? false : { rotate: -90 }}
          whileInView={{ rotate: needleAngle }}
          viewport={{ once: true, amount: 0.4 }}
          transition={transition}
        >
          <path d={`M ${cx - 2.5} ${cy} L ${cx} ${cy - (r - 6)} L ${cx + 2.5} ${cy} Z`} fill={color} />
        </motion.g>
        <circle cx={cx} cy={cy} r={3.5} fill={color} />
        <text x={cx - r} y={cy + 9} textAnchor="middle" fontSize={6} fill="#737373" style={{ fontFamily: MONO }}>0</text>
        <text x={cx + r} y={cy + 9} textAnchor="middle" fontSize={6} fill="#737373" style={{ fontFamily: MONO }}>100</text>
      </svg>
      <div className="-mt-1 text-[20px] font-semibold text-white tabular-nums">{Math.round(value)}</div>
    </figure>
  );
}

export default function PillarGauges() {
  return (
    <div className="mt-4 rounded-md border border-white/[0.07] bg-black p-4">
      <div className="mb-3 text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>LATEST SCORE BY PILLAR</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-4">
        {SERIES.map((s, i) => (
          <Gauge key={s.key} label={s.label} value={s.end} color={PILLAR_CHART_COLORS[s.key]} delay={1.4 + i * 0.15} />
        ))}
      </div>
    </div>
  );
}
