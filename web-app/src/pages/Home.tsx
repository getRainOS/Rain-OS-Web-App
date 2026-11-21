import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, Search,
  MapPin, ShoppingBag, PenLine, Sparkles, Code2, HelpCircle,
} from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import { ENGINE_ICONS } from '@/components/marketing/engineIcons';
import SiteFooter from '@/components/marketing/SiteFooter';
import { FAQ } from '@/components/marketing/MarketingComponents';
import { useLiveEngines } from '@/lib/liveEngines';
import HeroPrompt from '@/components/marketing/HeroPrompt';
import SourceNetwork from '@/components/marketing/SourceNetwork';
import RainBackground from '@/components/marketing/RainBackground';
import { PillarVisual, forLane, LANE_EXAMPLES, CitationRotation, LaneCycle, ShareCard, SHARE_LANES, DescribeCard, DESCRIBE_LANES } from '@/components/marketing/ToolVisuals';
import ScrollWords from '@/components/marketing/ScrollWords';
import PillarGauges from '@/components/marketing/PillarGauges';
import TrendCard, { WEEKS } from '@/components/marketing/TrendCard';
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
function AnalyzeConsole({ compact = false, litLane }: { compact?: boolean; litLane?: number }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [runIdx, setRunIdx] = useState(0); // the analyzer running now
  const [shownIdx, setShownIdx] = useState(-1); // the analyzer whose results are on screen
  const FIX_HOLD_MS = 3500;
  // Each lane runs the four steps (1.4s each), shows its result, then clears
  // before the next lane starts.
  useEffect(() => {
    if (reduce) return;
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
  const done = reduce ? ANALYZE_STEPS.length : step;
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

const TOOLS = [
  {
    key: 'analysis',
    eyebrow: 'Run an analysis and improve your AI readability',
    title: 'Get your Rain Score and pillar breakdown',
    body: 'One score, split into the pillars that matter for your kind of business, with the fixes for each gap. Run it three ways:',
    ways: [
      { label: 'Check your writing', href: '/analyze', note: 'Articles, blogs and landing pages' },
      { label: 'Scan a URL', href: '/url-scanner', note: 'Your website, with plain-English fixes' },
      { label: 'Scan a repo', href: '/repo-analysis', note: 'Docs, READMEs and apps on GitHub' },
    ],
    href: '/analyze',
    visual: 'pillar' as const,
  },
  {
    key: 'citing',
    eyebrow: 'Is AI Citing Me?',
    title: 'See which AI tools cite your pages',
    lead: 'AI Citation Monitor:',
    body: 'Whether AI links to your pages when customers ask. Which pages, and where you rank among the sources it uses.',
    ways: [],
    href: '/citation-monitor',
    visual: 'citation' as const,
  },
  {
    key: 'recommends',
    eyebrow: 'Who AI Recommends',
    title: 'See how often you are named, against competitors',
    body: 'Share of AI voice: how often each AI tool names your business compared with the competitors it names.',
    ways: [],
    href: '/share-of-voice',
    visual: 'share' as const,
  },
  {
    key: 'describes',
    eyebrow: 'How AI Describes Me',
    title: 'See how AI describes your business',
    body: 'The wording each AI uses for your business, and whether it reads as positive, neutral or negative, so you know what to change.',
    ways: [],
    href: '/brand-visibility',
    visual: 'describe' as const,
  },
];

// A tool's name, large and bold, with each word rising in turn as it scrolls into view.
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

function RotatingAnalysis() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const cur = RUN_STEPS[step];
    const t = setTimeout(() => setStep(n => (n + 1) % RUN_STEPS.length), cur.kind === 'running' ? 7000 : 3500);
    return () => clearTimeout(t);
  }, [step, reduce]);
  const cur = RUN_STEPS[step];
  return (
    <div className="min-h-[360px]">
      <AnimatePresence mode="wait">
        <motion.div
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
function TrackRow() {
  const reduce = useReducedMotion();
  const [week, setWeek] = useState(WEEKS - 1);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (reduce || !inView) return;
    const t = window.setInterval(() => setWeek(w => (w + 1) % WEEKS), 1800);
    return () => clearInterval(t);
  }, [reduce, inView]);
  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.4fr] gap-8 lg:gap-12 items-center p-5 md:p-7">
      <div>
        <ToolTitle text="Track it over time" />
        <p className="mt-6 text-xl md:text-2xl font-semibold tracking-[-0.02em] text-white">See each pillar move, one analysis at a time</p>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-400">Every analysis adds a point to each pillar, so you can see what changed after a fix. Example data.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <PillarGauges week={week} />
        <TrendCard week={week} />
      </div>
    </div>
  );
}

