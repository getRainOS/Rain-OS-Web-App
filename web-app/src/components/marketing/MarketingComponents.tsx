import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, ShieldCheck, MousePointerClick, SearchCheck, Network, Target, 
  Sparkles, FileJson, Layers, Cpu, Users, Globe2, AlertTriangle, Shield,
  TrendingDown, Search, Quote, BarChart, Info, Plus, Minus, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HybridFuture = () => {
  return (
    <section id="hybrid-future" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-24 relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rain-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative flex items-center justify-center w-full max-w-2xl mx-auto">
            {/* Venn Diagram */}
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
            <p className="text-slate-400 leading-relaxed">Traditional SEO focuses on keywords and backlinks. It works for Google, but fails when AI models try to extract facts and logic from your content.</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="card-gradient rounded-3xl p-8 hover:border-white/20 transition-all relative overflow-hidden">
            <AlertTriangle className="w-8 h-8 text-rose-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">The Hybrid Gap</h3>
            <p className="text-slate-400 leading-relaxed relative z-10">As search shifts to AI answers, traditional traffic is dropping. If LLMs can't parse your content, you won't be cited in the new search landscape.</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="card-gradient rounded-3xl p-8 hover:border-rain-400/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <Shield className="w-8 h-8 text-rain-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">Insurance</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">The rain OS Standard</h3>
            <p className="text-slate-400 leading-relaxed">We bridge the gap. We ensure your content is perfectly structured for AI extraction while maintaining all traditional SEO benefits.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const FourPillars = () => {
  const pillars = [
    {
      name: 'AI Readability',
      weight: '30%',
      tagline: 'Can AI actually extract your answers?',
      description: 'Measures how easily ChatGPT, Perplexity, and Gemini can parse, chunk, and lift exact answers from your content — the foundation of being cited.',
      color: 'rain-400',
      glowColor: 'rgba(14,165,233,0.25)',
      borderColor: 'rain-400/50',
      viaColor: 'via-sky-400',
      bgColor: 'bg-rain-500/20',
      dotColor: 'bg-rain-500',
      Icon: BrainCircuit,
      scores: ['Structural Clarity', 'Answer-First Formatting', 'Semantic Precision', 'Context Sufficiency', 'Section Concept Isolation'],
    },
    {
      name: 'Digital Authority',
      weight: '25%',
      tagline: 'Does AI trust you enough to cite you?',
      description: 'AI models only quote sources they consider credible. This pillar scores the trust signals — citations, entity clarity, and expertise depth — that make you citable.',
      color: 'emerald-400',
      glowColor: 'rgba(16,185,129,0.25)',
      borderColor: 'emerald-400/50',
      viaColor: 'via-emerald-400',
      bgColor: 'bg-emerald-500/20',
      dotColor: 'bg-emerald-500',
      Icon: ShieldCheck,
      scores: ['Citation Signals', 'Entity Clarity', 'Topical Authority', 'Freshness Signals', 'Social Proof Markup'],
    },
    {
      name: 'Conversion Readiness',
      weight: '25%',
      tagline: 'Does your content move people to act?',
      description: "Getting cited is half the battle. This pillar scores how effectively your content turns AI-referred visitors into customers — from CTA clarity to objection handling.",
      color: 'violet-400',
      glowColor: 'rgba(139,92,246,0.2)',
      borderColor: 'violet-400/50',
      viaColor: 'via-violet-400',
      bgColor: 'bg-violet-500/20',
      dotColor: 'bg-violet-500',
      Icon: MousePointerClick,
      scores: ['CTA Clarity', 'Trust Signals', 'Value Proposition', 'Friction Reduction'],
    },
    {
      name: 'Product Discoverability',
      weight: '20%',
      tagline: 'Will AI recommend your product?',
      description: 'As ChatGPT and Gemini become shopping assistants, this pillar ensures your product data — pricing, variants, availability — is structured so AI recommends you over competitors.',
      color: 'orange-400',
      glowColor: 'rgba(249,115,22,0.2)',
      borderColor: 'orange-400/50',
      viaColor: 'via-orange-400',
      bgColor: 'bg-orange-500/20',
      dotColor: 'bg-orange-500',
      Icon: Target,
      scores: ['Product Variant Coverage', 'Merchant Identity Clarity', 'Pricing Transparency', 'Availability Signals', 'Comparative Context'],
    },
  ];

  return (
    <section id="four-pillars" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-rain-400 font-bold tracking-wider text-xs uppercase mb-3 block">The Scoring Framework</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Four Pillars. One Score.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Every analysis returns a weighted score across four dimensions — each one a signal that AI models use to decide what content gets cited, recommended, and surfaced.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`group bg-surface/30 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 transition-all duration-500 hover:border-${p.borderColor} relative overflow-hidden`}
              style={{ '--hover-shadow': p.glowColor } as React.CSSProperties}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 60px ${p.glowColor}`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
            >
              <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent ${p.viaColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl ${p.bgColor} flex items-center justify-center`}>
                  <p.Icon className={`w-6 h-6 text-${p.color}`} />
                </div>
                <span className={`text-xs font-bold text-${p.color} bg-${p.color.replace('400','500')}/10 border border-${p.color.replace('400','500')}/20 px-3 py-1 rounded-full`}>{p.weight} weight</span>
              </div>

              <h3 className={`text-2xl font-bold text-${p.color} mb-1`}>{p.name}</h3>
              <p className="text-slate-500 text-sm font-medium mb-4 italic">{p.tagline}</p>
              <p className="text-slate-400 mb-6 leading-relaxed text-sm">{p.description}</p>

              <ul className="space-y-2">
                {p.scores.map((s, j) => (
                  <li key={j} className="flex items-center text-sm text-slate-300">
                    <span className={`w-1.5 h-1.5 rounded-full ${p.dotColor} mr-3 shrink-0`} /> {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const FeatureGrid = () => {
  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-rain-400 font-bold tracking-wider text-xs uppercase mb-3 block">Under the Hood</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">What No Other Tool Measures</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Beyond the four pillars, rain OS runs a deeper layer of signals that most tools don't even know exist.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 — big feature */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="md:col-span-2 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm rounded-3xl p-8 relative overflow-hidden group hover:border-rain-500/30 transition-all duration-300">
            <BrainCircuit className="absolute -right-10 -bottom-10 w-64 h-64 text-rain-400 opacity-5 group-hover:opacity-10 transition-opacity duration-500" />
            <BrainCircuit className="w-8 h-8 text-rain-400 mb-6 relative z-10" />
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Semantic Precision Scoring</h3>
            <p className="text-slate-400 mb-6 relative z-10 max-w-md">LLMs don't read like humans — they extract facts. We score every sentence on how machine-extractable it is and flag anything too vague to be cited.</p>
            <div className="bg-midnight/50 rounded-xl p-4 border border-white/5 relative z-10">
              <div className="flex items-center gap-2 text-sm text-rose-400 line-through mb-2"><span className="w-2 h-2 rounded-full bg-rose-500" /> "We've seen some really significant growth recently"</div>
              <div className="flex items-center gap-2 text-sm text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> "Revenue grew 34% quarter-over-quarter in Q2 2025"</div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-surface/40 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-sky-500/30 transition-all duration-300">
            <Layers className="w-8 h-8 text-sky-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">RAG Chunking Quality</h3>
            <p className="text-slate-400 text-sm">Most AI systems retrieve content in chunks. We score how cleanly your content breaks into standalone, answerable units — the way retrieval systems actually read it.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-surface/40 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300">
            <SearchCheck className="w-8 h-8 text-emerald-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">Information Gain Score</h3>
            <p className="text-slate-400 text-sm">AI already knows what's common. This score measures how much genuinely new or specific information your content adds — the higher it is, the more likely AI is to quote you over a generic source.</p>
          </motion.div>

          {/* Card 4 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-surface/40 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-orange-500/30 transition-all duration-300">
            <Network className="w-8 h-8 text-orange-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">Query Alignment Score</h3>
            <p className="text-slate-400 text-sm">Maps your content against the real questions people ask AI tools in your topic area. If your content doesn't match the query patterns AI sees, it won't get surfaced.</p>
          </motion.div>

          {/* Card 5 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-surface/40 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-violet-500/30 transition-all duration-300">
            <Target className="w-8 h-8 text-violet-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">Semantic Redundancy Detection</h3>
            <p className="text-slate-400 text-sm">Repeated or padded content dilutes AI extraction confidence. We flag every redundant passage so you can cut it — tighter content scores higher.</p>
          </motion.div>

          {/* Card 6 — big */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="md:col-span-2 bg-gradient-to-br from-cyan-500/[0.05] to-surface/50 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-cyan-500/30 transition-all duration-300">
            <Sparkles className="w-8 h-8 text-cyan-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Rewrite Tools</h3>
            <p className="text-slate-400 max-w-md">Don't just see the problem — fix it. Built-in tools suggest improved titles, generate meta descriptions, summarize for AI snippets, and rewrite vague sentences into citable facts. All without losing your voice.</p>
          </motion.div>

          {/* Card 7 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-surface/40 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-teal-500/30 transition-all duration-300">
            <FileJson className="w-8 h-8 text-teal-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">Multimodal Readiness</h3>
            <p className="text-slate-400 text-sm">Images and tables are invisible to AI unless they're described in text. We flag every non-text element that's missing an AI-readable description.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const ReadabilityIntelligence = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <span className="text-rain-400 font-bold tracking-wider text-xs uppercase mb-2 block flex items-center gap-2">
              <Layers className="w-4 h-4" /> Readability Intelligence
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 leading-[1.1]">
              Built for the AI Era, <br/><span className="text-slate-500">Not 2015.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Traditional SEO tools measure keyword density and Flesch-Kincaid reading scores. But LLMs don't read like humans. They process tokens, entities, and semantic relationships.
            </p>
            <div className="border-l-2 border-rain-500 pl-6 py-2 mb-12">
              <div className="flex items-center gap-2 text-white font-medium mb-2">
                <Sparkles className="w-4 h-4 text-rain-400" /> Good AI Readability = Good SEO.
              </div>
              <p className="text-slate-400 text-sm">When you optimize for machine extraction, human readability naturally improves. It's a win-win.</p>
            </div>

            {/* ExtractionConfidenceChart */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Standard Content (Fluff)</span>
                  <span className="text-rose-400 font-mono">32% confidence</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                  <div className="bg-rose-500/50 h-2 rounded-full" style={{ width: '32%' }} />
                </div>
                <p className="text-xs text-slate-500 italic">"We saw some significant growth recently..."</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white font-medium">rain OS Optimized (Facts)</span>
                  <span className="text-rain-400 font-mono font-bold">98% confidence</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 mb-2 relative">
                  <div className="bg-rain-500 h-2 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" style={{ width: '98%' }} />
                </div>
                <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  "Revenue increased by 24% in Q3 2024."
                </p>
              </div>
            </div>
          </motion.div>

          {/* CycleVisual */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
              <Search className="w-6 h-6 text-rain-400" />
              <div className="text-xs font-bold text-white mt-2 text-center">SEO</div>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-surface border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
              <BrainCircuit className="w-6 h-6 text-teal-400" />
              <div className="text-xs font-bold text-white mt-2 text-center">AEO</div>
            </div>

            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Feeds</div>
              <div className="w-px h-16 bg-gradient-to-b from-rain-400 to-teal-400 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-b-2 border-r-2 border-teal-400 transform rotate-45" />
              </div>
            </div>

            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-px h-16 bg-gradient-to-t from-teal-400 to-rain-400 relative mb-2">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 border-t-2 border-l-2 border-rain-400 transform rotate-45" />
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strengthens</div>
            </div>

            <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] z-10">
              <span className="font-bold text-midnight text-lg">rain OS</span>
              <div className="w-12 h-px bg-slate-200 my-2" />
              <Sparkles className="w-5 h-5 text-rain-500" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const ComparisonTable = () => {
  const features = [
    { name: 'Keyword & Readability Scoring', seo: true, rain: true },
    { name: 'AI Readability Score (LLM parse-ability)', seo: false, rain: true },
    { name: 'Digital Authority & Citation Signals', seo: false, rain: true },
    { name: 'Conversion Readiness Analysis', seo: false, rain: true },
    { name: 'Product Discoverability for AI Shopping', seo: false, rain: true },
    { name: 'RAG Chunking Quality Score', seo: false, rain: true },
    { name: 'Information Gain Score', seo: false, rain: true },
    { name: 'Query Alignment Score', seo: false, rain: true },
    { name: 'Semantic Redundancy Detection', seo: false, rain: true },
    { name: 'Multimodal Readiness Check', seo: false, rain: true },
  ];

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="bg-surface/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-3 border-b border-white/10 bg-white/5">
              <div className="p-6 font-bold text-white">Feature</div>
              <div className="p-6 font-bold text-slate-400 text-center">Traditional SEO</div>
              <div className="p-6 font-bold text-rain-400 text-center bg-rain-500/5 border-x border-white/5">rain OS</div>
            </div>
            
            {features.map((f, i) => (
              <div key={i} className="grid grid-cols-3 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors">
                <div className="p-6 flex items-center gap-2 text-slate-300">
                  {f.name}
                  <div className="relative group/tooltip cursor-help">
                    <Info className="w-4 h-4 text-slate-500" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-midnight border border-white/10 rounded text-xs text-slate-300 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                      Information about {f.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
                    </div>
                  </div>
                </div>
                <div className="p-6 flex items-center justify-center">
                  {f.seo ? <span className="text-slate-500">✓</span> : <span className="text-slate-700">✕</span>}
                </div>
                <div className="p-6 flex items-center justify-center bg-rain-500/5 border-x border-white/5">
                  {f.rain ? <span className="text-rain-400 font-bold">✓</span> : <span className="text-slate-700">✕</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export const Testimonials = () => {
  const quotes = [
    { src: 'Gartner Research', icon: TrendingDown, color: 'text-orange-400', text: "By 2026, traditional search engine volume will drop by 25%..." },
    { src: 'Search Engine Land', icon: Search, color: 'text-rain-400', text: "SEO is evolving into GEO (Generative Engine Optimization)..." },
    { src: 'Bing Webmaster Team', icon: Quote, color: 'text-teal-400', text: "We want to see the same thing that users see..." },
    { src: 'Marketing AI Institute', icon: Quote, color: 'text-emerald-400', text: "The future isn't just links. It's answers..." },
    { src: 'Google DeepMind', icon: BarChart, color: 'text-blue-400', text: "LLMs favor content that reduces token complexity..." },
    { src: 'Neil Patel', icon: Search, color: 'text-rose-400', text: "Optimizing for the answer engine is about becoming the definitive source of truth..." },
    { src: 'Moz', icon: Quote, color: 'text-cyan-400', text: "Structure data and schema are the vocabulary of the AI web..." },
  ];

  return (
    <section className="py-24 relative z-10 overflow-hidden">
      <div className="text-center mb-16 px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">The Market is Speaking</h2>
        <p className="text-slate-400">The shift to AI search is already happening.</p>
      </div>
      
      <div className="mask-fade-sides flex overflow-hidden">
        <motion.div 
          animate={{ x: "-50%" }} 
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-6 px-3 w-max"
        >
          {[...quotes, ...quotes].map((q, i) => (
            <div key={i} className="w-[350px] md:w-[450px] bg-surface/40 border border-white/10 p-8 rounded-2xl shrink-0">
              <q.icon className={`w-8 h-8 mb-6 ${q.color}`} />
              <p className="text-slate-300 text-lg leading-relaxed mb-6">"{q.text}"</p>
              <div className="text-sm font-bold text-white">— {q.src}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export const Pricing = () => {
  const plans = [
    {
      plan: "Free", price: "Free", checkCount: "5 Answer Engine Optimizations / month",
      description: "Great for hobbyists and experimenters. Get full access to all four scoring pillars and see exactly how AI reads your content.",
      buttonText: "Get Started",
      features: [
        "AI Readability Score: How easily LLMs parse your content.",
        "Digital Authority Score: Trust signals AI uses to decide to cite you.",
        "Conversion Readiness Score: How well your content drives action.",
        "Product Discoverability Score: Visibility in AI shopping recommendations.",
        "Actionable recommendations on every analysis.",
        "Built-in AI rewrite tools: titles, meta, summaries."
      ]
    },
    {
      plan: "Business", price: "$29.99", checkCount: "100 Answer Engine Optimizations / month", isPopular: true,
      description: "Perfect for local businesses, early-stage startups, and solo creators optimizing for ChatGPT, Perplexity, Gemini, and Claude.",
      buttonText: "Get Started",
      features: [
        "Everything in Free, plus:",
        "AI Readability: Structural clarity, answer-first formatting, semantic precision.",
        "Digital Authority: Citation signals, entity clarity, topical authority.",
        "Conversion Readiness: CTA clarity, trust signals, value proposition.",
        "Product Discoverability: Pricing transparency, availability signals, comparative context.",
        "Phase 2 signals: RAG chunking quality, information gain, query alignment.",
        "URL Scanner: Analyze any live page without pasting content.",
        "Score history with expandable pillar breakdowns."
      ]
    },
    {
      plan: "Pro", price: "$99.99", checkCount: "500 Answer Engine Optimizations / month",
      description: "Ideal for content teams, agencies, scaling SaaS brands, and e-commerce stores publishing at volume.",
      buttonText: "Get Started",
      features: ["Everything in Business, plus:", "400 additional monthly optimizations.", "Priority email support.", "Early access to new pillars and signals."]
    }
  ];

  return (
    <section id="pricing" className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Simple, transparent pricing</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative bg-surface/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm flex flex-col h-full ${p.isPopular ? '-mt-4 mb-4 bg-rain-900/10' : ''}`}
            >
              {p.isPopular && (
                <>
                  <div className="absolute -inset-[1px] rounded-[34px] bg-gradient-to-b from-rain-400 to-rain-600 opacity-40 blur-sm group-hover:opacity-70 pointer-events-none" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rain-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">Best Value</div>
                </>
              )}
              
              <div className="relative z-10 flex-grow">
                <h3 className="text-xl font-bold text-white mb-2">{p.plan}</h3>
                <div className="text-4xl font-bold text-white mb-4">{p.price}</div>
                <div className="text-sm font-medium text-rain-400 mb-4">{p.checkCount}</div>
                <p className="text-slate-400 text-sm mb-8">{p.description}</p>
                
                <a href="https://app.getrainos.com" className={`block w-full text-center py-3 rounded-lg font-medium transition-colors mb-8 ${p.isPopular ? 'bg-rain-500 hover:bg-rain-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                  {p.buttonText}
                </a>
                
                <ul className="space-y-4">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start text-sm text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-rain-400 mr-3 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const AccordionItem = ({ question, answer }: { question: string, answer: string, key?: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-6 flex items-center justify-between text-left focus:outline-none group">
        <span className="text-lg font-medium text-white pr-8 group-hover:text-rain-400 transition-colors">{question}</span>
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen ? 'bg-rain-500 border-rain-500 text-white rotate-180' : 'border-white/10 text-slate-400 group-hover:border-rain-500/50 group-hover:text-rain-400'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-400 leading-relaxed text-lg font-light">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQ = () => {
  const faqs = [
    { q: "Who is rain OS for?", a: "Anyone who relies on organic traffic. We're especially powerful for SaaS, E-commerce, and Tech Publishers..." },
    { q: "Does rain OS replace Yoast or RankMath?", a: "No, rain OS is designed to work alongside your existing SEO plugins..." },
    { q: "How does rain OS decide what to score?", a: "Every analysis runs your content through four weighted pillars — AI Readability (30%), Digital Authority (25%), Conversion Readiness (25%), and Product Discoverability (20%) — plus a deeper layer of Phase 2 signals covering things like RAG chunking quality, information gain, and query alignment. The result is a single overall score from 0 to 100 with a breakdown for every dimension." },
    { q: "How does the Authorship Proof work?", a: "We generate a SHA-256 cryptographic hash of your content at the time of publishing..." },
    { q: "What is the 'Zero-Click Problem' and how does rain OS help?", a: "The Zero-Click Problem occurs when AI answers a user's query directly, resulting in no traffic to your site..." },
    { q: "Will this slow down my WordPress site?", a: "Not at all. rain OS runs its analysis asynchronously in the cloud..." },
    { q: "What is 'AI Readability' exactly?", a: "AI Readability measures how easily a Large Language Model (like ChatGPT or Google Gemini) can parse..." },
    { q: "What does the 'AEO Alignment' score actually measure?", a: "It measures how 'citable' your content is..." },
    { q: "Can rain OS fix my content, or just analyze it?", a: "Both. Every analysis includes a full four-pillar breakdown with actionable recommendations. We also offer built-in AI tools to rewrite sentences, generate better titles, create meta descriptions, and summarize content for AI snippet extraction — all without leaving the dashboard." },
    { q: "Do you guarantee that I will be cited by AI models?", a: "Just like with traditional SEO, no one can guarantee specific rankings..." },
    { q: "How does the pricing work? What is an 'Action'?", a: "We offer simple flat-rate monthly plans..." },
    { q: "What happens to my content if I cancel?", a: "Your content remains 100% yours and stays on your WordPress site..." },
  ];

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-12 text-center">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} />)}
        </div>
      </div>
    </section>
  );
};

export const CTA = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative bg-gradient-to-r from-rain-900/40 to-midnight border border-rain-500/20 rounded-3xl p-8 md:p-16 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 w-[600px] h-[300px] bg-rain-500/20 blur-[100px] -translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-rain-500/10 rounded-2xl border border-white/10 flex items-center justify-center mb-8">
              <Sparkles className="w-10 h-10 text-rain-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6 leading-[1.05]">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-sky-200 to-sky-400">grow</span> your reach?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Start optimizing for the future of search today. Join thousands of creators ensuring their content survives the AI shift.
            </p>
            <a href="https://app.getrainos.com" className="bg-rain-500 hover:bg-rain-400 text-white px-8 py-4 rounded-xl font-medium shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:scale-105">
              Get Started for Free
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
