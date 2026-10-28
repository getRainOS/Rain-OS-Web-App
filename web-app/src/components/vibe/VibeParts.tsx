import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Search, Shield, SearchCheck, FileCode, Terminal, CheckCircle2, AlertTriangle, Wand2, Monitor, Code2, Globe, Cpu, BrainCircuit, ShieldCheck, MousePointerClick, TrendingUp, ClipboardCopy, GitCommit, Send, RefreshCw } from 'lucide-react';

export const ROTATING_WORDS = ['SaaS?', 'MVP?', 'Website?', 'Web App?', 'Portfolio?', 'Landing Page?', 'Store?', 'Product?', 'Blog?', 'App?'];

export const repoPillars = [
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: BrainCircuit,
    name: 'AI Readability',
    score: 42,
    maxScore: 94,
    subSignals: [
      { name: 'llms.txt', before: false, after: true, description: 'A file that tells AI crawlers how to read your site and what each page does.' },
      { name: 'Schema markup', before: false, after: true, description: 'Structured data (JSON-LD) that helps AI understand your organization, product, or content.' },
      { name: 'H1/H2 structure', before: true, after: true, description: 'Clear heading hierarchy so AI can quickly grasp the topic and sections of each page.' },
      { name: 'Meta tags', before: false, after: true, description: 'Title and description tags that show up in AI summaries and search results.' },
    ],
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: ShieldCheck,
    name: 'Digital Authority',
    score: 58,
    maxScore: 91,
    subSignals: [
      { name: 'README quality', before: true, after: true, description: 'A clear README that explains what your project does, how to install it, and where key files live.' },
      { name: 'robots.txt', before: false, after: true, description: 'Tells AI crawlers (GPTBot, ChatGPT-User) which pages they are allowed to visit.' },
      { name: 'Canonical URL', before: true, after: true, description: 'Prevents duplicate content issues so AI always points to the right version of a page.' },
      { name: 'OG tags', before: false, after: true, description: 'Open Graph tags that control how your links look when shared on social platforms and AI chat interfaces.' },
    ],
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: MousePointerClick,
    name: 'Conversion Readiness',
    score: 35,
    maxScore: 87,
    subSignals: [
      { name: 'FAQ section', before: false, after: true, description: 'A dedicated FAQ page that AI can quote directly when answering questions about your product.' },
      { name: 'Bullet answers', before: false, after: true, description: 'Short, structured bullet points that AI can extract easily for featured answers.' },
      { name: 'CTA clarity', before: true, after: true, description: 'Clear calls-to-action so AI knows what step you want readers to take next.' },
      { name: 'Lead paragraph', before: false, after: true, description: 'A strong opening sentence in each section that gives AI the main point immediately.' },
    ],
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: SearchCheck,
    name: 'Product Discoverability',
    score: 38,
    maxScore: 85,
    subSignals: [
      { name: 'Product schema', before: false, after: true, description: 'Structured data that tells AI what your product does, who it is for, and how to find it.' },
      { name: 'Pricing signals', before: false, after: true, description: 'Clear pricing, plans, or tier information so AI can surface your product in comparison queries.' },
      { name: 'Review markup', before: false, after: true, description: 'AggregateRating or review schema that makes your product look credible in AI recommendations.' },
      { name: 'Availability data', before: false, after: true, description: 'Stock status, shipping info, or signup availability that AI can extract for real-time answers.' },
    ],
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: Layers,
    name: 'RAG Readiness',
    score: 40,
    maxScore: 88,
    subSignals: [
      { name: 'llms.txt', before: false, after: true, description: 'AI crawler instructions that help RAG systems chunk and retrieve your content correctly.' },
      { name: 'H1/H2 structure', before: true, after: true, description: 'Clear heading hierarchy so vector databases can chunk your content semantically.' },
      { name: 'FAQ section', before: false, after: true, description: 'Structured Q&A content that retrieval systems can match directly to user queries.' },
      { name: 'Semantic tags', before: false, after: true, description: 'Proper HTML semantic tags that help embedding models understand context.' },
    ],
  },
];

