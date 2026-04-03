import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HybridFuture, FourPillars, FeatureGrid, ReadabilityIntelligence,
  ComparisonTable, Testimonials, Pricing, FAQ, CTA, VibeCoderBand
} from '@/components/marketing/MarketingComponents';
import { RainfallBeams } from '@/components/RainfallBeams';

interface LandingPageProps {
  onAnalyze: (content: string, industry: string) => void;
  onLoginClick: () => void;
  onGetStartedClick?: () => void;
}

export default function LandingPage({ onAnalyze, onLoginClick, onGetStartedClick }: LandingPageProps) {
  const [content, setContent] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAnalyze(content, industry);
  };

  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-rain-500/30">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center ${isScrolled ? 'py-4' : 'py-6'}`}>
        <div className={`flex items-center justify-between px-8 transition-all duration-500 ${
          isScrolled
            ? 'w-full max-w-5xl py-3 rounded-full bg-midnight/60 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/40'
            : 'w-full max-w-7xl bg-transparent border-transparent'
        }`}>
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 group">
              <span className="font-bold text-3xl tracking-tighter text-white transition-all">
                r<span className="text-sky-400">ai</span>n
              </span>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="https://www.getrainos.com/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
            <a href="https://www.getrainos.com/wordpress-plugin" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WordPress Plugin</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block"
            >
              Login
            </button>
            <button
              onClick={onGetStartedClick || onLoginClick}
              className="bg-sky-500 hover:bg-sky-400 text-white rounded-lg px-5 py-2 text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-40 pb-24 md:pt-52 md:pb-40 relative z-10 px-6 overflow-hidden" style={{ paddingTop: '10rem', paddingBottom: '6rem' }}>
          <RainfallBeams />

          {/* Single center bloom — one clean light source */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.11) 0%, rgba(14,165,233,0.04) 50%, transparent 75%)' }} />

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[500px] bg-arc-glow opacity-60 pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto flex flex-col gap-12 items-center">
            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center space-y-5"
            >
              {/* Accent chip */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-400 text-xs font-medium tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Built for AI-generated sites & content
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] text-white"
                style={{ letterSpacing: '-0.04em', fontFeatureSettings: '"cv11" on, "ss01" on, "calt" on' }}>
                Score Your Content's{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-sky-200 to-sky-400">
                  AI Readability
                </span>
              </h1>
              <p className="text-slate-400 text-base md:text-lg font-normal max-w-xl mx-auto leading-relaxed">
                Find out how ChatGPT, Perplexity, and Gemini read your content — and how likely they are to cite it when someone asks a question you should own.
              </p>
            </motion.div>

            {/* Content Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-3xl"
            >
              {/* Subtle border gradient */}
              <div className="absolute -inset-[1px] rounded-[25px] pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(255,255,255,0.04), rgba(56,189,248,0.06))', filter: 'blur(0px)' }} />
              <form onSubmit={handleSubmit} className="card-surface p-2 text-left relative group" style={{ boxShadow: '0 0 40px rgba(14,165,233,0.07), 0 20px 60px -12px rgba(0,0,0,0.7)' }}>
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your content here to get started..."
                    className="w-full h-40 bg-transparent border-0 resize-none p-6 text-slate-200 placeholder:text-slate-600 focus:ring-0 focus:outline-none text-lg leading-relaxed font-sans relative z-10"
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

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Industry</span>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="bg-transparent border-0 text-slate-400 text-xs font-semibold focus:ring-0 focus:outline-none cursor-pointer hover:text-white transition-colors p-0 uppercase tracking-widest"
                      >
                        <option value="Technology" className="bg-[#0b0f19] text-slate-300">Technology</option>
                        <option value="Marketing" className="bg-[#0b0f19] text-slate-300">Marketing</option>
                        <option value="Healthcare" className="bg-[#0b0f19] text-slate-300">Healthcare</option>
                        <option value="Finance" className="bg-[#0b0f19] text-slate-300">Finance</option>
                        <option value="Ecommerce" className="bg-[#0b0f19] text-slate-300">E-commerce</option>
                        <option value="General" className="bg-[#0b0f19] text-slate-300">General</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-all flex items-center gap-2 group/btn"
                      style={{ boxShadow: '0 0 16px rgba(14,165,233,0.25), 0 2px 8px rgba(0,0,0,0.4)' }}
                    >
                      Analyze now
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Secondary Hero Text */}
            {/* Stat strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap items-center justify-center gap-3 -mt-4"
            >
              {[
                { label: '4 AI Pillars Scored', color: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.3)', text: '#7dd3fc' },
                { label: 'Instant Results', color: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.3)', text: '#5eead4' },
                { label: 'WordPress & Web App', color: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)', text: '#93c5fd' },
                { label: 'Works with Bolt, Lovable, Cursor & more', color: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', text: '#c4b5fd' },
              ].map((s) => (
                <span key={s.label} className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                  style={{ background: s.color, border: `1px solid ${s.border}`, color: s.text }}>
                  {s.label}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-8 text-center flex flex-col items-center mt-12"
            >
              <div className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-bold text-sky-300 tracking-[0.2em] uppercase shadow-[0_0_16px_rgba(56,189,248,0.15)]">
                <span className="flex h-2 w-2 rounded-full bg-sky-400 mr-3 animate-pulse" />
                Answer Engine Optimization
              </div>

              <h2 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight text-white max-w-3xl">
                Built for the Way{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-400 to-teal-400 drop-shadow-lg">
                  People Search Now
                </span>
              </h2>

              <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light max-w-2xl mx-auto">
                <strong className="text-white font-semibold">rain OS</strong> scores your content against the signals that AI tools use to choose their answers — so you show up when people ask questions, not just when they type keywords.
              </p>
            </motion.div>
          </div>
        </section>

        <VibeCoderBand onGetStarted={onGetStartedClick || onLoginClick} />

        <div id="features">
          <HybridFuture />
          <FourPillars />
          <FeatureGrid />
          <ReadabilityIntelligence />
          <ComparisonTable />
          <Testimonials />
        </div>
        <div id="pricing">
          <Pricing />
        </div>
        <FAQ />
        <CTA />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-midnight py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-3xl tracking-tighter text-white">
              r<span className="text-sky-400">ai</span>n
            </span>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <a
              href="https://www.getrainos.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="https://www.getrainos.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a href="mailto:support@getrainos.com" className="hover:text-white transition-colors">
              Support
            </a>
          </div>

          <div className="text-right text-xs text-slate-600">
            © {new Date().getFullYear()} rain OS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
