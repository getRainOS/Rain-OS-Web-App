import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  FourPillars,
  LocalBusinessBadge,
} from '@/components/marketing/MarketingComponents';
import { DemoShowcase } from '@/components/marketing/DemoShowcase';
import MarketingNav from '@/components/marketing/MarketingNav';

interface LandingPageProps {
  onAnalyze: (content: string, siteType: string) => void;
  onLoginClick: () => void;
  onGetStartedClick?: () => void;
}

export default function LandingPage({ onAnalyze, onLoginClick, onGetStartedClick }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-rain-500/30">
      <MarketingNav onLoginClick={onLoginClick} onGetStartedClick={onGetStartedClick || onLoginClick} />
      <main className="flex-grow">
        <section className="pt-40 pb-24 md:pt-52 md:pb-40 relative z-10 px-6 overflow-hidden" style={{ paddingTop: '10rem', paddingBottom: '6rem' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none -z-10" style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.32) 0%, rgba(14,165,233,0.14) 35%, rgba(14,165,233,0.04) 60%, transparent 80%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[260px] pointer-events-none -z-10" style={{ background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.22) 0%, rgba(14,165,233,0.10) 50%, transparent 80%)', filter: 'blur(16px)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[500px] bg-arc-glow opacity-60 pointer-events-none -z-10" />
          <div className="max-w-5xl mx-auto flex flex-col gap-12 items-center">
            <div className="flex justify-end w-full max-w-5xl">
              <LocalBusinessBadge />
            </div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="text-center space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.05] text-white" style={{ letterSpacing: '-0.04em', fontFeatureSettings: '"cv11" on, "ss01" on, "calt" on' }}>
                Vibe Coded Your SaaS, Web Site Or Web App?{' '}
                <span className="text-sky-400">Find Out How AI Reads It.</span>
              </h1>
              <p className="text-slate-400 text-base md:text-lg font-normal max-w-xl mx-auto leading-relaxed">
                Find out how ChatGPT, Perplexity, and Gemini read your content — and how likely they are to cite it when someone asks a question you should own.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStartedClick || onLoginClick}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-8 py-3.5 text-sm font-bold shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 group"
              >
                Start optimizing free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a href="/content-writers" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                See how it works for writers →
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }} className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-4 py-1.5 mb-5">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">The vibe coder trap</span>
              </div>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-5">
                You built something incredible in a weekend. Bolt shipped the landing page. Cursor wired the backend. Lovable made it look like a million-dollar product. But here is the problem nobody talks about: <strong className="text-white">AI cannot actually read your site.</strong>
              </p>
              <p className="text-slate-400 text-base leading-relaxed mb-5">
                ChatGPT, Perplexity, and Gemini do not see what you see. They strip out your beautiful animations, ignore your visual hierarchy, and extract raw text from the DOM. If your headings are buried in nested divs, your value prop is hidden behind CSS trickery, or your schema markup is missing, AI treats your content as noise. The same thing that makes your site feel premium to humans makes it invisible to the engines that now control search.
              </p>
              <p className="text-slate-400 text-base leading-relaxed mb-5">
                Worse: if someone asks "what is the best tool for X" and your product is exactly that answer, but your site structure is a mess, AI will cite your competitor instead. The code you vibe-coded in three hours is silently costing you customers every single day.
              </p>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed">
                <strong className="text-sky-400">rain OS fixes this in under 60 seconds.</strong> Paste your homepage, scan your URL, or connect your repo. We show you exactly what AI sees, score how readable it is, and tell you what to change so you get cited instead of skipped.
              </p>
            </motion.div>
          </div>
        </section>
        <div className="px-6">
          <FourPillars />
          <DemoShowcase onAnalyzeClick={() => {}} />
        </div>
      </main>
    </div>
  );
}
