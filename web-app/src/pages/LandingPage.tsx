import React, { useState, useEffect, useRef } from 'react';
import TypewriterPlaceholder from '@/components/TypewriterPlaceholder';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowRight } from 'lucide-react';
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

const SITE_TYPES = [
  { value: 'SaaS app / web app', label: 'SaaS app / web app', hint: 'Tune for onboarding, feature clarity, and trust', focus: 'conversion readiness + product discoverability' },
  { value: 'Marketing site / landing page', label: 'Marketing site / landing page', hint: 'Tune for hero, proof, and CTA conversion', focus: 'conversion readiness + AI readability' },
  { value: 'Blog / content site', label: 'Blog / content site', hint: 'Tune for answer-first structure and citations', focus: 'AI readability + digital authority' },
  { value: 'Ecommerce / product page', label: 'Ecommerce / product page', hint: 'Tune for benefits, FAQs, and product signals', focus: 'product discoverability + conversion readiness' },
  { value: 'Docs / knowledge base', label: 'Docs / knowledge base', hint: 'Tune for clarity, snippetability, and steps', focus: 'AI readability + discoverability' },
  { value: 'Local / service business', label: 'Local / service business', hint: 'Tune for trust, services, and contact intent', focus: 'SEO + local authority + conversion readiness' },
  { value: 'Other', label: 'Other', hint: 'General optimization for any web content', focus: 'balanced across all pillars' },
];

export default function LandingPage({ onAnalyze, onLoginClick, onGetStartedClick }: LandingPageProps) {
  const [content, setContent] = useState('');
  const [siteType, setSiteType] = useState('SaaS app / web app');
  const [heroFocused, setHeroFocused] = useState(false);
  const heroInputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAnalyze(content, siteType);
  };

  const selectedSiteType = SITE_TYPES.find(option => option.value === siteType) || SITE_TYPES[0];

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
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="text-center space-y-5">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.05] text-white" style={{ letterSpacing: '-0.04em', fontFeatureSettings: '"cv11" on, "ss01" on, "calt" on' }}>
                Vibe Coded Your Website or App?
              </h1>
              <p className="text-slate-400 text-base md:text-lg font-normal max-w-xl mx-auto leading-relaxed">
                Find out how ChatGPT, Perplexity, Gemini, and Google Search read your content — and how likely they are to cite it when someone asks for a solution you should own.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative w-full max-w-3xl">
              <div className="absolute -inset-[1px] rounded-[25px] pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(255,255,255,0.04), rgba(56,189,248,0.06))' }} />
              <form onSubmit={handleSubmit} className="card-surface p-2 text-left relative group" style={{ boxShadow: '0 0 40px rgba(14,165,233,0.07), 0 20px 60px -12px rgba(0,0,0,0.7)' }}>
                <div className="relative">
                  <TypewriterPlaceholder value={content} isFocused={heroFocused} padding="24px" fontSize="18px" lineHeight="1.625" color="rgba(255,255,255,0.28)" />
                  <textarea ref={heroInputRef} value={content} onChange={(e) => setContent(e.target.value)} onFocus={() => setHeroFocused(true)} onBlur={() => setHeroFocused(false)} className="w-full h-40 bg-transparent border-0 resize-none p-6 text-slate-200 focus:ring-0 focus:outline-none text-lg leading-relaxed font-sans relative z-10" required />
                </div>
                <div className="px-6 pb-4 relative z-10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <button type="button" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90" onClick={() => setContent('')} title="Clear">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Site type</span>
                        <select value={siteType} onChange={(e) => setSiteType(e.target.value)} className="bg-transparent border-0 text-slate-400 text-xs font-semibold focus:ring-0 focus:outline-none cursor-pointer hover:text-white transition-colors p-0 uppercase tracking-widest max-w-[240px]">
                          {SITE_TYPES.map(option => <option key={option.value} value={option.value} className="bg-[#0b0f19] text-slate-300">{option.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button type="submit" size="sm" className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-all flex items-center gap-2 group/btn" style={{ boxShadow: '0 0 16px rgba(14,165,233,0.25), 0 2px 8px rgba(0,0,0,0.4)' }}>
                        Analyze now
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">{selectedSiteType.label}</span>
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">{selectedSiteType.focus}</span>
                  </div>
                </div>
              </form>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }} className="flex flex-col items-center text-center gap-5 w-full max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-4 py-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">For vibe coders</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight" style={{ letterSpacing: '-0.03em' }}>
                Your AI built the site.{' '}
                <span className="text-emerald-400">Now paste the content, scan the URL, or connect the repo.</span>
              </h2>
            </motion.div>
          </div>
        </section>
        <div className="px-6">
          <FourPillars />
          <DemoShowcase onAnalyzeClick={() => onAnalyze(content, siteType)} />
        </div>
      </main>
    </div>
  );
}
