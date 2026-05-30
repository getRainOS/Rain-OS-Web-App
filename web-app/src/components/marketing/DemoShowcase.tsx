import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ShieldCheck, MousePointerClick, Target, ArrowRight, GitBranch, Globe, FileText, AlertTriangle, CheckCircle2, Sparkles, Zap } from 'lucide-react';

const STATES = [
  {
    mode: 'Repo Analysis',
    modeIcon: GitBranch,
    modeColor: '#34d399',
    modeBg: 'rgba(16,185,129,0.12)',
    modeBorder: 'rgba(16,185,129,0.3)',
    label: 'Bolt App — Before',
    score: 31,
    color: '#f87171',
    glow: 'rgba(248,113,113,0.2)',
    status: 'Critical gaps found',
    statusColor: '#f87171',
    pillars: [
      { name: 'AI Readability', score: 22, color: '#38bdf8', Icon: BrainCircuit },
      { name: 'Digital Authority', score: 29, color: '#34d399', Icon: ShieldCheck },
      { name: 'Conversion', score: 38, color: '#a78bfa', Icon: MousePointerClick },
      { name: 'Discoverability', score: 35, color: '#fb923c', Icon: Target },
    ],
    signals: [
      { label: 'llms.txt missing', ok: false },
      { label: 'No schema markup', ok: false },
      { label: 'JS-only rendering', ok: false },
    ],
  },
  {
    mode: 'Repo Analysis',
    modeIcon: GitBranch,
    modeColor: '#34d399',
    modeBg: 'rgba(16,185,129,0.12)',
    modeBorder: 'rgba(16,185,129,0.3)',
    label: 'Bolt App — After',
    score: 89,
    color: '#34d399',
    glow: 'rgba(52,211,153,0.2)',
    status: 'AI-ready',
    statusColor: '#34d399',
    pillars: [
      { name: 'AI Readability', score: 91, color: '#38bdf8', Icon: BrainCircuit },
      { name: 'Digital Authority', score: 87, color: '#34d399', Icon: ShieldCheck },
      { name: 'Conversion', score: 88, color: '#a78bfa', Icon: MousePointerClick },
      { name: 'Discoverability', score: 90, color: '#fb923c', Icon: Target },
    ],
    signals: [
      { label: 'llms.txt present', ok: true },
      { label: 'Schema markup added', ok: true },
      { label: 'Static fallback added', ok: true },
    ],
  },
  {
    mode: 'URL Scanner',
    modeIcon: Globe,
    modeColor: '#a78bfa',
    modeBg: 'rgba(139,92,246,0.12)',
    modeBorder: 'rgba(139,92,246,0.3)',
    label: 'Landing Page Scan',
    score: 67,
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.2)',
    status: 'Needs improvement',
    statusColor: '#fbbf24',
    pillars: [
      { name: 'AI Readability', score: 61, color: '#38bdf8', Icon: BrainCircuit },
      { name: 'Digital Authority', score: 72, color: '#34d399', Icon: ShieldCheck },
      { name: 'Conversion', score: 69, color: '#a78bfa', Icon: MousePointerClick },
      { name: 'Discoverability', score: 66, color: '#fb923c', Icon: Target },
    ],
    signals: [
      { label: 'Open Graph present', ok: true },
      { label: 'Missing FAQ schema', ok: false },
      { label: 'robots.txt found', ok: true },
    ],
  },
  {
    mode: 'Content Analysis',
    modeIcon: FileText,
    modeColor: '#38bdf8',
    modeBg: 'rgba(14,165,233,0.12)',
    modeBorder: 'rgba(14,165,233,0.3)',
    label: 'Blog Post — Optimized',
    score: 94,
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.25)',
    status: 'Highly citable',
    statusColor: '#38bdf8',
    pillars: [
      { name: 'AI Readability', score: 96, color: '#38bdf8', Icon: BrainCircuit },
      { name: 'Digital Authority', score: 91, color: '#34d399', Icon: ShieldCheck },
      { name: 'Conversion', score: 95, color: '#a78bfa', Icon: MousePointerClick },
      { name: 'Discoverability', score: 94, color: '#fb923c', Icon: Target },
    ],
    signals: [
      { label: 'Answer-first format', ok: true },
      { label: 'High info gain score', ok: true },
      { label: 'Strong entity clarity', ok: true },
    ],
  },
];

interface DemoShowcaseProps {
  onAnalyzeClick: () => void;
}

