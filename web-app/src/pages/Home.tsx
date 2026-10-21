import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, Search, Radar, Wand2, Gauge, CalendarClock,
  GitPullRequest, FileText, Globe, GitBranch, BarChart2, Eye, Mail, ShieldCheck,
  MapPin, ShoppingBag, PenLine, Sparkles, Code2, HelpCircle,
} from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import RainBackground from '@/components/marketing/RainBackground';
import SiteFooter from '@/components/marketing/SiteFooter';
import { Pricing, FAQ } from '@/components/marketing/MarketingComponents';
import { useLiveEngines, joinNames } from '@/lib/liveEngines';
import HeroPrompt from '@/components/marketing/HeroPrompt';

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


const HERO_EXAMPLES = [
  {
    query: 'best project management tool for small agencies',
    cited: true,
    rank: 2,
    sources: ['g2.com', 'yourbrand.com', 'zapier.com', 'reddit.com'],
    history: [null, null, 3, null, 2, 2, 3, 2] as (number | null)[],
  },
  {
    query: 'how do I make my Shopify store show up in AI shopping answers',
    cited: false,
    rank: 0,
    sources: ['shopify.com', 'wired.com', 'theverge.com', 'competitor.co'],
    history: [2, 3, null, null, null, 4, null, null] as (number | null)[],
  },
  {
    query: 'emergency plumber open now near Austin',
    cited: true,
    rank: 1,
    sources: ['yourbrand.com', 'yelp.com', 'angi.com', 'bbb.org'],
    history: [null, 2, 1, 1, null, 1, 1, 1] as (number | null)[],
  },
];

// Where your site ranked in Gemini's sources on each check (1 is the top).
// Gaps are checks where it wasn't cited. Same idea as the app's "Position over time" chart.
function PositionLine({ history }: { history: (number | null)[] }) {
  const W = 220, H = 64, padX = 10, padY = 8, maxRank = 4;
  const x = (k: number) => padX + (k * (W - padX * 2)) / (history.length - 1);
  const y = (r: number) => padY + ((r - 1) * (H - padY * 2)) / (maxRank - 1);
  const segments: string[] = [];
  let cur: string[] = [];
  history.forEach((r, k) => {
    if (r == null) { if (cur.length > 1) segments.push(cur.join(' ')); cur = []; return; }
    cur.push(`${x(k)},${y(r)}`);
  });
  if (cur.length > 1) segments.push(cur.join(' '));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[260px]" role="img" aria-label="Your position over the last 8 checks">
      {[1, 2, 3, 4].map(r => (
        <line key={r} x1={padX} x2={W - padX} y1={y(r)} y2={y(r)} stroke="rgba(255,255,255,0.07)" />
      ))}
      {segments.map((pts, k) => (
        <polyline key={k} points={pts} fill="none" stroke="#2B8FE3" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      ))}
      {history.map((r, k) => r == null ? null : <circle key={k} cx={x(k)} cy={y(r)} r="3" fill="#2B8FE3" />)}
    </svg>
  );
}

