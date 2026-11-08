import { motion, useReducedMotion } from 'framer-motion';

// The scores-by-area bars for the platform section. Example data. They grow up
// one after another when they scroll into view; the trend lines start after them.
const AREAS = [
  { label: 'AI Readability', score: 74 },
  { label: 'Digital Authority', score: 61 },
  { label: 'Conversion Readiness', score: 58 },
  { label: 'RAG Readiness', score: 66 },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function AreaBars() {
  const reduce = useReducedMotion();
  return (
    <div className="rounded-md border border-white/[0.07] bg-black p-4">
      <div className="flex items-end gap-4 h-[200px]">
        {AREAS.map((a, i) => (
          <div key={a.label} className="flex h-full flex-1 flex-col items-center justify-end">
            <span className="mb-2 text-[12px] text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>{a.score}%</span>
            <div className="relative w-full flex-1 flex items-end">
              <motion.div
                className="w-full rounded-t-sm bg-[#3B82F6]"
                style={{ height: `${a.score}%`, originY: 1 }}
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-4">
        {AREAS.map(a => (
          <span key={a.label} className="text-center text-[11px] leading-tight text-neutral-500">{a.label}</span>
        ))}
      </div>
    </div>
  );
}
