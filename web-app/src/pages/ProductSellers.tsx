import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle, ShoppingCart, Tag, Star, Package,
  BarChart3, Zap, Globe, Search, TrendingUp, Shield, Target,
  AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';

const pdSignals = [
  {
    color: '#fb923c',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.2)',
    Icon: Tag,
    name: 'Pricing Transparency',
    desc: 'AI shopping assistants need clear, unambiguous pricing. Buried or conditional prices get skipped entirely.',
  },
  {
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.1)',
    border: 'rgba(244,114,182,0.2)',
    Icon: Package,
    name: 'Product Variant Coverage',
    desc: 'Every size, color, and configuration should be explicitly described. AI cannot infer what isn\'t written.',
  },
  {
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.1)',
    border: 'rgba(14,165,233,0.2)',
    Icon: Globe,
    name: 'Availability Signals',
    desc: 'In stock, shipping time, delivery region — these signals drive AI product recommendations. Vague availability kills discoverability.',
  },
  {
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.2)',
    Icon: Shield,
    name: 'Merchant Identity Clarity',
    desc: 'Is your brand clearly identified? AI shopping assistants need to know who is selling the product, not just what it is.',
  },
  {
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.2)',
    Icon: BarChart3,
    name: 'Comparative Context',
    desc: 'Content that explains why your product is different — and better — gives AI the context to recommend you over a competitor.',
  },
];

const problems = [
  {
    label: 'The problem',
    body: 'AI shopping assistants can\'t recommend what they can\'t clearly read. No schema, vague prices, missing variants — your product becomes invisible.',
    dim: true,
  },
  {
    label: 'What\'s changed',
    body: 'ChatGPT, Perplexity, and Gemini now surface product recommendations directly. The brands with clean, structured product data win.',
    highlight: true,
  },
  {
    label: 'The rain OS approach',
    body: 'Score your product pages against the 5 AI shopping signals Gemini actually checks. Fix what\'s missing. Get recommended.',
    dim: false,
  },
];

const steps = [
  { num: '01', title: 'Paste your product page', desc: 'Drop in your product description, page copy, or any product-focused content.' },
  { num: '02', title: 'Get your Product Discoverability Score', desc: 'See exactly how AI shopping assistants read your product — and what\'s blocking a recommendation.' },
  { num: '03', title: 'Fix the signals, get recommended', desc: 'Apply targeted fixes and re-score until your product is AI-shopping-ready.' },
];

const comparisons = [
  { signal: 'Pricing transparency scoring', standard: false, rain: true },
  { signal: 'Product variant coverage analysis', standard: false, rain: true },
  { signal: 'Availability signal detection', standard: false, rain: true },
  { signal: 'Merchant identity clarity', standard: false, rain: true },
  { signal: 'Comparative context analysis', standard: false, rain: true },
  { signal: 'AI Readability scoring', standard: false, rain: true },
  { signal: 'Digital Authority scoring', standard: false, rain: true },
  { signal: 'Conversion Readiness scoring', standard: false, rain: true },
  { signal: 'RAG Readiness scoring', standard: false, rain: true },
  { signal: 'Traditional SEO scoring', standard: true, rain: true },
];

export default function ProductSellers() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-orange-500/30">
      <MarketingNav onGetStartedClick={() => navigate('/login')} onLoginClick={() => navigate('/login?mode=login')} />

      <main className="flex-grow">
        <section className="pt-44 pb-28 relative z-10 px-6 overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.18) 0%, transparent 70%)',
            }}
          />

          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] text-white mb-6"
                style={{ letterSpacing: '-0.04em' }}
              >
                Your products.{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #fdba74, #fb923c)' }}
                >
                  Discovered by AI.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                ChatGPT, Perplexity, and Gemini are now recommending products. rain OS scores your product pages against the exact signals AI shopping assistants use — so your products get recommended, not skipped.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {['Ecommerce Brands', 'DTC Companies', 'Product Marketers', 'Shopify Sellers'].map(
                (label) => (
                  <span
                    key={label}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: 'rgba(249,115,22,0.08)',
                      border: '1px solid rgba(249,115,22,0.2)',
                      color: '#fdba74',
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
                  background: '#fb923c',
                  boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f97316')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fb923c')}
              >
                Score your product page free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
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
                AI shopping is here. Most product pages aren't ready.
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
                When someone asks ChatGPT "what's the best X to buy?", AI engines surface products based on structured signals — schema markup, pricing clarity, variant coverage — not keyword density. Most product pages fail these checks invisibly.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {problems.map((c, i) => (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`rounded-2xl border p-6 ${
                    c.highlight
                      ? 'border-orange-400/30 bg-orange-500/5'
                      : c.dim
                      ? 'border-white/5 bg-white/[0.02]'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <p className={`text-sm font-bold mb-2 ${c.highlight ? 'text-orange-300' : c.dim ? 'text-slate-600' : 'text-white'}`}>
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
              <span
                className="font-bold tracking-wider text-xs uppercase mb-3 block"
                style={{ color: '#fb923c' }}
              >
                Product Discoverability Module
              </span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
                5 signals. One Product Score.
              </h2>
              <p className="text-slate-400 max-w-xl leading-relaxed">
                Every product page analysis returns a weighted score across the signals AI shopping assistants actually use when deciding what to recommend.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pdSignals.map((p, i) => (
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
              className="text-center mb-14"
            >
              <span className="font-bold tracking-wider text-xs uppercase mb-3 block text-orange-400">Simple workflow</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">From invisible to recommended in three steps</h2>
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

        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
                  What rain OS checks that no one else does
                </h2>
              </div>
              <div className="bg-surface/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="grid grid-cols-3 border-b border-white/10 bg-white/5">
                  <div className="p-5 font-bold text-white text-sm">Signal</div>
                  <div className="p-5 font-bold text-slate-400 text-center text-sm">Standard SEO</div>
                  <div className="p-5 font-bold text-center text-sm border-x border-white/5" style={{ color: '#fb923c', background: 'rgba(249,115,22,0.05)' }}>
                    rain OS
                  </div>
                </div>
                {comparisons.map((f, i) => (
                  <div key={i} className="grid grid-cols-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <div className="p-5 flex items-center text-slate-300 text-sm">{f.signal}</div>
                    <div className="p-5 flex items-center justify-center">
                      {f.standard ? <span className="text-slate-500">✓</span> : <span className="text-slate-700">✕</span>}
                    </div>
                    <div className="p-5 flex items-center justify-center border-x border-white/5" style={{ background: 'rgba(249,115,22,0.03)' }}>
                      {f.rain ? <span className="font-bold" style={{ color: '#fb923c' }}>✓</span> : <span className="text-slate-700">✕</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-28 px-6 border-t border-white/[0.06] relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.06) 0%, transparent 70%)' }}
          />
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                Ready to get your products recommended?
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Paste your product page and get a full Product Discoverability score in seconds. Free to start.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-white rounded-xl px-8 py-4 text-sm font-bold transition-all hover:scale-105 active:scale-95 group"
                  style={{
                    background: '#fb923c',
                    boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f97316')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#fb923c')}
                >
                  Score your product page free
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
