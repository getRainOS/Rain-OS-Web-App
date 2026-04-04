import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ShieldCheck, MousePointerClick, Target, ArrowRight, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

const BEFORE_DATA = {
  label: 'Before',
  sample: `Our company has been doing really well lately with our new marketing efforts. We've seen some significant improvements across multiple channels and customers seem to really like what we're putting out there. The team has been working hard and it's paying off in terms of growth and engagement metrics that we track on a regular basis.`,
  overall: 38,
  pillars: [
    { name: 'AI Readability', score: 32, color: '#38bdf8', bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.3)', icon: BrainCircuit },
    { name: 'Digital Authority', score: 41, color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: ShieldCheck },
    { name: 'Conversion Readiness', score: 35, color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', icon: MousePointerClick },
    { name: 'Product Discoverability', score: 44, color: '#fb923c', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', icon: Target },
  ],
  recommendations: [
    'Replace vague phrases like "significant improvements" with specific metrics (e.g., "28% increase in CTR")',
    'Add entity signals — name your team, department, or product to establish topical authority',
    'Include a clear CTA with a measurable outcome tied to your stated value proposition',
    'Structure content with answer-first formatting so AI can extract key claims immediately',
  ],
  semanticPrecision: 24,
  infoGain: 18,
};

const AFTER_DATA = {
  label: 'After',
  sample: `rain OS helped BloomAgency increase organic AI citations by 340% in 90 days. By restructuring their blog posts with answer-first formatting and adding entity-level authority signals, ChatGPT now surfaces BloomAgency in 6 out of 10 relevant queries — up from 1 in 10. Their average Rain Score improved from 38 to 91, driving a 52% lift in demo request conversions.`,
  overall: 91,
  pillars: [
    { name: 'AI Readability', score: 94, color: '#38bdf8', bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.3)', icon: BrainCircuit },
    { name: 'Digital Authority', score: 88, color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: ShieldCheck },
    { name: 'Conversion Readiness', score: 93, color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', icon: MousePointerClick },
    { name: 'Product Discoverability', score: 89, color: '#fb923c', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', icon: Target },
  ],
  recommendations: [
    'Strong specific metrics detected — AI extraction confidence is high',
    'Entity clarity excellent: named company, product, and timeframe present',
    'CTA tied to measurable outcome ("demo request conversions") — optimal',
    'Answer-first structure confirmed: lead claim is machine-extractable',
  ],
  semanticPrecision: 96,
  infoGain: 87,
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <motion.span
          className="text-4xl font-bold text-white tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Rain Score</span>
      </div>
    </div>
  );
}

function PillarBar({ pillar, index }: { pillar: typeof BEFORE_DATA.pillars[0]; index: number }) {
  const Icon = pillar.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className="flex items-center gap-3"
    >
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: pillar.bg, border: `1px solid ${pillar.border}` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: pillar.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-300 truncate">{pillar.name}</span>
          <span className="text-xs font-bold tabular-nums ml-2 shrink-0" style={{ color: pillar.color }}>{pillar.score}</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5">
          <motion.div
            className="h-1.5 rounded-full"
            style={{ background: pillar.color, boxShadow: `0 0 6px ${pillar.color}66` }}
            initial={{ width: 0 }}
            animate={{ width: `${pillar.score}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.15 * index }}
          />
        </div>
      </div>
    </motion.div>
  );
}

interface DemoShowcaseProps {
  onAnalyzeClick: () => void;
}

export const DemoShowcase = ({ onAnalyzeClick }: DemoShowcaseProps) => {
  const [activeState, setActiveState] = useState<'before' | 'after'>('before');
  const data = activeState === 'before' ? BEFORE_DATA : AFTER_DATA;

  const overallColor = activeState === 'before' ? '#f87171' : '#38bdf8';

  return (
    <section className="py-20 relative z-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Live Demo
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">See It in Action</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Watch the Rain Score transform real content — toggle between an unoptimized draft and its AI-ready version.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-[1px] rounded-[32px] pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(255,255,255,0.03), rgba(139,92,246,0.08))' }} />

          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-sm font-semibold text-slate-300">Sample Content Analysis</span>
                <span className="text-xs text-slate-500">· Technology industry</span>
              </div>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 self-start md:self-auto">
                {(['before', 'after'] as const).map((state) => (
                  <button
                    key={state}
                    onClick={() => setActiveState(state)}
                    aria-pressed={activeState === state}
                    className={`relative px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                      activeState === state ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {activeState === state && (
                      <motion.div
                        layoutId="toggle-pill"
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: state === 'before'
                            ? 'linear-gradient(135deg, rgba(248,113,113,0.2), rgba(239,68,68,0.1))'
                            : 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.1))',
                          border: `1px solid ${state === 'before' ? 'rgba(248,113,113,0.3)' : 'rgba(56,189,248,0.3)'}`,
                        }}
                        transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10 capitalize">{state}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="flex flex-col gap-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Content Sample</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeState + '-text'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed font-mono min-h-[140px]"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    {data.sample}
                  </motion.div>
                </AnimatePresence>

                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recommendations</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeState + '-recs'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      {data.recommendations.map((rec, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.08 }}
                          className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed"
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${activeState === 'after' ? 'text-emerald-400' : 'text-amber-500'}`}
                          />
                          {rec}
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1 bg-white/[0.03] border rounded-xl px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="text-xs text-slate-500 mb-1">Semantic Precision</div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeState + '-sp'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-lg font-bold"
                        style={{ color: overallColor }}
                      >
                        {data.semanticPrecision}%
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="flex-1 bg-white/[0.03] border rounded-xl px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="text-xs text-slate-500 mb-1">Information Gain</div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeState + '-ig'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-lg font-bold"
                        style={{ color: overallColor }}
                      >
                        {data.infoGain}%
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 self-start">Overall Score</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeState + '-ring'}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="self-center"
                    >
                      <ScoreRing score={data.overall} color={overallColor} />
                    </motion.div>
                  </AnimatePresence>
                  <div
                    className="text-xs font-semibold px-3 py-1 rounded-full mt-1"
                    style={{
                      background: activeState === 'before' ? 'rgba(248,113,113,0.1)' : 'rgba(56,189,248,0.1)',
                      border: `1px solid ${activeState === 'before' ? 'rgba(248,113,113,0.25)' : 'rgba(56,189,248,0.25)'}`,
                      color: overallColor,
                    }}
                  >
                    {activeState === 'before' ? 'Needs improvement' : 'AI-ready'}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Four Pillars</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeState + '-pillars'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {data.pillars.map((pillar, i) => (
                        <PillarBar key={pillar.name} pillar={pillar} index={i} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  onClick={onAnalyzeClick}
                  className="group flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl font-semibold text-sm text-white transition-all duration-300 mt-auto"
                  style={{
                    background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(56,189,248,0.1))',
                    border: '1px solid rgba(56,189,248,0.3)',
                    boxShadow: '0 0 20px rgba(14,165,233,0.1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(14,165,233,0.35), rgba(56,189,248,0.2))';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(14,165,233,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(56,189,248,0.1))';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(14,165,233,0.1)';
                  }}
                >
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  Analyze your own content
                  <ArrowRight className="w-4 h-4 text-sky-400 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
