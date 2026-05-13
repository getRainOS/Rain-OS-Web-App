import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, ShieldCheck, MousePointerClick, SearchCheck, Network, Target, 
  Sparkles, FileJson, Layers, Cpu, Users, Globe2, AlertTriangle, Shield,
  Search, Info, Plus, Minus, CheckCircle2,
  FileText, Globe, GitBranch, ArrowRight, Lock, MapPin, BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HybridFuture = () => {
  return (
    <section id="hybrid-future" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex flex-col items-center mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rain-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative flex items-center justify-center w-full max-w-2xl mx-auto">
            <div className="w-48 h-48 rounded-full border border-rain-400 bg-rain-500/10 flex items-center justify-center absolute -translate-x-16 z-10">
              <div className="flex flex-col items-center gap-2">
                <Users className="w-8 h-8 text-rain-400" />
                <span className="text-rain-400 font-bold tracking-wider text-sm uppercase">Humans</span>
              </div>
            </div>
            <div className="w-48 h-48 rounded-full border border-emerald-400 bg-emerald-500/10 mix-blend-screen flex items-center justify-center absolute translate-x-16 z-10">
              <div className="flex flex-col items-center gap-2">
                <Cpu className="w-8 h-8 text-emerald-400" />
                <span className="text-emerald-400 font-bold tracking-wider text-sm uppercase">Machines</span>
              </div>
            </div>
            <div className="z-20 flex flex-col items-center bg-midnight/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <span className="font-bold text-white">rain OS</span>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent my-1" />
              <Sparkles className="w-4 h-4 text-rain-400" />
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="card-gradient rounded-3xl p-8 hover:border-white/20 transition-all">
            <Globe2 className="w-8 h-8 text-slate-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">The Old Way (SEO)</h3>
            <p className="text-slate-400 leading-relaxed">Traditional SEO still matters for discovery, indexing, and local visibility. It works for Google, but fails when AI models try to extract facts and logic from your content.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="card-gradient rounded-3xl p-8 hover:border-white/20 transition-all relative overflow-hidden">
            <AlertTriangle className="w-8 h-8 text-rose-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">The Hybrid Gap</h3>
            <p className="text-slate-400 leading-relaxed relative z-10">AI-generated and vibe-coded sites built on Bolt, Lovable, or Cursor look great — but they're often invisible to AI crawlers. Missing schema, no llms.txt, JS-rendered content: if LLMs can't parse your page, you won't be cited.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="card-gradient rounded-3xl p-8 hover:border-rain-400/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <Shield className="w-8 h-8 text-rain-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">Insurance</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">The rain OS Standard</h3>
            <p className="text-slate-400 leading-relaxed">We bridge the gap. We ensure your content is structured for AI extraction while maintaining traditional SEO benefits.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const LocalBusinessBadge = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-300 hover:bg-rose-500/15 hover:border-rose-400/50 transition-all">
      <BadgeCheck className="w-3.5 h-3.5" />
      Local Business
      <span className="text-[10px] font-semibold normal-case tracking-normal text-rose-200/80">SEO + Google Calling</span>
    </button>
  );
};

export const FourPillars = () => {
  const pillars = [
    { name: 'AI Readability', weight: '40%', tagline: 'Can AI actually read your source?', description: 'Vibe-coded sites render great in a browser, but AI crawlers read the raw HTML. This scores how well your source actually translates into machine-extractable answers — the #1 gap in AI-generated sites.', color: 'rain-400', bgColor: 'bg-rain-500/20', Icon: BrainCircuit },
    { name: 'Digital Authority', weight: '30%', tagline: 'Is your site a source AI will quote?', description: 'AI tools built your site fast, but they skipped the trust markup. This pillar scores the schema, entity clarity, and credibility signals that make AI engines treat your domain as a quotable source.', color: 'emerald-400', bgColor: 'bg-emerald-500/20', Icon: ShieldCheck },
    { name: 'Conversion Readiness', weight: '30%', tagline: 'Does your site convert AI-referred visitors?', description: 'Getting traffic from AI is only half the job. This pillar scores whether your site’s copy actually converts that traffic — CTA clarity, trust proof, and friction that vibe-coded landing pages routinely miss.', color: 'violet-400', bgColor: 'bg-violet-500/20', Icon: MousePointerClick },
  ];

  return (
    <section id="three-pillars" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-end mb-6"><LocalBusinessBadge /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div key={pillar.name} className="card-gradient rounded-3xl p-8">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${pillar.bgColor} border border-white/10 flex items-center justify-center`}>
                  <pillar.Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{pillar.weight}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{pillar.name}</h3>
              <p className="text-slate-400 mb-4">{pillar.tagline}</p>
              <p className="text-slate-300 leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
