import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ShieldCheck, MousePointerClick, Target, ArrowRight } from 'lucide-react';

const STATES = [
  {
    label: 'Unoptimized',
    score: 38,
    color: '#f87171',
    glow: 'rgba(248,113,113,0.2)',
    status: 'Needs improvement',
    pillars: [
      { name: 'AI Readability', score: 32, color: '#38bdf8', Icon: BrainCircuit },
      { name: 'Digital Authority', score: 41, color: '#34d399', Icon: ShieldCheck },
      { name: 'Conversion', score: 35, color: '#a78bfa', Icon: MousePointerClick },
      { name: 'Discoverability', score: 44, color: '#fb923c', Icon: Target },
    ],
  },
  {
    label: 'Optimized',
    score: 91,
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.2)',
    status: 'AI-ready',
    pillars: [
      { name: 'AI Readability', score: 94, color: '#38bdf8', Icon: BrainCircuit },
      { name: 'Digital Authority', score: 88, color: '#34d399', Icon: ShieldCheck },
      { name: 'Conversion', score: 93, color: '#a78bfa', Icon: MousePointerClick },
      { name: 'Discoverability', score: 89, color: '#fb923c', Icon: Target },
    ],
  },
];

interface DemoShowcaseProps {
  onAnalyzeClick: () => void;
}

export const DemoShowcase = ({ onAnalyzeClick }: DemoShowcaseProps) => {
  const [idx, setIdx] = useState(0);
  const data = STATES[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % STATES.length), 3800);
    return () => clearInterval(t);
  }, []);

  const circumference = 2 * Math.PI * 48;
  const dashOffset = circumference - (data.score / 100) * circumference;

  return (
    <section className="py-16 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          <div className="flex-1 max-w-lg">
            <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-4 block">
              Live Preview
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 leading-snug">
              Watch your Rain Score transform in real time
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Paste your content, run the analysis, and see exactly which signals are holding your score back — and what to fix.
            </p>
            <button
              onClick={onAnalyzeClick}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              Try it with your own content
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="w-full lg:w-auto lg:shrink-0">
            <div className="relative w-full max-w-[320px] mx-auto">
              <div className="absolute -inset-[1px] rounded-[24px] pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(255,255,255,0.03), rgba(139,92,246,0.08))' }} />

              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[24px] p-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-400">Sample Analysis</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={data.label}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.3 }}
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: idx === 0 ? 'rgba(248,113,113,0.12)' : 'rgba(56,189,248,0.12)',
                        border: `1px solid ${idx === 0 ? 'rgba(248,113,113,0.3)' : 'rgba(56,189,248,0.3)'}`,
                        color: data.color,
                      }}
                    >
                      {data.label}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <div className="relative w-[88px] h-[88px] shrink-0 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                      <AnimatePresence mode="wait">
                        <motion.circle
                          key={idx}
                          cx="56"
                          cy="56"
                          r="48"
                          fill="none"
                          stroke={data.color}
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset: dashOffset }}
                          exit={{ strokeDashoffset: circumference }}
                          transition={{ duration: 1.1, ease: 'easeOut' }}
                          style={{ filter: `drop-shadow(0 0 6px ${data.glow})` }}
                        />
                      </AnimatePresence>
                    </svg>
                    <div className="z-10 text-center">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={idx + '-score'}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="text-2xl font-bold text-white tabular-nums block"
                        >
                          {data.score}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wide font-semibold">Score</span>
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
                                transition={{ duration: 0.25, delay: i * 0.05 }}
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
                                transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.06 }}
                              />
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-4">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={idx + '-status'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-xs text-center font-semibold"
                      style={{ color: data.color }}
                    >
                      {data.status}
                    </motion.p>
                  </AnimatePresence>
                  <div className="flex justify-center gap-2 mt-3">
                    {STATES.map((_, i) => (
                      <span
                        key={i}
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: i === idx ? '20px' : '6px',
                          background: i === idx ? '#38bdf8' : 'rgba(255,255,255,0.15)',
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
