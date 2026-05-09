import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, CheckCircle, Download, Zap, BrainCircuit, ShieldCheck,
  MousePointerClick, Target, Layers, Search, Globe, FileText,
  BarChart3, Settings, Lock, Plus, Minus, GitBranch, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';

const coreFeatures = [
  {
    Icon: BrainCircuit,
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.1)',
    border: 'rgba(14,165,233,0.2)',
    title: 'Full 4-Pillar Rain Score',
    desc: 'Every post gets scored across AI Readability, Digital Authority, Conversion Readiness, and Product Discoverability — directly inside WordPress.',
  },
  {
    Icon: Layers,
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.2)',
    title: 'Gutenberg Sidebar Panel',
    desc: 'A native React sidebar integrates seamlessly into the block editor. Score and review recommendations without leaving the post.',
  },
  {
    Icon: Globe,
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.2)',
    title: 'URL Scanner',
    desc: 'Scan any published URL for technical AEO signals — schema markup, llms.txt, JS rendering risk, open graph tags, and more.',
  },
  {
    Icon: FileText,
    color: '#fb923c',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.2)',
    title: 'Classic Editor Support',
    desc: 'Works in both the block editor and the classic editor through dedicated meta boxes. No workflow disruption.',
  },
  {
    Icon: Zap,
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.1)',
    border: 'rgba(244,114,182,0.2)',
    title: 'Built-in Rewrite Tools',
    desc: 'Suggest AI-optimized titles, generate meta descriptions, summarize for AI snippets, and rewrite vague sentences — all in-editor.',
  },
  {
    Icon: BarChart3,
    color: '#38bdf8',
    bg: 'rgba(14,165,233,0.1)',
    border: 'rgba(14,165,233,0.2)',
    title: 'Score History & Tracking',
    desc: 'Every analysis is saved. Track how your score changes across rewrites and see which changes had the most impact.',
  },
  {
    Icon: Settings,
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.15)',
    title: 'Per-Pillar Configuration',
    desc: 'Toggle individual pillars on or off per post type. E-commerce sites can weight Product Discoverability higher; service businesses can mute it entirely.',
  },
  {
    Icon: Lock,
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.2)',
    title: 'Secure API Key Storage',
    desc: 'Your rain OS API key is stored securely in WordPress options with nonce-verified AJAX and REST API endpoints.',
  },
];

const technicalSpecs = [
  { label: 'Minimum WordPress', value: '5.8+' },
  { label: 'Minimum PHP', value: '7.4+' },
  { label: 'Required Extensions', value: 'curl, json, mbstring' },
  { label: 'Editor Support', value: 'Gutenberg + Classic' },
  { label: 'REST API Auth', value: 'Nonce middleware' },
  { label: 'Analysis Method', value: 'Cloud (async)' },
  { label: 'Data stored locally', value: 'Score history only' },
  { label: 'Plugin size', value: 'Lightweight (<200KB)' },
];

const steps = [
  {
    num: '01',
    title: 'Install the plugin',
    desc: 'Download from WordPress.org or upload the .zip file directly in your WordPress admin. Activate in one click.',
    detail: 'Compatible with all major WordPress hosts including WP Engine, Kinsta, SiteGround, and Cloudways.',
  },
  {
    num: '02',
    title: 'Add your API key',
    desc: 'Enter your rain OS API key in the plugin settings page. Your key is available in your rain OS dashboard.',
    detail: 'Supports Free, Business, and Pro plan keys. No additional configuration needed.',
  },
  {
    num: '03',
    title: 'Score your content',
    desc: 'Open any post or page in the editor. Click the rain OS sidebar panel and hit Analyze. Results appear in seconds.',
    detail: 'Works on published posts, drafts, and pages. Analyze before publishing to optimize proactively.',
  },
];

const vsComparison = [
  { feature: 'Traditional SEO scoring (keywords, readability)', yoast: true, rankmath: true, rain: true },
  { feature: 'AI Readability Score (LLM parse-ability)', yoast: false, rankmath: false, rain: true },
  { feature: 'Digital Authority & citation signals', yoast: false, rankmath: false, rain: true },
  { feature: 'Conversion Readiness analysis', yoast: false, rankmath: false, rain: true },
  { feature: 'Product Discoverability for AI shopping', yoast: false, rankmath: false, rain: true },
  { feature: 'RAG chunking quality score', yoast: false, rankmath: false, rain: true },
  { feature: 'Information Gain & semantic redundancy', yoast: false, rankmath: false, rain: true },
  { feature: 'URL scanner with AEO signal detection', yoast: false, rankmath: false, rain: true },
  { feature: 'Built-in AI rewrite tools', yoast: false, rankmath: true, rain: true },
  { feature: 'Schema markup suggestions', yoast: true, rankmath: true, rain: false },
];

