import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, ChevronsRight, Search,
  MapPin, ShoppingBag, PenLine, Sparkles, Code2, HelpCircle,
} from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import { ENGINE_ICONS } from '@/components/marketing/engineIcons';
import SiteFooter from '@/components/marketing/SiteFooter';
import { FAQ } from '@/components/marketing/MarketingComponents';
import { useLiveEngines, ENGINES } from '@/lib/liveEngines';
import HeroPrompt from '@/components/marketing/HeroPrompt';
import SourceNetwork from '@/components/marketing/SourceNetwork';
import RainBackground from '@/components/marketing/RainBackground';
import { PillarVisual, forLane, LANE_EXAMPLES, CitationRotation, LaneCycle, ShareCard, SHARE_LANES, DescribeCard, DESCRIBE_LANES } from '@/components/marketing/ToolVisuals';
import ScrollWords from '@/components/marketing/ScrollWords';
import TrackDemo from '@/components/marketing/TrackDemo';
import { LaneSection, TrackExample } from '@/components/marketing/IllustratedExample';

const MONO: React.CSSProperties = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace" };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500 mb-4" style={MONO}>
      {children}
    </div>
  );
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Hero product frame ─────────────────────────────────────────────────── */


// Where your site ranked in Gemini's sources on each check (1 is the top).
// Gaps are checks where it wasn't cited. Same idea as the app's "Position over time" chart.
const ANALYZE_STEPS = [
  'Reading your content',
  'Measuring structure and readability',
  'Scoring each pillar',
  'Writing your fixes',
];

// Sample fixes, one set per way rain OS applies them. Each row shows the finding
// it was written for, then the fix. Illustrative wording, not output from a real scan.
// The lanes rain OS serves. Each analyzer lists the lanes most likely to use it;
// the other lanes stay visible, dimmer, because every analyzer helps all of them.
const LANES = [
  { name: 'Local businesses', icon: MapPin },
  { name: 'Online sellers', icon: ShoppingBag },
  { name: 'Writers and marketers', icon: PenLine },
  { name: 'Independent developers', icon: Code2 },
  { name: 'Vibe coders', icon: Sparkles },
];

const FIX_MODES = [
  {
    label: 'Check my writing',
    lanes: [2],
    rows: [
      { was: 'Answer starts after a 58-word intro', now: 'Open with the answer in the first sentence' },
      { was: 'Heading reads "Our approach"', now: 'Rename it to what the section answers: "How pricing works"' },
      { was: 'No dates or figures in the claims', now: 'Add the year and one number a reader can check' },
    ],
  },
  {
    label: 'URL scanner',
    lanes: [0, 1],
    rows: [
      { was: "AI can't find your business details on the page", now: 'Put your address, hours and phone in plain text' },
      { was: 'Missing Product schema markup', now: 'Add Product markup with price and availability' },
      { was: 'Meta description absent', now: 'Add a 150-character summary to the page head' },
    ],
  },
  {
    label: 'Repo analysis',
    lanes: [3, 4],
    rows: [
      { was: 'No JSON-LD schema markup found in index.html or layout files', now: 'Add a JSON-LD block to the page template' },
      { was: 'Meta description missing from index.html and layout templates', now: 'Add a meta description to the page template' },
      { was: 'README lacks a clear call to action', now: 'Add one line on what to do first, under the title' },
    ],
  },
];

