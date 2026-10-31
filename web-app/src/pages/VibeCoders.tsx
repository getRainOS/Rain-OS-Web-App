import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';
import VibeWorkflowDiagram from '@/components/VibeWorkflowDiagram';
import SiteFooter from '@/components/marketing/SiteFooter';
import { ROTATING_WORDS, repoPillars, vibeSignals, platforms, FIX_PROMPT, URL_FIX_PROMPT, ScoreCard, TerminalLine, TypewriterLine, ScanningDots, useDemoAnimation, DemoHeader, ScoreCards, TerminalPanel, RepoDemo, wait } from '../components/vibe/VibeParts';
export default function VibeCoders() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [repoDemoVisible, setRepoDemoVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-white/20">
      <MarketingNav
        light
        onGetStartedClick={() => navigate('/login')}
        onLoginClick={() => navigate('/login?mode=login')}
      />

      <main className="flex-grow">
        {/* Hero */}
        <section className="pt-32 md:pt-44 pb-20 md:pb-28 relative z-10 px-4 md:px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Rotating subheading */}
              <div className="mb-4">
                <span
                  className="inline-flex items-center gap-1 flex-wrap justify-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white"
                  style={{ letterSpacing: '-0.04em', fontFeatureSettings: '"cv11" on, "ss01" on, "calt" on' }}
                >
                  <span>Vibe Coded Your</span>
                  <span className="inline-block relative text-white min-w-[6rem] sm:min-w-[8rem] md:min-w-[10rem]">
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
                  style={{ backgroundImage: 'linear-gradient(135deg, #ffffff, #a3a3a3)' }}
                >
                  invisible to AI.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Bolt, Lovable, Cursor, and v0 build beautiful sites fast. But AI crawlers can't read them. Missing structured data, no llms.txt, JS-rendered content — if LLMs can't parse your page, you won't be cited.
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
                  className="px-4 py-1.5 rounded-md text-xs font-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#a3a3a3',
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
                className="flex items-center gap-2 text-white rounded-xl px-8 py-3.5 text-sm font-bold transition-all hover:scale-105 active:scale-95 group"
                style={{ background: 'var(--cyan)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#d4d4d4')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--cyan)')}
              >
                Scan my repo or URL free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Stat banner — real, cited industry data, not a customer claim */}
        <section
          className="relative overflow-hidden border-t border-white/10 py-20 px-6"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            backgroundPosition: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative max-w-3xl mx-auto text-center"
          >
            <div className="text-6xl md:text-8xl font-bold tracking-tight text-white">47%</div>
            <p className="mt-5 text-lg md:text-xl text-neutral-300 max-w-xl mx-auto leading-relaxed">
              drop in click-through to normal search results when Google shows an AI Overview instead.
            </p>
            <p className="mt-4 text-xs text-neutral-500 uppercase tracking-wider">
              Pew Research Center, July 2025
            </p>
          </motion.div>
        </section>

        {/* The Problem */}
        <section className="py-16 px-6 border-t border-white/10">
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
              <p className="text-neutral-400 max-w-2xl mx-auto leading-relaxed">
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
                  body: "ChatGPT, Gemini, and Perplexity read your llms.txt, meta tags, structured data, and robots.txt before they ever render your React components. If those are missing, you're not in the index.",
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
                      ? 'border-white/20 bg-white/5'
                      : c.dim
                      ? 'border-white/5 bg-white/[0.03]'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <p
                    className={`text-sm font-bold mb-2 ${
                      c.highlight ? 'text-neutral-300' : c.dim ? 'text-neutral-400' : 'text-white'
                    }`}
                  >
                    {c.label}
                  </p>
                  <p className={`text-sm leading-relaxed ${c.dim ? 'text-neutral-400' : 'text-neutral-400'}`}>{c.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <VibeWorkflowDiagram />

        {/* What We Analyze */}
        <section className="py-24 px-6 border-t border-white/10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="text-white font-bold tracking-wider text-xs uppercase mb-3 block">8 signals scored</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">What we analyze in your repo or URL</h2>
              <p className="text-neutral-400 max-w-xl leading-relaxed">
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
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-7 hover:border-white/20 hover:bg-white/[0.045] transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))',
                      border: `1px solid ${p.border}`,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                  >
                    <p.Icon className="w-5 h-5" strokeWidth={1.5} style={{ color: p.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">{p.name}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">{p.desc}</p>
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
          <RepoDemo isVisible={repoDemoVisible} />
        </motion.div>

        {/* Five Pillars — Dynamic Scores */}
        <section
          className="py-24 px-6 border-t border-white/10 relative"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '120px 100%',
            backgroundPosition: 'center',
          }}
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="text-white font-bold tracking-wider text-xs uppercase mb-3 block">Scoring breakdown</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Five of six pillars, granular signals</h2>
              <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed mb-3">
                Every repo scan and URL check breaks down into these five core areas.
              </p>
              <p className="text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
                Hover over any metric in the cards below to see a deeper explanation of what each signal means.
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
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0.15))',
                        border: `1px solid ${p.border}`,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                      }}
                    >
                      <p.Icon className="w-5 h-5" strokeWidth={1.5} style={{ color: p.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                      <span className="text-xs text-neutral-400">4 signals scored</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {p.subSignals.map((sig, j) => (
                      <div
                        key={sig.name}
                        className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs cursor-default"
                        style={{
                          background: 'rgba(0,0,0,0.15)',
                          border: `1px solid ${p.border}`,
                        }}
                      >
                        <span className="flex items-center justify-center w-4 h-4 rounded-full shrink-0" style={{ background: 'rgba(0,0,0,0.2)' }}>
                          <CheckCircle2 className="w-3 h-3" style={{ color: p.color }} />
                        </span>
                        <span className="text-neutral-400">{sig.name}</span>
                        {/* Hover tooltip */}
                        {sig.description && (
                          <div className="hidden md:block absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="rounded-lg bg-[#000000] border border-white/10 p-3 shadow-xl">
                              <p className="text-xs text-neutral-300 leading-relaxed">{sig.description}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t" style={{ borderColor: p.border }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">Weight in overall score</span>
                      <span className="text-xs font-bold" style={{ color: p.color }}>
                        {i === 0 ? '32%' : i === 1 ? '32%' : i === 2 ? '26%' : i === 3 ? '0%' : '10%'}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${p.color}, ${p.color}88)`,
                          width: `${i === 0 ? 32 : i === 1 ? 32 : i === 2 ? 26 : i === 3 ? 0 : 10}%`,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Screenshots */}
        <section className="py-24 px-6 border-t border-white/10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="text-white font-bold tracking-wider text-xs uppercase mb-3 block">Inside rain OS</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Built for people who ship fast</h2>
              <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed">
                You already watch your build's deploy logs. This is the same instinct, pointed at whether AI can actually read what you shipped — real trendlines, not a vibe check.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-white/10 overflow-hidden mb-6"
              style={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)' }}
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a0a] border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="ml-3 text-xs text-neutral-500 font-mono">getrainos.com/dashboard</span>
              </div>
              <img src="/screenshots/dashboard-chart.png" alt="rain OS pillar breakdown dashboard showing AI Readability, Digital Authority, Conversion Readiness, and Easy to Quote trendlines" className="w-full block" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="md:col-span-3 rounded-2xl border border-white/10 overflow-hidden"
                style={{ boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)' }}
              >
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a0a] border-b border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="ml-3 text-xs text-neutral-500 font-mono">getrainos.com/citation-monitor</span>
                </div>
                <img src="/screenshots/citation-map.png" alt="rain OS citation map showing which countries AI tools are citing your domain from" className="w-full block" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-7 h-full flex flex-col justify-center"
              >
                <h3 className="text-base font-semibold text-white mb-3">You shipped it in an afternoon. Now find out if AI can even see it.</h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                  Repo scans, live-site checks, citation tracking, and a world map of where your domain actually gets cited — the same dashboard whether you vibe-coded it in Bolt or hand-wrote every line.
                </p>
                <a href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-neutral-300 transition-colors">
                  Scan your build free
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 px-6 border-t border-white/10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-10"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Stop building in the dark.</h2>
              <p className="text-neutral-400 mb-8 max-w-lg mx-auto leading-relaxed">
                Scan your repo or URL for AI discoverability. Check any URL for technical AI-readiness signals. Free to start, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-white rounded-xl px-8 py-3.5 text-sm font-bold transition-all hover:scale-105 active:scale-95 group"
                style={{ background: 'var(--cyan)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#d4d4d4')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--cyan)')}
                >
                  Scan my repo or URL free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
