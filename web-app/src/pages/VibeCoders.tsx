import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Zap, GitBranch, Layers, Search, Shield,
  FileCode, Terminal, CheckCircle2, AlertTriangle, Sparkles, Wand2,
  Monitor, Code2, Globe, Cpu, MapPin, BrainCircuit, ShieldCheck, MousePointerClick,
  RotateCcw, TrendingUp, Globe2, Link2, ChevronRight, ScanLine, Radar
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

const urlSignals = [
  {
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.1)',
    border: 'rgba(14,165,233,0.25)',
    Icon: Globe2,
    name: 'AI Readability',
    score: 38,
    maxScore: 92,
    subSignals: [
      { name: 'llms.txt', before: false, after: true },
      { name: 'Schema markup', before: false, after: true },
      { name: 'H1/H2 structure', before: true, after: true },
      { name: 'Content depth', before: false, after: true },
    ],
  },
  {
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    Icon: ShieldCheck,
    name: 'Digital Authority',
    score: 55,
    maxScore: 89,
    subSignals: [
      { name: 'robots.txt', before: false, after: true },
      { name: 'HTTPS', before: true, after: true },
      { name: 'Page speed', before: false, after: true },
      { name: 'OG tags', before: false, after: true },
    ],
  },
  {
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.25)',
    Icon: MousePointerClick,
    name: 'Conversion Readiness',
    score: 40,
    maxScore: 88,
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
    desc: 'Structured data tells AI exactly what your page represents \u2014 product, article, organization, FAQ. Without it, AI guesses. Most vibe tools don\'t add schema automatically.',
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
                    <motion.div
                      key="warn"
                      initial={{ scale: 1 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
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

function LiveDemo({
  title,
  subtitle,
  pillars,
  fixPrompt,
  type,
  isVisible,
}: {
  title: string;
  subtitle: string;
  pillars: typeof repoPillars;
  fixPrompt: string;
  type: 'repo' | 'url';
  isVisible: boolean;
}) {
  const [demoFixed, setDemoFixed] = useState(false);
  const [animScores, setAnimScores] = useState(pillars.map((p) => p.score));
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'fixing' | 'done'>('idle');
  const [stepText, setStepText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const typeIndex = useRef(0);

  const scanMessages = type === 'repo'
    ? [
        'Scanning README...',
        'Checking package.json...',
        'Analyzing index.html...',
        'Looking for llms.txt...',
        'Checking robots.txt...',
        'Analyzing source files...',
      ]
    : [
        'Fetching page...',
        'Analyzing HTML structure...',
        'Checking meta tags...',
        'Looking for schema markup...',
        'Checking robots.txt...',
        'Analyzing content structure...',
      ];

  useEffect(() => {
    if (!isVisible) return;

    const cycle = async () => {
      // Phase 1: Scanning
      setPhase('scanning');
      setDemoFixed(false);
      setAnimScores(pillars.map((p) => p.score));

      // Typewriter scan messages
      for (const msg of scanMessages) {
        setStepText(msg);
        await new Promise((r) => setTimeout(r, 600));
      }

      // Phase 2: Fixing
      setPhase('fixing');
      setDemoFixed(true);
      const targets = pillars.map((p) => p.maxScore);
      let frame = 0;
      const animateUp = () => {
        frame++;
        setAnimScores((prev) =>
          prev.map((s, i) => {
            const diff = targets[i] - s;
            if (Math.abs(diff) < 0.5) return targets[i];
            return s + diff * 0.05;
          })
        );
        if (frame < 100) requestAnimationFrame(animateUp);
      };
      requestAnimationFrame(animateUp);
      setStepText('Applying AI fixes...');
      await new Promise((r) => setTimeout(r, 3500));

      // Phase 3: Done
      setPhase('done');
      setStepText('Done! Score improved.');
      await new Promise((r) => setTimeout(r, 2500));

      // Reset
      setPhase('idle');
      setDemoFixed(false);
      setAnimScores(pillars.map((p) => p.score));
      setStepText('');
      await new Promise((r) => setTimeout(r, 500));
    };

    cycle();
    const timer = setInterval(cycle, 10000);
    return () => clearInterval(timer);
  }, [isVisible, pillars]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  const overallScore = Math.round(animScores.reduce((a, b) => a + b, 0) / 3);

  return (
    <section className="py-20 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score cards */}
          <div className="space-y-4">
            {pillars.map((p, i) => (
              <ScoreCard
                key={p.name}
                p={p}
                score={Math.round(animScores[i])}
                isFixed={demoFixed}
                isScanning={phase === 'scanning'}
                index={i}
              />
            ))}
          </div>

          {/* Terminal panel */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl border border-white/10 bg-[#0a0f1e] p-5 font-mono"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                  {type === 'repo' ? 'rain-os scan' : 'rain-os url-scan'}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  {phase === 'scanning' && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
                    </span>
                  )}
                  {phase === 'fixing' && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400"></span>
                    </span>
                  )}
                  {phase === 'done' && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                    </span>
                  )}
                  <span className={
                    phase === 'scanning' ? 'text-amber-400' :
                    phase === 'fixing' ? 'text-violet-400' :
                    phase === 'done' ? 'text-emerald-400' : 'text-slate-500'
                  }>
                    {phase === 'scanning' ? 'Scanning' : phase === 'fixing' ? 'Fixing' : phase === 'done' ? 'Complete' : 'Idle'}
                  </span>
                </span>
              </div>

              {/* Terminal output */}
              <div className="rounded-lg bg-[#060912] border border-white/[0.06] p-4 text-xs leading-relaxed min-h-[120px]">
                <div className="text-slate-400 mb-2">
                  <span className="text-emerald-400">$</span> rain-os {type === 'repo' ? 'scan-repo' : 'scan-url'} {type === 'repo' ? 'github.com/acme/webapp' : 'https://acme.com'}
                </div>
                <div className="text-slate-500 mb-2">
                  {phase === 'idle' ? (
                    <span className="animate-pulse">Waiting for input...</span>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={stepText}
                    >
                      <span className="text-sky-400">&gt;</span>{' '}
                      <span className="text-slate-300">{stepText}</span>
                      <span className={cursorVisible ? 'text-slate-300' : 'text-transparent'}>█</span>
                    </motion.div>
                  )}
                </div>
                {phase === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-400"
                  >
                    <span className="text-emerald-400">&#10003;</span> Score improved from {pillars.map((p) => p.score).reduce((a, b) => a + b, 0) / 3 | 0} to {overallScore}
                  </motion.div>
                )}
              </div>

              {/* Fix prompt */}
              <div className="mt-4 rounded-lg bg-[#060912] border border-white/[0.06] p-4 max-h-48 overflow-y-auto">
                <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">Fix prompt generated</div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {fixPrompt}
                </div>
              </div>
            </motion.div>

            {/* Overall score */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center"
            >
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Overall AI Readability</span>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-white tabular-nums">{overallScore}</span>
                <span className="text-sm text-slate-500">/ 100</span>
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
                {phase === 'scanning' ? 'Scanning signals...' : phase === 'fixing' ? 'Applying fixes...' : phase === 'done' ? 'All fixes applied!' : 'Ready to scan'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function VibeCoders() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [repoDemoVisible, setRepoDemoVisible] = useState(false);
  const [urlDemoVisible, setUrlDemoVisible] = useState(false);

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
          <LiveDemo
            title="Repo Scanner — Live in Action"
            subtitle="Watch a real GitHub repo get scanned and fixed in real time. Scores climb, signals turn green, and the fix prompt generates automatically."
            pillars={repoPillars}
            fixPrompt={FIX_PROMPT}
            type="repo"
            isVisible={repoDemoVisible}
          />
        </motion.div>

        {/* URL Scanner Demo */}
        <motion.div
          onViewportEnter={() => setUrlDemoVisible(true)}
          viewport={{ once: true, margin: '-100px' }}
        >
          <LiveDemo
            title="URL Scanner — Live in Action"
            subtitle="See how any website gets analyzed for AI discoverability. No repo needed — just a URL. Same three-pillar breakdown, same fix prompt generation."
            pillars={urlSignals}
            fixPrompt={URL_FIX_PROMPT}
            type="url"
            isVisible={urlDemoVisible}
          />
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
