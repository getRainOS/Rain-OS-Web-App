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
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-24 relative"
        >
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
            <p className="text-slate-400 leading-relaxed">Traditional SEO focuses on keywords and backlinks. It works for Google, but fails when AI models try to extract facts and logic from your content.</p>
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
            <p className="text-slate-400 leading-relaxed">We bridge the gap. We ensure your content is perfectly structured for AI extraction while maintaining all traditional SEO benefits.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const LocalBusinessBadge = () => {
  return (
    <a
      href="/local-business"
      className="inline-flex items-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-400 px-5 py-2.5 text-sm font-bold text-white transition-all shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95"
    >
      <MapPin className="w-4 h-4" />
      Local Businesses →
    </a>
  );
};

export const FourPillars = () => {
  const pillars = [
    {
      name: 'AI Readability',
      weight: '40%',
      tagline: 'Can AI actually read your source?',
      description: 'Vibe-coded sites render great in a browser, but AI crawlers read the raw HTML. This scores how well your source actually translates into machine-extractable answers — the #1 gap in AI-generated sites.',
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
      weight: '30%',
      tagline: 'Is your site a source AI will quote?',
      description: 'AI tools built your site fast, but they skipped the trust markup. This pillar scores the schema, entity clarity, and credibility signals that make AI engines treat your domain as a quotable source.',
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
      weight: '30%',
      tagline: 'Does your site convert AI-referred visitors?',
      description: "Getting traffic from AI is only half the job. This pillar scores whether your site's copy actually converts that traffic — CTA clarity, trust proof, and friction that vibe-coded landing pages routinely miss.",
      color: 'violet-400',
      glowColor: 'rgba(139,92,246,0.2)',
      borderColor: 'violet-400/50',
      viaColor: 'via-violet-400',
      bgColor: 'bg-violet-500/20',
      dotColor: 'bg-violet-500',
      Icon: MousePointerClick,
      scores: ['CTA Clarity', 'Trust Signals', 'Value Proposition', 'Friction Reduction'],
    },
  ];

  return (
    <section id="three-pillars" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-rain-400 font-bold tracking-wider text-xs uppercase mb-3 block">Your AI Built Your Product Or Website</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Now Optimize For AI Search</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">AI Readability is how easily ChatGPT, Perplexity, and Gemini can extract answers from your raw content. It is the #1 factor in whether AI cites you or skips you. We score it — plus Authority and Conversion — so you own the answers that matter.</p>
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
          <p className="text-slate-400 max-w-2xl mx-auto">Beyond the three pillars, rain OS runs a deeper layer of signals that most tools don't even know exist.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-surface/40 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-sky-500/30 transition-all duration-300">
            <Layers className="w-8 h-8 text-sky-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">RAG Chunking Quality</h3>
            <p className="text-slate-400 text-sm">Most AI systems retrieve content in chunks. We score how cleanly your content breaks into standalone, answerable units — the way retrieval systems actually read it.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-surface/40 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300">
            <SearchCheck className="w-8 h-8 text-emerald-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">Information Gain Score</h3>
            <p className="text-slate-400 text-sm">AI already knows what's common. This score measures how much genuinely new or specific information your content adds — the higher it is, the more likely AI is to quote you over a generic source.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-surface/40 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-orange-500/30 transition-all duration-300">
            <Network className="w-8 h-8 text-orange-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">Query Alignment Score</h3>
            <p className="text-slate-400 text-sm">Maps your content against the real questions people ask AI tools in your topic area. If your content doesn't match the query patterns AI sees, it won't get surfaced.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-surface/40 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-violet-500/30 transition-all duration-300">
            <Target className="w-8 h-8 text-violet-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">Semantic Redundancy Detection</h3>
            <p className="text-slate-400 text-sm">Repeated or padded content dilutes AI extraction confidence. We flag every redundant passage so you can cut it — tighter content scores higher.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="md:col-span-2 bg-gradient-to-br from-cyan-500/[0.05] to-surface/50 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:border-cyan-500/30 transition-all duration-300">
            <Sparkles className="w-8 h-8 text-cyan-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Rewrite Tools</h3>
            <p className="text-slate-400 max-w-md">Don't just see the problem — fix it. Built-in tools suggest improved titles, generate meta descriptions, summarize for AI snippets, and rewrite vague sentences into citable facts. All without losing your voice.</p>
          </motion.div>

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

export const Pricing = () => {
  type PlanFeature = { label: string; included: boolean };
  type Plan = {
    plan: string; price: string; period?: string; checkCount: string;
    description: string; buttonText: string; isPopular?: boolean;
    accentColor: string; features: PlanFeature[];
  };
  const plans: Plan[] = [
    {
      plan: "Free", price: "Free", checkCount: "5 analyses / month",
      accentColor: "#64748b",
      description: "Try Rain OS and see how AI reads your content — no credit card needed.",
      buttonText: "Get Started",
      features: [
        { label: "Content Analyzer", included: true },
        { label: "All 3 core scoring pillars", included: true },
        { label: "Actionable recommendations", included: true },
        { label: "URL Scanner", included: false },
        { label: "Repo Analysis (GitHub)", included: false },
        { label: "Citation Monitor", included: false },
        { label: "Brand Sentiment", included: false },
        { label: "Share of Voice", included: false },
      ]
    },
    {
      plan: "Pro", price: "$29", period: "/ mo", checkCount: "200 analyses / month", isPopular: true,
      accentColor: "#0ea5e9",
      description: "Everything in Free, plus the full AEO suite for content creators, startups, and growing brands optimizing for ChatGPT, Perplexity, and Gemini.",
      buttonText: "Get Started",
      features: [
        { label: "Everything in Free", included: true },
        { label: "Content Analyzer", included: true },
        { label: "URL Scanner", included: true },
        { label: "Repo Analysis (GitHub)", included: true },
        { label: "Citation Monitor — 20 checks / mo", included: true },
        { label: "Quick Tools — titles, meta, summarize", included: true },
        { label: "Score History", included: true },
        { label: "Brand Sentiment", included: false },
        { label: "Share of Voice", included: false },
      ]
    },
    {
      plan: "Business", price: "$99", period: "/ mo", checkCount: "500 analyses / month",
      accentColor: "#a855f7",
      description: "Premium AI intelligence for scaling brands, agencies, and teams that need to track and grow their presence inside AI answers.",
      buttonText: "Get Started",
      features: [
        { label: "Everything in Pro", included: true },
        { label: "Citation Monitor — 100 checks / mo", included: true },
        { label: "Brand Sentiment — 50 checks / mo", included: true },
        { label: "Share of Voice — 20 checks / mo", included: true },
        { label: "Priority support", included: true },
      ]
    }
  ];

  return (
    <section id="pricing" className="py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
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
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">{p.price}</span>
                  {p.period && <span className="text-slate-500 text-sm">{p.period}</span>}
                </div>
                <p className="text-slate-400 text-sm mb-6">{p.description}</p>
                
                <a href="https://app.getrainos.com" className={`block w-full text-center py-3 rounded-lg font-medium transition-colors mb-8 ${p.isPopular ? 'bg-rain-500 hover:bg-rain-400 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                  {p.buttonText}
                </a>
                
                <div className="text-xs font-semibold uppercase tracking-widest mb-6 px-3 py-1.5 rounded-md inline-block" style={{ color: p.accentColor, background: `${p.accentColor}18`, border: `1px solid ${p.accentColor}30` }}>
                  {p.checkCount}
                </div>
                <ul className="space-y-3">
                  {p.features.map((f, j) => (
                    <li key={j} className={`flex items-center text-sm ${f.included ? 'text-slate-300' : 'text-slate-600'}`}>
                      {f.included
                        ? <CheckCircle2 className="w-4 h-4 mr-3 shrink-0" style={{ color: p.accentColor }} />
                        : <Minus className="w-4 h-4 mr-3 shrink-0 text-slate-700" />
                      }
                      <span>{f.label}</span>
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
    { q: "How does rain OS decide what to score?", a: "Every analysis runs your content through three weighted pillars — AI Readability (40%), Digital Authority (30%), and Conversion Readiness (30%) — plus a deeper layer of Phase 2 signals covering things like RAG chunking quality, information gain, and query alignment. The result is a single overall score from 0 to 100 with a breakdown for every dimension." },
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

export const ThreeModesSection = ({ onGetStarted }: { onGetStarted?: () => void }) => {
  const modes = [
    {
      Icon: FileText,
      accent: '#38bdf8',
      bg: 'rgba(14,165,233,0.08)',
      border: 'rgba(14,165,233,0.2)',
      glow: 'rgba(14,165,233,0.12)',
      tag: 'Most popular',
      tagColor: 'text-sky-300 bg-sky-400/10 border-sky-400/25',
      title: 'Content Analysis',
      description: 'Paste any content — a blog post, product page, or landing copy — and get a full Rain Score with actionable recommendations in seconds.',
      availability: ['WordPress Plugin', 'Web App'],
      availColor: 'text-sky-400',
      detail: 'The fastest way to go from draft to AI-optimized. Works on any text, any format.',
    },
    {
      Icon: Globe,
      accent: '#a78bfa',
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.2)',
      glow: 'rgba(139,92,246,0.12)',
      tag: 'Technical signals',
      tagColor: 'text-violet-300 bg-violet-400/10 border-violet-400/25',
      title: 'URL Scanner',
      description: 'Enter any live URL. We fetch the page, parse the HTML, and surface every technical AEO signal: schema markup, llms.txt, JS rendering risk, open graph, and more.',
      availability: ['WordPress Plugin', 'Web App'],
      availColor: 'text-violet-400',
      detail: 'Spot what\'s invisible in the rendered page — because AI crawlers see the raw HTML, not what your browser shows.',
    },
    {
      Icon: GitBranch,
      accent: '#34d399',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)',
      glow: 'rgba(16,185,129,0.12)',
      tag: 'For vibe coders',
      tagColor: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/25',
      title: 'Repo Analysis',
      description: 'Built with Bolt, Lovable, Cursor, or v0? Connect your GitHub repo and we scan the actual source files — README, package.json, llms.txt, robots.txt, index.html — not just the rendered output.',
      availability: ['Web App only'],
      availColor: 'text-emerald-400',
      availIcon: Lock,
      detail: 'The only analysis mode that reads your site the way it was built — at the source level. Catches gaps that URL scanning can\'t see.',
    },
  ];

  return (
    <section className="py-24 px-6 relative z-10 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 block">Three ways to analyze</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
            One platform.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-400">
              Three analysis modes.
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Whatever you built and wherever it lives — rain OS has the right tool. Each mode surfaces different signals, so use all three for complete coverage.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {modes.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl p-6 flex flex-col gap-4 group hover:scale-[1.015] transition-transform duration-300"
              style={{
                background: m.bg,
                border: `1px solid ${m.border}`,
                boxShadow: `0 0 40px ${m.glow}`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${m.accent}18`, border: `1px solid ${m.accent}30` }}>
                  <m.Icon className="w-5 h-5" style={{ color: m.accent }} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${m.tagColor}`}>
                  {m.tag}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{m.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{m.description}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">{m.detail}</p>

              <div className="mt-auto pt-4 border-t border-white/[0.06]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-2">Available on</span>
                <div className="flex flex-wrap gap-2">
                  {m.availability.map((a) => (
                    <span key={a} className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 ${m.availColor}`}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {onGetStarted && (
          <div className="mt-12 text-center">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Try all three free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export const AIRewriteTools = () => {
  return (
    <section className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-cyan-400 font-bold tracking-wider text-xs uppercase mb-3 block">Built-in tools</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Fix it without leaving the dashboard</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Don&apos;t just see the problem. rain OS gives you one-click AI tools to rewrite, improve, and optimize the exact issues your score flags.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { color: 'text-sky-400', border: 'hover:border-sky-500/30', bg: 'bg-sky-500/5', title: 'Suggest Titles', body: 'Generate AI-optimized headlines that match how people phrase questions to ChatGPT and Perplexity.' },
            { color: 'text-emerald-400', border: 'hover:border-emerald-500/30', bg: 'bg-emerald-500/5', title: 'Meta Description', body: 'Auto-generate a meta description structured for AI snippet extraction, not just keyword stuffing.' },
            { color: 'text-violet-400', border: 'hover:border-violet-500/30', bg: 'bg-violet-500/5', title: 'Summarize for AI', body: 'Condense your page into a tight, citable paragraph that AI engines can lift directly as an answer.' },
            { color: 'text-orange-400', border: 'hover:border-orange-500/30', bg: 'bg-orange-500/5', title: 'Rewrite Sentences', body: 'Flag vague, fluffy sentences and replace them with specific, machine-extractable facts in one click.' },
          ].map((t, i) => (
            <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`${t.bg} border border-white/10 ${t.border} rounded-2xl p-6 transition-all duration-300`}>
              <h3 className={`text-base font-bold ${t.color} mb-3`}>{t.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{t.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const VibeFAQ = () => {
  const faqs = [
    { q: "My Bolt / Lovable / Cursor site looks great — why is my AI readability score low?", a: "Because AI crawlers don't see what your browser renders. They read the raw HTML. If your content is injected by JavaScript at runtime, AI engines see an empty page. rain OS flags this and tells you exactly what's missing from the source." },
    { q: "What is the difference between scanning a URL and scanning my repo?", a: "A URL scan fetches the live rendered HTML and checks technical signals like schema, llms.txt, and open graph. A repo scan reads your actual source files — README, package.json, index.html, robots.txt — and finds issues invisible in the rendered output. For vibe-coded sites, repo analysis almost always finds more." },
    { q: "What is llms.txt and do I actually need it?", a: "llms.txt is a simple text file (like robots.txt, but for AI crawlers) that tells AI models which parts of your site to read and which to ignore. Without it, AI engines guess. Most vibe-coded sites don't have one. rain OS flags it as a high-priority fix if it's missing." },
    { q: "Why can't AI cite my site even though it loads fine in the browser?", a: "AI engines crawl your site statically — they don't execute JavaScript. If your content only exists after JS runs (which is the default for most React, Vue, and Svelte apps), AI sees nothing to quote. This is the single biggest AEO gap for vibe-coded sites, and rain OS's repo analysis catches it every time." },
    { q: "Will rain OS work for Next.js, Astro, SvelteKit, or other JS frameworks?", a: "Yes. Repo analysis works at the source level regardless of framework. URL scanning works best with server-rendered output (Next.js SSR, Astro static). For client-side-only apps (Vite SPA, CRA), repo analysis is more accurate than URL scanning." },
    { q: "Do I need to know how to code to fix the issues rain OS finds?", a: "No. Every recommendation includes a plain-English explanation of what to fix and why it matters. For most issues — missing meta tags, llms.txt, schema markup — you can paste the recommendation straight into Cursor, Bolt, or Lovable and have it fixed in minutes." },
    { q: "How does the Rain Score work?", a: "Every analysis returns a weighted score from 0–100 built from three pillars: AI Readability (40%), Digital Authority (30%), and Conversion Readiness (30%). Each pillar breaks down into specific sub-signals so you know exactly where you're losing points. For product sellers, a dedicated Product Discoverability module is available with 50% weight." },
    { q: "Can I scan private GitHub repos?", a: "Yes. The GitHub OAuth connection works with both public and private repos you own or have access to. Your code is never stored — rain OS reads the relevant files, scores them, and discards the content." },
    { q: "How often should I re-scan after making changes?", a: "Re-scan after every significant content or structural update. Most users run a repo scan when they ship a new feature or page, and a URL scan before and after major copy revisions. The Score History tab tracks every run so you can see exactly what moved the needle." },
    { q: "Who is rain OS for?", a: "Primarily vibe coders (Bolt, Lovable, Cursor, v0, Replit users), developers shipping fast with AI tools, and content writers who want their work cited by AI engines. It's also powerful for SEO professionals who want to stay ahead of the shift from keyword rankings to AI citations." },
  ];

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-emerald-400 font-bold tracking-wider text-xs uppercase mb-3 block">Got questions?</span>
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Common questions from developers and vibe coders getting their sites AI-ready.</p>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => <AccordionItem key={i} question={faq.q} answer={faq.a} />)}
        </div>
      </div>
    </section>
  );
};

export const VibeCoderBand = ({ onGetStarted }: { onGetStarted?: () => void }) => {
  const platforms = ['Bolt', 'Lovable', 'Cursor', 'v0', 'Replit', 'Windsurf'];
  return (
    <section className="py-20 relative z-10 border-y border-white/[0.06]" style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.05) 0%, transparent 70%)' }}>
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/8 px-4 py-1.5">
          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">For vibe coders</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight max-w-2xl" style={{ letterSpacing: '-0.03em' }}>
          Your AI built the site.{' '}
          <span className="text-emerald-400">Now scan the repo.</span>
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {platforms.map((p) => (
            <span
              key={p}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 bg-white/[0.04] border border-white/10 tracking-wide"
            >
              {p}
            </span>
          ))}
        </div>

        <div className="max-w-2xl space-y-3">
          <p className="text-base text-slate-300 leading-relaxed">
            AI-generated sites have a blind spot: the rendered page looks fine, but the source is missing the signals that AI search engines actually look for — no llms.txt, no schema, JS-rendered content that crawlers can't parse.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Connect your GitHub repo and rain OS reads your actual source files — README, package.json, robots.txt, index.html — and gives you a full AEO score at the code level. No URL parsing. No guessing. The real thing.
          </p>
        </div>

        {onGetStarted && (
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/15 hover:border-emerald-400/50 transition-all"
          >
            <GitBranch className="w-4 h-4" />
            Connect your repo — it's free
          </button>
        )}
      </div>
    </section>
  );
};
