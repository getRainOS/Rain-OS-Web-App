import { motion, useReducedMotion } from 'framer-motion';
import { PILLAR_CHART_COLORS } from '@/lib/pillarColors.js';

// A real screenshot of the app's screen, shown large and sharp. It fades up as it
// scrolls into view, then drifts slowly, and sits on a soft colour glow so it
// reads at the same weight as the rest of the page.
const MONO = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const frame = 'rounded-xl border border-white/10 bg-[#0a0a0a] p-5 md:p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]';
const view = { once: true, amount: 0.3 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function AppShot({ src, alt, accent }: { src: string; alt: string; accent: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-6 rounded-[32px] opacity-60 blur-2xl"
        style={{ background: `radial-gradient(60% 60% at 50% 40%, ${accent}, transparent 70%)` }}
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-xl border border-white/15 bg-[#0a0a0a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1.025, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
        <motion.img
          src={src}
          alt={alt}
          width={1146}
          height={560}
          loading="lazy"
          className="block h-auto w-full"
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={view}
          transition={{ duration: 1, ease: EASE }}
        />
        </motion.div>
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-1/3"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, mixBlendMode: 'screen' }}
            initial={{ left: '-40%' }}
            whileInView={{ left: ['-40%', '110%'] }}
            viewport={view}
            transition={{ duration: 3.2, delay: 0.8, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  );
}

// The analysis result, in the same vertical format the app shows: the business,
// the overall score, and one column per pillar. Example data from a saved demo
// analysis. Each column rises in turn when it scrolls into view.
export type PillarData = { overall: number; business: string; page: string; pillars: Pillar[] };

type Pillar = { key: keyof typeof PILLAR_CHART_COLORS; label: string; value: number };

export const BEFORE: PillarData = {
  business: 'Bright Smile Dental',
  page: 'Invisalign in Austin',
  overall: 58,
  pillars: [
    { key: 'ai_readability', label: 'AI Readability', value: 55 },
    { key: 'digital_authority', label: 'Digital Authority', value: 61 },
    { key: 'conversion_readiness', label: 'Conversion Readiness', value: 60 },
    { key: 'rag_readiness', label: 'Easy to Quote', value: 52 },
    { key: 'local_presence', label: 'Local Presence', value: 57 },
  ] as Pillar[],
};


// The same page, checked again after its fixes: a real saved analysis from the demo.
export const AFTER: PillarData = {
  business: 'Bright Smile Dental',
  page: 'Invisalign in Austin',
  overall: 74,
  pillars: [
    { key: 'ai_readability', label: 'AI Readability', value: 77 },
    { key: 'digital_authority', label: 'Digital Authority', value: 70 },
    { key: 'conversion_readiness', label: 'Conversion Readiness', value: 72 },
    { key: 'rag_readiness', label: 'Easy to Quote', value: 66 },
    { key: 'local_presence', label: 'Local Presence', value: 78 },
  ] as Pillar[],
};

export function PillarVisual({ result = BEFORE, label }: { result?: PillarData; label?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={frame}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {label && <div className="mb-1 text-[11px] text-neutral-400" style={{ fontFamily: MONO }}>{label.toUpperCase()}</div>}
          <div className="truncate text-[15px] font-semibold text-white">{result.business}</div>
          <div className="text-[12px] text-neutral-500" style={{ fontFamily: MONO }}>{result.page.toUpperCase()}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>OVERALL AEO SCORE</div>
          <div className="text-4xl font-semibold tabular-nums text-white">{result.overall}<span className="text-lg text-neutral-500">/100</span></div>
        </div>
      </div>
      <div className="mt-6 grid h-52 items-end gap-3" style={{ gridTemplateColumns: `repeat(${result.pillars.length}, minmax(0, 1fr))` }}>
        {result.pillars.map((p, i) => (
          <div key={String(p.key)} className="flex h-full min-w-0 flex-col justify-end">
            <div className="mb-1.5 text-center text-[13px] font-semibold tabular-nums text-white">{p.value}</div>
            <motion.div
              className="w-full rounded-t-md"
              style={{ background: PILLAR_CHART_COLORS[p.key], height: `${p.value}%`, originY: 1 }}
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={view}
              transition={{ duration: 0.9, delay: i * 0.12, ease: EASE }}
            />
            <div className="mt-2 text-center text-[11px] leading-tight text-neutral-400">{p.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