function ToolsSection({ lane }: { lane: number }) {
  return (
    <section id="product" className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <Eyebrow>The tools</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white max-w-3xl text-balance">
            See what AI can read. Fix what it can’t.
          </h2>
        </Reveal>
        <div className="mt-14 space-y-4">
          {TOOLS.map((t, k) => (
            <React.Fragment key={t.key}>
            <Reveal delay={0.05 * k}>
              <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.4fr] gap-8 lg:gap-12 items-center p-5 md:p-7">
                <div>
                  <ToolTitle text={t.eyebrow} />
                  <p className="mt-6 text-xl md:text-2xl font-semibold tracking-[-0.02em] text-white">{t.title}</p>
                  <p className="mt-4 text-[15px] leading-relaxed text-neutral-400">{t.lead && <span className="font-medium text-white">{t.lead} </span>}{t.body}</p>
                  {t.ways.length > 0 && (
                    <>
                    <div className="mt-6 text-[12px] text-neutral-500" style={MONO}>FEATURES</div>
                    <ul className="mt-3 space-y-2">
                      {t.ways.map(w => (
                        <li key={w.label}>
                          <Link to={w.href} className="group flex items-baseline justify-between gap-4 rounded-lg border border-white/[0.07] px-4 py-3 hover:bg-white/[0.02] transition-colors">
                            <span className="text-[14px] text-white font-medium">{w.label}</span>
                            <span className="text-[13px] text-neutral-500 group-hover:text-neutral-300 transition-colors">{w.note}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    </>
                  )}
                </div>
                <div className="min-w-0">
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
        <TrackExample index={lane} inline />
      </div>
    </section>
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
    <section id="who" className="relative z-10 py-24 border-t border-white/[0.06] scroll-mt-16">
      <div className="max-w-[1440px] mx-auto px-6">
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
    <section className="relative z-10 py-24 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6">
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
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 pt-28 md:pt-24 pb-16 flex flex-col items-center gap-16">
            <motion.div className="text-center max-w-4xl mx-auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* The subtitle takes the headline's width: w-0 + min-w-full stops it widening the block. */}
              <div className="mx-auto flex w-fit max-w-full flex-col items-center px-2 text-center">
              <h1 className="mt-7 max-w-full text-[clamp(26px,4.6vw,64px)] leading-[1.02] font-semibold tracking-[-0.045em] md:whitespace-nowrap">
                Be seen. <span className="text-neutral-500">Be readable by</span>
              </h1>
              <EngineCycle names={engines} />
              <div className="mt-7 w-0 min-w-full space-y-4 text-lg md:text-xl text-neutral-400 leading-relaxed text-center">
                <p>People now ask AI for answers. Rain OS helps expand the virtual presence of businesses, websites and content by improving how well chatbots like ChatGPT and Claude can read them, which increases their chances of being visible online.</p>
              </div>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={start} className="h-11 px-6 rounded-md bg-white text-black text-[15px] font-medium hover:bg-neutral-200 transition-colors inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Check my site free <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            <motion.div
              className="min-w-0 w-full max-w-[1100px]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroPrompt />
              <p className="mt-4 text-center text-[12px] text-neutral-500">
                Illustrative example, not a real AI answer.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="relative z-10">
          <div className="py-28" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.10) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            backgroundPosition: 'center',
          }}>
          <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-14 items-end">
            <Reveal>
              <Eyebrow>The shift</Eyebrow>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">
                Search is becoming an answer.
              </h2>
              <p className="mt-5 text-lg md:text-xl font-medium text-white leading-relaxed max-w-xl">
                Start by making your business, website or content easy for AI to read
              </p>
              <p className="mt-5 text-neutral-400 text-lg leading-relaxed max-w-xl">
                You could be leaving opportunities on the table, however well you rank. Rain OS helps you optimize your content or website to increase your chances of being found and recommended by AI.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-8">
                <div className="text-7xl md:text-8xl font-semibold tracking-[-0.05em] tabular-nums" style={{ color: '#A8203E' }}>47%</div>
                <p className="mt-3 text-[15px] text-neutral-300 leading-relaxed">Fewer people click through to websites when Google AI Overviews shows an answer.</p>
                <a href="https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] text-neutral-500 hover:text-neutral-300" style={MONO}>
                  PEW RESEARCH CENTER, JULY 2025 <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </Reveal>
          </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-6 py-28 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
            <Reveal>
              <Eyebrow>Where AI gets its answers</Eyebrow>
              <ScrollWords
                text="Each answer comes from websites and content it can actually read."
                className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance"
              />
              <p className="mt-5 max-w-3xl text-neutral-400 text-lg leading-relaxed">
                When someone asks an AI a question, it reads a handful of websites and names the ones it can read and use most easily. Rain OS scores how readable your site is for each AI, shows what is holding it back.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="p-4 md:p-6">
                <SourceNetwork />
              </div>
            </Reveal>
          </div>
        </section>

        <LaneSection index={lane} onPick={setLane} />
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
