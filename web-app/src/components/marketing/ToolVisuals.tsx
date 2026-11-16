import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
      <IllustrativeTag />
    </div>
  );
}

// The analysis result, in the same vertical format the app shows: the business,
// the overall score, and one column per pillar. Example data from a saved demo
// analysis. Each column rises in turn when it scrolls into view.
export type PillarData = { overall: number; business: string; page: string; pillars: Pillar[]; laneName?: string };

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

export function IllustrativeTag() {
  return <div className="mt-4 text-[11px] uppercase tracking-wider text-neutral-500" style={{ fontFamily: MONO }}>Illustrative example, not a real result</div>;
}

export function PillarVisual({ result = BEFORE, label, before }: { result?: PillarData; label?: string; before?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className={frame}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          {label && <div className="mb-1 text-[11px] text-neutral-400" style={{ fontFamily: MONO }}>{label.toUpperCase()}</div>}
          <div className="flex min-w-0 items-center gap-2"><span className="truncate text-[15px] font-semibold text-white">{result.business}</span>{result.laneName && <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-neutral-300">{result.laneName}</span>}</div>
          <div className="text-[12px] text-neutral-500" style={{ fontFamily: MONO }}>{result.page.toUpperCase()}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>OVERALL AEO SCORE</div>
          {before !== undefined ? (
            <div className="flex items-baseline justify-end gap-2 tabular-nums">
              <span className="text-2xl font-semibold text-neutral-500 line-through decoration-neutral-600">{before}</span>
              <span className="text-4xl font-semibold text-white">{result.overall}</span>
              <span className="text-[13px] font-semibold text-[#3B82F6]">+{result.overall - before}</span>
            </div>
          ) : (
            <div className="text-4xl font-semibold tabular-nums text-white">{result.overall}<span className="text-lg text-neutral-500">/100</span></div>
          )}
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
      <IllustrativeTag />
    </div>
  );
}

// The pillars each lane is scored on, so a chart only shows what that lane measures.
// Writers, developers and vibe coders: the four core pillars. Online sellers add
// Product Discoverability; local businesses add Local Presence.
const CORE_KEYS = ['ai_readability', 'digital_authority', 'conversion_readiness', 'rag_readiness'] as const;
const LANE_KEYS = {
  writers: CORE_KEYS,
  developers: CORE_KEYS,
  vibe_coders: CORE_KEYS,
  sellers: [...CORE_KEYS, 'product_discoverability'],
  local: [...CORE_KEYS, 'local_presence'],
} as const;
export type LaneId = keyof typeof LANE_KEYS;

const LANE_NAME: Record<LaneId, string> = {
  local: 'Local businesses',
  sellers: 'Online sellers',
  writers: 'Writers & marketers',
  developers: 'Developers',
  vibe_coders: 'Vibe coders',
};

export function forLane(lane: LaneId, data: PillarData): PillarData {
  const keys: readonly string[] = LANE_KEYS[lane];
  return { ...data, laneName: LANE_NAME[lane], pillars: data.pillars.filter(p => keys.includes(p.key as string)) };
}

// One example per lane, each for a different kind of business, scored on that
// lane's pillars. The local business is a real saved demo analysis; the others
// are illustrative and labelled as examples on the page.
const pill = (key: Pillar['key'], label: string, value: number): Pillar => ({ key, label, value });
export const LANE_EXAMPLES: { lane: LaneId; index: number; before: PillarData; after: PillarData }[] = [
  { lane: 'local', index: 0, before: BEFORE, after: AFTER },
  {
    lane: 'sellers', index: 1,
    before: { business: 'Harbor Wallet Co.', page: 'Example product page', overall: 51, pillars: [
      pill('ai_readability', 'AI Readability', 50), pill('digital_authority', 'Digital Authority', 48), pill('conversion_readiness', 'Conversion Readiness', 55),
      pill('product_discoverability', 'Product Discoverability', 44), pill('rag_readiness', 'Easy to Quote', 58)] },
    after: { business: 'Harbor Wallet Co.', page: 'Example product page', overall: 71, pillars: [
      pill('ai_readability', 'AI Readability', 74), pill('digital_authority', 'Digital Authority', 66), pill('conversion_readiness', 'Conversion Readiness', 70),
      pill('product_discoverability', 'Product Discoverability', 76), pill('rag_readiness', 'Easy to Quote', 69)] },
  },
  {
    lane: 'writers', index: 2,
    before: { business: 'Quillpost', page: 'Example blog post', overall: 60, pillars: [
      pill('ai_readability', 'AI Readability', 66), pill('digital_authority', 'Digital Authority', 58), pill('conversion_readiness', 'Conversion Readiness', 55), pill('rag_readiness', 'Easy to Quote', 61)] },
    after: { business: 'Quillpost', page: 'Example blog post', overall: 77, pillars: [
      pill('ai_readability', 'AI Readability', 82), pill('digital_authority', 'Digital Authority', 74), pill('conversion_readiness', 'Conversion Readiness', 72), pill('rag_readiness', 'Easy to Quote', 79)] },
  },
  {
    lane: 'developers', index: 3,
    before: { business: 'Tinyroute', page: 'Example README', overall: 56, pillars: [
      pill('ai_readability', 'AI Readability', 60), pill('digital_authority', 'Digital Authority', 52), pill('conversion_readiness', 'Conversion Readiness', 50), pill('rag_readiness', 'Easy to Quote', 62)] },
    after: { business: 'Tinyroute', page: 'Example README', overall: 74, pillars: [
      pill('ai_readability', 'AI Readability', 80), pill('digital_authority', 'Digital Authority', 71), pill('conversion_readiness', 'Conversion Readiness', 66), pill('rag_readiness', 'Easy to Quote', 78)] },
  },
  {
    lane: 'vibe_coders', index: 4,
    before: { business: 'Bookly', page: 'Example landing page', overall: 49, pillars: [
      pill('ai_readability', 'AI Readability', 45), pill('digital_authority', 'Digital Authority', 50), pill('conversion_readiness', 'Conversion Readiness', 52), pill('rag_readiness', 'Easy to Quote', 48)] },
    after: { business: 'Bookly', page: 'Example landing page', overall: 71, pillars: [
      pill('ai_readability', 'AI Readability', 70), pill('digital_authority', 'Digital Authority', 68), pill('conversion_readiness', 'Conversion Readiness', 74), pill('rag_readiness', 'Easy to Quote', 71)] },
  },
];

// Is AI Citing Me?: one question per lane, checked over time. The local business
// is the app's own saved check (demo). The other lanes are illustrative examples.
export type CitingCheck = { date: string; result: string; cited: boolean };
export type CitingData = { laneName: string; business: string; question: string; latest: string; firstCited: string; example: boolean; history: CitingCheck[] };

export const CITING_LANES: CitingData[] = [
  {
    laneName: 'Local businesses', business: 'Bright Smile Dental', question: 'best dentist in Austin for Invisalign',
    latest: '#2', firstCited: 'yelp.com', example: false,
    history: [
      { date: 'Oct 22', result: 'Not cited', cited: false },
      { date: 'Oct 29', result: 'Not cited', cited: false },
      { date: 'Nov 5', result: '#3 of 5', cited: true },
      { date: 'Nov 12', result: '#2 of 5', cited: true },
    ],
  },
  {
    laneName: 'Online sellers', business: 'Harbor Wallet Co.', question: 'best waterproof travel wallet under $80',
    latest: '#3', firstCited: 'wirecutter.com', example: true,
    history: [
      { date: 'Oct 22', result: 'Not cited', cited: false },
      { date: 'Oct 29', result: '#5 of 5', cited: true },
      { date: 'Nov 5', result: '#4 of 5', cited: true },
      { date: 'Nov 12', result: '#3 of 5', cited: true },
    ],
  },
  {
    laneName: 'Writers & marketers', business: 'Quillpost', question: 'best newsletter tool for a solo writer',
    latest: '#1', firstCited: 'substack.com', example: true,
    history: [
      { date: 'Oct 22', result: 'Not cited', cited: false },
      { date: 'Oct 29', result: '#4 of 5', cited: true },
      { date: 'Nov 5', result: '#2 of 5', cited: true },
      { date: 'Nov 12', result: '#1 of 5', cited: true },
    ],
  },
  {
    laneName: 'Developers', business: 'Tinyroute', question: 'best framework for a small API on Cloudflare Workers',
    latest: '#2', firstCited: 'hono.dev', example: true,
    history: [
      { date: 'Oct 22', result: 'Not cited', cited: false },
      { date: 'Oct 29', result: 'Not cited', cited: false },
      { date: 'Nov 5', result: '#3 of 5', cited: true },
      { date: 'Nov 12', result: '#2 of 5', cited: true },
    ],
  },
  {
    laneName: 'Vibe coders', business: 'Bookly', question: 'easiest way to add a booking page to a Lovable app',
    latest: 'Not cited', firstCited: 'lovable.dev', example: true,
    history: [
      { date: 'Oct 22', result: 'Not cited', cited: false },
      { date: 'Oct 29', result: '#5 of 5', cited: true },
      { date: 'Nov 5', result: 'Not cited', cited: false },
      { date: 'Nov 12', result: 'Not cited', cited: false },
    ],
  },
];

export function CitationPanel({ data }: { data: CitingData }) {
  const reduce = useReducedMotion();
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 md:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-white">{data.business}</div>
          <div className="text-[12px] text-neutral-500" style={{ fontFamily: MONO }}>{data.example ? 'EXAMPLE' : 'SAVED CHECK'}</div>
        </div>
        <span className="shrink-0 rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-neutral-300">{data.laneName}</span>
      </div>

      <div className="mt-6 text-[12px] text-neutral-500" style={{ fontFamily: MONO }}>QUESTION</div>
      <div className="mt-1 text-[16px] text-white">{data.question}</div>

      <div className="mt-6 flex items-end justify-between gap-6">
        <div>
          <div className="text-[12px] text-neutral-500" style={{ fontFamily: MONO }}>LATEST CHECK</div>
          <motion.div
            className="mt-1 text-6xl font-semibold tabular-nums text-white"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {data.latest}
          </motion.div>
        </div>
        <div className="pb-2 text-right">
          <div className="text-[12px] text-neutral-500" style={{ fontFamily: MONO }}>USUALLY CITED FIRST</div>
          <div className="mt-1 text-[15px] text-neutral-200">{data.firstCited}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {data.history.map((h, i) => (
          <motion.div
            key={h.date}
            className={`rounded-lg border px-3 py-3 ${i === data.history.length - 1 ? 'border-white/60 bg-white/[0.05]' : 'border-white/10'}`}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.16, ease: EASE }}
          >
            <div className="text-[11px] text-neutral-500" style={{ fontFamily: MONO }}>{h.date}</div>
            <div className={`mt-1 text-[14px] font-medium ${h.cited ? 'text-white' : 'text-[#F87171]'}`}>{h.result}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 text-[12px] text-neutral-500">Each card is one check on the same question, over time. Results vary between checks.</div>
      <IllustrativeTag />
    </div>
  );
}

// Cycles through the lanes, one question at a time, so each lane's result is shown.
export function CitationRotation() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setI(n => (n + 1) % CITING_LANES.length), 6500);
    return () => clearTimeout(t);
  }, [i, reduce]);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={i}
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.45 }}
      >
        <CitationPanel data={CITING_LANES[i]} />
      </motion.div>
    </AnimatePresence>
  );
}
