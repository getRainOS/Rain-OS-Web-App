import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Zap, GitBranch, Layers, Search, Shield,
  FileCode, Terminal, CheckCircle2, AlertTriangle, Sparkles, Wand2,
  Monitor, Code2, Globe, Cpu, MapPin, BrainCircuit, ShieldCheck, MousePointerClick,
  RotateCcw, TrendingUp, ChevronRight,
  Copy, Check, ClipboardCopy, GitCommit, Send, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';
import { LocalBusinessBadge } from '@/components/marketing/MarketingComponents';

const ROTATING_WORDS = ['SaaS?', 'Website?', 'Web App?', 'Portfolio?', 'Landing Page?', 'Store?', 'Product?', 'Blog?', 'App?'];

const repoPillars = [
  {
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.1)',
    border: 'rgba(14,165,233,0.25)',
    Icon: BrainCircuit,
    name: 'AI Readability',
    score: 42,
    maxScore: 94,
    subSignals: [
      { name: 'llms.txt', before: false, after: true },
      { name: 'Schema markup', before: false, after: true },
      { name: 'H1/H2 structure', before: true, after: true },
      { name: 'Meta tags', before: false, after: true },
    ],
  },
  {
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    Icon: ShieldCheck,
    name: 'Digital Authority',
    score: 58,
    maxScore: 91,
    subSignals: [
      { name: 'README quality', before: true, after: true },
      { name: 'robots.txt', before: false, after: true },
      { name: 'Canonical URL', before: true, after: true },
      { name: 'OG tags', before: false, after: true },
    ],
  },
  {
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.25)',
    Icon: MousePointerClick,
    name: 'Conversion Readiness',
    score: 35,
    maxScore: 87,
    subSignals: [
      { name: 'FAQ section', before: false, after: true },
      { name: 'Bullet answers', before: false, after: true },
      { name: 'CTA clarity', before: true, after: true },
      { name: 'Lead paragraph', before: false, after: true },
    ],
  },
];


const vibeSignals = [
  {
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.2)',
    Icon: FileCode,
    name: 'llms.txt Presence',
    desc: 'The single most important file for AI discoverability. Tells LLMs what your app does, how to use it, and where key info lives. Most vibe-coded sites skip this entirely.',
  },
  {
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.1)',
    border: 'rgba(14,165,233,0.2)',
    Icon: Search,
    name: 'Meta Description & OG Tags',
    desc: 'AI engines use meta descriptions and Open Graph tags to understand your page before they render it. Missing these means AI has no context to cite you.',
  },
  {
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.2)',
    Icon: Shield,
    name: 'robots.txt & Crawler Access',
    desc: 'Is your robots.txt blocking GPTBot, ChatGPT-User, or other AI crawlers? Many vibe-coded sites inherit restrictive defaults that hide them from AI search.',
  },
  {
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.2)',
    Icon: Code2,
    name: 'Schema Markup (JSON-LD)',
    desc: 'Structured data tells AI exactly what your page represents — product, article, organization, FAQ. Without it, AI guesses. Most vibe tools don\'t add schema automatically.',
  },
  {
    color: '#fb7185',
    bg: 'rgba(251,113,133,0.1)',
    border: 'rgba(251,113,133,0.2)',
    Icon: Monitor,
    name: 'SSR vs SPA Detection',
    desc: 'Vibe-coded SPAs (Vite, CRA) render content in JavaScript. AI crawlers often see a blank page. We detect this and flag it as high-risk for AI discoverability.',
  },
  {
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.18)',
    Icon: Terminal,
    name: 'README & Package.json Quality',
    desc: 'Your README is often the first thing AI reads about your project. Missing install steps, unclear description, or no keywords in package.json hurts discoverability.',
  },
  {
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.08)',
    border: 'rgba(14,165,233,0.18)',
    Icon: Globe,
    name: 'Canonical URL & index.html',
    desc: 'Duplicate content and missing canonical tags confuse AI. We check your index.html for title tags, meta viewport, and proper head structure.',
  },
  {
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.18)',
    Icon: Cpu,
    name: 'AI-Ready Content Structure',
    desc: 'Clear H1/H2 hierarchy, FAQ sections, bullet-point answers. AI extracts the first 1-2 sentences of each section. If your lead is vague, AI moves to a competitor.',
  },
];

const platforms = [
  'Bolt', 'Lovable', 'Cursor', 'v0', 'Replit', 'Windsurf',
  'Base44', 'lovable.dev', 'Framer', 'Webflow',
];