const faqs = [
  {
    q: 'Does the plugin replace Yoast SEO or RankMath?',
    a: 'No — rain OS is designed to work alongside your existing SEO plugin. Yoast and RankMath are excellent at traditional SEO signals: keywords, meta descriptions, and schema. rain OS adds the AEO layer that those tools don\'t measure — AI readability, citation authority, and answer-engine signals.',
  },
  {
    q: 'Will the plugin slow down my WordPress site?',
    a: 'Not at all. rain OS analysis runs asynchronously in the cloud. The plugin sends your content to our API only when you explicitly click Analyze — it never runs in the background, never affects page load time, and never touches your frontend.',
  },
  {
    q: 'Does it work with page builders like Elementor or Divi?',
    a: 'The plugin works with any content stored in the WordPress post content field. For page builders that store content in custom fields or shortcodes, we recommend pasting the rendered text into the classic editor meta box for analysis.',
  },
  {
    q: 'What PHP and WordPress versions are required?',
    a: 'The plugin requires WordPress 5.8 or higher and PHP 7.4 or higher. You\'ll also need the curl, json, and mbstring PHP extensions, which are enabled by default on virtually all modern WordPress hosting environments.',
  },
  {
    q: 'How is my content handled? Is it stored?',
    a: 'Your content is sent to the rain OS API over HTTPS for analysis. We store your Rain Score and pillar breakdown locally in your WordPress database for history tracking. We do not permanently store your raw content on our servers after analysis is complete.',
  },
  {
    q: 'Can I use the plugin with WooCommerce product pages?',
    a: 'Yes. The plugin works on any post type including WooCommerce products. Product Discoverability scoring is particularly valuable for e-commerce — it checks whether AI shopping assistants can surface your products when users ask for recommendations.',
  },
  {
    q: 'Does the plugin include Repo Analysis for GitHub repositories?',
    a: 'No — Repo Analysis is available on the rain OS web app at getrainos.com, not the WordPress plugin. If you built your site with Bolt, Lovable, Cursor, v0, or another AI coding tool, connect your GitHub repo on the web app and we\'ll scan your actual source files for AEO signals. The plugin covers Content Analysis and URL Scanner; the web app adds Repo Analysis on top of those.',
  },
];

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="text-base font-medium text-white pr-6 group-hover:text-sky-300 transition-colors">{question}</span>
        <div className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${open ? 'bg-sky-500 border-sky-500 text-white' : 'border-white/10 text-slate-400'}`}>
          {open ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-slate-400 leading-relaxed text-sm">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WordPressPlugin() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-sky-500/30">
      <MarketingNav onLoginClick={() => navigate('/login?mode=login')} onGetStartedClick={() => navigate('/login')} />

      <main className="flex-grow">

        {/* Hero */}
        <section className="pt-44 pb-24 relative z-10 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at top, rgba(14,165,233,0.18) 0%, transparent 65%)' }} />

          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left">
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                  <div className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-bold text-sky-300 tracking-[0.2em] uppercase mb-6">
                    <span className="flex h-2 w-2 rounded-full bg-sky-400 mr-3 animate-pulse" />
                    WordPress Plugin
                  </div>

                  <h1 className="text-4xl md:text-5xl font-semibold leading-[1.08] text-white mb-6"
                    style={{ letterSpacing: '-0.04em' }}>
                    AEO scoring{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-sky-400">
                      inside WordPress
                    </span>
                  </h1>

                  <p className="text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed mb-5">
                    Two powerful analysis tools — Content Analysis and URL Scanner — built directly into your editor. Score, audit, and optimize without leaving WordPress.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
                    {[
                      { label: 'Content Analysis', icon: FileText, color: 'text-sky-400 border-sky-400/30 bg-sky-400/8' },
                      { label: 'URL Scanner', icon: Globe, color: 'text-violet-400 border-violet-400/30 bg-violet-400/8' },
                    ].map(({ label, icon: Icon, color }) => (
                      <span key={label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${color}`}>
                        <Icon className="w-3 h-3" />
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <a
                      href="https://wordpress.org/plugins/rain-os-aeo-analyzer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-7 py-3.5 text-sm font-bold shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 group"
                    >
                      <Download className="w-4 h-4" />
                      Download Free Plugin
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                    <button
                      onClick={() => navigate('/login')}
                      className="text-sm font-medium text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-white/20 rounded-xl px-6 py-3.5"
                    >
                      Sign up for rain OS →
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Plugin UI Mockup */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="w-full lg:w-[340px] shrink-0"
              >
                <div className="relative">
                  <div className="absolute -inset-[1px] rounded-[20px]"
                    style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(255,255,255,0.04), rgba(139,92,246,0.1))' }} />
                  <div className="relative bg-[#0a1220] border border-white/10 rounded-[20px] overflow-hidden">
                    <div className="bg-[#111827] border-b border-white/10 px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500/60" />
                        <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                        <span className="w-3 h-3 rounded-full bg-green-500/60" />
                      </div>
                      <span className="text-xs text-slate-500 ml-2 font-medium">rain OS — WordPress Sidebar</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">Rain Score</span>
                        <span className="text-xs text-sky-400 font-bold">Analyzed</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                            <circle cx="32" cy="32" r="26" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round"
                              strokeDasharray="163.4" strokeDashoffset="32.7" style={{ filter: 'drop-shadow(0 0 4px rgba(56,189,248,0.4))' }} />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">82</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          {[
                            { name: 'AI Readability', score: 88, color: '#38bdf8' },
                            { name: 'Authority', score: 79, color: '#34d399' },
                            { name: 'Conversion', score: 84, color: '#a78bfa' },
                            { name: 'Discoverability', score: 72, color: '#fb923c' },
                          ].map(p => (
                            <div key={p.name}>
                              <div className="flex justify-between mb-0.5">
                                <span className="text-[10px] text-slate-500">{p.name}</span>
                                <span className="text-[10px] font-bold" style={{ color: p.color }}>{p.score}</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full">
                                <div className="h-1 rounded-full" style={{ width: `${p.score}%`, background: p.color }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-white/[0.06] pt-3 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Recommendations</span>
                        {[
                          'Add entity signals — name your company and product explicitly',
                          'Structure paragraph 3 with answer-first formatting',
                        ].map((r, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                            <CheckCircle className="w-3 h-3 text-sky-400 mt-0.5 shrink-0" />
                            {r}
                          </div>
                        ))}
                      </div>

                      <button className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(56,189,248,0.15))', border: '1px solid rgba(56,189,248,0.3)' }}>
                        Re-analyze
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Two Analysis Tools */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">What's inside the plugin</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Two analysis tools. Zero context-switching.</h2>
              <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
                Whether you're writing new content or auditing a live page, both tools run directly inside WordPress — no browser tabs, no copy-pasting.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Content Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.05] p-7 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Content Analysis</h3>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Gutenberg Sidebar + Classic Editor</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Score the post you're currently editing. The Gutenberg sidebar panel pulls the live content from the editor and sends it for a full 4-pillar analysis — AI Readability, Digital Authority, Conversion Readiness, and Product Discoverability — without you leaving the screen.
                </p>
                <ul className="space-y-2">
                  {[
                    'Scores the active post in one click',
                    'Full 4-pillar Rain Score with sub-scores',
                    'Inline recommendations ranked by impact',
                    'Built-in rewrite tools: titles, meta, summarize, rewrite',
                    'Works on drafts before you publish',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* URL Scanner */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.05] p-7 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">URL Scanner</h3>
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Plugin Admin Panel</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enter any URL — your own pages or a competitor's — and we fetch the raw HTML, parse every technical AEO signal, and return a full breakdown. Catch what JS rendering hides, what schema is missing, and what AI crawlers actually see.
                </p>
                <ul className="space-y-2">
                  {[
                    'Scans any publicly accessible URL',
                    'Detects llms.txt, schema markup, open graph tags',
                    'Flags JS rendering risk (content AI crawlers miss)',
                    'Full pillar scores on the live page',
                    'Actionable technical AEO recommendations',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Repo Analysis callout */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                <GitBranch className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">Repo Analysis — Web App only</h3>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-400/25 bg-emerald-400/8">For vibe coders</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Built with Bolt, Lovable, Cursor, or v0? The third analysis mode — Repo Analysis — connects to your GitHub repository and scores your actual source files. This runs on the rain OS web app, not the plugin. It's the deepest analysis we offer, and it's free on any plan.
                </p>
              </div>
              <a
                href="https://www.getrainos.com"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-400/30 text-emerald-300 text-xs font-bold hover:bg-emerald-400/10 transition-all whitespace-nowrap"
              >
                Try Repo Analysis
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">Setup in minutes</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">From install to first analysis in three steps</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative"
                >
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-full w-8 h-px bg-gradient-to-r from-sky-500/30 to-transparent" />
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-400/25 flex items-center justify-center text-xs font-bold text-sky-400">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-2">{s.desc}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">What's included</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Every feature you need for AEO in WordPress</h2>
              <p className="text-slate-400 max-w-xl leading-relaxed">
                rain OS goes beyond what traditional SEO plugins offer, covering every signal that determines whether AI engines read, trust, and cite your content.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {coreFeatures.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 hover:border-white/15 hover:bg-white/[0.04] transition-all"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 shrink-0"
                    style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                    <f.Icon className="w-4 h-4" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">How we compare</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">rain OS vs traditional SEO plugins</h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                rain OS doesn't replace Yoast or RankMath — it adds the AEO layer they don't cover.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-4 bg-white/5 border-b border-white/10 text-xs font-bold uppercase tracking-wider">
                  <div className="p-4 text-slate-400">Feature</div>
                  <div className="p-4 text-slate-500 text-center">Yoast SEO</div>
                  <div className="p-4 text-slate-500 text-center">RankMath</div>
                  <div className="p-4 text-sky-400 text-center bg-sky-500/5 border-l border-sky-500/15">rain OS</div>
                </div>
                {vsComparison.map((row, i) => (
                  <div key={i} className="grid grid-cols-4 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <div className="p-4 text-sm text-slate-300">{row.feature}</div>
                    <div className="p-4 flex items-center justify-center">
                      {row.yoast
                        ? <CheckCircle className="w-4 h-4 text-slate-500" />
                        : <span className="text-slate-700 text-lg">—</span>}
                    </div>
                    <div className="p-4 flex items-center justify-center">
                      {row.rankmath
                        ? <CheckCircle className="w-4 h-4 text-slate-500" />
                        : <span className="text-slate-700 text-lg">—</span>}
                    </div>
                    <div className="p-4 flex items-center justify-center bg-sky-500/[0.03] border-l border-sky-500/10">
                      {row.rain
                        ? <CheckCircle className="w-4 h-4 text-sky-400" />
                        : <span className="text-slate-700 text-lg">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">Technical details</span>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Built for performance and security</h2>
                <p className="text-slate-400 leading-relaxed mb-8">
                  rain OS uses a modular, class-based plugin architecture with WordPress coding standards. All API calls are asynchronous — your site's frontend is never affected.
                </p>
                <div className="space-y-2">
                  {[
                    'Modular class-based architecture',
                    'AJAX with nonce verification on all endpoints',
                    'REST API with nonce middleware for Gutenberg',
                    'No third-party tracking or analytics injected',
                    'Analysis runs in cloud — zero server load on your host',
                    'Full WordPress Coding Standards compliance',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-sky-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  <div className="bg-white/5 border-b border-white/10 px-6 py-4">
                    <span className="text-sm font-semibold text-white">System Requirements</span>
                  </div>
                  <div className="divide-y divide-white/[0.05]">
                    {technicalSpecs.map((spec) => (
                      <div key={spec.label} className="flex items-center justify-between px-6 py-3.5">
                        <span className="text-sm text-slate-400">{spec.label}</span>
                        <span className="text-sm font-medium text-white">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-white">Frequently asked questions</h2>
            </motion.div>

            <div className="space-y-1">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <AccordionItem question={faq.q} answer={faq.a} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 px-6 border-t border-white/[0.06] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.07) 0%, transparent 70%)' }} />

          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                Get your content cited by AI
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Install the free plugin, connect your rain OS account, and run your first analysis in under five minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://wordpress.org/plugins/rain-os-aeo-analyzer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-8 py-4 text-sm font-bold shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 group"
                >
                  <Download className="w-4 h-4" />
                  Download Free Plugin
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Sign up for rain OS →
                </button>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-midnight py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <span className="font-bold text-3xl tracking-tighter text-white">r<span className="text-sky-400">ai</span>n</span>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <a href="https://www.getrainos.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="https://www.getrainos.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:support@getrainos.com" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="text-right text-xs text-slate-600">© {new Date().getFullYear()} rain OS. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
