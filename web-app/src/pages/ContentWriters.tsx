import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle, FileText, Search, Zap,
  TrendingUp, Globe, Bot, BarChart3, BrainCircuit,
  ShieldCheck, MousePointerClick, Layers, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HybridFuture, FeatureGrid, ReadabilityIntelligence, ComparisonTable, FAQ } from '@/components/marketing/MarketingComponents';
import MarketingNav from '@/components/marketing/MarketingNav';
import TypewriterPlaceholder from '@/components/TypewriterPlaceholder';

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
];

const features = [
  {
    Icon: Bot,
    title: 'AI Engine Scoring',
    desc: 'See exactly how ChatGPT, Perplexity, and Gemini read your content and score it across three weighted pillars.',
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
  { num: '02', title: 'Get your Rain Score', desc: 'Receive a weighted score across three pillars with a full signal breakdown.' },
  { num: '03', title: 'Fix and re-score', desc: 'Apply the recommendations, re-run the analysis, and watch your score climb.' },
];

export default function ContentWriters() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [heroFocused, setHeroFocused] = useState(false);
  const heroInputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-sky-500/30">
      <MarketingNav onLoginClick={() => navigate('/login?mode=login')} onGetStartedClick={() => navigate('/login')} />

      <main className="flex-grow">
        {/* Hero */}
        <section className="pt-40 pb-24 md:pt-52 md:pb-40 relative z-10 px-6 overflow-hidden" style={{ paddingTop: '10rem', paddingBottom: '6rem' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.22) 0%, transparent 70%)' }} />

          <div className="max-w-5xl mx-auto flex flex-col gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center space-y-6">
              <div className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-bold text-sky-300 tracking-[0.2em] uppercase mb-4">
                <span className="flex h-2 w-2 rounded-full bg-sky-400 mr-3 animate-pulse" />
                For Content Writers & SEO Professionals
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.05] text-white"
                style={{ letterSpacing: '-0.04em', fontFeatureSettings: '"cv11" on, "ss01" on, "calt" on' }}>
                Write content that{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-sky-400">
                  AI engines cite
                </span>
              </h1>

              <p className="text-slate-400 text-base md:text-lg font-normal max-w-xl mx-auto leading-relaxed">
                rain OS scores your articles, blog posts, and landing pages against the exact signals AI engines use to pick their sources — so you can optimize, then check whether AI cites you right away.
              </p>
            </motion.div>

            {/* Content Box with Typewriter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-3xl"
            >
              <div className="absolute -inset-[1px] rounded-[25px] pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(255,255,255,0.04), rgba(56,189,248,0.06))', filter: 'blur(0px)' }} />
              <form onSubmit={handleSubmit} className="rounded-[24px] p-2 text-left relative group" style={{ background: 'rgba(4,7,20,0.65)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 0 40px rgba(14,165,233,0.07), 0 20px 60px -12px rgba(0,0,0,0.7)' }}>
                <div className="relative">
                  <TypewriterPlaceholder
                    value={content}
                    isFocused={heroFocused}
                    padding="24px"
                    fontSize="18px"
                    lineHeight="1.625"
                    color="rgba(255,255,255,0.28)"
                  />
                  <textarea
                    ref={heroInputRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setHeroFocused(true)}
                    onBlur={() => setHeroFocused(false)}
                    className="w-full h-40 bg-transparent border-0 resize-none p-6 text-slate-200 focus:ring-0 focus:outline-none text-lg leading-relaxed font-sans relative z-10"
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-4 px-6 pb-4 relative z-10">
                  <div className="flex items-center gap-6">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                      onClick={() => setContent('')}
                      title="Clear"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-all flex items-center gap-2 group/btn"
                      style={{ boxShadow: '0 0 16px rgba(14,165,233,0.25), 0 2px 8px rgba(0,0,0,0.4)' }}
                    >
                      Analyze now
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </form>
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

        {/* Three Pillars */}
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
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Three pillars. One Rain Score.</h2>
              <p className="text-slate-400 max-w-xl leading-relaxed">
                Every analysis returns a weighted score across the three dimensions that determine whether AI engines cite your content.
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

        {/* Moved from homepage */}
        <HybridFuture />
        <ReadabilityIntelligence />
        <FeatureGrid />
        <ComparisonTable />
        <FAQ />

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
                  href="/wordpress-plugin"
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