export const vibeSignals = [
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: FileCode,
    name: 'llms.txt Presence',
    desc: 'The single most important file for AI discoverability. Tells LLMs what your app does, how to use it, and where key info lives. Most vibe-coded sites skip this entirely.',
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: Search,
    name: 'Meta Description & OG Tags',
    desc: 'AI engines use meta descriptions and Open Graph tags to understand your page before they render it. Missing these means AI has no context to cite you.',
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: Shield,
    name: 'robots.txt & Crawler Access',
    desc: 'Is your robots.txt blocking GPTBot, ChatGPT-User, or other AI crawlers? Many vibe-coded sites inherit restrictive defaults that hide them from AI search.',
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: Code2,
    name: 'Schema Markup (JSON-LD)',
    desc: 'Structured data tells AI exactly what your page represents — product, article, organization, FAQ. Without it, AI guesses. Most vibe tools don\'t add schema automatically.',
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: Monitor,
    name: 'SSR vs SPA Detection',
    desc: 'Vibe-coded SPAs (Vite, CRA) render content in JavaScript. AI crawlers often see a blank page. We detect this and flag it as high-risk for AI discoverability.',
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: Terminal,
    name: 'README & Package.json Quality',
    desc: 'Your README is often the first thing AI reads about your project. Missing install steps, unclear description, or no keywords in package.json hurts discoverability.',
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: Globe,
    name: 'Canonical URL & index.html',
    desc: 'Duplicate content and missing canonical tags confuse AI. We check your index.html for title tags, meta viewport, and proper head structure.',
  },
  {
    color: '#ffffff',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    Icon: Cpu,
    name: 'AI-Ready Content Structure',
    desc: 'Clear H1/H2 hierarchy, FAQ sections, bullet-point answers. AI extracts the first 1-2 sentences of each section. If your lead is vague, AI moves to a competitor.',
  },
];

export const platforms = [
  'Bolt', 'Lovable', 'Cursor', 'v0', 'Replit', 'Windsurf',
  'Base44', 'lovable.dev', 'Framer', 'Webflow',
];

export const FIX_PROMPT = `Add llms.txt to the root of the repo with a concise description of what this app does, how to install it, and where key files live. Then add JSON-LD schema markup to index.html (Organization type with name, url, description). Add meta description and Open Graph tags (og:title, og:description, og:image). Ensure H1/H2 hierarchy is clear and add an FAQ section with 3-5 questions in a <details> block. Update robots.txt to allow GPTBot and ChatGPT-User.`;

export const URL_FIX_PROMPT = `Add llms.txt to the root with a description of what this site does. Add JSON-LD schema markup (Organization type with name, url, description). Add meta description and Open Graph tags (og:title, og:description, og:image). Ensure H1/H2 hierarchy is clear, add an FAQ section with 3-5 questions, and include bullet-point answers for AI extraction. Add a clear lead paragraph in the first sentence of each section.`;

/* ------------------------------------------------------------------ */
/*  ScoreCard                                                          */
/* ------------------------------------------------------------------ */

