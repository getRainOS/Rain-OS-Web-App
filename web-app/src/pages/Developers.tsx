import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Code2, BookOpen, GitBranch, Layers, Search,
  FileCode, Cpu, CheckCircle2, Terminal, Link2, AlertCircle, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';

const docSignals = [
  {
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.1)',
    border: 'rgba(14,165,233,0.2)',
    Icon: Layers,
    name: 'Navigation Structure',
    desc: 'Clear hierarchy, table of contents signals, and logical section ordering — the foundation of AI-parseable documentation.',
  },
  {
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.2)',
    Icon: Code2,
    name: 'Code Example Quality',
    desc: 'Self-contained, labeled, runnable code blocks. AI answers dev questions using your examples — incomplete snippets get skipped.',
  },
  {
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.2)',
    Icon: Terminal,
    name: 'Step Determinism',
    desc: 'Numbered, unambiguous instructions. Vague steps like "configure as needed" are unfollowable for AI — and for developers.',
  },
  {
    color: '#fb923c',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.2)',
    Icon: FileCode,
    name: 'API Reference Completeness',
    desc: 'Parameters, types, return values, and examples for every endpoint. Missing any of these makes your API docs uncitable.',
  },
  {
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.08)',
    border: 'rgba(14,165,233,0.18)',
    Icon: BookOpen,
    name: 'Getting Started Clarity',
    desc: 'A clear entry path: prerequisites, first command, expected output. Without this, AI can\'t confidently guide a developer to success.',
  },
  {
    color: '#34d399',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.18)',
    Icon: AlertCircle,
    name: 'Error Recovery Coverage',
    desc: 'Common errors, their causes, and their fixes. AI frequently gets asked "why is X failing?" — if your docs don\'t answer it, AI guesses.',
  },
  {
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.18)',
    Icon: Search,
    name: 'Search Snippet Quality',
    desc: 'Can AI extract a one-sentence answer to "how do I do X?" from your docs? High snippet quality = high citation rate.',
  },
  {
    color: '#fb923c',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.18)',
    Icon: Link2,
    name: 'Cross-Reference Quality',
    desc: 'Related concepts linked and mentioned in context. Isolated pages score lower — AI navigates your docs like a graph.',
  },
];

const docPillars = [
  {
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.1)',
    border: 'rgba(14,165,233,0.25)',
    Icon: Layers,
    name: 'Documentation Structure',
    weight: '35%',
    desc: 'Navigation hierarchy, TOC quality, getting started path, and logical flow. Mintlify-style structure that AI can traverse.',
    scores: ['Navigation Clarity', 'Section Hierarchy', 'Getting Started Path', 'Version & Freshness Signals'],
  },
  {
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    Icon: Code2,
    name: 'Technical Clarity',
    weight: '35%',
    desc: 'Code example completeness, step determinism, API reference coverage, error documentation. The technical accuracy layer.',
    scores: ['Code Example Quality', 'Step Determinism', 'API Reference Completeness', 'Error Recovery Coverage'],
  },
  {
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.25)',
    Icon: Cpu,
    name: 'AI Retrievability',
    weight: '26%',
    desc: 'Search snippet quality, query alignment, concept isolation, cross-reference quality. How well AI can extract answers.',
    scores: ['Search Snippet Quality', 'Query Alignment', 'Concept Isolation', 'Cross-Reference Quality'],
  },
  {
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.1)',
    border: 'rgba(236,72,153,0.25)',
    Icon: Layers,
    name: 'RAG Readiness',
    weight: '10%',
    desc: 'How well your docs are structured for vector database retrieval: semantic chunks, hierarchical headings, FAQ density, and cross-linking.',
    scores: ['Semantic Chunking', 'Hierarchical Formatting', 'FAQ Density', 'Cross-Reference Quality'],
  },
];

const fileTypes = [
  { icon: FileText, label: 'README.md', desc: 'Project overview & setup' },
  { icon: FileCode, label: 'OpenAPI / Swagger', desc: 'API endpoint specs' },
  { icon: GitBranch, label: 'CHANGELOG.md', desc: 'Version history & freshness' },
  { icon: BookOpen, label: 'Docs pages / MDX', desc: 'Guides, tutorials, how-tos' },
  { icon: Terminal, label: 'llms.txt', desc: 'AI crawler instructions' },
  { icon: Code2, label: 'Code comments', desc: 'Inline documentation quality' },
];

const steps = [
  { num: '01', title: 'Paste your documentation', desc: 'Drop in your README, API reference, guide, or any technical documentation.' },
  { num: '02', title: 'Get your Documentation Score', desc: 'See structure, clarity, and retrievability scores with specific fixes ranked by impact.' },
  { num: '03', title: 'Ship docs that AI cites', desc: 'Apply the recommendations and watch your docs become the source AI points developers to.' },
];

