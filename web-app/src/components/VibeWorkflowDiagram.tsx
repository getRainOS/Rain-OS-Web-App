import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, GitBranch, Search, Code2, Globe, TrendingUp, Rocket, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

const VIBE_TOOLS = [
  { name: 'Bolt', color: '#f59e0b' },
  { name: 'Lovable', color: '#ec4899' },
  { name: 'Cursor', color: '#22c55e' },
  { name: 'v0', color: '#000000' },
  { name: 'Replit', color: '#f97316' },
  { name: 'Windsurf', color: '#06b6d4' },
];

const PILLARS = [
  { name: 'AI Readability', color: '#38bdf8', short: 'Readability' },
  { name: 'Digital Authority', color: '#34d399', short: 'Authority' },
  { name: 'Conversion Readiness', color: '#a78bfa', short: 'Conversion' },
];

export default function VibeWorkflowDiagram() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const totalSteps = 8;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % (totalSteps + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReplay = () => {
    setStep(0);
    setIsPlaying(true);
  };

  return (
    <section className="py-20 px-6 border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-violet-400 font-bold tracking-wider text-xs uppercase mb-3 block">
            The complete workflow
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            Build. Optimize. Go live.
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            Rain is the optimization layer between your vibe-coded build and AI discoverability.
            Without it, your site is invisible.
          </p>
        </motion.div>

        {/* Diagram */}
        <div className="relative">
          {/* Main flow - horizontal on desktop, vertical on mobile */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
            {/* Step 1: Plan */}
            <WorkflowNode
              step={step}
              targetStep={0}
              label="Plan"
              icon={<Layers className="w-5 h-5" />}
              color="#94a3b8"
              description="Idea ready"
            />

            {/* Arrow */}
            <FlowArrow visible={step >= 1} />

            {/* Step 2: Vibe Code */}
            <WorkflowNode
              step={step}
              targetStep={1}
              label="Vibe Code"
              icon={<Code2 className="w-5 h-5" />}
              color="#94a3b8"
              description="Build fast"
              expanded={step >= 1 && step < 3}
            >
              <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
                {VIBE_TOOLS.map((tool) => (
                  <span
                    key={tool.name}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${tool.color}15`,
                      color: tool.color,
                      border: `1px solid ${tool.color}30`,
                    }}
                  >
                    {tool.name}
                  </span>
                ))}
              </div>
            </WorkflowNode>

            {/* Arrow */}
            <FlowArrow visible={step >= 2} />

            {/* Step 3: Rain OS - The Critical Layer */}
            <WorkflowNode
              step={step}
              targetStep={2}
              label="Rain OS"
              icon={<Zap className="w-5 h-5" />}
              color="#0ea5e9"
              description="Optimize for AI"
              isHighlighted
              pulse={step === 2}
            />

            {/* Arrow splits */}
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
              {/* Branch 1: Repo Scanner */}
              <div className="flex flex-col items-center gap-3">
                <FlowArrow visible={step >= 3} direction="down" />
                <WorkflowNode
                  step={step}
                  targetStep={3}
                  label="Repo Scanner"
                  icon={<GitBranch className="w-5 h-5" />}
                  color="#f59e0b"
                  description="Scan source code"
                />
              </div>

              {/* OR */}
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                or
              </div>

              {/* Branch 2: URL Scanner */}
              <div className="flex flex-col items-center gap-3">
                <FlowArrow visible={step >= 3} direction="down" />
                <WorkflowNode
                  step={step}
                  targetStep={3}
                  label="URL Scanner"
                  icon={<Search className="w-5 h-5" />}
                  color="#ec4899"
                  description="Scan live site"
                />
              </div>
            </div>
          </div>

          {/* Convergence: 3 Pillars */}
          <div className="flex justify-center mt-8">
            <div className="flex flex-col items-center gap-3">
              <FlowArrow visible={step >= 4} />
              <WorkflowNode
                step={step}
                targetStep={4}
                label="3 Pillars"
                icon={<Globe className="w-5 h-5" />}
                color="#a78bfa"
                description="Analyze signals"
                expanded={step >= 4 && step < 5}
              >
                <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
                  {PILLARS.map((p) => (
                    <span
                      key={p.name}
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${p.color}15`,
                        color: p.color,
                        border: `1px solid ${p.color}30`,
                      }}
                    >
                      {p.short}
                    </span>
                  ))}
                </div>
              </WorkflowNode>
            </div>
          </div>

          {/* Bottom flow: Prompt → Optimize → Score ↑ → Publish */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <FlowArrow visible={step >= 5} />

            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
              {/* Prompt */}
              <WorkflowNode
                step={step}
                targetStep={5}
                label="AI Prompt"
                icon={<Zap className="w-5 h-5" />}
                color="#94a3b8"
                description="Get fixes"
              />

              <FlowArrow visible={step >= 6} />

              {/* Optimize */}
              <WorkflowNode
                step={step}
                targetStep={6}
                label="Optimize"
                icon={<CheckCircle2 className="w-5 h-5" />}
                color="#0ea5e9"
                description="Apply changes"
                isHighlighted
              />

              <FlowArrow visible={step >= 7} />

              {/* Score Improvement */}
              <motion.div
                className="relative"
                initial={false}
                animate={step >= 7 ? { scale: 1 } : { scale: 0.9 }}
              >
                <WorkflowNode
                  step={step}
                  targetStep={7}
                  label="Score ↑"
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="#34d399"
                  description="AI-ready now"
                />
                <AnimatePresence>
                  {step >= 7 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-emerald-400"
                    >
                      +42 points
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <FlowArrow visible={step >= 8} />

              {/* Publish Live */}
              <WorkflowNode
                step={step}
                targetStep={8}
                label="Go Live"
                icon={<Rocket className="w-5 h-5" />}
                color="#f59e0b"
                description="Site is alive"
                isFinal
              />
            </div>
          </div>
        </div>

        {/* Step-by-step breakdown */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { num: 1, text: "Start with an idea and build fast with your favorite vibe tool" },
              { num: 2, text: "Rain scans your site for AI readiness — repo or live URL" },
              { num: 3, text: "12 signals checked across 3 pillars for gaps" },
              { num: 4, text: "Get a platform-specific fix prompt" },
              { num: 5, text: "Paste back into your builder and apply" },
              { num: 6, text: "Your score climbs. AI can now read you." },
            ].map((item) => (
              <div key={item.num} className="flex items-start gap-3 text-left">
                <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 mt-0.5">
                  {item.num}
                </span>
                <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Replay + CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={handleReplay}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <Zap className="w-4 h-4" />
            {isPlaying ? 'Watch the flow' : 'Replay'}
          </button>
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          <p className="text-xs text-slate-500">
            Without Rain, your site is built but invisible. AI cannot find what it cannot read.
          </p>
        </div>
      </div>
    </section>
  );
}

function WorkflowNode({
  step,
  targetStep,
  label,
  icon,
  color,
  description,
  children,
  expanded,
  isHighlighted,
  pulse,
  isFinal,
}: {
  step: number;
  targetStep: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  children?: React.ReactNode;
  expanded?: boolean;
  isHighlighted?: boolean;
  pulse?: boolean;
  isFinal?: boolean;
}) {
  const isActive = step >= targetStep;
  const isCurrent = step === targetStep;

  return (
    <motion.div
      className={`relative flex flex-col items-center ${isFinal ? '' : ''}`}
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0.3,
        scale: isCurrent ? 1.05 : 1,
      }}
      transition={{ duration: 0.4 }}
    >
      {/* Node box */}
      <div
        className={`relative rounded-xl px-5 py-3 flex items-center gap-3 transition-all duration-300 ${
          isHighlighted
            ? 'border-2'
            : 'border'
        } ${isFinal && isActive ? 'shadow-lg shadow-amber-500/20' : ''}`}
        style={{
          background: isHighlighted
            ? `linear-gradient(135deg, ${color}10, ${color}05)`
            : isActive
            ? `${color}08`
            : 'rgba(255,255,255,0.02)',
          borderColor: isActive ? `${color}40` : 'rgba(255,255,255,0.08)',
        }}
      >
        {/* Pulse ring for Rain node */}
        {pulse && (
          <div
            className="absolute inset-0 rounded-xl animate-ping"
            style={{ border: `2px solid ${color}40` }}
          />
        )}

        {/* Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: isActive ? `${color}15` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isActive ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
          }}
        >
          <span style={{ color: isActive ? color : '#64748b' }}>{icon}</span>
        </div>

        {/* Text */}
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="text-[10px] text-slate-500">{description}</div>
        </div>

        {/* Checkmark for completed steps */}
        {isActive && !isCurrent && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: color }}
          >
            <CheckCircle2 className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>

      {/* Expanded children */}
      <AnimatePresence>
        {expanded && children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FlowArrow({ visible, direction = 'right' }: { visible: boolean; direction?: 'right' | 'down' }) {
  const isHorizontal = direction === 'right';

  return (
    <motion.div
      className={`flex items-center justify-center ${isHorizontal ? 'w-8 lg:w-10' : 'h-6'}`}
      initial={false}
      animate={{ opacity: visible ? 1 : 0.2 }}
      transition={{ duration: 0.3 }}
    >
      {isHorizontal ? (
        <div className="relative w-full h-px bg-white/10">
          <motion.div
            className="absolute top-0 left-0 h-full"
            style={{ background: 'linear-gradient(90deg, #0ea5e9, #a78bfa)' }}
            initial={false}
            animate={{ width: visible ? '100%' : '0%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <ArrowRight
            className="absolute top-1/2 -translate-y-1/2 right-0 w-3 h-3"
            style={{ color: visible ? '#a78bfa' : '#475569' }}
          />
        </div>
      ) : (
        <div className="relative w-px h-full bg-white/10">
          <motion.div
            className="absolute left-0 top-0 w-full"
            style={{ background: 'linear-gradient(180deg, #0ea5e9, #a78bfa)' }}
            initial={false}
            animate={{ height: visible ? '100%' : '0%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}
    </motion.div>
  );
}
