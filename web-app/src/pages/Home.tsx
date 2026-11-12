import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, Search, Radar, Wand2, Gauge, CalendarClock,
  GitPullRequest, FileText, Globe, GitBranch, BarChart2, Eye, Mail, ShieldCheck,
  MapPin, ShoppingBag, PenLine, Sparkles, Code2, HelpCircle,
} from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import SiteFooter from '@/components/marketing/SiteFooter';
import { FAQ } from '@/components/marketing/MarketingComponents';
import { useLiveEngines, joinNames } from '@/lib/liveEngines';
import HeroPrompt from '@/components/marketing/HeroPrompt';
import SourceNetwork from '@/components/marketing/SourceNetwork';
import RainBackground from '@/components/marketing/RainBackground';
import TrendCard from '@/components/marketing/TrendCard';
import PillarGauges from '@/components/marketing/PillarGauges';
import ScrollWords from '@/components/marketing/ScrollWords';
import IllustratedExample from '@/components/marketing/IllustratedExample';

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
function AnalyzeConsole() {
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
        <span className="ml-auto text-[10px] text-neutral-600 hidden sm:inline" style={MONO}>EXAMPLE</span>
      </div>
      <div className="p-6 md:p-8">
        {/* Lanes: the ones the running analyzer is for are lit */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LANES.map((lane, k) => {
            const on = FIX_MODES[runIdx].lanes.includes(k);
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
        <div className="text-[15px] font-medium text-white mb-6">Running {FIX_MODES[runIdx].label}</div>
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
      </div>
    </div>
  );
}

/* ── Platform: measure / monitor / fix ──────────────────────────────────── */

const PLATFORM = [
  {
    id: 'measure',
    label: 'Measure',
    Icon: Gauge,
    title: 'Know how AI reads you',
    body: 'One score from 0 to 100, built from the six things AI looks at and adjusted for your kind of business. Every check is explained, so you know what moved it.',
    tools: [
      { Icon: FileText, name: 'Content Optimizer', desc: 'Score drafts before you publish' },
      { Icon: Globe, name: 'Check a Web Page', desc: 'AI-friendly files, page details, whether AI can get in, page layout' },
      { Icon: GitBranch, name: 'Repo Analysis', desc: 'Audit an app straight from GitHub' },
    ],
  },
  {
    id: 'monitor',
    label: 'Monitor',
    Icon: Radar,
    title: 'See whether AI cites you',
    body: 'Ask the questions your customers ask. We put them to {engines}, searching the live web, and show every website each one linked to.',
    tools: [
      { Icon: Radar, name: 'Is AI Citing Me?', desc: 'Whether AI links to you, with the full list of sources' },
      { Icon: CalendarClock, name: 'Weekly tracking', desc: 'Re-checked every week, alerts on change' },
      { Icon: BarChart2, name: 'Who AI Recommends', desc: 'How often AI names you compared with competitors' },
      { Icon: Eye, name: 'How AI Describes Me', desc: 'How AI describes your brand' },
    ],
  },
  {
    id: 'fix',
    label: 'Fix',
    Icon: Wand2,
    title: 'Ship the fix, not a report',
    body: 'Every problem comes with what to do in plain English, plus the technical version for whoever builds your site. Rewrite in one click, or let rain OS make the code change for you.',
    tools: [
      { Icon: Wand2, name: 'Rewrite for AI', desc: 'Restructure content for extraction' },
      { Icon: FileText, name: 'Fix prompts', desc: 'Tailored to Bolt, Lovable, Cursor and more' },
      { Icon: GitPullRequest, name: 'GitHub pull requests', desc: 'Fixes committed to a branch for review' },
    ],
  },
];

const SHOTS: Record<string, { src: string; alt: string; label: string; w: number; h: number }> = {
  measure: { src: '/screens/measure.png', alt: 'rain OS URL Scanner results: overall score, four area scores and the technical checks that need fixing', label: 'URL SCANNER', w: 1072, h: 1066 },
  monitor: { src: '/screens/monitor.png', alt: 'rain OS Tracked weekly list: each question, whether you were cited, and a history of past checks', label: 'TRACKED WEEKLY', w: 1072, h: 756 },
  fix: { src: '/screens/fix.png', alt: 'rain OS recommendation with a plain-English fix and a copy-ready technical fix', label: 'RECOMMENDATIONS', w: 1072, h: 1080 },
};

// Screenshots of the real app, rendered with example data. The URL scanner
// shows its bar charts and its trend chart as two separate, smaller cards side
// by side, each with its own caption.
function PlatformVisual({ id }: { id: string }) {
  const shot = SHOTS[id];
  if (id === 'measure') {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <figure className="min-w-0">
          <div className="mb-2 text-[11px] text-neutral-500" style={MONO}>SCORE BY AREA</div>
          <PillarGauges />
        </figure>
        <figure className="min-w-0">
          <div className="mb-2 text-[11px] text-neutral-500" style={MONO}>TREND BY AREA</div>
          <TrendCard />
        </figure>
      </div>
    );
  }
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] text-neutral-500" style={MONO}>{shot.label}</span>
        <span className="text-[11px] text-neutral-500" style={MONO}>EXAMPLE DATA</span>
      </div>
      <div className="relative rounded-md overflow-hidden border border-white/[0.07] max-h-[420px]">
        <img src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} loading="lazy" className="w-full h-auto block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>
    </div>
  );
}

