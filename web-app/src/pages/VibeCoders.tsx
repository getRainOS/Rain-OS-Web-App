import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Zap, GitBranch, Layers, Search, Shield,
  FileCode, Terminal, CheckCircle2, AlertTriangle, Sparkles, Wand2,
  Monitor, Code2, Globe, Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';
import { LocalBusinessBadge } from '@/components/marketing/MarketingComponents';

const ROTATING_WORDS = ['SaaS?', 'Website?', 'Web App?'];

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
  'Base44', 'Tempo', 'lovable.dev', 'Framer', 'Webflow',
];

const steps = [
  { num: '01', title: 'Connect your GitHub repo', desc: 'One-click OAuth to grant read access. We scan README, package.json, index.html, llms.txt, robots.txt, and source files.' },
  { num: '02', title: 'Get your AI Readability Score', desc: 'See exactly which signals are missing and how they affect whether ChatGPT, Gemini, and Perplexity can discover and cite your site.' },
  { num: '03', title: 'Copy the fix prompt', desc: 'Pick your vibe platform (Bolt, Lovable, Cursor, etc.) and get a platform-specific prompt. Paste it into your builder\'s AI and watch the fixes apply automatically.' },
];

export default function VibeCoders() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-violet-500/30">
      <MarketingNav onGetStartedClick={() => navigate('/login')} onLoginClick={() => navigate('/login?mode=login')} />

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
            <div className="flex justify-end w-full max-w-5xl mx-auto">
              <LocalBusinessBadge />
            </div>
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div
                className="inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase mb-6"
                style={{
                  borderColor: 'rgba(167,139,250,0.3)',
                  background: 'rgba(139,92,246,0.08)',
                  color: '#c4b5fd',
                }}
              >
                <span className="flex h-2 w-2 rounded-full bg-violet-400 mr-3 animate-pulse" />
                For Vibe Coders
              </div>

              {/* Rotating subheading */}
              <div className="mb-4">
                <span className="inline-flex items-baseline gap-2 flex-wrap justify-center text-2xl md:text-3xl font-semibold text-white"
                  style={{ letterSpacing: '-0.04em', fontFeatureSettings: '"cv11" on, "ss01" on, "calt" on' }}>
                  <span>Vibe Coded Your</span>
                  <span className="inline-block relative text-violet-400" style={{ minWidth: '5.5ch' }}>
                    {ROTATING_WORDS.map((word, i) => (
                      <span
                        key={word}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ease-in-out whitespace-nowrap"
                        style={{ opacity: i === wordIndex ? 1 : 0 }}
                        aria-hidden={i !== wordIndex}
                      >
                        {word}
                      </span>
                    ))}
                    <span className="invisible whitespace-nowrap">Web App?</span>
                  </span>
                </span>
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] text-white mb-6"
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
                Scan my repo free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a href="/repo-analysis" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Or try the demo →
              </a>
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
                { label: 'The vibe coder trap', body: 'You built something amazing in Bolt or Lovable. It looks perfect. But AI crawlers see a blank page or missing context. Zero citations = zero AI traffic.', dim: true },
                { label: 'What AI actually reads', body: "ChatGPT, Gemini, and Perplexity read your llms.txt, meta tags, schema markup, and robots.txt before they ever render your React components. If those are missing, you're not in the index.", highlight: true },
                { label: 'The rain OS fix', body: 'Connect your repo, scan in seconds, get a score, then copy a platform-specific prompt. Paste it back into your vibe builder and let AI fix what AI broke.', dim: false },
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
                  <p className={`text-sm font-bold mb-2 ${c.highlight ? 'text-violet-300' : c.dim ? 'text-slate-600' : 'text-white'}`}>
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
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">What we analyze in your repo</h2>
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
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                Stop building in the dark.
              </h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                Your vibe-coded project deserves to be found. Scan your repo, see what's blocking AI discoverability, and fix it with a single prompt.
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
                  Scan my repo free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <a href="/repo-analysis" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  Try the demo →
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