export default function Developers() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-teal-500/30">
      <MarketingNav onGetStartedClick={() => navigate('/login')} onLoginClick={() => navigate('/login?mode=login')} />

      <main className="flex-grow">
        <section className="pt-44 pb-28 relative z-10 px-6 overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, rgba(14,165,233,0.08) 40%, transparent 70%)',
            }}
          />

          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div
                className="inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase mb-6"
                style={{
                  borderColor: 'rgba(52,211,153,0.3)',
                  background: 'rgba(16,185,129,0.08)',
                  color: '#6ee7b7',
                }}
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-3 animate-pulse" />
                For Developers
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] text-white mb-6"
                style={{ letterSpacing: '-0.04em' }}
              >
                Make your docs{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7, #38bdf8)' }}
                >
                  the source AI cites.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Developers ask ChatGPT, Claude, and Perplexity for help every day. When they do, AI cites the documentation it can best understand. rain OS scores your docs and tells you exactly what's blocking a citation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {['API Documentation', 'Developer Guides', 'README Files', 'SDK Docs', 'Open Source Maintainers'].map(
                (label) => (
                  <span
                    key={label}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(52,211,153,0.2)',
                      color: '#6ee7b7',
                    }}
                  >
                    {label}
                  </span>
                )
              )}
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
                  background: 'linear-gradient(135deg, #059669, #0ea5e9)',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
                }}
              >
                Score your docs free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a href="/repo-analysis" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Or connect your GitHub repo →
              </a>
            </motion.div>
          </div>
        </section>

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
                Developers now ask AI before they read your docs.
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
                If AI doesn't understand your documentation, it doesn't cite it. Your docs might be technically excellent — but if they're not AI-readable, they're invisible to the developers who need them most.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: 'The old assumption', body: 'Developers read documentation. Write it clearly and they\'ll find it via search.', dim: true },
                { label: 'What\'s changed', body: 'Developers ask ChatGPT and Claude first. AI reads your docs for them — and cites what it understands best.', highlight: true },
                { label: 'The rain OS approach', body: 'Score your docs for AI readability. Fix the structure, clarity, and snippet quality. Become the source AI recommends.', dim: false },
              ].map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`rounded-2xl border p-6 ${
                    c.highlight
                      ? 'border-emerald-400/30 bg-emerald-500/5'
                      : c.dim
                      ? 'border-white/5 bg-white/[0.02]'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <p className={`text-sm font-bold mb-2 ${c.highlight ? 'text-emerald-300' : c.dim ? 'text-slate-600' : 'text-white'}`}>
                    {c.label}
                  </p>
                  <p className={`text-sm leading-relaxed ${c.dim ? 'text-slate-600' : 'text-slate-400'}`}>{c.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="text-emerald-400 font-bold tracking-wider text-xs uppercase mb-3 block">
                Documentation Scoring Framework
              </span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
                Five pillars built for developer docs.
              </h2>
              <p className="text-slate-400 max-w-xl leading-relaxed">
                Standard content scoring doesn't work for technical documentation. These five pillars were built from the ground up for docs — inspired by what makes documentation like Stripe, Mintlify, and Linear so AI-citable.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {docPillars.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-[28px] border border-white/10 bg-white/[0.02] p-7 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: p.bg, border: `1px solid ${p.border}` }}
                    >
                      <p.Icon className="w-5 h-5" style={{ color: p.color }} />
                    </div>
                    <span
                      className="text-xs font-bold rounded-full px-3 py-1"
                      style={{ color: p.color, background: p.bg, border: `1px solid ${p.border}` }}
                    >
                      {p.weight} weight
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1" style={{ color: p.color }}>{p.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">{p.desc}</p>
                  <ul className="space-y-2">
                    {p.scores.map((s, j) => (
                      <li key={j} className="flex items-center text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full mr-3 shrink-0" style={{ background: p.color }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">8 signals scored</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">What we analyze</h2>
              <p className="text-slate-400 max-w-xl leading-relaxed">
                Each of these signals has a measurable impact on whether AI cites your docs or guesses instead.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {docSignals.map((p, i) => (
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

        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <span className="text-emerald-400 font-bold tracking-wider text-xs uppercase mb-3 block">Works with</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">Analyze any doc format</h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fileTypes.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:border-emerald-400/20 hover:bg-white/[0.04] transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-mono">{f.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="text-emerald-400 font-bold tracking-wider text-xs uppercase mb-3 block">Simple workflow</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">From written to cited in three steps</h2>
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

        <section className="py-28 px-6 border-t border-white/[0.06] relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.06) 0%, transparent 70%)' }}
          />
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                Ready to make your docs AI-citable?
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Paste your README, API reference, or any documentation and get a full Documentation Score in seconds. Free to start.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-white rounded-xl px-8 py-4 text-sm font-bold transition-all hover:scale-105 active:scale-95 group"
                  style={{
                    background: 'linear-gradient(135deg, #059669, #0ea5e9)',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.25)',
                  }}
                >
                  Score your docs free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <a
                  href="/repo-analysis"
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Connect your GitHub repo →
                </a>
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
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/support" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="text-right text-xs text-slate-600">© {new Date().getFullYear()} rain OS. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