function HeroConsole() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI(n => (n + 1) % HERO_EXAMPLES.length), 5200);
    return () => clearInterval(t);
  }, [reduce]);
  const ex = HERO_EXAMPLES[i];

  return (
    <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] shadow-[0_40px_120px_-40px_rgba(43,143,227,0.35)] overflow-hidden text-left">
      <div className="flex items-center gap-2 px-4 h-10 border-b border-white/[0.07] bg-white/[0.02]">
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="ml-3 text-[11px] text-neutral-500 truncate" style={MONO}>getrainos.com/citation-monitor</span>
        <span className="ml-auto text-[10px] text-neutral-600 hidden sm:inline" style={MONO}>EXAMPLE DATA</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr]">
        <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-white/[0.07] min-w-0">
          <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 mb-2" style={MONO}>Question</div>
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black px-3 h-10 mb-5 min-w-0">
            <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <AnimatePresence mode="wait">
              <motion.span
                key={ex.query}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-[13px] text-neutral-200 truncate"
              >
                {ex.query}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-500" style={MONO}>Sources Gemini cited</div>
            <AnimatePresence mode="wait">
              <motion.span
                key={String(ex.cited) + i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-[11px] font-medium px-2 py-0.5 rounded border ${ex.cited ? 'text-[#4ade80] border-[#4ade80]/25 bg-[#4ade80]/[0.06]' : 'text-[#f87171] border-[#f87171]/25 bg-[#f87171]/[0.06]'}`}
              >
                {ex.cited ? `Cited · source ${ex.rank}` : 'Not cited'}
              </motion.span>
            </AnimatePresence>
          </div>
          <ol className="space-y-1.5">
            {ex.sources.map((d, k) => {
              const mine = d === 'yourbrand.com';
              return (
                <motion.li
                  key={ex.query + d}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * k }}
                  className={`flex items-center gap-3 rounded-md px-3 h-9 text-[13px] ${mine ? 'bg-[#2B8FE3]/10 border border-[#2B8FE3]/30 text-white' : 'border border-white/[0.06] text-neutral-400'}`}
                >
                  <span className="text-[11px] text-neutral-600 w-4" style={MONO}>{k + 1}</span>
                  <span className="truncate">{d}</span>
                  {mine && <span className="ml-auto text-[10px] text-[#2B8FE3]" style={MONO}>YOU</span>}
                </motion.li>
              );
            })}
          </ol>
        </div>

        <div className="p-5 md:p-6 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 mb-2" style={MONO}>Your position</div>
          <AnimatePresence mode="wait">
            <motion.div key={ex.query} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-8">
              {ex.cited ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-[44px] leading-none font-semibold tracking-[-0.03em] text-white tabular-nums">#{ex.rank}</span>
                  <span className="text-sm text-neutral-500">of {ex.sources.length}</span>
                </div>
              ) : (
                <div className="text-[32px] leading-none font-semibold tracking-[-0.02em] text-[#f87171]">Not cited</div>
              )}
              <p className="mt-3 text-[13px] text-neutral-400 leading-relaxed">
                {ex.cited
                  ? `Gemini cited your site as source ${ex.rank} for this question.`
                  : `Your site wasn't among the ${ex.sources.length} sources. rain OS shows what your page needs.`}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 mb-2" style={MONO}>Position over time</div>
          <PositionLine history={ex.history} />
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
      { Icon: Globe, name: 'URL Scanner', desc: 'llms.txt, schema, crawler access, structure' },
      { Icon: GitBranch, name: 'Repo Analysis', desc: 'Audit an app straight from GitHub' },
    ],
  },
  {
    id: 'monitor',
    label: 'Monitor',
    Icon: Radar,
    title: 'See whether AI cites you',
    body: 'Ask the questions your customers ask. We put them to {engines}, searching the live web, and show every website each one pointed to.',
    tools: [
      { Icon: Radar, name: 'Citation Monitor', desc: 'Cited or not, with the full source list' },
      { Icon: CalendarClock, name: 'Weekly tracking', desc: 'Re-checked every week, alerts on change' },
      { Icon: BarChart2, name: 'Share of Voice', desc: 'Your mentions versus competitors' },
      { Icon: Eye, name: 'Brand Sentiment', desc: 'How AI describes your brand' },
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
  measure: { src: '/screens/measure.png', alt: 'rain OS URL Scanner results: overall score, four pillar scores and the technical checks that need fixing', label: 'URL SCANNER', w: 1072, h: 1066 },
  monitor: { src: '/screens/monitor.png', alt: 'rain OS Tracked weekly list: each question, whether you were cited, and a history of past checks', label: 'TRACKED WEEKLY', w: 1072, h: 756 },
  fix: { src: '/screens/fix.png', alt: 'rain OS recommendation with a plain-English fix and a copy-ready technical fix', label: 'RECOMMENDATIONS', w: 1072, h: 1080 },
};

// Screenshots of the real app, rendered with example data.
function PlatformVisual({ id }: { id: string }) {
  const shot = SHOTS[id];
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
      <div className="max-w-6xl mx-auto px-6">
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
                  className={`text-left rounded-lg border px-5 py-4 transition-colors min-w-[220px] lg:min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B8FE3] ${on ? 'border-white/15 bg-white/[0.04]' : 'border-transparent hover:bg-white/[0.02]'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <p.Icon className={`w-4 h-4 ${on ? 'text-[#2B8FE3]' : 'text-neutral-500'}`} />
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
                'radial-gradient(120% 90% at 85% 0%, rgba(43,143,227,0.55) 0%, rgba(43,143,227,0) 55%),' +
                'radial-gradient(90% 70% at 0% 100%, rgba(199,120,70,0.40) 0%, rgba(199,120,70,0) 60%),' +
                'linear-gradient(180deg, #16313f 0%, #10222b 55%, #1a1410 100%)',
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
  { name: 'Product Sellers', who: 'Shopify, Etsy, Amazon, DTC stores', href: '/product-sellers', w: [20, 15, 15, 50, 0, 10] },
  { name: 'Developers', who: 'Docs, READMEs, API references', href: '/developers', w: [32, 32, 26, 0, 0, 10] },
  { name: 'Vibe Coders', who: 'Apps built with Bolt, Lovable, Cursor, v0', href: '/vibe-coders', w: [32, 32, 26, 0, 0, 10] },
  { name: 'Local Businesses', who: 'Service businesses people find nearby', href: '/local-business', w: [20, 20, 20, 0, 30, 10] },
];

const SEG = ['#2B8FE3', '#5aa9ef', '#8ac2f4', '#c7b8ff', '#ffb86b', '#6b7280'];
const SHORT = ['Easy for AI to read', 'Trust', 'Clear next step', 'Product details', 'Local info', 'Easy to quote'];

function LanesSection() {
  return (
    <section className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
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
    { n: '01', title: 'We ask the engines', body: `Your exact question goes to ${engines}, searching the live web, the same way a customer would ask it.` },
    { n: '02', title: 'We read the sources', body: 'We collect every source the answer cites and match them against your domain. Cited or not is a fact, not an estimate.' },
    { n: '03', title: 'We show our work', body: 'You get the answer excerpt, the full source list and the competitors who were cited instead, saved so you can compare over time.' },
  ];
  return (
    <section className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-14 items-start">
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
                <span className="text-[12px] text-[#2B8FE3] pt-1" style={MONO}>{s.n}</span>
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
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <Eyebrow>The engines we check</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance max-w-3xl">
            We ask the AI your customers actually use.
          </h2>
          <p className="mt-5 text-neutral-400 text-lg leading-relaxed max-w-2xl">
            rain OS puts your questions to {joinNames(live)}, searching the live web, and shows exactly which sites each one cited and where you ranked.
            {' '}One question, every engine, side by side.
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-3">
          {points.map(({ Icon, title, body }, k) => (
            <Reveal key={title} delay={0.08 * k}>
              <div className="h-full rounded-xl border border-white/10 bg-[#0a0a0a] p-6">
                <Icon className="w-5 h-5 text-[#2B8FE3]" />
                <div className="mt-4 text-[17px] text-white font-medium">{title}</div>
                <p className="mt-2 text-[14px] text-neutral-400 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-neutral-500 max-w-3xl leading-relaxed">
          Each check shows what that engine answered at that moment, from the location you choose. AI answers vary between runs, which is why
          weekly tracking matters more than any single check. The Rain Score measures what every assistant relies on, like clear answers, structure and schema, so the fixes apply everywhere.
        </p>
      </div>
    </section>
  );
}

/* ── Weekly tracking spotlight ──────────────────────────────────────────── */

function TrackingSection() {
  return (
    <section className="relative z-10 py-28 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
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
              <div className="mt-5 inline-flex items-center gap-2 h-9 px-4 rounded-md bg-[#2B8FE3] text-white text-[13px] font-medium">Open Citation Monitor</div>
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
              <li key={t} className="flex items-center gap-3"><Check className="w-4 h-4 text-[#2B8FE3]" />{t}</li>
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

function WhoSection({ onStart }: { onStart: () => void }) {
  return (
    <section id="who" className="relative z-10 py-24 border-t border-white/[0.06] scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6">
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
                className="group flex h-full flex-col rounded-xl border border-white/10 bg-[#0a0a0a] p-6 hover:border-[#2B8FE3]/50 hover:bg-[#2B8FE3]/[0.04] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B8FE3]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                    <w.Icon className="w-4 h-4 text-[#5aa9ef]" />
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
              className="group flex h-full w-full flex-col rounded-xl border border-dashed border-white/15 p-6 text-left hover:border-white/30 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B8FE3]"
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
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">Three steps. No setup.</h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((st, k) => (
            <Reveal key={st.n} delay={0.06 * k}>
              <div className="h-full rounded-xl border border-white/10 bg-[#0a0a0a] p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2B8FE3]/15 text-[13px] font-medium text-[#8ac2f4]">{st.n}</span>
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
  { k: '6', v: 'scoring pillars, weighted for your type of business' },
  { k: '6', v: 'AI engines checked, from any US state or country' },
  { k: 'Live', v: 'checks against real AI answers' },
  { k: 'Weekly', v: 're-checks with email alerts' },
];

export default function Home() {
  const engines = useLiveEngines();
  const navigate = useNavigate();
  const start = () => navigate('/login');

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <MarketingNav onGetStartedClick={start} onLoginClick={() => navigate('/login?mode=login')} />

      <main>
        <section className="relative overflow-hidden">
          <RainBackground />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[720px] z-[1]"
            style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(43,143,227,0.16), transparent 70%)' }}
          />
          <div className="relative z-10 max-w-6xl mx-auto px-6 pt-36 md:pt-44 pb-20 text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <a href="#who" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] pl-3 pr-2.5 h-7 text-[12px] text-neutral-300 hover:border-white/20 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2B8FE3]" />
                For local businesses, sellers and builders
                <ArrowRight className="w-3 h-3 text-neutral-500" />
              </a>
              <h1 className="mt-7 text-[44px] leading-[1.02] sm:text-6xl md:text-[84px] font-semibold tracking-[-0.045em] text-balance">
                Be the answer
                <br />
                <span className="text-neutral-500">AI gives.</span>
              </h1>
              <p className="mt-7 text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed text-balance">
                More people now ask AI where to buy, who to hire and what to use. rain OS checks whether ChatGPT, Google's AI answers, Perplexity and Claude recommend you, and walks you through fixing it in plain English.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={start} className="h-11 px-6 rounded-md bg-[#2B8FE3] text-white text-[15px] font-medium hover:bg-[#1C73C4] transition-colors inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Check my site free <ArrowRight className="w-4 h-4" />
                </button>
                <a href="/demo" className="h-11 px-6 rounded-md border border-white/15 text-[15px] text-white hover:bg-white/[0.05] transition-colors inline-flex items-center gap-2">
                  Try the live demo <ArrowRight className="w-4 h-4 text-neutral-400" />
                </a>
              </div>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-neutral-400">
                {[`Checks ${engines.length} AI engines`, 'Free to start', 'No credit card', 'No technical skills needed'].map(t => (
                  <li key={t} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#2B8FE3]" />{t}</li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="mt-20 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeroPrompt />
            </motion.div>
          </div>
        </section>

        <WhoSection onStart={start} />
        <HowItWorks />

        <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.01]">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
            {SPECS.map((s, k) => (
              <div key={s.v} className={`px-6 py-8 ${k % 2 === 1 ? 'border-l' : ''} ${k >= 2 ? 'border-t md:border-t-0' : ''} ${k === 2 ? 'md:border-l' : ''} border-white/[0.06]`}>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight text-white">{s.k}</div>
                <div className="mt-1 text-[13px] text-neutral-500">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 py-28">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-14 items-end">
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
                <div className="text-7xl md:text-8xl font-semibold tracking-[-0.05em] text-white tabular-nums">47%</div>
                <p className="mt-3 text-[15px] text-neutral-300 leading-relaxed">fewer clicks on regular search results when Google shows an AI summary. Users clicked a link on 8% of those visits, compared with 15% without one.</p>
                <a href="https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 text-[12px] text-neutral-500 hover:text-neutral-300" style={MONO}>
                  PEW RESEARCH CENTER, JULY 2025 <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative z-10 py-28 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal className="text-center">
              <Eyebrow>Inside the app</Eyebrow>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">
                Every source, in order. Your place among them.
              </h2>
              <p className="mt-5 text-neutral-400 text-lg leading-relaxed max-w-2xl mx-auto">
                Ask the question your customers ask. See exactly which sites the AI cited, where you ranked, and how that changes week to week.
              </p>
              <div className="mt-8 text-[11px] uppercase tracking-[0.16em] text-neutral-600" style={MONO}>Checks answers from</div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] text-neutral-300">
                {engines.map(e => <span key={e}>{e}</span>)}
              </div>
            </Reveal>
            <Reveal delay={0.1} className="mt-12 max-w-5xl mx-auto">
              <HeroConsole />
            </Reveal>
          </div>
        </section>

        <WhyGoogleSection />
        <PlatformSection />
        <LanesSection />
        <MethodSection />
        <TrackingSection />

        <section id="pricing" className="relative z-10 pt-28 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <Reveal>
              <Eyebrow>Pricing</Eyebrow>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white">Start free. Upgrade when it works.</h2>
            </Reveal>
          </div>
          <Pricing />
        </section>

        <section className="relative z-10 border-t border-white/[0.06]">
          <FAQ />
        </section>

        <section className="relative z-10 overflow-hidden border-t border-white/[0.06]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(50% 80% at 50% 100%, rgba(43,143,227,0.18), transparent 70%)' }}
          />
          <div className="relative max-w-4xl mx-auto px-6 py-32 text-center">
            <h2 className="text-4xl md:text-7xl font-semibold tracking-[-0.045em] text-balance">Get cited.</h2>
            <p className="mt-6 text-lg text-neutral-400 max-w-xl mx-auto">Run your first analysis today. Five are free, no card required.</p>
            <button onClick={start} className="mt-10 h-12 px-7 rounded-md bg-[#2B8FE3] text-white text-[15px] font-medium hover:bg-[#1C73C4] transition-colors inline-flex items-center gap-2">
              Start free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
