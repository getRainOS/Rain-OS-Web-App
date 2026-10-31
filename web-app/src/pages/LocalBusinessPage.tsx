import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Search, PhoneCall, Star, BrainCircuit, ShieldCheck, MousePointerClick,
  ArrowRight, CheckCircle2, AlertTriangle, Sparkles, Globe, MessageSquare,
  TrendingUp, Users, Eye, Zap, Clock, Building2, Scissors, Wrench, UtensilsCrossed,
  Stethoscope, ChevronRight, Bot
} from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';

import SiteFooter from '@/components/marketing/SiteFooter';
export default function LocalBusinessPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <MarketingNav onLoginClick={onBack} onGetStartedClick={onBack} />

      {/* Hero */}
      <section className="pt-36 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 rounded-md border border-[#ffffff]/30 bg-[#ffffff]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#bdbdbd] mb-6">
              <MapPin className="w-3.5 h-3.5" /> For Local Businesses
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] mb-6" style={{ letterSpacing: '-0.04em' }}>
              When someone asks AI<br />
              <span className="text-[#bdbdbd]">"who's the best plumber near me?"</span><br />
              will they find you?
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              ChatGPT, Google's AI Overviews, Perplexity and Claude are answering local business questions millions of times a day. rain OS checks what each one says about your city, and helps your business show up and get called.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/login" className="inline-flex items-center gap-2 bg-[#ffffff] hover:bg-neutral-200 text-white rounded-md px-7 py-3.5 text-sm font-medium transition-colors">
                Analyze my business site
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/pricing" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white rounded-xl px-7 py-3.5 text-sm font-semibold transition-all">
                See pricing
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The problem — plain language */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[#bdbdbd] font-bold tracking-wider text-xs uppercase mb-3 block">The new reality</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">People stopped Googling. They're asking AI.</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Your customers used to type keywords into Google and scroll through results. Now they ask ChatGPT or their phone's AI assistant a full question — and get one answer back. If you're not in that answer, you don't exist.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                color: 'text-sky-400',
                bg: 'bg-sky-500/10',
                border: 'border-sky-500/20',
                title: 'AI gives one answer',
                body: 'When someone asks "best hair salon in Austin," ChatGPT doesn\'t show 10 results. It picks a few — or just one. If your site isn\'t optimized, it won\'t be picked.',
              },
              {
                icon: PhoneCall,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                title: 'Google\'s AI calls your phone',
                body: 'Google now uses AI (called Duplex) to call local businesses and check if you\'re available. If you\'re unreachable or your info is wrong, Google marks you as hard to reach and sends customers elsewhere.',
              },
              {
                icon: AlertTriangle,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                title: 'Old SEO isn\'t enough',
                body: 'You might rank on page 1 of Google but still be invisible to AI. Traditional keyword tricks don\'t work in AI search. Your content needs to be structured so AI can actually read and trust it.',
              },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-7 border ${card.border} ${card.bg}`}>
                <card.icon className={`w-7 h-7 ${card.color} mb-4`} />
                <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — visual flow */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">How rain OS works for local businesses</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">From invisible to cited in three steps</h2>
          </motion.div>

          <div className="flex flex-col gap-0">
            {[
              {
                step: '01',
                color: 'text-[#bdbdbd]',
                borderColor: 'border-[#ffffff]/30',
                bgColor: 'bg-[#ffffff]/10',
                icon: Search,
                title: 'We analyze your website',
                body: 'Paste your homepage copy or give us your URL. rain OS reads your site the way AI tools do — not as a pretty webpage, but as raw information. We score it across the exact signals that AI systems use to decide what to recommend.',
                detail: 'Works on any local business website — even simple ones built on Squarespace, Wix, or WordPress.',
              },
              {
                step: '02',
                color: 'text-sky-400',
                borderColor: 'border-sky-400/30',
                bgColor: 'bg-sky-500/10',
                icon: BrainCircuit,
                title: 'You get a clear score and specific fixes',
                body: 'We score your content across three areas: how clearly AI can read it, how trustworthy your business looks to AI systems, and how likely your site is to turn an AI-referred visitor into a call or booking.',
                detail: 'No confusing technical jargon. Every recommendation is written in plain English with a clear explanation of why it matters.',
              },
              {
                step: '03',
                color: 'text-emerald-400',
                borderColor: 'border-emerald-400/30',
                bgColor: 'bg-emerald-500/10',
                icon: TrendingUp,
                title: 'You fix it — and track your growth',
                body: 'Make the changes on your website and re-run the analysis. Every scan is saved so you can see exactly how your score improves over time. Most local businesses see meaningful gains in the first two rounds.',
                detail: 'You can paste changes directly into Cursor, Bolt, or your web designer — we write the recommendations to be copy-paste ready.',
              },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex gap-6 items-start pb-12 last:pb-0 relative">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-14 h-14 rounded-2xl ${step.bgColor} border ${step.borderColor} flex items-center justify-center`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  {i < 2 && <div className="w-px flex-1 bg-white/10 mt-3 min-h-[60px]" />}
                </div>
                <div className="pt-1 pb-8">
                  <span className={`text-xs font-bold uppercase tracking-widest ${step.color} mb-2 block`}>Step {step.step}</span>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-neutral-400 leading-relaxed mb-3">{step.body}</p>
                  <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-neutral-400 ${step.bgColor} border ${step.borderColor}`}>
                    <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: step.color.replace('text-', '') }} />
                    {step.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business types */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-neutral-500 font-bold tracking-wider text-xs uppercase mb-3 block">Who this is for</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Built for every type of local business</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">If customers search for your service in their area, you need this. It doesn't matter how big or small your business is.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { icon: Wrench, label: 'Plumbers & HVAC', color: 'text-sky-400' },
              { icon: Scissors, label: 'Salons & Spas', color: 'text-rose-400' },
              { icon: UtensilsCrossed, label: 'Restaurants & Cafes', color: 'text-amber-400' },
              { icon: Stethoscope, label: 'Dentists & Clinics', color: 'text-emerald-400' },
              { icon: Building2, label: 'Real Estate & Law', color: 'text-violet-400' },
              { icon: Users, label: 'Any Local Service', color: 'text-neutral-400' },
            ].map((type, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center text-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/15 transition-all">
                <type.icon className={`w-6 h-6 ${type.color}`} />
                <span className="text-xs text-neutral-400 font-medium leading-tight">{type.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature breakdown */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[#bdbdbd] font-bold tracking-wider text-xs uppercase mb-3 block">What we score</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Three of six pillars AI checks about your business</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">These are three of the six signals that AI tools use when deciding whether to recommend your business — alongside Local Presence (NAP consistency, service area, review signals), the single largest pillar in this lane at 30% weight. Most local business sites score poorly across the board — which means a huge opportunity for you.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BrainCircuit,
                color: 'text-sky-400',
                bg: 'bg-sky-500/10',
                border: 'border-sky-500/20',
                weight: '20%',
                title: 'AI Readability',
                tagline: 'Can AI actually understand your services?',
                body: 'AI doesn\'t browse your website like a human — it reads raw text. If your services are buried in images, if your pages are vague ("we do it all!"), or if your site is mostly built with JavaScript that AI can\'t see, you score low here.',
                fixes: ['Write clear, specific service descriptions', 'List your services with prices and areas served', 'Avoid vague phrases — be specific about what you do'],
              },
              {
                icon: ShieldCheck,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                weight: '20%',
                title: 'Digital Authority',
                tagline: 'Does AI trust your business?',
                body: 'AI checks whether your business is a legitimate, trustworthy source. This means things like your NAP (Name, Address, Phone) being consistent, having reviews mentioned, having clear business details, and technical trust signals like structured data.',
                fixes: ['Consistent NAP across your site and Google Business Profile', 'Display reviews, certifications, and years in business', 'Add LocalBusiness structured data to your homepage'],
              },
              {
                icon: MousePointerClick,
                color: 'text-violet-400',
                bg: 'bg-violet-500/10',
                border: 'border-violet-500/20',
                weight: '20%',
                title: 'Conversion Readiness',
                tagline: 'When AI sends someone to your site, do they call?',
                body: 'Getting traffic from AI is only half the battle. Your site also needs to immediately tell visitors how to contact you, what you offer, why to trust you, and make it effortless to book or call.',
                fixes: ['Phone number visible above the fold on every page', 'Clear call-to-action (Book now / Get a free quote)', 'Hours, service area, and emergency availability clearly stated'],
              },
            ].map((pillar, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-3xl p-8 border ${pillar.border} ${pillar.bg}`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center`}>
                    <pillar.icon className={`w-5 h-5 ${pillar.color}`} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 ${pillar.color}`}>{pillar.weight} weight</span>
                </div>
                <h3 className={`text-xl font-bold ${pillar.color} mb-1`}>{pillar.title}</h3>
                <p className="text-neutral-500 text-xs font-medium italic mb-4">{pillar.tagline}</p>
                <p className="text-neutral-400 text-sm leading-relaxed mb-5">{pillar.body}</p>
                <div className="space-y-2">
                  {pillar.fixes.map((fix, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${pillar.color}`} />
                      {fix}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Business Profile + AI Calling section */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-amber-400 font-bold tracking-wider text-xs uppercase mb-3 block">The bigger picture</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Google's AI ecosystem is already calling your customers</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              AI isn't just answering questions — it's actively contacting local businesses on behalf of customers. Here's what's happening right now, and how to stay ahead of it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Globe,
                color: 'text-sky-400',
                border: 'border-sky-500/20',
                bg: 'rgba(14,165,233,0.05)',
                title: 'Google Business Profile interactions',
                body: 'Your Google Business Profile tracks calls, direction requests, website clicks, and messages. As of mid-2024, Google removed its built-in call history — so if you\'re not tracking calls through your own records or a third-party tool, you\'re flying blind.',
                insight: 'rain OS scores how well your website supports what your GBP promises — so visitors who click through actually convert.',
              },
              {
                icon: Bot,
                color: 'text-violet-400',
                border: 'border-violet-500/20',
                bg: 'rgba(139,92,246,0.05)',
                title: 'Google\'s AI agent calls your store',
                body: 'Google Duplex calls local businesses to verify hours, pricing, and availability on behalf of customers. Businesses that answer and provide accurate info get featured in AI-generated summaries. Those that don\'t appear as "businesses we couldn\'t reach."',
                insight: 'Having clear, accurate info on your website reduces these calls and improves your standing in AI summaries.',
              },
              {
                icon: Star,
                color: 'text-amber-400',
                border: 'border-amber-500/20',
                bg: 'rgba(245,158,11,0.05)',
                title: 'Local Service Ads and AI visibility',
                body: 'Google\'s Local Service Ads (pay-per-lead) show above organic results for searches like "emergency plumber near me." But even LSA performance is influenced by your profile\'s overall trustworthiness — which starts with your website.',
                insight: 'A strong rain OS score makes your whole local presence more credible, supporting both organic and paid visibility.',
              },
              {
                icon: MessageSquare,
                color: 'text-emerald-400',
                border: 'border-emerald-500/20',
                bg: 'rgba(16,185,129,0.05)',
                title: 'AI links in conversational search',
                body: 'When someone asks Perplexity or ChatGPT "who\'s the best [your service] in [your city]?" — the answer is pulled from sources AI can read and trust. If your website isn\'t structured for AI extraction, you won\'t be mentioned.',
                insight: 'This is the highest-value new source of local leads, and most businesses don\'t even know it exists yet.',
              },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-7 border ${card.border}`} style={{ background: card.bg }}>
                <div className="flex items-center gap-3 mb-4">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                  <h3 className="text-base font-bold text-white">{card.title}</h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed mb-4">{card.body}</p>
                <div className={`flex items-start gap-2 rounded-lg p-3 bg-white/[0.03] border border-white/[0.07] text-xs text-neutral-300`}>
                  <Sparkles className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${card.color}`} />
                  <span className="leading-relaxed">{card.insight}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get — comparison */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">What you actually get from rain OS</h2>
          </motion.div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-2 border-b border-white/10 bg-white/5">
              <div className="p-5 font-bold text-neutral-400 text-sm">Without rain OS</div>
              <div className="p-5 font-bold text-[#bdbdbd] text-sm border-l border-white/5">With rain OS</div>
            </div>
            {[
              ['Your website is invisible to AI search', 'AI tools can read, trust, and recommend your business'],
              ['You don\'t know why competitors get called instead of you', 'You get a clear score showing exactly what to fix'],
              ['Generic SEO advice that doesn\'t apply to local business', 'Local-specific recommendations written in plain English'],
              ['No idea how customers find you via AI', 'Is AI Citing Me? tracks when ChatGPT, Google AI Overviews, Perplexity and Claude recommend you'],
              ['Your website info conflicts with your Google listing', 'Your name, address and phone are checked across your site, structured data and Google Business Profile'],
              ['You guess what AI says in the next town over', 'Check any question as a customer in any US state or country would see it'],
              ['You don\'t know how you compare on Google Maps or reviews', 'See your Google Business Profile, rating, reviews that mention your city, and Maps position next to competitors'],
              ['Customers land on your site and don\'t call', 'Conversion Readiness score shows you every reason they bounce'],
            ].map(([without, with_], i) => (
              <div key={i} className="grid grid-cols-2 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="p-5 flex items-start gap-2 text-sm text-neutral-500">
                  <span className="text-neutral-700 mt-0.5 shrink-0">✕</span>
                  {without}
                </div>
                <div className="p-5 flex items-start gap-2 text-sm text-neutral-300 border-l border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-[#bdbdbd] mt-0.5 shrink-0" />
                  {with_}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple stat row */}
      <section className="py-16 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { value: '30%', label: 'of the score comes from Local Presence', color: 'text-white' },
            { value: '6', label: 'Areas scored for every local business check', color: 'text-white' },
            { value: 'Free', label: 'to start — no credit card needed', color: 'text-white' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-7">
              <div className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
              <div className="text-neutral-400 text-sm leading-snug">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/[0.06] relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <MapPin className="w-10 h-10 text-[#bdbdbd] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-5">
              Start getting found by AI today
            </h2>
            <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
              Sign up, choose Local Businesses as your lane, and scan your homepage. rain OS shows you exactly where you're losing customers to AI search, and how to fix it.
            </p>
            <a href="/login" className="inline-flex items-center gap-2 bg-[#ffffff] hover:bg-neutral-200 text-white rounded-md px-8 py-4 text-base font-medium transition-colors">
              Analyze my business free
              <ArrowRight className="w-5 h-5" />
            </a>
            <p className="text-neutral-600 text-xs mt-4">Free plan includes 5 analyses in total. No credit card required.</p>
          </motion.div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
