import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PILLAR_CHART_COLORS } from '@/lib/pillarColors.js';

// Small, animated pictures of each tool, drawn from how the app works. Example
// data only. Each one plays once when it scrolls into view, and the citation
// rows keep cycling so the page feels alive.

const MONO = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const EASE = [0.22, 1, 0.36, 1] as const;
const frame = 'rounded-xl border border-white/10 bg-[#0a0a0a] p-5 md:p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]';
const view = { once: true, amount: 0.4 } as const;

// Pillar breakdown: one score, split into the pillars for the lane.
const PILLARS = [
  { key: 'ai_readability', label: 'AI Readability', score: 74 },
  { key: 'digital_authority', label: 'Digital Authority', score: 70 },
  { key: 'conversion_readiness', label: 'Conversion Readiness', score: 61 },
  { key: 'rag_readiness', label: 'Easy to Quote', score: 58 },
] as const;

export function PillarVisual() {
  const reduce = useReducedMotion();
  return (
    <div className={frame}>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>RAIN SCORE</div>
          <div className="mt-1 text-5xl font-semibold tabular-nums text-white">68</div>
        </div>
        <div className="text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>PILLAR BREAKDOWN</div>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3 h-40 items-end">
        {PILLARS.map((p, i) => (
          <div key={p.key} className="flex h-full flex-col justify-end">
            <motion.div
              className="w-full rounded-t-sm"
              style={{ background: PILLAR_CHART_COLORS[p.key], height: `${p.score}%`, originY: 1 }}
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={view}
              transition={{ duration: 0.9, delay: i * 0.12, ease: EASE }}
            />
            <div className="mt-2 text-[11px] leading-tight text-neutral-400 text-center">{p.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Is AI Citing Me?: the same question across AI tools, each one cited or not.
const ENGINES = [
  { name: 'ChatGPT', cited: true },
  { name: 'Google AI Overviews', cited: true },
  { name: 'Perplexity', cited: false },
  { name: 'Claude', cited: true },
];

export function CitationVisual() {
  const reduce = useReducedMotion();
  const [hot, setHot] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setHot(n => (n + 1) % ENGINES.length), 1600);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <div className={frame}>
      <div className="rounded-md border border-white/[0.07] bg-black px-4 py-3 text-[14px] text-neutral-200">
        Who&apos;s the best emergency plumber near Austin?
      </div>
      <ul className="mt-4 space-y-2">
        {ENGINES.map((e, i) => (
          <motion.li
            key={e.name}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={view}
            transition={{ duration: 0.4, delay: i * 0.1, ease: EASE }}
            className={`flex items-center justify-between rounded-md border px-4 py-2.5 text-[13px] transition-colors duration-500 ${
              i === hot ? 'border-white/40 bg-white/[0.04]' : 'border-white/[0.07]'
            }`}
          >
            <span className="text-neutral-200">{e.name}</span>
            <span className={`text-[11px] ${e.cited ? 'text-white' : 'text-neutral-600'}`} style={{ fontFamily: MONO }}>
              {e.cited ? 'CITED' : 'NOT CITED'}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// Who AI Recommends: how often each business is named, against competitors.
const SHARE = [
  { name: 'Your business', value: 34, you: true },
  { name: 'Competitor A', value: 41, you: false },
  { name: 'Competitor B', value: 25, you: false },
];

export function ShareVisual() {
  return (
    <div className={frame}>
      <div className="text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>SHARE OF AI VOICE</div>
      <div className="mt-4 space-y-4">
        {SHARE.map((s, i) => (
          <div key={s.name}>
            <div className="mb-1.5 flex justify-between text-[13px]">
              <span className={s.you ? 'text-white' : 'text-neutral-400'}>{s.name}</span>
              <span className="tabular-nums text-neutral-300">{s.value}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={`h-full rounded-full ${s.you ? 'bg-white' : 'bg-white/30'}`}
                style={{ width: `${s.value * 2}%`, maxWidth: '100%' }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={view}
                transition={{ duration: 1, delay: 0.15 * i, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// How AI Describes Me: the wording an AI uses, placed on a positive-to-negative scale.
export function SentimentVisual() {
  const reduce = useReducedMotion();
  return (
    <div className={frame}>
      <div className="text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>HOW AI DESCRIBES YOU</div>
      <p className="mt-3 text-[14px] leading-relaxed text-neutral-200">
        &ldquo;Known for fast response and fair pricing, with strong reviews from local customers.&rdquo;
      </p>
      <div className="relative mt-6 h-2 rounded-full bg-gradient-to-r from-white/10 via-white/25 to-white">
        <motion.div
          className="absolute -top-1.5 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-[#0a0a0a] bg-white"
          style={{ left: '82%' }}
          initial={reduce ? false : { left: '50%', opacity: 0 }}
          whileInView={{ left: '82%', opacity: 1 }}
          viewport={view}
          transition={{ duration: 1.1, ease: EASE }}
        />
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>
        <span>NEGATIVE</span><span>NEUTRAL</span><span className="text-white">POSITIVE</span>
      </div>
    </div>
  );
}