export const DemoShowcase = ({ onAnalyzeClick }: DemoShowcaseProps) => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const data = STATES[idx];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % STATES.length), 4200);
    return () => clearInterval(t);
  }, [paused]);

  const circumference = 2 * Math.PI * 48;
  const dashOffset = circumference - (data.score / 100) * circumference;
  const ModeIcon = data.modeIcon;

  return (
    <section className="py-20 relative z-10 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
        <div className="text-center mb-14">
          <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">Live preview</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            Your Rain Score, in real time
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Every analysis mode returns the same five-pillar score — whether you paste content, scan a URL, or connect your GitHub repo. See what that looks like across the full platform.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {STATES.map((s, i) => {
            const Icon = s.modeIcon;
            const active = i === idx;
            return (
              <button
                key={i}
                onClick={() => { setIdx(i); setPaused(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300"
                style={{
                  background: active ? s.modeBg : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? s.modeBorder : 'rgba(255,255,255,0.08)'}`,
                  color: active ? s.modeColor : '#64748b',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.mode}
                {i < 2 && <span className="text-[9px] opacity-60 font-normal normal-case tracking-normal">{i === 0 ? 'before' : 'after'}</span>}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left — copy */}
          <div className="flex-1 max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx + '-copy'}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: data.modeBg, border: `1px solid ${data.modeBorder}` }}>
                    <ModeIcon className="w-4 h-4" style={{ color: data.modeColor }} />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: data.modeColor }}>{data.mode}</span>
                </div>

                {idx === 0 && (
                  <>
                    <h3 className="text-2xl font-semibold text-white mb-4 leading-snug">Your Bolt app is invisible to AI — here's why</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">Connect your GitHub repo and rain OS reads the actual source files your AI tool generated. Most vibe-coded apps score below 40 before optimization — missing llms.txt, no schema, JS-only rendering.</p>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                      <span className="text-sm text-rose-300">3 critical AEO gaps found in source</span>
                    </div>
                  </>
                )}
                {idx === 1 && (
                  <>
                    <h3 className="text-2xl font-semibold text-white mb-4 leading-snug">Same repo. Fixed in one pass. Score jumped 58 points.</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">After acting on rain OS recommendations — adding llms.txt, schema markup, and a static HTML fallback — the same Bolt app went from invisible to highly citable.</p>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="text-sm text-emerald-300">All critical gaps resolved</span>
                    </div>
                  </>
                )}
                {idx === 2 && (
                  <>
                    <h3 className="text-2xl font-semibold text-white mb-4 leading-snug">Scan any live URL and see every technical AEO signal</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">Paste a URL and rain OS fetches the raw HTML — the same way AI crawlers see it. Surface missing schema, robots issues, open graph gaps, and llms.txt status in seconds.</p>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                      <span className="text-sm text-amber-300">2 fixable issues found — score impact: +18pts</span>
                    </div>
                  </>
                )}
                {idx === 3 && (
                  <>
                    <h3 className="text-2xl font-semibold text-white mb-4 leading-snug">Paste any content and watch it score across all five pillars</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">Works on blog posts, landing pages, product copy, or anything else. Get a weighted Rain Score with actionable recommendations — and built-in rewrite tools to fix issues without leaving the dashboard.</p>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/20">
                      <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
                      <span className="text-sm text-sky-300">Highly citable — AI engines will quote this</span>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <button
              onClick={onAnalyzeClick}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors mt-8"
            >
              Try it free with your own content
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Right — animated score card */}
          <div className="w-full lg:w-auto lg:shrink-0">
            <div className="relative w-full max-w-[340px] mx-auto">
              <div className="absolute -inset-[1px] rounded-[24px] pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${data.modeBorder}, rgba(255,255,255,0.03), rgba(139,92,246,0.08))` }} />

              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[24px] p-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(to right, transparent, ${data.modeColor}50, transparent)` }} />

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: data.modeColor }} />
                    <span className="text-xs font-semibold text-slate-400">Rain OS Analysis</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={idx + '-badge'}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: data.modeBg, border: `1px solid ${data.modeBorder}`, color: data.modeColor }}
                    >
                      <ModeIcon className="w-3 h-3" />
                      {data.mode}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Score ring + pillars */}
                <div className="flex items-center gap-5 mb-5">
                  <div className="relative w-[96px] h-[96px] shrink-0 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                      <AnimatePresence mode="wait">
                        <motion.circle
                          key={idx}
                          cx="56" cy="56" r="48"
                          fill="none"
                          stroke={data.color}
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset: dashOffset }}
                          exit={{ strokeDashoffset: circumference }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          style={{ filter: `drop-shadow(0 0 8px ${data.glow})` }}
                        />
                      </AnimatePresence>
                    </svg>
                    <div className="z-10 text-center">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={idx + '-score'}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.35, delay: 0.2 }}
                          className="text-2xl font-bold tabular-nums block"
                          style={{ color: data.color }}
                        >
                          {data.score}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wide font-semibold">Rain Score</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    {data.pillars.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <p.Icon className="w-3 h-3 shrink-0" style={{ color: p.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[10px] text-slate-400 truncate font-medium">{p.name}</span>
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={idx + '-' + i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25, delay: i * 0.06 }}
                                className="text-[10px] font-bold tabular-nums ml-1 shrink-0"
                                style={{ color: p.color }}
                              >
                                {p.score}
                              </motion.span>
                            </AnimatePresence>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={idx + '-bar-' + i}
                                className="h-1 rounded-full"
                                style={{ background: p.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${p.score}%` }}
                                exit={{ width: 0 }}
                                transition={{ duration: 1.0, ease: 'easeOut', delay: i * 0.07 }}
                              />
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signal checks */}
                <div className="border-t border-white/[0.06] pt-4 space-y-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={idx + '-signals'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {data.signals.map((sig, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[8px] font-black ${sig.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {sig.ok ? '✓' : '✕'}
                          </span>
                          <span className={`text-[10px] font-medium ${sig.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{sig.label}</span>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Status + dots */}
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={idx + '-status'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-xs text-center font-semibold mb-3"
                      style={{ color: data.statusColor }}
                    >
                      {data.status}
                    </motion.p>
                  </AnimatePresence>
                  <div className="flex justify-center gap-2">
                    {STATES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setIdx(i); setPaused(true); }}
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: i === idx ? '20px' : '6px',
                          background: i === idx ? data.color : 'rgba(255,255,255,0.15)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