export function ScoreCard({ p, score, isFixed, isScanning, index }: {
  p: typeof repoPillars[0];
  score: number;
  isFixed: boolean;
  isScanning: boolean;
  index: number;
}) {
  return (
    <motion.div
      key={p.name}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        borderColor: isFixed ? p.border : 'rgba(255,255,255,0.08)',
        background: isFixed ? p.bg : 'rgba(255,255,255,0.02)',
      }}
    >
      {/* Scanning pulse overlay */}
      {isScanning && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ borderColor: p.border }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))',
              border: `1px solid ${p.border}`,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <p.Icon className="w-4 h-4" strokeWidth={1.5} style={{ color: p.color }} />
          </div>
          <span className="text-sm font-semibold text-white">{p.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums" style={{ color: p.color }}>{score}</span>
          <span className="text-xs text-neutral-400">/ 100</span>
          {isFixed && score > p.score + 20 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ color: p.color }}
            >
              <TrendingUp className="w-3 h-3" />+{p.maxScore - p.score}
            </motion.span>
          )}
        </div>
      </div>

      {/* Sub-signals with staggered reveal */}
      <div className="grid grid-cols-2 gap-2 relative z-10">
        {p.subSignals.map((sig, j) => {
          const isSignalFixed = isFixed && sig.before === false;
          return (
            <motion.div
              key={sig.name}
              initial={false}
              animate={isSignalFixed ? { scale: [1, 1.08, 1], borderColor: [p.border, p.border, p.border] } : {}}
              transition={{ duration: 0.5, delay: j * 0.2 }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors"
              style={{
                background: isSignalFixed ? p.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSignalFixed ? p.border : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span className="flex items-center justify-center w-4 h-4 rounded-full shrink-0"
                style={{
                  background: isSignalFixed ? p.bg : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isSignalFixed ? p.border : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <AnimatePresence mode="wait">
                  {isSignalFixed ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <CheckCircle2 className="w-3 h-3" style={{ color: p.color }} />
                    </motion.div>
                  ) : (
                    <motion.div key="warn">
                      {sig.before ? (
                        <CheckCircle2 className="w-3 h-3" style={{ color: p.color }} />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-white" />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </span>
              <span className={isSignalFixed ? 'text-white font-medium' : 'text-neutral-400'}>
                {sig.name}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar with glow */}
      <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden relative z-10">
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: `linear-gradient(90deg, ${p.color}, ${p.color}88)`,
            width: `${score}%`,
          }}
          transition={{ duration: 0.3 }}
        >
          {isFixed && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${p.color}66, transparent)` }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  TerminalLine                                                       */
/* ------------------------------------------------------------------ */

export function TerminalLine({ type, text, color = 'sky', delay = 0 }: {
  type: 'cmd' | 'out' | 'ok' | 'warn' | 'prompt' | 'vibe' | 'commit' | 'rescan';
  text: string;
  color?: 'sky' | 'emerald' | 'amber' | 'violet' | 'red' | 'slate' | 'white';
  delay?: number;
}) {
  const colorMap: Record<string, string> = {
    sky: 'text-white',
    emerald: 'text-white',
    amber: 'text-white',
    violet: 'text-white',
    red: 'text-neutral-300',
    slate: 'text-neutral-400',
    white: 'text-white',
  };

  const iconMap: Record<string, React.ReactNode> = {
    cmd: <span className="text-white mr-1">$</span>,
    out: <span className="text-neutral-400 mr-1">&gt;</span>,
    ok: <span className="text-white mr-1">&#10003;</span>,
    warn: <span className="text-white mr-1">!</span>,
    prompt: <span className="text-white mr-1">&#9654;</span>,
    vibe: <span className="text-white mr-1">~</span>,
    commit: <span className="text-white mr-1">&#9679;</span>,
    rescan: <span className="text-white mr-1">&#8635;</span>,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="text-xs leading-relaxed mb-1"
    >
      {iconMap[type]}
      <span className={colorMap[color]}>{text}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  TypewriterLine                                                     */
/* ------------------------------------------------------------------ */

export function TypewriterLine({ text, color = 'slate', speed = 40, delay = 0, onDone }: {
  text: string;
  color?: string;
  speed?: number;
  delay?: number;
  onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        const idx = indexRef.current;
        if (idx >= text.length) {
          clearInterval(interval);
          setDone(true);
          onDone?.();
          return;
        }
        indexRef.current = idx + 1;
        setDisplayed(text.slice(0, idx + 1));
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(startDelay);
  }, [text, speed, delay, onDone]);

  return (
    <span className={`text-${color}-400`}>
      {displayed}
      {!done && <span className="animate-pulse">&#9608;</span>}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  ScanningDots                                                       */
/* ------------------------------------------------------------------ */

export function ScanningDots({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-1 ml-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full"
          style={{ background: color }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Common UI helpers                                                  */
/* ------------------------------------------------------------------ */

export function useDemoAnimation(pillars: typeof repoPillars) {
  const [animScores, setAnimScores] = useState(pillars.map((p) => p.score));
  const [demoFixed, setDemoFixed] = useState(false);
  const animRef = useRef<number | null>(null);

  const animateScores = useCallback((targetScores: number[]) => {
    let frame = 0;
    const animate = () => {
      frame++;
      setAnimScores((prev) =>
        prev.map((s, i) => {
          const diff = targetScores[i] - s;
          if (Math.abs(diff) < 0.5) return targetScores[i];
          return s + diff * 0.04;
        })
      );
      if (frame < 120) animRef.current = requestAnimationFrame(animate);
    };
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
  }, []);

  return { animScores, demoFixed, setDemoFixed, setAnimScores, animateScores, animRef };
}

export function DemoHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-14"
    >
      <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed">{subtitle}</p>
    </motion.div>
  );
}

export function ScoreCards({ pillars, animScores, demoFixed, phase }: {
  pillars: typeof repoPillars;
  animScores: number[];
  demoFixed: boolean;
  phase: string;
}) {
  const overallScore = Math.round(animScores.reduce((a, b) => a + b, 0) / 5);
  const initialOverall = Math.round(pillars.map((p) => p.score).reduce((a, b) => a + b, 0) / 5);

  return (
    <div className="space-y-4">
      {pillars.map((p, i) => (
        <ScoreCard
          key={p.name}
          p={p}
          score={Math.round(animScores[i])}
          isFixed={demoFixed}
          isScanning={phase === 'scanning' || phase === 'rescanning'}
          index={i}
        />
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center"
      >
        <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold">Overall AI Readability</span>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-4xl font-bold text-white tabular-nums">{overallScore}</span>
          <span className="text-sm text-neutral-400">/ 100</span>
          {demoFixed && overallScore > initialOverall + 20 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-white"
            >
              <TrendingUp className="w-3 h-3" />+{overallScore - initialOverall}
            </motion.span>
          )}
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full relative"
            style={{
              background: 'linear-gradient(90deg, #ffffff, #a3a3a3)',
              width: `${overallScore}%`,
            }}
          >
            {demoFixed && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </motion.div>
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          {phase === 'scanning' ? 'Scanning signals...' :
           phase === 'rescanning' ? 'Rescanning after fixes...' :
           phase === 'improved' ? 'All fixes applied! Score improved.' :
           phase === 'analyzed' ? 'Missing signals detected' :
           'Ready to scan'}
        </p>
      </motion.div>
    </div>
  );
}

export function TerminalPanel({
  header,
  phase,
  phaseColor,
  phaseLabel,
  phaseDotColor,
  lines,
  processing,
}: {
  header: string;
  phase: string;
  phaseColor: string;
  phaseLabel: string;
  phaseDotColor: string;
  lines: { type: string; text: string }[];
  processing: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="rounded-2xl border border-white/10 bg-[#000000] p-5 font-mono"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-white uppercase tracking-wider">{header}</span>
        <span className="flex items-center gap-1.5 text-xs text-neutral-400">
          <span className={`relative flex h-1.5 w-1.5 ${phase === 'scanning' || phase === 'rescanning' ? 'animate-pulse' : ''}`}>
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${phaseDotColor}`}></span>
          </span>
          <span className="text-neutral-300">{phaseLabel}</span>
        </span>
      </div>
      <div className="rounded-lg bg-[#0a0a0a] border border-white/10 p-4 text-xs leading-relaxed min-h-[180px] max-h-[280px] overflow-y-auto">
        {lines.map((line, i) => (
          <div key={i} className="mb-1">
            <span className={
              line.type === 'cmd' ? 'text-white' :
              line.type === 'out' ? 'text-neutral-400' :
              line.type === 'ok' ? 'text-white' :
              line.type === 'warn' ? 'text-white' :
              line.type === 'vibe' ? 'text-white' :
              line.type === 'commit' ? 'text-white' :
              line.type === 'rescan' ? 'text-white' :
              line.type === 'rec' ? 'text-white' :
              line.type === 'fix' ? 'text-white' : 'text-neutral-400'
            }>
              {line.type === 'cmd' ? '$ ' : line.type === 'out' ? '> ' : line.type === 'ok' ? '\u2713 ' : line.type === 'warn' ? '! ' : line.type === 'vibe' ? '~ ' : line.type === 'commit' ? '\u25CF ' : line.type === 'rescan' ? '\u21BB ' : line.type === 'rec' ? '\u25B6 ' : line.type === 'fix' ? '\u2713 ' : '> '}
            </span>
            <span className={
              line.type === 'cmd' ? 'text-neutral-300' :
              line.type === 'out' ? 'text-neutral-400' :
              line.type === 'ok' ? 'text-neutral-300' :
              line.type === 'warn' ? 'text-neutral-300' :
              line.type === 'vibe' ? 'text-neutral-300' :
              line.type === 'commit' ? 'text-neutral-300' :
              line.type === 'rescan' ? 'text-neutral-300' :
              line.type === 'rec' ? 'text-neutral-300' :
              line.type === 'fix' ? 'text-neutral-300' : 'text-neutral-400'
            }>
              {line.text}
            </span>
          </div>
        ))}
        {processing && (
          <div className="text-neutral-400">
            <span className="text-neutral-400">{'>'} </span>
            <span className="animate-pulse">Processing...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  RepoDemo — GitHub repo scan flow                                   */
/* ------------------------------------------------------------------ */

export function RepoDemo({ isVisible }: { isVisible: boolean }) {
  const { animScores, demoFixed, setDemoFixed, setAnimScores, animateScores, animRef } = useDemoAnimation(repoPillars);
  const [phase, setPhase] = useState('idle');
  const [terminalLines, setTerminalLines] = useState<{ type: string; text: string }[]>([]);
  const [showPromptPanel, setShowPromptPanel] = useState(false);
  const [showVibePanel, setShowVibePanel] = useState(false);
  const [showCommitPanel, setShowCommitPanel] = useState(false);
  const [showRescanPanel, setShowRescanPanel] = useState(false);

  const addLine = useCallback((type: string, text: string) => {
    setTerminalLines((prev) => [...prev, { type, text }]);
  }, []);
  const clearLines = useCallback(() => setTerminalLines([]), []);

  useEffect(() => {
    if (!isVisible) return;
    const cycle = async () => {
      setPhase('idle'); setDemoFixed(false); setAnimScores(repoPillars.map((p) => p.score));
      clearLines(); setShowPromptPanel(false); setShowVibePanel(false); setShowCommitPanel(false); setShowRescanPanel(false);
      await wait(800);

      setPhase('scanning');
      addLine('cmd', 'rain-os scan-repo github.com/acme/webapp');
      await wait(400); addLine('out', 'Connecting to GitHub...');
      await wait(600); addLine('out', 'Scanning README.md...');
      await wait(600); addLine('out', 'Checking package.json...');
      await wait(600); addLine('out', 'Analyzing index.html...');
      await wait(600); addLine('out', 'Looking for llms.txt...');
      await wait(600); addLine('out', 'Checking robots.txt...');
      await wait(600); addLine('out', 'Analyzing source files...');
      await wait(800);

      setPhase('analyzed');
      addLine('warn', '4 missing signals detected');
      await wait(400); addLine('warn', 'llms.txt not found');
      await wait(300); addLine('warn', 'Schema markup missing');
      await wait(300); addLine('warn', 'robots.txt blocking AI crawlers');
      await wait(300); addLine('warn', 'FAQ section missing');
      await wait(800); addLine('ok', 'Scan complete. Score: 45/100');
      await wait(2500);

      setPhase('generating_prompt');
      addLine('cmd', 'rain-os generate-prompt --platform Bolt');
      await wait(400); addLine('out', 'Analyzing missing signals...');
      await wait(600); addLine('out', 'Building platform-specific prompt...');
      await wait(600); addLine('out', 'Optimizing for AI discoverability...');
      await wait(800); addLine('ok', 'Prompt generated successfully');
      await wait(500); setShowPromptPanel(true);
      await wait(2000);

      setPhase('prompt_ready'); await wait(1500);

      setPhase('pasting'); setShowVibePanel(true);
      addLine('vibe', 'Copying prompt to Bolt...');
      await wait(800); addLine('vibe', 'Pasting into builder chat...');
      await wait(800); addLine('vibe', 'AI processing request...');
      await wait(1000); addLine('vibe', 'Changes generated');
      await wait(500);

      setPhase('applying'); setShowCommitPanel(true);
      addLine('commit', 'Creating llms.txt...');
      await wait(500); addLine('commit', 'Adding schema markup to index.html...');
      await wait(500); addLine('commit', 'Updating meta tags...');
      await wait(500); addLine('commit', 'Updating robots.txt...');
      await wait(500); addLine('commit', 'Adding FAQ section...');
      await wait(500); addLine('ok', 'All changes applied');
      await wait(1000);

      setPhase('rescanning'); setShowRescanPanel(true);
      addLine('rescan', 'Rescanning repo...');
      await wait(600); addLine('rescan', 'Checking llms.txt... found');
      await wait(500); addLine('rescan', 'Checking schema... found');
      await wait(500); addLine('rescan', 'Checking robots.txt... valid');
      await wait(500); addLine('rescan', 'Checking FAQ... found');
      await wait(800); addLine('ok', 'Rescan complete');
      await wait(500);

      setPhase('improved'); setDemoFixed(true);
      animateScores(repoPillars.map((p) => p.maxScore));
      await wait(2000);
      addLine('ok', `Score improved from 45 to ${Math.round(repoPillars.map((p) => p.maxScore).reduce((a, b) => a + b, 0) / 5)}`);
      await wait(3000);

      setPhase('resetting'); setDemoFixed(false); setAnimScores(repoPillars.map((p) => p.score));
      setShowPromptPanel(false); setShowVibePanel(false); setShowCommitPanel(false); setShowRescanPanel(false);
      clearLines(); await wait(1000);
    };
    cycle();
    const timer = setInterval(cycle, 25000);
    return () => { clearInterval(timer); if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isVisible, addLine, clearLines, animateScores, setAnimScores, setDemoFixed, animRef]);

  const phaseColor = { idle: 'slate', scanning: 'amber', analyzed: 'red', generating_prompt: 'violet', prompt_ready: 'violet', pasting: 'sky', applying: 'violet', rescanning: 'amber', improved: 'emerald', resetting: 'slate' }[phase];
  const phaseLabel = { idle: 'Idle', scanning: 'Scanning', analyzed: 'Analyzed', generating_prompt: 'Generating', prompt_ready: 'Prompt Ready', pasting: 'Pasting', applying: 'Applying', rescanning: 'Rescanning', improved: 'Improved', resetting: 'Resetting' }[phase];
  const phaseDotColor = { idle: 'bg-neutral-600', scanning: 'bg-white', analyzed: 'bg-neutral-300', generating_prompt: 'bg-white', prompt_ready: 'bg-white', pasting: 'bg-white', applying: 'bg-white', rescanning: 'bg-white', improved: 'bg-white', resetting: 'bg-neutral-600' }[phase];

  return (
    <section className="py-16 px-6 border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        <DemoHeader title="" subtitle="Scan a repo, get a fix prompt, paste it into your vibe builder, and watch the score improve after rescanning." />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScoreCards pillars={repoPillars} animScores={animScores} demoFixed={demoFixed} phase={phase} />
          <div className="space-y-4">
            <TerminalPanel header="rain-os scan" phase={phase} phaseColor={phaseColor} phaseLabel={phaseLabel} phaseDotColor={phaseDotColor} lines={terminalLines} processing={phase === 'scanning' || phase === 'rescanning' || phase === 'generating_prompt' || phase === 'applying'} />
            <AnimatePresence>
              {showPromptPanel && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.5 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Wand2 className="w-3.5 h-3.5" />Fix Prompt Generated</span>
                    <span className="text-xs text-neutral-400">for Bolt</span>
                  </div>
                  <div className="rounded-lg bg-[#0a0a0a] border border-white/10 p-4 text-xs text-neutral-300 leading-relaxed max-h-48 overflow-y-auto">{FIX_PROMPT}</div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400"><ClipboardCopy className="w-3 h-3" /><span>Copied to clipboard</span></div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showVibePanel && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.5 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-3"><span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Send className="w-3.5 h-3.5" />Bolt Builder</span></div>
                  <div className="rounded-lg bg-[#0a0a0a] border border-white/10 p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0"><span className="text-xs text-white">AI</span></div>
                      <div className="text-xs text-neutral-400 leading-relaxed"><span className="text-white font-medium">Prompt pasted. </span>Processing your request to add llms.txt, schema markup, meta tags, and FAQ section...</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400"><span className="w-1 h-1 rounded-full bg-white animate-pulse"></span><span>Generating changes...</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showCommitPanel && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.5 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-3"><span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><GitCommit className="w-3.5 h-3.5" />Changes Applied</span></div>
                  <div className="space-y-2">
                    {[{ file: 'llms.txt', action: 'Created', status: 'added' }, { file: 'index.html', action: 'Schema markup added', status: 'modified' }, { file: 'robots.txt', action: 'Updated for AI crawlers', status: 'modified' }, { file: 'src/App.tsx', action: 'FAQ section added', status: 'modified' }].map((change, i) => (
                      <motion.div key={change.file} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center justify-between rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-2 text-xs">
                        <span className="text-neutral-300">{change.file}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400">{change.action}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">{change.status === 'added' ? 'A' : 'M'}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showRescanPanel && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.5 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-3"><span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" />Rescanning</span></div>
                  <div className="text-xs text-neutral-400 leading-relaxed">Verifying that all fixes were applied correctly and checking new AI Readability scores...</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