const steps = [
  { num: '01', title: 'Connect your GitHub repo or URL', desc: 'One-click OAuth for repo access, or paste any URL. We scan README, package.json, index.html, llms.txt, robots.txt, and source files.' },
  { num: '02', title: 'Get your AI Readability Score', desc: 'See exactly which signals are missing and how they affect whether ChatGPT, Gemini, and Perplexity can discover and cite your site.' },
  { num: '03', title: 'Copy the fix prompt', desc: 'Pick your vibe platform (Bolt, Lovable, Cursor, etc.) and get a platform-specific prompt. Paste it into your builder\'s AI and watch the fixes apply automatically.' },
];

const FIX_PROMPT = `Add llms.txt to the root of the repo with a concise description of what this app does, how to install it, and where key files live. Then add JSON-LD schema markup to index.html (Organization type with name, url, description). Add meta description and Open Graph tags (og:title, og:description, og:image). Ensure H1/H2 hierarchy is clear and add an FAQ section with 3-5 questions in a <details> block. Update robots.txt to allow GPTBot and ChatGPT-User.`;

const URL_FIX_PROMPT = `Add llms.txt to the root with a description of what this site does. Add JSON-LD schema markup (Organization type with name, url, description). Add meta description and Open Graph tags (og:title, og:description, og:image). Ensure H1/H2 hierarchy is clear, add an FAQ section with 3-5 questions, and include bullet-point answers for AI extraction. Add a clear lead paragraph in the first sentence of each section.`;

