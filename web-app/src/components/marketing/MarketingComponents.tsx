import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Minus, Plus } from 'lucide-react';

// ... existing file content omitted for brevity ...

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
        { label: "Product Visibility pillar", included: false },
        { label: "URL Scanner", included: false },
        { label: "Repo Analysis (GitHub)", included: false },
        { label: "Citation Monitor", included: false },
        { label: "AI Visibility", included: false },
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
        { label: "AI Visibility", included: false },
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
        { label: "AI Visibility — 50 checks / mo", included: true },
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
