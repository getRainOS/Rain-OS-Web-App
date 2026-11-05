import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Search, PhoneCall, Star, BrainCircuit, ShieldCheck, MousePointerClick,
  ArrowRight, CheckCircle2, AlertTriangle, Sparkles, Globe, MessageSquare,
  TrendingUp, Users, Bot, Wrench, Scissors, UtensilsCrossed, Stethoscope, Building2
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
              Someone asks AI<br />
              <span className="text-[#bdbdbd]">"who's the best plumber near me?"</span><br />
              Does it name you?
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              More people ask ChatGPT, Google's AI answers, Perplexity and Claude who to call. rain OS checks what each one says about your business, and tells you what to change, in plain English.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/login" className="inline-flex items-center gap-2 bg-[#ffffff] hover:bg-neutral-200 text-white rounded-md px-7 py-3.5 text-sm font-medium transition-colors">
                Check my business site free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/pricing" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white rounded-xl px-7 py-3.5 text-sm font-semibold transition-all">
                See plans
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[#bdbdbd] font-bold tracking-wider text-xs uppercase mb-3 block">The new reality</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">People ask AI now, not just Google.</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Customers used to search Google and pick from a list. Now many ask an AI one question and get one answer. If your business isn't in that answer, they won't see you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                color: 'text-sky-400',
                bg: 'bg-sky-500/10',
                border: 'border-sky-500/20',
                title: 'AI names a few businesses',
                body: 'Ask "best hair salon in Austin" and the AI names a few places, sometimes just one. If your website doesn\'t clearly say what you do and where, it won\'t be one of them.',
              },
              {
                icon: PhoneCall,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                title: 'Your details have to match',
                body: 'AI compares your website with your Google Business Profile. If your name, address or phone number is different in each place, AI trusts you less.',
              },
              {
                icon: AlertTriangle,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                title: 'Google ranking isn\'t enough',
                body: 'You can be on page one of Google and still be missing from AI answers. AI reads plain, clear pages. Keyword tricks don\'t help.',
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

      {/* How it works */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">How rain OS works for local businesses</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">From invisible to recommended in three steps</h2>
          </motion.div>

          <div className="flex flex-col gap-0">
            {[
              {
                step: '01',
                color: 'text-[#bdbdbd]',
                borderColor: 'border-[#ffffff]/30',
                bgColor: 'bg-[#ffffff]/10',
                icon: Search,
                title: 'We read your website',
                body: 'Paste your homepage text or enter your web address. rain OS reads your site the way an AI tool does, and checks the things AI uses to decide who to recommend.',
                detail: 'Works with simple sites built on Squarespace, Wix or WordPress.',
              },
              {
                step: '02',
                color: 'text-sky-400',
                borderColor: 'border-sky-400/30',
                bgColor: 'bg-sky-500/10',
                icon: BrainCircuit,
                title: 'You get a score and clear fixes',
                body: 'We score your site in three areas: how easily AI can read it, whether it looks trustworthy, and whether a visitor is likely to call or book.',
                detail: 'Every fix is written in plain English, with the reason it matters.',
              },
              {
                step: '03',
                color: 'text-emerald-400',
                borderColor: 'border-emerald-400/30',
                bgColor: 'bg-emerald-500/10',
                icon: TrendingUp,
                title: 'Fix it and check again',
                body: 'Make the changes and run the check again. Every check is saved, so you can see your score go up over time.',
                detail: 'Send the fixes to your web designer, or paste them into your site builder.',
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
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Built for local businesses of every size</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">If customers search for your service in your area, this is for you.</p>
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

      {/* What we score */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[#bdbdbd] font-bold tracking-wider text-xs uppercase mb-3 block">What we score</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Three things AI checks on your website</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              AI looks at six areas before it recommends a business. These three are about your website. The other three include Local Presence, which covers your Google listing, reviews and service area, and makes up 30% of the score.
            </p>
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
                tagline: 'Can AI understand what you offer?',
                body: 'AI reads the words on your page. If your services are only in images, your pages are vague ("we do it all!"), or the content only appears after a script runs, AI may miss it.',
                fixes: ['Describe each service in specific words', 'List your services, prices and the areas you serve', 'Replace vague phrases with what you actually do'],
              },
              {
                icon: ShieldCheck,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                weight: '20%',
                title: 'Digital Authority',
                tagline: 'Does AI trust your business?',
                body: 'AI checks that your business looks real and consistent. Your name, address and phone should match everywhere, and your site should show reviews and clear business details.',
                fixes: ['Use the same name, address and phone on your site and Google', 'Show reviews, licenses and years in business', 'Add business details in a format search tools read (called schema markup)'],
              },
              {
                icon: MousePointerClick,
                color: 'text-violet-400',
                bg: 'bg-violet-500/10',
                border: 'border-violet-500/20',
                weight: '20%',
                title: 'Conversion Readiness',
                tagline: 'When a visitor arrives, do they call?',
                body: 'A visitor from AI still has to act. Your site should tell them what you do, why to trust you, and how to call or book in a few seconds.',
                fixes: ['Show your phone number at the top of every page', 'Use a clear button: "Book now" or "Get a free quote"', 'State your hours, service area and emergency availability'],
              },
            ].map((pillar, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-3xl p-8 border ${pillar.border} ${pillar.bg}`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center`}>
                    <pillar.icon className={`w-5 h-5 ${pillar.color}`} />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 ${pillar.color}`}>{pillar.weight} of score</span>
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

      {/* Google */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-amber-400 font-bold tracking-wider text-xs uppercase mb-3 block">Your Google listing</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Your listing and your website should agree</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Google's AI can check details like your hours, prices and availability for customers. Your website and your Google Business Profile should tell the same story.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Globe,
                color: 'text-sky-400',
                border: 'border-sky-500/20',
                bg: 'rgba(14,165,233,0.05)',
                title: 'Your Google Business Profile',
                body: 'Your Google listing shows calls, directions and website clicks. Visitors who click through should find what the listing promises.',
                insight: 'rain OS checks that your website backs up your listing.',
              },
              {
                icon: Bot,
                color: 'text-violet-400',
                border: 'border-violet-500/20',
                bg: 'rgba(139,92,246,0.05)',
                title: 'Accurate details help',
                body: 'When your hours, prices and phone number are right and easy to find, it is easier for Google\'s AI to recommend you.',
                insight: 'Keep the same details on your website and your listing.',
              },
              {
                icon: Star,
                color: 'text-amber-400',
                border: 'border-amber-500/20',
                bg: 'rgba(245,158,11,0.05)',
                title: 'Paid ads and trust',
                body: 'Paid Google ads show above normal results. How trustworthy your business looks online still matters, and your website is a big part of that.',
                insight: 'A clear website supports both paid and free visibility.',
              },
              {
                icon: MessageSquare,
                color: 'text-emerald-400',
                border: 'border-emerald-500/20',
                bg: 'rgba(16,185,129,0.05)',
                title: 'AI chat answers',
                body: 'When someone asks Perplexity or ChatGPT for the best service in your city, the answer comes from pages AI can read. A clear site gives you a chance to be named.',
                insight: 'This is a growing source of new customers, and many businesses don\'t track it yet.',
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

      {/* Comparison */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">What you get from rain OS</h2>
          </motion.div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-2 border-b border-white/10 bg-white/5">
              <div className="p-5 font-bold text-neutral-400 text-sm">Without rain OS</div>
              <div className="p-5 font-bold text-[#bdbdbd] text-sm border-l border-white/5">With rain OS</div>
            </div>
            {[
              ['AI doesn\'t mention your business', 'See whether ChatGPT, Google, Perplexity and Claude name you'],
              ['You don\'t know why a competitor gets picked instead', 'A score with the exact things to fix'],
              ['Generic advice that doesn\'t fit a local business', 'Fixes written for local businesses, in plain English'],
              ['You don\'t know how customers find you through AI', 'Is AI Citing Me? shows when AI links to your site'],
              ['Your website and Google listing don\'t match', 'Your name, address and phone checked across both'],
              ['You guess what AI says in the next town over', 'See the answer a customer gets, for the question they ask'],
              ['You don\'t know how you compare on Google Maps', 'See your rating, reviews and Maps position next to competitors'],
              ['Visitors land on your site and leave', 'See the reasons visitors leave without calling'],
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

      {/* Stats */}
      <section className="py-16 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { value: '30%', label: 'of the score comes from your Google listing, reviews and service area', color: 'text-white' },
            { value: '6', label: 'areas scored for every local business check', color: 'text-white' },
            { value: 'Free', label: 'to start, no credit card needed', color: 'text-white' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-7">
              <div className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
              <div className="text-neutral-400 text-sm leading-snug">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Keep the site working */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[#bdbdbd] font-bold tracking-wider text-xs uppercase mb-3 block">Keep it working</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">A site that AI and Google can reach, and that stays safe</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">A good score doesn't last if the site goes offline, gets blocked from search, or gets hacked. These checks are worth doing once and again after big changes.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Pick the right setup',
                body: 'A site builder like Squarespace, Wix or WordPress handles sitemaps, redirects and updates for you. Use it for anything you update often, such as your services, prices and hours.',
              },
              {
                title: 'Put your words on the page',
                body: 'Your services, prices, hours and reviews should be visible as soon as the page opens. If a builder adds them with a script that loads later, AI tools may not see them. Ask your builder whether the text is on the page itself.',
              },
              {
                title: 'Stay reachable',
                body: 'Make sure robots.txt does not block Googlebot, and that your site has a sitemap. Check that your hosting plan has not been paused for inactivity, and that your site loads without errors.',
              },
              {
                title: 'Protect the site',
                body: 'Use an established form service for your contact form instead of a custom one. Keep your builder and its apps updated, and watch Google Search Console for security warnings. If a developer maintains your site, ask them to turn on dependency alerts.',
              },
              {
                title: 'Check after every change',
                body: 'Updates to your builder can change page settings, such as your web address or search settings. After any change, open your key pages and check the title, the address and that the page loads.',
              },
              {
                title: 'Save your settings for your AI tool',
                body: 'If you use an AI tool to edit your site, write down your important search settings, such as redirects and the preferred address of each page, and why they exist. Tell the tool not to change them without asking you first.',
              },
            ].map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-7 border border-white/10 bg-white/[0.03]">
                <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/[0.06] relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <MapPin className="w-10 h-10 text-[#bdbdbd] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-5">
              Find out what AI says about your business
            </h2>
            <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
              Sign up, pick Local Businesses, and check your homepage. rain OS shows where you're missing out and what to fix first.
            </p>
            <a href="/login" className="inline-flex items-center gap-2 bg-[#ffffff] hover:bg-neutral-200 text-white rounded-md px-8 py-4 text-base font-medium transition-colors">
              Check my business free
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