/* ------------------------------------------------------------------ */
/*  ScoreCard                                                          */
/* ------------------------------------------------------------------ */
function ScoreCard({ p, score, isFixed, isScanning, index }: {
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
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: p.bg, border: `1px solid ${p.border}` }}>
            <p.Icon className="w-4 h-4" style={{ color: p.color }} />
          </div>
          <span className="text-sm font-semibold text-white">{p.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums" style={{ color: p.color }}>{score}</span>
          <span className="text-xs text-slate-500">/ 100</span>
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
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </span>
              <span className={isSignalFixed ? 'text-white font-medium' : 'text-slate-400'}>
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
            boxShadow: isFixed ? `0 0 12px ${p.color}44` : 'none',
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
function TerminalLine({ type, text, color = 'sky', delay = 0 }: {
  type: 'cmd' | 'out' | 'ok' | 'warn' | 'prompt' | 'vibe' | 'commit' | 'rescan';
  text: string;
  color?: 'sky' | 'emerald' | 'amber' | 'violet' | 'red' | 'slate' | 'white';
  delay?: number;
}) {
  const colorMap: Record<string, string> = {
    sky: 'text-sky-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    violet: 'text-violet-400',
    red: 'text-red-400',
    slate: 'text-slate-400',
    white: 'text-white',
  };

  const iconMap: Record<string, React.ReactNode> = {
    cmd: <span className="text-emerald-400 mr-1">$</span>,
    out: <span className="text-slate-500 mr-1">&gt;</span>,
    ok: <span className="text-emerald-400 mr-1">&#10003;</span>,
    warn: <span className="text-amber-400 mr-1">!</span>,
    prompt: <span className="text-violet-400 mr-1">&#9654;</span>,
    vibe: <span className="text-violet-400 mr-1">~</span>,
    commit: <span className="text-sky-400 mr-1">&#9679;</span>,
    rescan: <span className="text-amber-400 mr-1">&#8635;</span>,
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
function TypewriterLine({ text, color = 'slate', speed = 40, delay = 0, onDone }: {
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
function ScanningDots({ color }: { color: string }) {
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
function useDemoAnimation(pillars: typeof repoPillars) {
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

function DemoHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-14"
    >
      <div className="inline-flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="text-emerald-400 font-bold tracking-wider text-xs uppercase">Live demo</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">{title}</h2>
      <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">{subtitle}</p>
    </motion.div>
  );
}

function ScoreCards({ pillars, animScores, demoFixed, phase }: {
  pillars: typeof repoPillars;
  animScores: number[];
  demoFixed: boolean;
  phase: string;
}) {
  const overallScore = Math.round(animScores.reduce((a, b) => a + b, 0) / 3);
  const initialOverall = Math.round(pillars.map((p) => p.score).reduce((a, b) => a + b, 0) / 3);

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
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center"
      >
        <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Overall AI Readability</span>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-4xl font-bold text-white tabular-nums">{overallScore}</span>
          <span className="text-sm text-slate-500">/ 100</span>
          {demoFixed && overallScore > initialOverall + 20 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400"
            >
              <TrendingUp className="w-3 h-3" />+{overallScore - initialOverall}
            </motion.span>
          )}
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full relative"
            style={{
              background: 'linear-gradient(90deg, #8b5cf6, #0ea5e9)',
              width: `${overallScore}%`,
              boxShadow: demoFixed ? '0 0 20px rgba(139,92,246,0.3)' : 'none',
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
        <p className="mt-3 text-xs text-slate-500">
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

function TerminalPanel({
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
      className="rounded-2xl border border-white/10 bg-[#0a0f1e] p-5 font-mono"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">{header}</span>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className={`relative flex h-1.5 w-1.5 ${phase === 'scanning' || phase === 'rescanning' ? 'animate-pulse' : ''}`}>
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${phaseDotColor}`}></span>
          </span>
          <span className={`text-${phaseColor}-400`}>{phaseLabel}</span>
        </span>
      </div>
      <div className="rounded-lg bg-[#060912] border border-white/[0.06] p-4 text-xs leading-relaxed min-h-[180px] max-h-[280px] overflow-y-auto">
        {lines.map((line, i) => (
          <div key={i} className="mb-1">
            <span className={
              line.type === 'cmd' ? 'text-emerald-400' :
              line.type === 'out' ? 'text-slate-500' :
              line.type === 'ok' ? 'text-emerald-400' :
              line.type === 'warn' ? 'text-amber-400' :
              line.type === 'vibe' ? 'text-violet-400' :
              line.type === 'commit' ? 'text-sky-400' :
              line.type === 'rescan' ? 'text-amber-400' :
              line.type === 'rec' ? 'text-violet-400' :
              line.type === 'fix' ? 'text-emerald-400' : 'text-slate-400'
            }>
              {line.type === 'cmd' ? '$ ' : line.type === 'out' ? '> ' : line.type === 'ok' ? '\u2713 ' : line.type === 'warn' ? '! ' : line.type === 'vibe' ? '~ ' : line.type === 'commit' ? '\u25CF ' : line.type === 'rescan' ? '\u21BB ' : line.type === 'rec' ? '\u25B6 ' : line.type === 'fix' ? '\u2713 ' : '> '}
            </span>
            <span className={
              line.type === 'cmd' ? 'text-slate-300' :
              line.type === 'out' ? 'text-slate-400' :
              line.type === 'ok' ? 'text-emerald-300' :
              line.type === 'warn' ? 'text-amber-300' :
              line.type === 'vibe' ? 'text-violet-300' :
              line.type === 'commit' ? 'text-sky-300' :
              line.type === 'rescan' ? 'text-amber-300' :
              line.type === 'rec' ? 'text-violet-300' :
              line.type === 'fix' ? 'text-emerald-300' : 'text-slate-400'
            }>
              {line.text}
            </span>
          </div>
        ))}
        {processing && (
          <div className="text-slate-500">
            <span className="text-slate-500">{'>'} </span>
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
function RepoDemo({ isVisible }: { isVisible: boolean }) {
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
      addLine('ok', `Score improved from 45 to ${Math.round(repoPillars.map((p) => p.maxScore).reduce((a, b) => a + b, 0) / 3)}`);
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
  const phaseDotColor = { idle: 'bg-slate-400', scanning: 'bg-amber-400', analyzed: 'bg-red-400', generating_prompt: 'bg-violet-400', prompt_ready: 'bg-violet-400', pasting: 'bg-sky-400', applying: 'bg-violet-400', rescanning: 'bg-amber-400', improved: 'bg-emerald-400', resetting: 'bg-slate-400' }[phase];

  return (
    <section className="py-20 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <DemoHeader title="Repo Scanner — Full Workflow" subtitle="Watch the complete journey: scan a repo, get a fix prompt, paste it into your vibe builder, and watch the score improve after rescanning." />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScoreCards pillars={repoPillars} animScores={animScores} demoFixed={demoFixed} phase={phase} />
          <div className="space-y-4">
            <TerminalPanel header="rain-os scan" phase={phase} phaseColor={phaseColor} phaseLabel={phaseLabel} phaseDotColor={phaseDotColor} lines={terminalLines} processing={phase === 'scanning' || phase === 'rescanning' || phase === 'generating_prompt' || phase === 'applying'} />
            <AnimatePresence>
              {showPromptPanel && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.5 }} className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.03] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2"><Wand2 className="w-3.5 h-3.5" />Fix Prompt Generated</span>
                    <span className="text-xs text-slate-500">for Bolt</span>
                  </div>
                  <div className="rounded-lg bg-[#060912] border border-white/[0.06] p-4 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">{FIX_PROMPT}</div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500"><ClipboardCopy className="w-3 h-3" /><span>Copied to clipboard</span></div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showVibePanel && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.5 }} className="rounded-2xl border border-sky-400/20 bg-sky-500/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-3"><span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2"><Send className="w-3.5 h-3.5" />Bolt Builder</span></div>
                  <div className="rounded-lg bg-[#060912] border border-white/[0.06] p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-400/20 flex items-center justify-center shrink-0"><span className="text-xs text-violet-400">AI</span></div>
                      <div className="text-xs text-slate-400 leading-relaxed"><span className="text-sky-400 font-medium">Prompt pasted. </span>Processing your request to add llms.txt, schema markup, meta tags, and FAQ section...</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500"><span className="w-1 h-1 rounded-full bg-sky-400 animate-pulse"></span><span>Generating changes...</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showCommitPanel && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.5 }} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-3"><span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2"><GitCommit className="w-3.5 h-3.5" />Changes Applied</span></div>
                  <div className="space-y-2">
                    {[{ file: 'llms.txt', action: 'Created', status: 'added' }, { file: 'index.html', action: 'Schema markup added', status: 'modified' }, { file: 'robots.txt', action: 'Updated for AI crawlers', status: 'modified' }, { file: 'src/App.tsx', action: 'FAQ section added', status: 'modified' }].map((change, i) => (
                      <motion.div key={change.file} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center justify-between rounded-lg bg-[#060912] border border-white/[0.06] px-3 py-2 text-xs">
                        <span className="text-slate-300">{change.file}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{change.action}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${change.status === 'added' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-sky-400/10 text-sky-400'}`}>{change.status === 'added' ? 'A' : 'M'}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showRescanPanel && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.5 }} className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-3"><span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" />Rescanning</span></div>
                  <div className="text-xs text-slate-400 leading-relaxed">Verifying that all fixes were applied correctly and checking new AI Readability scores...</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function VibeCoders() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [repoDemoVisible, setRepoDemoVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-violet-500/30">
      <MarketingNav
        onGetStartedClick={() => navigate('/login')}
        onLoginClick={() => navigate('/login?mode=login')}
      />

      <main className="flex-grow">
        {/* Hero */}
        <section className="pt-44 pb-28 relative z-10 px-6 overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, rgba(14,165,233,0.08) 40%, transparent 70%)',
            }}
          />
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex justify-end w-full">
              <LocalBusinessBadge />
            </div>
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Rotating subheading */}
              <div className="mb-4">
                <span
                  className="inline-flex items-center gap-1 flex-wrap justify-center text-xl md:text-2xl lg:text-3xl font-semibold text-white"
                  style={{ letterSpacing: '-0.04em', fontFeatureSettings: '"cv11" on, "ss01" on, "calt" on' }}
                >
                  <span>Vibe Coded Your</span>
                  <span className="inline-block relative text-violet-400">
                    {ROTATING_WORDS.map((word, i) => (
                      <span
                        key={word}
                        className="absolute left-0 top-1/2 -translate-y-1/2 transition-opacity duration-500 ease-in-out whitespace-nowrap"
                        style={{ opacity: i === wordIndex ? 1 : 0 }}
                        aria-hidden={i !== wordIndex}
                      >
                        {word}
                      </span>
                    ))}
                    <span className="invisible whitespace-nowrap">Landing Page?</span>
                  </span>
                </span>
              </div>

              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.08] text-white mb-6"
                style={{ letterSpacing: '-0.04em' }}
              >
                Your vibe-coded site is{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #c4b5fd, #38bdf8)' }}
                >
                  invisible to AI.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Bolt, Lovable, Cursor, and v0 build beautiful sites fast. But AI crawlers can't read them. Missing schema, no llms.txt, JS-rendered content — if LLMs can't parse your page, you won't be cited.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {platforms.map((label) => (
                <span
                  key={label}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(139,92,246,0.08)',
                    border: '1px solid rgba(167,139,250,0.2)',
                    color: '#c4b5fd',
                  }}
                >
                  {label}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-white rounded-xl px-8 py-3.5 text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 group"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)',
                  boxShadow: '0 8px 24px rgba(139,92,246,0.25)',
                }}
              >
                Scan my repo or URL free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* The Problem */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                Vibe coding is fast. AI discoverability is slow.
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
                You shipped in 10 minutes. But when someone asks ChatGPT "What's the best tool for X?" or searches on Perplexity, your site isn't even in the conversation. Here's why.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  label: 'The vibe coder trap',
                  body: 'You built something amazing in Bolt or Lovable. It looks perfect. But AI crawlers see a blank page or missing context. Zero citations = zero AI traffic.',
                  dim: true,
                },
                {
                  label: 'What AI actually reads',
                  body: "ChatGPT, Gemini, and Perplexity read your llms.txt, meta tags, schema markup, and robots.txt before they ever render your React components. If those are missing, you're not in the index.",
                  highlight: true,
                },
                {
                  label: 'The rain OS fix',
                  body: 'Connect your repo or URL, scan in seconds, get a score, then copy a platform-specific prompt. Paste it back into your vibe builder and let AI fix what AI broke.',
                  dim: false,
                },
              ].map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`rounded-2xl border p-6 ${
                    c.highlight
                      ? 'border-violet-400/30 bg-violet-500/5'
                      : c.dim
                      ? 'border-white/5 bg-white/[0.02]'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <p
                    className={`text-sm font-bold mb-2 ${
                      c.highlight ? 'text-violet-300' : c.dim ? 'text-slate-600' : 'text-white'
                    }`}
                  >
                    {c.label}
                  </p>
                  <p className={`text-sm leading-relaxed ${c.dim ? 'text-slate-600' : 'text-slate-400'}`}>{c.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Analyze */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="text-violet-400 font-bold tracking-wider text-xs uppercase mb-3 block">8 signals scored</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">What we analyze in your repo or URL</h2>
              <p className="text-slate-400 max-w-xl leading-relaxed">
                Each signal has a direct impact on whether AI search engines can discover, understand, and cite your vibe-coded project.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {vibeSignals.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: p.bg, border: `1px solid ${p.border}` }}
                  >
                    <p.Icon className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">{p.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Repo Scanner Demo */}
        <motion.div
          onViewportEnter={() => setRepoDemoVisible(true)}
          viewport={{ once: true, margin: '-100px' }}
        >
          <RepoDemo isVisible={repoDemoVisible} />
        </motion.div>

        {/* How It Works */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="text-violet-400 font-bold tracking-wider text-xs uppercase mb-3 block">Simple workflow</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">From invisible to cited in three steps</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <span className="text-5xl font-bold text-white/[0.06] block mb-4">{s.num}</span>
                  <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Three Pillars — Dynamic Scores */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="text-violet-400 font-bold tracking-wider text-xs uppercase mb-3 block">Scoring breakdown</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Three pillars, granular signals</h2>
              <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
                Every repo scan and URL check breaks down into these three core areas. Click any signal to see what we check.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {repoPillars.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl border p-6"
                  style={{
                    borderColor: p.border,
                    background: p.bg,
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${p.border}` }}>
                      <p.Icon className="w-5 h-5" style={{ color: p.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                      <span className="text-xs text-slate-400">4 signals scored</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {p.subSignals.map((sig, j) => (
                      <div
                        key={sig.name}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                        style={{
                          background: 'rgba(0,0,0,0.15)',
                          border: `1px solid ${p.border}`,
                        }}
                      >
                        <span className="flex items-center justify-center w-4 h-4 rounded-full shrink-0" style={{ background: 'rgba(0,0,0,0.2)' }}>
                          <CheckCircle2 className="w-3 h-3" style={{ color: p.color }} />
                        </span>
                        <span className="text-slate-300">{sig.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t" style={{ borderColor: p.border }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Weight in overall score</span>
                      <span className="text-xs font-bold" style={{ color: p.color }}>
                        {i === 0 ? '40%' : i === 1 ? '30%' : '30%'}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-black/20 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${p.color}, ${p.color}88)`,
                          width: `${i === 0 ? 40 : 30}%`,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-[28px] border border-violet-400/20 bg-violet-500/[0.03] p-10"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Stop building in the dark.</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                Scan your repo or URL for AI discoverability. Check any URL for technical AI-readiness signals. Free to start, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-white rounded-xl px-8 py-3.5 text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 group"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)',
                    boxShadow: '0 8px 24px rgba(139,92,246,0.25)',
                  }}
                >
                  Scan my repo or URL free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-midnight py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <span className="font-bold text-3xl tracking-tighter text-white">
            r<span className="text-sky-400">ai</span>n
          </span>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="/support" className="hover:text-white transition-colors">
              Support
            </a>
          </div>
          <div className="text-right text-xs text-slate-600">
            © {new Date().getFullYear()} rain OS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