function PlatformSection() {
  const [active, setActive] = useState('measure');
  const engines = joinNames(useLiveEngines());
  const found = PLATFORM.find(p => p.id === active)!;
  const current = { ...found, body: found.body.replace('{engines}', engines) };
  return (
    <section id="product" className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <Eyebrow>The platform</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white max-w-3xl text-balance">
            Measure it. Monitor it. Fix it.
          </h2>
          <p className="mt-5 text-neutral-400 text-lg max-w-2xl leading-relaxed">
            Most tools stop at a dashboard. rain OS closes the loop, from the first score to the change that earns the citation.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <div role="tablist" aria-label="Platform" className="flex lg:flex-col gap-2 overflow-x-auto">
            {PLATFORM.map(p => {
              const on = p.id === active;
              return (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(p.id)}
                  className={`text-left rounded-lg border px-5 py-4 transition-colors min-w-[220px] lg:min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ffffff] ${on ? 'border-white/15 bg-white/[0.04]' : 'border-transparent hover:bg-white/[0.02]'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <p.Icon className={`w-4 h-4 ${on ? 'text-[#ffffff]' : 'text-neutral-500'}`} />
                    <span className={`text-[11px] uppercase tracking-[0.14em] ${on ? 'text-white' : 'text-neutral-500'}`} style={MONO}>{p.label}</span>
                  </div>
                  <div className={`mt-2 text-[17px] font-medium ${on ? 'text-white' : 'text-neutral-400'}`}>{p.title}</div>
                  {on && <p className="mt-2 text-[14px] text-neutral-400 leading-relaxed hidden lg:block">{p.body.replace('{engines}', engines)}</p>}
                </button>
              );
            })}
          </div>

          {/* The product floats on a soft, out-of-focus backdrop: crisp UI over a muted horizon. */}
          <div
            className="rounded-2xl p-4 sm:p-8 min-w-0 self-start"
            style={{
              background:
                'radial-gradient(120% 90% at 85% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 55%),' +
                'radial-gradient(90% 70% at 0% 100%, rgba(199,120,70,0.40) 0%, rgba(199,120,70,0) 60%),' +
                'linear-gradient(180deg, #2b2b2b 0%, #10222b 55%, #1a1410 100%)',
            }}
          >
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden min-w-0 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)]">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <p className="px-6 pt-6 text-[14px] text-neutral-400 leading-relaxed lg:hidden">{current.body}</p>
                <PlatformVisual id={active} />
                <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-white/[0.07]">
                  {current.tools.map((t, k) => (
                    <div key={t.name} className={`flex gap-3 p-5 ${k % 2 === 0 ? 'sm:border-r' : ''} ${k > 1 ? 'border-t' : ''} ${k === 1 ? 'border-t sm:border-t-0' : ''} border-white/[0.07]`}>
                      <t.Icon className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[14px] text-white font-medium">{t.name}</div>
                        <div className="text-[13px] text-neutral-500">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Lanes with real weights ────────────────────────────────────────────── */

const LANE_ROWS = [
  { name: 'Writers & Marketers', who: 'Articles, blogs, landing pages', href: '/content-writers', w: [36, 27, 27, 0, 0, 10] },
  { name: 'Online Sellers', who: 'Shopify, Etsy, Amazon, DTC stores', href: '/product-sellers', w: [20, 15, 15, 50, 0, 10] },
  { name: 'Developers', who: 'Docs, READMEs, API references', href: '/developers', w: [32, 32, 26, 0, 0, 10] },
  { name: 'Vibe Coders', who: 'Apps built with Bolt, Lovable, Cursor, v0', href: '/vibe-coders', w: [32, 32, 26, 0, 0, 10] },
  { name: 'Local Businesses', who: 'Service businesses people find nearby', href: '/local-business', w: [20, 20, 20, 0, 30, 10] },
];

const SEG = ['#ffffff', '#bdbdbd', '#bdbdbd', '#c5c5c5', '#ffb86b', '#6b7280'];
const SHORT = ['Easy for AI to read', 'Trust', 'Clear next step', 'Product details', 'Local info', 'Easy to quote'];

function LanesSection() {
  return (
    <section className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <Eyebrow>Scored for your kind of business</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white max-w-3xl text-balance">
            A bakery and a SaaS company don't get found the same way.
          </h2>
          <p className="mt-5 text-neutral-400 text-lg max-w-2xl leading-relaxed">
            So we don't score them the same way. Pick yours and the Rain Score focuses on what decides whether AI recommends you. These are the real percentages.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
            {SHORT.map((s, k) => (
              <span key={s} className="flex items-center gap-2 text-[12px] text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: SEG[k] }} />{s}
              </span>
            ))}
          </div>
          <div className="rounded-xl border border-white/10 divide-y divide-white/[0.07] bg-[#0a0a0a]">
            {LANE_ROWS.map(l => (
              <Link key={l.name} to={l.href} className="group grid grid-cols-1 md:grid-cols-[260px_1fr_24px] gap-3 md:gap-8 items-center px-5 md:px-6 py-5 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <div className="text-[15px] text-white font-medium">{l.name}</div>
                  <div className="text-[13px] text-neutral-500 truncate">{l.who}</div>
                </div>
                <div className="flex h-7 rounded-md overflow-hidden" aria-label={l.w.map((v, k) => `${SHORT[k]} ${v}%`).filter((_, k) => l.w[k]).join(', ')}>
                  {l.w.map((v, k) => v > 0 && (
                    <div key={k} className="flex items-center justify-center text-[11px] text-black/80 font-medium tabular-nums" style={{ width: `${v}%`, background: SEG[k], ...MONO }}>
                      {v}%
                    </div>
                  ))}
                </div>
                <ArrowUpRight className="hidden md:block w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Method ─────────────────────────────────────────────────────────────── */

function MethodSection() {
  const engines = joinNames(useLiveEngines());
  const steps = [
    { n: '01', title: 'We ask the AI tools', body: `Your exact question goes to ${engines}, searching the live web, the same way a customer would ask it.` },
    { n: '02', title: 'We read the sources', body: 'We collect every source the answer cites and match them against your domain. Cited or not is a fact, not an estimate.' },
    { n: '03', title: 'We show our work', body: 'You get the answer excerpt, the full source list and the competitors who were cited instead, saved so you can compare over time.' },
  ];
  return (
    <section className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-14 items-start">
        <Reveal>
          <Eyebrow>Method</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">
            Real checks, not predictions.
          </h2>
          <p className="mt-5 text-neutral-400 text-lg leading-relaxed max-w-xl">
            Some tools guess whether AI will mention you. rain OS asks, then shows you the answer. When a number is a judgment call, we say so and show the evidence.
          </p>
          <div className="mt-8 flex items-start gap-3 text-[13px] text-neutral-500 max-w-md">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-neutral-400" />
            Citation checks, weekly tracking, Share of Voice and Brand Sentiment run on every engine. The Rain Score looks at what all of them rely on, so each fix helps everywhere.
          </div>
        </Reveal>
        <div className="space-y-3">
          {steps.map((s, k) => (
            <Reveal key={s.n} delay={0.08 * k}>
              <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 flex gap-5">
                <span className="text-[12px] text-[#ffffff] pt-1" style={MONO}>{s.n}</span>
                <div>
                  <div className="text-[17px] text-white font-medium">{s.title}</div>
                  <p className="mt-1.5 text-[14px] text-neutral-400 leading-relaxed">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── The engines we check ───────────────────────────────────────────────── */

function WhyGoogleSection() {
  const live = useLiveEngines();
  const points = [
    {
      Icon: Search,
      title: 'Where your customers already are',
      body: 'ChatGPT is the AI assistant people use most. Google answers many searches with an AI Overview before a single link, and AI Mode goes further. Perplexity and Claude round out where people ask. We check the real answers on each.',
    },
    {
      Icon: Globe,
      title: 'Live search, not memory',
      body: 'Every check searches the web at that moment and answers from what it finds today, not from training data that may be a year old.',
    },
    {
      Icon: ShieldCheck,
      title: 'Proof you can click',
      body: 'Each check returns the exact pages the answer relied on. So "cited" or "not cited" is a fact with links, not a guess, and you can open every source yourself.',
    },
  ];
  return (
    <section id="why-google" className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6">
        <Reveal>
          <Eyebrow>The AI tools we check</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance max-w-3xl">
            We ask the AI your customers actually use.
          </h2>
          <p className="mt-5 text-neutral-400 text-lg leading-relaxed max-w-2xl">
            rain OS puts your questions to {joinNames(live)}, searching the live web, and shows exactly which sites each one cited and where you ranked.
            {' '}One question, every AI tool, side by side.
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-3">
          {points.map(({ Icon, title, body }, k) => (
            <Reveal key={title} delay={0.08 * k}>
              <div className="h-full rounded-xl border border-white/10 bg-[#0a0a0a] p-6">
                <Icon className="w-5 h-5 text-[#ffffff]" />
                <div className="mt-4 text-[17px] text-white font-medium">{title}</div>
                <p className="mt-2 text-[14px] text-neutral-400 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Weekly tracking spotlight ──────────────────────────────────────────── */

function TrackingSection() {
  return (
    <section className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <Reveal className="order-2 lg:order-1">
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden max-w-md">
            <div className="flex items-center gap-2 px-5 h-11 border-b border-white/[0.07]">
              <Mail className="w-4 h-4 text-neutral-500" />
              <span className="text-[12px] text-neutral-500" style={MONO}>support@getrainos.com</span>
            </div>
            <div className="p-6">
              <div className="text-[11px] text-neutral-500 mb-2">Weekly tracking · Pricing page</div>
              <div className="text-[19px] text-white font-semibold leading-snug">Gemini now cites you for "best scheduling app for clinics"</div>
              <p className="mt-3 text-[14px] text-neutral-400 leading-relaxed">Your site appeared among the sources in this week's check. Keep the page that earned it up to date.</p>
              <div className="mt-5 inline-flex items-center gap-2 h-9 px-4 rounded-md bg-white text-black text-[13px] font-medium">Open Citation Monitor</div>
            </div>
          </div>
        </Reveal>
        <Reveal className="order-1 lg:order-2">
          <Eyebrow>Weekly tracking</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">
            Know the week it changes.
          </h2>
          <p className="mt-5 text-neutral-400 text-lg leading-relaxed max-w-xl">
            Pick the questions that matter to your business. rain OS re-checks them every week, keeps the history, and emails you only when you gain or lose a citation.
          </p>
          <ul className="mt-8 space-y-3 text-[15px] text-neutral-300">
            {['Up to 10 questions on Pro, 30 on Business', 'Email only when your status changes', 'Doesn\'t use your monthly analyses'].map(t => (
              <li key={t} className="flex items-center gap-3"><Check className="w-4 h-4 text-[#ffffff]" />{t}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Who it's for (lane picker) ─────────────────────────────────────────── */

const WHO = [
  { Icon: MapPin, title: 'I run a local business', body: 'Plumbers, salons, dentists, restaurants. Help AI recommend you when people ask who\'s best nearby.', to: '/local-business' },
  { Icon: ShoppingBag, title: 'I sell products online', body: 'Shopify, Etsy, Amazon or your own store. Help AI suggest your products when people ask what to buy.', to: '/product-sellers' },
  { Icon: PenLine, title: 'I write content', body: 'Blogs, newsletters and landing pages. Write things AI quotes and links to.', to: '/content-writers' },
  { Icon: Sparkles, title: 'I build apps with AI tools', body: 'Bolt, Lovable, Replit, v0 or Cursor. Make sure AI can actually find what you built.', to: '/vibe-coders' },
  { Icon: Code2, title: 'I write code and docs', body: 'READMEs, documentation and API references. Help AI explain your project correctly.', to: '/developers' },
];

function SourceNetworkSection() {
  return (
    <section className="relative z-10 py-28 border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
        <Reveal>
          <Eyebrow>Where AI gets its answers</Eyebrow>
          <ScrollWords
            text="Each answer draws on many sites. Get on the list."
            className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance"
          />
          <p className="mt-5 max-w-3xl text-neutral-400 text-lg leading-relaxed">
            When someone asks an AI a question, it reads a handful of websites and quotes from the ones it finds most useful. rain OS puts your questions to each AI, shows you which websites it read for each answer, and tells you whether your site is one of them, so you know exactly where you stand.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <SourceNetwork />
        </Reveal>
      </div>
    </section>
  );
}

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
    { n: '3', title: 'Follow the fixes', body: 'Each fix is written in plain English, with a technical version you can hand to whoever builds your site.' },
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

const SPECS = [
  { k: '6', v: 'scored areas, weighted for your type of business' },
  { k: '6', v: 'AI tools checked, from any US state or country' },
  { k: 'Live', v: 'checks against real AI answers' },
  { k: 'Weekly', v: 're-checks with email alerts' },
];

// Under the headline: each AI tool's name in turn, blurring in and out.
function EngineCycle({ names }: { names: string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI(n => (n + 1) % names.length), 1800);
    return () => clearInterval(t);
  }, [reduce, names.length]);
  return (
    <div className="mt-4 flex h-8 items-center justify-center text-lg md:text-xl">
      <AnimatePresence mode="wait">
        <motion.span
          key={names[i]}
          initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          transition={{ duration: 0.45 }}
          className="whitespace-nowrap font-medium text-white"
        >
          {names[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
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
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 pt-32 md:pt-36 pb-16 flex flex-col items-center gap-16">
            <motion.div className="text-center max-w-4xl mx-auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <a href="#who" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] pl-3 pr-2.5 h-7 text-[12px] text-neutral-300 hover:border-white/20 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff]" />
                For local businesses, sellers and builders
                <ArrowRight className="w-3 h-3 text-neutral-500" />
              </a>
              {/* The subtitle takes the headline's width: w-0 + min-w-full stops it widening the block. */}
              <div className="mx-auto w-fit">
              <h1 className="mt-7 text-[clamp(26px,4.6vw,64px)] leading-[1.02] font-semibold tracking-[-0.045em] whitespace-nowrap">
                Be the answer <span className="text-neutral-500">AI gives.</span>
              </h1>
              <EngineCycle names={engines} />
              <p className="mt-7 w-0 min-w-full text-lg md:text-xl text-neutral-400 leading-relaxed text-center">
                More people now ask AI where to buy, who to hire and what to use. rain OS checks whether {joinNames(engines)} recommend you, and walks you through fixing it in plain English.
              </p>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={start} className="h-11 px-6 rounded-md bg-white text-black text-[15px] font-medium hover:bg-neutral-200 transition-colors inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Check my site free <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-neutral-400">
                {[`Checks ${engines.length} AI tools`, 'No credit card', 'No technical skills needed'].map(t => (
                  <li key={t} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#ffffff]" />{t}</li>
                ))}
              </ul>
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

        <SourceNetworkSection />
        <WhoSection onStart={start} />
        <IllustratedExample />
        <HowItWorks />

        <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.01]">
          <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4">
            {SPECS.map((s, k) => (
              <div key={s.v} className={`px-6 py-8 ${k % 2 === 1 ? 'border-l' : ''} ${k >= 2 ? 'border-t md:border-t-0' : ''} ${k === 2 ? 'md:border-l' : ''} border-white/[0.06]`}>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight text-white">{s.k}</div>
                <div className="mt-1 text-[13px] text-neutral-500">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 py-28">
          <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-14 items-end">
            <Reveal>
              <Eyebrow>The shift</Eyebrow>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">
                Search is becoming an answer.
              </h2>
              <p className="mt-5 text-neutral-400 text-lg leading-relaxed max-w-xl">
                When AI answers the question, it cites a handful of sources and most people stop there. If you're not one of them, you're not in the conversation, however well you rank.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-8">
                <div className="text-7xl md:text-8xl font-semibold tracking-[-0.05em] tabular-nums" style={{ color: '#A8203E' }}>47%</div>
                <p className="mt-3 text-[15px] text-neutral-300 leading-relaxed">Fewer people click through to websites when Google shows an AI answer. With an AI answer, 8 out of 100 searches end in a click to a site. Without one, it's 15.</p>
                <a href="https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 text-[12px] text-neutral-500 hover:text-neutral-300" style={MONO}>
                  PEW RESEARCH CENTER, JULY 2025 <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative z-10 py-28 border-t border-white/[0.06]">
          <div className="max-w-[1440px] mx-auto px-6">
            <Reveal className="text-center">
              <Eyebrow>Inside the app</Eyebrow>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">
                Paste your page. See each step as it runs.
              </h2>
              <p className="mt-5 text-neutral-400 text-lg leading-relaxed max-w-2xl mx-auto">
                rain OS reads your writing, measures it, scores it and writes the fixes in plain English.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-12 max-w-5xl mx-auto">
              <AnalyzeConsole />
            </Reveal>
          </div>
        </section>

        <WhyGoogleSection />
        <PlatformSection />
        <LanesSection />
        <MethodSection />
        <TrackingSection />

        <section className="relative z-10 border-t border-white/[0.06]">
          <FAQ />
        </section>

        <section className="relative z-10 overflow-hidden border-t border-white/[0.06]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(50% 80% at 50% 100%, rgba(255,255,255,0.18), transparent 70%)' }}
          />
          <div className="relative max-w-4xl mx-auto px-6 py-32 text-center">
            <h2 className="text-4xl md:text-7xl font-semibold tracking-[-0.045em] text-balance">Get cited.</h2>
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
