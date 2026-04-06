import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle, FileText, Search, Zap,
  TrendingUp, Globe, Bot, BarChart3, BrainCircuit,
  ShieldCheck, MousePointerClick, Target, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pillars = [
  {
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.1)',
    border: 'rgba(14,165,233,0.25)',
    Icon: BrainCircuit,
    name: 'AI Readability',
    desc: 'How easily ChatGPT, Gemini, and Perplexity can extract answers from your content.',
  },
  {
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    Icon: ShieldCheck,
    name: 'Digital Authority',
    desc: 'The trust signals that make AI engines choose your content over a competitor\'s.',
  },
  {
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.25)',
    Icon: MousePointerClick,
    name: 'Conversion Readiness',
    desc: 'How effectively your content turns AI-referred readers into customers.',
  },
  {
    color: '#fb923c',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.25)',
    Icon: Target,
    name: 'Product Discoverability',
    desc: 'Whether AI shopping assistants can surface your product in recommendations.',
  },
];

const features = [
  {
    Icon: Bot,
    title: 'AI Engine Scoring',
    desc: 'See exactly how ChatGPT, Perplexity, and Gemini read your content and score it across four weighted pillars.',
  },
  {
    Icon: BarChart3,
    title: 'Actionable Breakdown',
    desc: 'Every analysis returns specific, ordered recommendations — not vague suggestions. Know what to fix and why.',
  },
  {
    Icon: Search,
    title: 'SEO + AEO Gap Analysis',
    desc: 'Surface the gaps between what search engines and AI engines need — and fix both in a single pass.',
  },
  {
    Icon: FileText,
    title: 'WordPress Integration',
    desc: 'Score your posts directly inside the block editor. Optimize before you publish, not after traffic drops.',
  },
  {
    Icon: TrendingUp,
    title: 'Score History',
    desc: 'Track every revision. See exactly which changes moved the needle so you can replicate what works.',
  },
  {
    Icon: Zap,
    title: 'Built-in Rewrite Tools',
    desc: 'Suggest AI-ready titles, generate meta descriptions, rewrite vague sentences — without leaving the dashboard.',
  },
];

const steps = [
  { num: '01', title: 'Paste your content', desc: 'Drop any blog post, article, or landing page copy into the analyzer.' },
  { num: '02', title: 'Get your Rain Score', desc: 'Receive a weighted score across four pillars with a full signal breakdown.' },
  { num: '03', title: 'Fix and re-score', desc: 'Apply the recommendations, re-run the analysis, and watch your score climb.' },
];

export default function ContentWriters() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-sky-500/30">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center border-b border-white/10 ${isScrolled ? 'py-4' : 'py-6'}`}>
        <div className={`flex items-center justify-between px-8 transition-all duration-500 ${
          isScrolled
            ? 'w-full max-w-5xl py-3 rounded-full bg-midnight/60 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/40'
            : 'w-full max-w-7xl bg-transparent border-transparent'
        }`}>
          <a href="#/" className="font-bold text-3xl tracking-tighter text-white">
            r<span className="text-sky-400">ai</span>n
          </a>

          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
            <a href="#/" className="hover:text-white transition-colors">Home</a>
            <a href="#/#features" className="hover:text-white transition-colors">Features</a>
            <a href="#/#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="https://www.getrainos.com/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
            <a href="#/wordpress-plugin" className="hover:text-white transition-colors">WordPress Plugin</a>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login?mode=login')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block">
              Login
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-sky-500 hover:bg-sky-400 text-white rounded-lg px-5 py-2 text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="pt-44 pb-28 relative z-10 px-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.22) 0%, transparent 70%)' }} />

          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-bold text-sky-300 tracking-[0.2em] uppercase mb-6">
                <span className="flex h-2 w-2 rounded-full bg-sky-400 mr-3 animate-pulse" />
                For Content Writers & SEO Professionals
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] text-white mb-6"
                style={{ letterSpacing: '-0.04em' }}>
                Write content that{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-sky-400">
                  AI engines cite
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                rain OS scores your articles, blog posts, and landing pages against the exact signals AI engines use to pick their sources — so your content gets cited, not skipped.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {['Bloggers', 'SEO Professionals', 'AEO Strategists', 'Content Agencies'].map((label) => (
                <span key={label} className="px-4 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#7dd3fc' }}>
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
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-8 py-3.5 text-sm font-bold shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 group"
              >
                Score your content free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#/wordpress-plugin"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Get the WordPress plugin →
              </a>
            </motion.div>
          </div>
        </section>

        {/* Problem Section */}
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
                SEO alone won't get you cited
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
                When someone asks ChatGPT or Perplexity a question, AI engines select sources based on structure, authority, and clarity — not keyword density. Most content fails these checks invisibly, even content that ranks well on Google.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: 'The old approach', body: 'Optimize for keyword rankings. Wait for traffic. Hope it converts.', dim: true },
                { label: 'What\'s changed', body: 'AI answers questions directly. The sources it cites get the traffic — everything else is invisible.', highlight: true },
                { label: 'The rain OS approach', body: 'Score your content against the signals AI uses. Fix what matters. Get cited more.', dim: false },
              ].map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`rounded-2xl border p-6 ${
                    c.highlight
                      ? 'border-sky-400/30 bg-sky-500/5'
                      : c.dim
                      ? 'border-white/5 bg-white/[0.02]'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <p className={`text-sm font-bold mb-2 ${c.highlight ? 'text-sky-300' : c.dim ? 'text-slate-600' : 'text-white'}`}>
                    {c.label}
                  </p>
                  <p className={`text-sm leading-relaxed ${c.dim ? 'text-slate-600' : 'text-slate-400'}`}>{c.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Four Pillars */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">How we score</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Four pillars. One Rain Score.</h2>
              <p className="text-slate-400 max-w-xl leading-relaxed">
                Every analysis returns a weighted score across the four dimensions that determine whether AI engines cite your content.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pillars.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: p.bg, border: `1px solid ${p.border}` }}>
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

        {/* How it works */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">Simple workflow</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">From draft to cited in three steps</h2>
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

        {/* Features Grid */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">Everything included</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">Built for content writers</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 hover:border-sky-400/20 hover:bg-white/[0.04] transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400 mb-4">
                    <f.Icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 px-6 border-t border-white/[0.06] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />

          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                Ready to get your content cited?
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Paste your first piece of content and get a full AI readability score in seconds. Free to start, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-8 py-4 text-sm font-bold shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 group"
                >
                  Score your content free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <a
                  href="#/wordpress-plugin"
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Get the WordPress plugin →
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-midnight py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <span className="font-bold text-3xl tracking-tighter text-white">r<span className="text-sky-400">ai</span>n</span>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <a href="https://www.getrainos.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="https://www.getrainos.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:support@getrainos.com" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="text-right text-xs text-slate-600">© {new Date().getFullYear()} rain OS. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