// The analysis screen in the app, shown as it runs: each step fills in turn.
function AnalyzeConsole({ compact = false, litLane, step: stepProp }: { compact?: boolean; litLane?: number; step?: number }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [runIdx, setRunIdx] = useState(0); // the analyzer running now
  const [shownIdx, setShownIdx] = useState(-1); // the analyzer whose results are on screen
  const FIX_HOLD_MS = 3500;
  // Each lane runs the four steps (1.4s each), shows its result, then clears
  // before the next lane starts.
  useEffect(() => {
    if (reduce || stepProp !== undefined) return; // driven by the parent when a step is given
    if (step < ANALYZE_STEPS.length) {
      const t = setTimeout(() => setStep(n => n + 1), 1400);
      return () => clearTimeout(t);
    }
    // Result shows, holds, then clears; the next lane starts after the blank.
    setShownIdx(runIdx);
    const clear = setTimeout(() => setShownIdx(-1), FIX_HOLD_MS);
    const next = setTimeout(() => {
      setRunIdx(n => (n + 1) % FIX_MODES.length);
      setStep(0);
    }, FIX_HOLD_MS + 700);
    return () => { clearTimeout(clear); clearTimeout(next); };
  }, [step, runIdx, reduce]);
  const done = stepProp ?? (reduce ? ANALYZE_STEPS.length : step);
  const shown = reduce ? 0 : shownIdx;
  const shownMode = FIX_MODES[Math.max(shown, 0)];

  return (
    <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] shadow-[0_40px_120px_-40px_rgba(255,255,255,0.35)] overflow-hidden text-left">
      <div className="flex items-center gap-2 px-4 h-10 border-b border-white/[0.07] bg-white/[0.02]">
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="ml-3 text-[11px] text-neutral-500 truncate" style={MONO}>getrainos.com/analyze</span>
        <span className="ml-auto text-[10px] text-neutral-600 hidden sm:inline" style={MONO}>ILLUSTRATIVE</span>
      </div>
      <div className="p-6 md:p-8">
        {/* Lanes: the ones the running analyzer is for are lit */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LANES.map((lane, k) => {
            const on = litLane !== undefined ? k === litLane : FIX_MODES[runIdx].lanes.includes(k);
            const Icon = lane.icon;
            return (
              <span key={lane.name}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] transition-colors duration-500 ${
                  on ? 'border-white/80 text-white' : 'border-white/[0.08] text-neutral-700'
                }`}>
                <Icon className="w-3 h-3" />
                {lane.name}
              </span>
            );
          })}
        </div>
        <div className="text-[15px] font-medium text-white mb-6">Analyzing your content</div>
        <ul className="space-y-4">
          {ANALYZE_STEPS.map((label, k) => {
            const isDone = k < done;
            const isActive = k === done;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    isDone ? 'border-white bg-white' : isActive ? 'border-white/60' : 'border-white/15'
                  }`}
                >
                  {isActive && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                </span>
                <span className={`text-[14px] ${isDone || isActive ? 'text-neutral-100' : 'text-neutral-600'}`}>{label}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-7 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min(100, (done / ANALYZE_STEPS.length) * 100)}%` }}
          />
        </div>
        {!compact && (
        <div className="mt-7">
          <div className="mb-3 text-[11px] text-neutral-500" style={MONO}>THE FIXES</div>
          <div className="relative flex gap-5 border-b border-white/[0.07] mb-4">
            {FIX_MODES.map((m, k) => (
              <span key={m.label} className={`relative pb-2.5 text-[13px] transition-colors duration-300 ${k === shown ? 'text-white' : 'text-neutral-600'}`}>
                {m.label}
                {k === shown && (
                  <motion.span layoutId="fix-tab" className="absolute left-0 right-0 -bottom-px h-px bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
              </span>
            ))}
          </div>
          <div className={`transition-opacity duration-700 ${shown >= 0 ? 'opacity-100' : 'opacity-0'}`}>
          <motion.ul key={shown} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="space-y-2">
            {shownMode.rows.map((r, k) => (
              <motion.li key={r.now} initial={reduce ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * k, duration: 0.35 }}
                className="flex items-start gap-3 rounded-lg border border-white/[0.08] bg-gradient-to-r from-white/[0.05] to-transparent px-3.5 py-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-black text-[11px] font-semibold" style={MONO}>{k + 1}</span>
                <div className="min-w-0">
                  <div className="text-[12px] text-neutral-600 line-through decoration-neutral-700">{r.was}</div>
                  <div className="text-[14px] text-white">{r.now}</div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

/* ── The tools: stacked, each with a dynamic picture ───────────────────── */

// The three ways to run an analysis, shown under Run an Analysis.
const ANALYSIS_WAYS = [
  { label: 'Check your writing', href: '/analyze', note: 'Articles, blogs and landing pages' },
  { label: 'Scan a URL', href: '/url-scanner', note: 'Your website, with plain-English fixes' },
  { label: 'Scan a repo', href: '/repo-analysis', note: 'Docs, READMEs and apps on GitHub' },
];

const TOOLS = [
  {
    key: 'analysis',
    eyebrow: 'Improve your AI readability',
    title: 'Get your Rain Score and pillar breakdown',
    body: 'One score, split into the pillars that matter for your kind of business, with the fixes for each gap.',
    ways: [],
    href: '/analyze',
    visual: 'pillar' as const,
  },
  {
    key: 'citing',
    eyebrow: 'Is AI citing me?',
    title: 'See which AI tools cite your pages',
    lead: 'AI Citation Monitor:',
    body: 'Whether AI links to your pages when customers ask. Which pages, and where you rank among the sources it uses.',
    ways: [],
    href: '/citation-monitor',
    visual: 'citation' as const,
  },
  {
    key: 'recommends',
    eyebrow: 'Who AI recommends',
    title: 'See how often you are named, against competitors',
    lead: 'Share of Voice:',
    body: 'How often each AI tool names your business compared with the competitors it names.',
    ways: [],
    href: '/share-of-voice',
    visual: 'share' as const,
  },
  {
    key: 'describes',
    eyebrow: 'How AI describes me',
    title: 'See how AI describes your business',
    lead: 'Sentiment:',
    body: 'The wording each AI uses for your business, and whether it reads as positive, neutral or negative, so you know what to change.',
    ways: [],
    href: '/brand-visibility',
    visual: 'describe' as const,
  },
];

// A tool's name, large and bold, with each word rising in turn as it scrolls into view.
// Filled numbered circle that marks the order of the steps on the page.
function StepBadge({ n }: { n: number }) {
  return (
    <span aria-hidden className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">{n}</span>
  );
}

function ToolTitle({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  return (
    <h3 className="text-2xl md:text-3xl font-bold tracking-[-0.035em] leading-[1.02] text-white">
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="inline-block mr-[0.25em]"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
        </motion.span>
      ))}
    </h3>
  );
}

// One picture, in turn: the chart, a run of the analysis, the chart again, then the
// same page with a higher score. Each lane in LANE_RUNS gets its own turn.
const LANE_RUNS = LANE_EXAMPLES.map(e => ({ index: e.index, business: e.before.business, before: forLane(e.lane, e.before), after: forLane(e.lane, e.after) }));

// The loop runs one step at a time. For each lane: its score before the analysis,
// the analysis running once, then the new score.
type RunStep =
  | { kind: 'score'; run: (typeof LANE_RUNS)[number]; which: 'before' | 'after' }
  | { kind: 'running'; lane: number };
const RUN_STEPS: RunStep[] = LANE_RUNS.flatMap(run => [
  { kind: 'score' as const, run, which: 'before' as const },
  { kind: 'running' as const, lane: run.index },
  { kind: 'score' as const, run, which: 'after' as const },
]);

// Static: shows the after result from the start, and does not cycle.
function RotatingAnalysis() {
  const reduce = useReducedMotion();
  const step = Math.max(0, RUN_STEPS.findIndex(x => x.kind === 'score' && x.which === 'after'));
  const cur = RUN_STEPS[step];
  return (
    <div className="min-h-[360px] h-full">
      <AnimatePresence mode="wait">
        <motion.div
          className="h-full"
          key={step}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45 }}
        >
          {cur.kind === 'running'
            ? <AnalyzeConsole compact litLane={cur.lane} />
            : cur.which === 'before'
              ? <PillarVisual result={cur.run.before} label="Earlier analysis" />
              : <PillarVisual result={cur.run.after} label="Later analysis" before={cur.run.before.overall} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// The score row under the analysis: the pillar gauges and the eight-analysis trend,
// stepping through the analyses while on screen. Example data, labelled as such.
// The options under an analysis: each one lights up once, in turn, then the cycle stops.
function WaysList({ ways }: { ways: { label: string; href: string; note: string }[] }) {
  const ref = useRef<HTMLUListElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(-1);
  useEffect(() => {
    if (reduce || !inView) return;
    const timers = ways.map((_, i) => window.setTimeout(() => setLit(i), i * 2000));
    timers.push(window.setTimeout(() => setLit(-1), ways.length * 2000));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce, ways]);
  return (
    <ul ref={ref} className="mt-3 space-y-2">
      {ways.map((w, i) => (
        <li key={w.label}>
          <Link
            to={w.href}
            className={`group flex items-baseline justify-between gap-4 rounded-lg border px-4 py-3 transition-colors duration-500 ${lit === i ? 'border-white/40 bg-white/[0.06]' : 'border-white/[0.07] hover:bg-white/[0.02]'}`}
          >
            <span className="text-[14px] text-white font-medium">{w.label}</span>
            <span className="text-[13px] text-neutral-500 group-hover:text-neutral-300 transition-colors">{w.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TrackRow() {
  return (
    <div className="pt-20 md:pt-24 pb-20 md:pb-24">
      <div className="max-w-3xl">
        <div className="flex items-start gap-3">
          <StepBadge n={3} />
          <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.035em] leading-[1.02] text-white">See your progress over your most recent analysis</h2>
        </div>
        <p className="mt-6 text-xl md:text-2xl font-semibold tracking-[-0.02em] text-white">See each pillar move, one analysis at a time</p>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-400">Every analysis adds a point to each pillar, so you can see what changed after a fix.</p>
      </div>
      <div className="mt-12">
        <TrackDemo />
      </div>
    </div>
  );
}

// A small square in the site's grid pattern, with a double chevron in it, the same
// arrow used in the headline of the competitor's site. It marks each tool as a feature.
function ToolMark() {
  return (
    <span aria-hidden="true" className="relative mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/15 bg-black">
      <ChevronsRight className="relative h-5 w-5 text-white" />
    </span>
  );
}

// The four core pillars. Each cell shows its name; hovering, tabbing in or tapping
// opens its meaning underneath. The lane pillars sit in their own row, dashed, so they
// read as extras for one kind of business.
const CORE_PILLARS = [
  { name: 'Structure', meaning: 'Can AI actually read your source? How well your page translates into answers AI can extract.' },
  { name: 'Digital Authority', meaning: 'Is your site a source AI will name? How much trust and credibility AI sees in your business.' },
  { name: 'Conversion Readiness', meaning: 'Does your site convert AI-referred visitors? Whether a visitor who arrives from AI can act on it.' },
  { name: 'Easy to Quote', meaning: 'Can AI retrieval systems find and synthesize your content? How cleanly AI can lift a fact from your page.' },
];
const LANE_PILLARS = [
  { name: 'Product Discoverability', lane: 'For online sellers', meaning: 'Whether AI can find and recommend your products when shoppers ask.' },
  { name: 'Local Presence', lane: 'For local businesses', meaning: 'Whether AI knows where you are, what you serve and who to send there.' },
];
function PillarCell({ name, meaning, tag, dashed }: { name: string; meaning: string; tag?: string; dashed?: boolean }) {
  // Tapping opens the meaning on touch screens; hovering or keyboard focus opens it on desktop.
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => setOpen(o => !o)}
      className={`group relative block w-full p-6 text-left outline-none focus-visible:bg-white/[0.04] hover:bg-white/[0.03] transition-colors duration-500 ${dashed ? 'border border-dashed border-white/20' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {tag && <div className="mb-3 text-[11px] text-neutral-500" style={MONO}>{tag}</div>}
          <div className="text-[18px] font-medium text-white">{name}</div>
        </div>
        <span style={{ color: "#A8203E" }} className={`text-[20px] leading-none transition-transform duration-500 group-hover:rotate-45 group-focus-visible:rotate-45 ${open ? 'rotate-45' : ''}`}>+</span>
      </div>
      <div className={`grid transition-[grid-template-rows] duration-700 ease-out group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="mt-4 text-[14px] leading-relaxed text-neutral-400">{meaning}</p>
        </div>
      </div>
    </button>
  );
}

function PillarBand() {
  return (
    <section className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-[1104px] mx-auto px-6 border-x border-dashed border-white/10">
        <Eyebrow>The pillars</Eyebrow>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">What we measure: four core pillars, plus two</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-400">Four core scores, built on a detailed scoring model that reads your pages the way AI does, plus two extra scores for specific kinds of business.</p>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 border-t border-b border-white/10">
          {CORE_PILLARS.map((c, i) => (
            <div key={c.name} className={`${i > 0 ? 'border-t border-white/10 md:border-t-0 md:border-l md:border-white/10' : ''}`}>
              <PillarCell name={c.name} meaning={c.meaning} />
            </div>
          ))}
        </div>
        <div className="mt-10 mb-4 text-[11px] uppercase tracking-[0.14em] text-neutral-500" style={MONO}>Additionally</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LANE_PILLARS.map(l => (
            <PillarCell key={l.name} name={l.name} meaning={l.meaning} tag={l.lane} dashed />
          ))}
        </div>
      </div>
    </section>
  );
}

// The changes each lane is told to make. This is the app's own fix copy, for the signals
// that matter most to that kind of business. Each lane takes its turn in the analysis.
const LANE_TABS = ['Local business', 'Online sellers', 'Writers & marketers', 'Developers', 'Vibe coders'];
const LANE_CHANGES = [
  [
    'Show your business name, street address and phone number exactly as they appear on your Google Business Profile.',
    'Add LocalBusiness structured data with your name, address, phone, hours and service area.',
    'Name the city and the neighbourhoods or towns you serve in the main heading and first paragraph.',
    'Quote or link real local reviews, ideally ones that mention your city or service.',
    'Link to your listings on Google, Yelp and local directories, and make sure the details match.',
  ],
  [
    'List every size, colour or option with its own price and stock status.',
    'Name the seller clearly, with shipping, returns and contact details on the page.',
    'State the exact price with currency, plus any sale price, shipping cost or subscription terms.',
    'Say whether it is in stock and how fast it ships.',
    'Compare it with one or two alternatives: what it does better, and who should pick something else.',
  ],
  [
    'Open each section with the direct answer in one sentence, then explain. AI quotes the first sentence under a heading.',
    'Back your main claims with a named source or a specific number, and say where it comes from ("according to…", a link, a study, your own data).',
    'Show it is current: add a "last updated" date and refer to current prices, versions or the current year where relevant.',
    'Swap general words for exact ones: name the product, place, number or person instead of "it", "things" or "solutions".',
    'Make each section make sense on its own: restate who or what it is about, since AI often quotes one section without the rest.',
  ],
  [
    'Give each section one job: a heading that names it, then short paragraphs that stay on that point.',
    'Swap general words for exact ones: name the product, place, number or person instead of "it", "things" or "solutions".',
    'Make each section make sense on its own: restate who or what it is about, since AI often quotes one section without the rest.',
    'Split sections that cover two topics, so each heading matches exactly one idea.',
    'Back your main claims with a named source or a specific number, and say where it comes from ("according to…", a link, a study, your own data).',
  ],
  [
    'Name who is speaking and exactly what this is about early on: the author, brand or organization, and the specific topic, product or place.',
    'Back your main claims with a named source or a specific number, and say where it comes from ("according to…", a link, a study, your own data).',
    'Add real proof: customer reviews, ratings, testimonials or results with names or numbers.',
    'End with one clear next step and say exactly what happens when they take it (e.g. "Book a free 15-minute call").',
    'Say in one sentence near the top what the reader gets and why it beats the alternatives.',
  ],
];

// The analysis flow: one timer drives the console and the changes together. For each lane
// the four steps run, the run completes, the lane's changes appear, then the next lane starts.
function AnalysisFlow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [lane, setLane] = useState(0);
  const [step, setStep] = useState(reduce ? ANALYZE_STEPS.length : 0);
  const [results, setResults] = useState(!!reduce);
  // Each cycle opens with the three ways to run an analysis, then the analysis runs.
  const [intro, setIntro] = useState(!reduce);
  useEffect(() => {
    if (reduce || !inView || !intro) return;
    const t = window.setTimeout(() => setIntro(false), 6000);
    return () => clearTimeout(t);
  }, [intro, reduce, inView, lane]);
  useEffect(() => {
    if (reduce || !inView || intro) return;
    let t: number;
    if (!results && step < ANALYZE_STEPS.length) t = window.setTimeout(() => setStep(n => n + 1), 1400);
    else if (!results) t = window.setTimeout(() => setResults(true), 0);
    else t = window.setTimeout(() => { setLane(l => (l + 1) % LANE_CHANGES.length); setStep(0); setResults(false); setIntro(true); }, 4500);
    return () => clearTimeout(t);
  }, [inView, reduce, step, results, lane, intro]);
  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-10 lg:gap-16 items-start pt-20 md:pt-24 pb-20 md:pb-24">
      <div>
        <div className="mb-6 flex items-center gap-3"><StepBadge n={1} /><ToolTitle text="Run an analysis" /></div>
        {intro ? (
          <div>
            <div className="text-[12px] text-neutral-500" style={MONO}>FEATURES</div>
            <WaysList ways={ANALYSIS_WAYS} />
          </div>
        ) : (
          <AnalyzeConsole compact litLane={lane} step={step} />
        )}
      </div>
      <div>
        <div className="mb-4 text-[11px] uppercase tracking-[0.14em] text-neutral-500" style={MONO}>What to change · {LANE_TABS[lane]}</div>
        {!results ? (
          <div className="flex h-[260px] items-center gap-2">
            <span className="text-[12px] text-neutral-500" style={MONO}>Analysing</span>
            {[0, 1, 2].map(d => (
              <motion.span
                key={d}
                className="inline-block h-1.5 w-1.5 rounded-full bg-white"
                animate={reduce ? {} : { opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.2 }}
              />
            ))}
          </div>
        ) : (
          <ol key={lane} className="divide-y divide-white/10 border-y border-white/10">
            {LANE_CHANGES[lane].map((r, i) => (
              <motion.li
                key={r}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex gap-4 py-4">
                  <span className="text-[12px] text-neutral-500" style={MONO}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[16px] leading-relaxed text-neutral-200">{r}</span>
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

const ENGINE_OPTIONS = ['All AI engines', ...ENGINES];

// One run through the AI engines: the highlight moves down the list and ends back on All AI engines.
function EngineRun() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.6, once: true });
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (reduce || !inView) return;
    setOpen(true);
    let step = 0;
    const t = window.setInterval(() => {
      step += 1;
      setIdx(step % ENGINE_OPTIONS.length);
      if (step >= ENGINE_OPTIONS.length) { window.clearInterval(t); setOpen(false); }
    }, 350);
    return () => window.clearInterval(t);
  }, [inView, reduce]);
  return (
    <div ref={ref} className="max-w-md">
      <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-neutral-500" style={MONO}>AI engine</div>
      <div className="rounded-lg border border-white/20 bg-black">
        <div className="flex items-center justify-between px-4 py-3 text-[14px] text-white">
          <span>{ENGINE_OPTIONS[idx]}</span>
          <span className="text-neutral-500">{open ? '▴' : '▾'}</span>
        </div>
        {open && (
          <ul className="border-t border-white/10 py-1" role="listbox" aria-label="AI engine">
            {ENGINE_OPTIONS.map((e, i) => (
              <li
                key={e}
                role="option"
                aria-selected={i === idx}
                className={`px-4 py-2 text-[14px] transition-colors duration-200 ${i === idx ? 'bg-white/[0.08] text-white' : 'text-neutral-500'}`}
              >
                {e}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ToolsSection({ lane }: { lane: number }) {
  return (
    <>
    <section id="product" className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-[1104px] mx-auto px-6 border-x border-dashed border-white/10">
        <Reveal>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-black">Analysis tools</span>
            <span className="text-[14px] text-neutral-400">Scores your content before AI reads it.</span>
          </div>
          <div className="flex items-start gap-4"><ToolMark /><h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white max-w-3xl text-balance">
            See what AI can read. Fix what it can’t.
          </h2></div>
        </Reveal>
        <Reveal>
          <p className="mt-4 max-w-2xl text-[13px] text-neutral-500">The examples below are illustrative, not real results.</p>
        </Reveal>
        <AnalysisFlow />
        <div className="border-t border-white/10">
          {TOOLS.slice(0, 1).map((t, k) => (
            <React.Fragment key={t.key}>
            <Reveal delay={0.05 * k}>
              <div className={k === 0 ? 'grid grid-cols-1 gap-10 items-stretch py-20 md:py-24 border-b border-white/10' : 'grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-10 lg:gap-16 items-stretch py-20 md:py-24 border-b border-white/10'}>
                <div>
                  <div className={k === 0 ? 'flex items-center gap-3' : undefined}>
                    {k === 0 && <StepBadge n={2} />}
                    <ToolTitle text={t.eyebrow} />
                  </div>
                  {t.key !== 'analysis' && <p className="mt-6 text-xl md:text-2xl font-semibold tracking-[-0.02em] text-white">{t.title}</p>}
                  {t.key !== 'analysis' && <p className="mt-4 text-[15px] leading-relaxed text-neutral-400">{t.lead && <span className="font-medium text-white">{t.lead} </span>}{t.body}</p>}
                  {t.ways.length > 0 && (
                    <>
                    <div className="mt-6 text-[12px] text-neutral-500" style={MONO}>FEATURES</div>
                    <WaysList ways={t.ways} />
                    </>
                  )}
                </div>
                <div className={k === 0 ? 'min-w-0 h-full' : 'min-w-0 h-full lg:border-l lg:border-white/10 lg:pl-12'}>
                  {t.visual === 'pillar' ? <RotatingAnalysis /> : t.visual === 'citation' ? <CitationRotation /> : t.visual === 'share' ? <LaneCycle items={SHARE_LANES} render={d => <ShareCard data={d} />} /> : t.visual === 'describe' ? <LaneCycle items={DESCRIBE_LANES} render={d => <DescribeCard data={d} />} /> : null}
                </div>
              </div>
            </Reveal>
            {k === 0 && (
              <Reveal delay={0.05}>
                <TrackRow />
              </Reveal>
            )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
    <section className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-[1104px] mx-auto px-6 border-x border-dashed border-white/10">
        <Reveal>
          <div className="mt-28 mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-white/40 px-3 py-1 text-[12px] font-semibold text-white">Monitoring tools</span>
            <span className="text-[14px] text-neutral-400">Follows what AI says about you, over weeks.</span>
          </div>
          <div className="flex items-start gap-4"><ToolMark /><h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white max-w-3xl text-balance">Watch how AI answers change over time</h2></div>
          <p className="mt-6 text-neutral-400 text-lg leading-relaxed max-w-2xl">Keep checking what AI says and where it links, over time, so you can see how things change.</p>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-500 max-w-2xl">Monitoring is most useful over time. New content often shows &ldquo;not cited&rdquo; at first, and changes take weeks to show.</p>
        </Reveal>
        <Reveal>
          <div className="mt-20 md:mt-24 rounded-xl border border-dashed border-white/15 p-6 md:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-dashed border-white/30 px-3 py-1 text-[12px] font-semibold text-neutral-300">AI engines</span>
            <span className="text-[14px] text-neutral-400">Every monitoring check runs on one engine or all of them.</span>
          </div>
          <div className="mt-8"><EngineRun /></div>
          </div>
        </Reveal>
        <TrackExample index={lane} inline />
        <div className="mt-16 md:mt-20">
          {TOOLS.slice(1).map((t, i) => {
            const k = i + 1;
            return (
            <React.Fragment key={t.key}>
            <Reveal delay={0.05 * k}>
              <div className={k === 0 ? 'grid grid-cols-1 gap-10 items-stretch py-20 md:py-24 border-b border-white/10' : 'grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-10 lg:gap-16 items-stretch py-20 md:py-24 border-b border-white/10'}>
                <div>
                  <div className={k === 0 ? 'flex items-center gap-3' : undefined}>
                    {k === 0 && <StepBadge n={2} />}
                    <ToolTitle text={t.eyebrow} />
                  </div>
                  {t.key !== 'analysis' && <p className="mt-6 text-xl md:text-2xl font-semibold tracking-[-0.02em] text-white">{t.title}</p>}
                  {t.key !== 'analysis' && <p className="mt-4 text-[15px] leading-relaxed text-neutral-400">{t.lead && <span className="font-medium text-white">{t.lead} </span>}{t.body}</p>}
                  {t.ways.length > 0 && (
                    <>
                    <div className="mt-6 text-[12px] text-neutral-500" style={MONO}>FEATURES</div>
                    <WaysList ways={t.ways} />
                    </>
                  )}
                </div>
                <div className={k === 0 ? 'min-w-0 h-full' : 'min-w-0 h-full lg:border-l lg:border-white/10 lg:pl-12'}>
                  {t.visual === 'pillar' ? <RotatingAnalysis /> : t.visual === 'citation' ? <CitationRotation /> : t.visual === 'share' ? <LaneCycle items={SHARE_LANES} render={d => <ShareCard data={d} />} /> : t.visual === 'describe' ? <LaneCycle items={DESCRIBE_LANES} render={d => <DescribeCard data={d} />} /> : null}
                </div>
              </div>
            </Reveal>
            </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
    </>
  );
}

/* ── Who it's for (lane picker) ─────────────────────────────────────────── */

const WHO = [
  { Icon: MapPin, title: 'I run a local business', body: 'Plumbers, salons, dentists, restaurants. Help AI recommend you when people ask who\'s best nearby.', to: '/local-business' },
  { Icon: ShoppingBag, title: 'I sell products online', body: 'Shopify, Etsy, Amazon or your own store. Help AI suggest your products when people ask what to buy.', to: '/product-sellers' },
  { Icon: PenLine, title: 'I write content', body: 'Blogs, newsletters and landing pages. Write things AI names and links to.', to: '/content-writers' },
  { Icon: Sparkles, title: 'I build apps with AI tools', body: 'Bolt, Lovable, Replit, v0 or Cursor. Make sure AI can actually find what you built.', to: '/vibe-coders' },
  { Icon: Code2, title: 'I write code and docs', body: 'READMEs, documentation and API references. Help AI explain your project correctly.', to: '/developers' },
];


function WhoSection({ onStart }: { onStart: () => void }) {
  return (
    <section id="who" className="relative z-10 py-28 border-t border-white/[0.06] scroll-mt-16">
      <div className="max-w-[1104px] mx-auto px-6 border-x border-dashed border-white/10">
        <Reveal className="text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">
            What are you working on?
          </h2>
          <p className="mt-4 text-neutral-400 text-lg max-w-xl mx-auto leading-relaxed">
            Pick the one that sounds most like you. We'll show you what matters for your kind of business.
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WHO.map((w, k) => (
            <Reveal key={w.title} delay={0.04 * k}>
              <Link
                to={w.to}
                className="group flex h-full flex-col rounded-xl border border-white/10 bg-[#0a0a0a] p-6 hover:border-[#ffffff]/50 hover:bg-[#ffffff]/[0.04] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ffffff]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                    <w.Icon className="w-4 h-4 text-[#bdbdbd]" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-5 text-[17px] font-medium text-white">{w.title}</div>
                <p className="mt-1.5 text-[14px] text-neutral-400 leading-relaxed">{w.body}</p>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={0.2}>
            <button
              onClick={onStart}
              className="group flex h-full w-full flex-col rounded-xl border border-dashed border-white/15 p-6 text-left hover:border-white/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ffffff]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10">
                <HelpCircle className="w-4 h-4 text-neutral-400" />
              </span>
              <div className="mt-5 text-[17px] font-medium text-white">Not sure?</div>
              <p className="mt-1.5 text-[14px] text-neutral-400 leading-relaxed">Start free and choose inside the app. You can switch any time.</p>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── How it works ───────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    { n: '1', title: 'Add your website', body: 'Paste your web address, or paste the text of a page or post. Nothing to install.' },
    { n: '2', title: 'Get your score', body: 'A number from 0 to 100, with what\'s helping you and what\'s holding you back.' },
    { n: '3', title: 'Follow the fixes', body: 'Each fix is written in plain English, with a technical version you can hand to whoever builds your site, for lanes that need it.' },
  ];
  return (
    <section className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-[1104px] mx-auto px-6 border-x border-dashed border-white/10">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">Three steps. No setup.</h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((st, k) => (
            <Reveal key={st.n} delay={0.06 * k}>
              <div className="h-full rounded-xl border border-white/10 bg-[#0a0a0a] p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffffff]/15 text-[13px] font-medium text-[#bdbdbd]">{st.n}</span>
                <div className="mt-5 text-[17px] font-medium text-white">{st.title}</div>
                <p className="mt-1.5 text-[14px] text-neutral-400 leading-relaxed">{st.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

// Each engine's mark. ChatGPT's blossom is drawn here; the rest are brand marks from engineIcons.
const ENGINE_MARK: Record<string, string> = {
  ChatGPT: 'chatgpt',
  'Google AI Overviews': 'google',
  'Google AI Mode': 'google',
  Gemini: 'gemini',
  Perplexity: 'perplexity',
  Claude: 'claude',
};

function EngineMark({ name }: { name: string }) {
  const key = ENGINE_MARK[name];
  if (key === 'chatgpt') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[0.8em] w-[0.8em] shrink-0" fill="none" stroke="#ffffff" strokeWidth={1.6}>
        {[0, 1, 2, 3, 4, 5].map(k => (
          <ellipse key={k} cx={12} cy={12} rx={4.2} ry={9} transform={`rotate(${k * 30} 12 12)`} />
        ))}
      </svg>
    );
  }
  const icon = key ? ENGINE_ICONS[key] : undefined;
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[0.8em] w-[0.8em] shrink-0">
      <path d={icon.path} fill="#ffffff" />
    </svg>
  );
}

// Under the headline: each AI tool's name and mark in turn, blurring in and out,
// at the headline's size.
function EngineCycle({ names }: { names: string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI(n => (n + 1) % names.length), 3000);
    return () => clearInterval(t);
  }, [reduce, names.length]);
  return (
    <div className="mt-4 flex justify-center" style={{ fontSize: 'clamp(15px, 2.6vw, 36px)' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={names[i]}
          initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-[0.25em] whitespace-nowrap font-semibold leading-[1.1] tracking-[-0.03em] text-white"
        >
          <EngineMark name={names[i]} />
          {names[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// A faint grid that appears at once, opening out from the top-left corner and fading in.
function DrawnGrid() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();
  const fade = 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.04) 100%)';
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute -inset-10 z-0">
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
        initial={{ opacity: 0 }}
        animate={reduce || inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 7, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function Home() {
  const [lane, setLane] = useState(0);
  const engines = useLiveEngines();
  const navigate = useNavigate();
  const start = () => navigate('/login');
  const [glowOn, setGlowOn] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setGlowOn(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white antialiased">
      <RainBackground />
      <MarketingNav onGetStartedClick={start} onLoginClick={() => navigate('/login?mode=login')} />

      <main className="relative">
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[960px] z-[1]"
            style={{ background: 'radial-gradient(75% 60% at 50% 0%, rgba(255,255,255,0.16), rgba(255,255,255,0.05) 45%, transparent 75%)', maskImage: 'linear-gradient(to bottom, #000 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 20%, transparent 100%)' }}
          />
          {/* One shade brighter after a second on the page, then a slow breath. */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 top-0 h-[960px] z-[1] transition-opacity duration-[1500ms] ease-out hero-glow-live ${glowOn ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'radial-gradient(75% 60% at 50% 0%, rgba(255,255,255,0.1), rgba(255,255,255,0.03) 45%, transparent 75%)', maskImage: 'linear-gradient(to bottom, #000 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 20%, transparent 100%)' }}
          />
          <div className="relative z-10 max-w-[1288px] mx-auto px-6 pt-28 md:pt-24 pb-16 flex flex-col items-center gap-16">
            <motion.div className="text-center max-w-4xl mx-auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* The subtitle takes the headline's width: w-0 + min-w-full stops it widening the block. */}
              <div className="mx-auto flex w-fit max-w-full flex-col items-center px-2 text-center">
              <h1 className="mt-7 max-w-full text-[clamp(26px,3.5vw,48px)] leading-[1.02] font-semibold tracking-[-0.045em] md:whitespace-nowrap">
                Are You Invisible to AI? <span className="text-neutral-500">Be readable by</span>
              </h1>
              <EngineCycle names={engines} />
              <div className="mt-7 w-0 min-w-full space-y-4 text-lg md:text-xl text-neutral-400 leading-relaxed text-center">
                <p>People now ask AI for answers. Rain OS helps businesses, content and websites become more readable by chatbots like ChatGPT and Claude.</p>
              </div>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={start} className="h-11 px-6 rounded-md bg-white text-black text-[15px] font-medium hover:bg-neutral-200 transition-colors inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Check my site free <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            <motion.div
              className="min-w-0 w-full max-w-[1235px]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroPrompt />
            </motion.div>
          </div>
        </section>

        <section className="relative z-10 pb-28">
          <div className="py-28">
          <div className="max-w-[1104px] mx-auto px-6 border-x border-dashed border-white/10">
            <Reveal>
              <Eyebrow>The shift</Eyebrow>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">
                <span style={{ color: '#A8203E' }}>Search is becoming an answer.</span> And being readable to artificial intelligence is now the new standard for your online presence.
              </h2>
              <p className="mt-5 text-lg md:text-xl font-medium text-white leading-relaxed max-w-xl">
                Start by making your business, website or content easy for AI to read.
              </p>
            </Reveal>
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-14 items-center">
              <Reveal>
                <div className="lg:border-r lg:border-white/10 lg:pr-14">
                  <p className="text-neutral-400 text-lg leading-relaxed max-w-xl">
                    You could be leaving valuable opportunities on the table, however well you rank on Google. Rain OS scores how readable your business, content or website is for AI, and shows what to change to make it easier for AI to read and understand.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="relative">
                  <DrawnGrid />
                  <div className="relative z-10 rounded-xl border border-white/10 bg-[#0a0a0a] p-8">
                <div className="text-7xl md:text-8xl font-semibold tracking-[-0.05em] tabular-nums" style={{ color: '#A8203E' }}>47%</div>
                <p className="mt-3 text-[15px] text-neutral-300 leading-relaxed">Fewer people click through to websites when Google AI Overviews shows an answer.</p>
                <a href="https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] text-neutral-500 hover:text-neutral-300" style={MONO}>
                  PEW RESEARCH CENTER, JULY 2025 <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
                </div>
              </Reveal>
            </div>
          </div>
          </div>
          <div className="max-w-[1104px] mx-auto px-6 border-x border-dashed border-white/10 py-36">
            <Reveal>
              <Eyebrow>Where AI gets its answers</Eyebrow>
              <ScrollWords
                text="Each answer comes from websites and content AI can actually read."
                className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance"
              />
            </Reveal>
            <div className="relative mt-24 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
              <Reveal>
                <div className="relative z-10 lg:pr-12">
                  <p className="mt-5 max-w-3xl text-neutral-400 text-lg leading-relaxed">
                When someone asks an AI a question, it reads a handful of websites and names the ones it can read and use most easily. Rain OS scores how readable your business, content or website is for each AI and shows what is holding it back.
              </p>
                </div>
              </Reveal>
              <div className="pointer-events-none p-4 md:p-6 lg:absolute lg:-top-24 lg:-bottom-24 lg:left-[37%] lg:-right-[9%] lg:p-0 lg:[&>div>div]:!h-full">
                <Reveal delay={0.1} className="h-full">
                  <SourceNetwork />
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <LaneSection index={lane} onPick={setLane} />
        <PillarBand />
        <ToolsSection lane={lane} />
        <HowItWorks />
        <WhoSection onStart={start} />

        <div className="relative z-10 border-t border-white/[0.06]">
          <FAQ />
        </div>

        <section className="relative z-10 overflow-hidden border-t border-white/[0.06]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(50% 80% at 50% 100%, rgba(255,255,255,0.18), transparent 70%)' }}
          />
          <div className="relative max-w-4xl mx-auto px-6 py-32 text-center">
            <h2 className="text-4xl md:text-7xl font-semibold tracking-[-0.045em] text-balance">Get ready for AI.</h2>
            <p className="mt-6 text-lg text-neutral-400 max-w-xl mx-auto">Run your first analysis today. Five are free, no card required.</p>
            <button onClick={start} className="mt-10 h-12 px-7 rounded-md bg-white text-black text-[15px] font-medium hover:bg-neutral-200 transition-colors inline-flex items-center gap-2">
              Start free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
