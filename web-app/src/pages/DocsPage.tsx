import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Key, Zap, BrainCircuit, ShieldCheck, MousePointerClick,
  Target, Globe, GitBranch, FileText, Code2, ChevronRight, Terminal,
  ArrowRight, Layers, Package, Search, SearchCheck, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';

import SiteFooter from '@/components/marketing/SiteFooter';
const sections = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'six-pillars', label: 'The Six Pillars' },
  { id: 'solutions', label: 'Solution Modules' },
  { id: 'analysis-modes', label: 'Analysis Modes' },
  { id: 'api-reference', label: 'API Reference' },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="pb-16 border-b border-white/[0.06] last:border-0">
      <h2 className="text-2xl font-semibold text-white mb-6">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ code, lang = 'bash' }: { code: string; lang?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#06091a] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
        <span className="text-xs font-mono text-neutral-500">{lang}</span>
      </div>
      <pre className="p-4 text-sm font-mono text-neutral-300 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DocsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      <MarketingNav onGetStartedClick={() => navigate('/login')} onLoginClick={() => navigate('/login?mode=login')} />

      <div className="pt-28 flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex gap-12">
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-28">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Documentation</p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={() => setActiveSection(s.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === s.id
                          ? 'bg-white/[0.03] text-white border border-white/10'
                          : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      {s.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-white/[0.06]">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
                    style={{ background: 'var(--cyan)' }}
                  >
                    Get started free
                  </button>
                </div>
              </div>
            </aside>

            <main className="flex-grow min-w-0 space-y-16">
              <div className="mb-12">
                <span className="text-white font-bold tracking-wider text-xs uppercase mb-3 block">Documentation</span>
                <h1 className="text-4xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
                  rain OS Documentation
                </h1>
                <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
                  Everything you need to get your content, products, and documentation scoring high for AI readability.
                </p>
              </div>

              <Section id="getting-started" title="Getting Started">
                <div className="space-y-6 text-neutral-400 leading-relaxed">
                  <p>
                    rain OS is an AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) platform.
                    It analyzes your content against the widely documented signals AI assistants such as ChatGPT, Perplexity,
                    Gemini and Claude rely on. Its citation checks run on ChatGPT, Google AI Overviews, Google AI Mode, Gemini, Perplexity and Claude.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { num: '01', title: 'Create an account', desc: 'Sign up free at getrainos.com. No credit card required.' },
                      { num: '02', title: 'Get your API key', desc: 'Your API key appears in the dashboard after signup.' },
                      { num: '03', title: 'Run your first analysis', desc: 'Paste content into the analyzer or use the API directly.' },
                    ].map((s) => (
                      <div key={s.num} className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
                        <span className="text-3xl font-bold text-white/[0.07] block mb-3">{s.num}</span>
                        <h3 className="text-sm font-semibold text-white mb-1.5">{s.title}</h3>
                        <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Authentication</h3>
                    <p className="mb-4">All API requests require your API key as a Bearer token in the Authorization header:</p>
                    <CodeBlock
                      lang="http"
                      code={`Authorization: Bearer your_api_key_here`}
                    />
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Quick start — your first analysis</h3>
                    <CodeBlock
                      lang="curl"
                      code={`curl -X POST https://api.getrainos.com/api/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "full_analysis",
    "content": "Your content here...",
    "industry": "SaaS / Tech"
  }'`}
                    />
                  </div>
                </div>
              </Section>

              <Section id="six-pillars" title="The Six Pillars">
                <div className="space-y-6">
                  <p className="text-neutral-400 leading-relaxed">
                    Every analysis returns a weighted Rain Score built from six core pillars. These are the exact signals
                    AI engines use to decide what gets cited and recommended.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        color: '#e5e5e5',
                        bg: 'rgba(255,255,255,0.08)',
                        border: 'rgba(255,255,255,0.2)',
                        Icon: BrainCircuit,
                        name: 'AI Readability',
                        weight: '36%',
                        desc: 'How well AI systems can parse, chunk, and extract answers from your content. Covers structural clarity, answer-first formatting, semantic precision, context sufficiency, and section concept isolation.',
                        subScores: ['Structural Clarity', 'Answer-First Formatting', 'Semantic Precision', 'Context Sufficiency', 'Section Concept Isolation'],
                      },
                      {
                        color: '#e5e5e5',
                        bg: 'rgba(255,255,255,0.08)',
                        border: 'rgba(255,255,255,0.2)',
                        Icon: ShieldCheck,
                        name: 'Digital Authority',
                        weight: '27%',
                        desc: 'Whether your content signals expertise, trustworthiness, and citability to AI. Covers citation signals, entity clarity, topical authority, freshness signals, and social proof markup.',
                        subScores: ['Citation Signals', 'Entity Clarity', 'Topical Authority', 'Freshness Signals', 'Social Proof Markup'],
                      },
                      {
                        color: '#e5e5e5',
                        bg: 'rgba(255,255,255,0.08)',
                        border: 'rgba(255,255,255,0.2)',
                        Icon: MousePointerClick,
                        name: 'Conversion Readiness',
                        weight: '27%',
                        desc: 'Whether your content guides the reader toward a clear next action. Covers CTA clarity, trust signals, value proposition, and friction reduction.',
                        subScores: ['CTA Clarity', 'Trust Signals', 'Value Proposition', 'Friction Reduction'],
                      },
                      {
                        color: '#e5e5e5',
                        bg: 'rgba(255,255,255,0.08)',
                        border: 'rgba(255,255,255,0.2)',
                        Icon: SearchCheck,
                        name: 'Product Discoverability',
                        weight: '0% (general)',
                        desc: 'For product-focused content: how well AI surfaces products in shopping and discovery contexts. 50% weight in the Product Sellers module.',
                        subScores: ['Product Variant Coverage', 'Merchant Identity', 'Pricing Transparency', 'Availability Signals', 'Comparative Context'],
                      },
                      {
                        color: '#e5e5e5',
                        bg: 'rgba(255,255,255,0.08)',
                        border: 'rgba(255,255,255,0.2)',
                        Icon: Layers,
                        name: 'RAG Readiness',
                        weight: '10%',
                        desc: 'How well content is optimized for Retrieval-Augmented Generation (RAG) systems — vector databases, embedding models, and chunk-based retrieval.',
                        subScores: ['Information Density', 'Semantic Mapping', 'Narrative Nuance', 'Hierarchical Formatting', 'Explicit Q&A', 'Authority Signals'],
                      },
                      {
                        color: '#e5e5e5',
                        bg: 'rgba(255,255,255,0.08)',
                        border: 'rgba(255,255,255,0.2)',
                        Icon: MapPin,
                        name: 'Local Presence',
                        weight: '0% (general)',
                        desc: 'For local service businesses: how confidently AI can recommend you for a "near me" query. 30% weight in the Local Businesses module — the largest single pillar there.',
                        subScores: ['NAP Consistency', 'LocalBusiness Schema', 'Service Area Clarity', 'Review Signal Strength', 'Local Citation Signals'],
                      },
                    ].map((p) => (
                      <div
                        key={p.name}
                        className="rounded-2xl p-6"
                        style={{ background: p.bg, border: `1px solid ${p.border}` }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <p.Icon className="w-5 h-5" style={{ color: p.color }} />
                          <h3 className="font-semibold text-white">{p.name}</h3>
                          <span
                            className="text-xs font-bold rounded-md px-2.5 py-0.5 ml-auto"
                            style={{ color: p.color, background: `${p.bg}`, border: `1px solid ${p.border}` }}
                          >
                            {p.weight} weight
                          </span>
                        </div>
                        <p className="text-neutral-400 text-sm leading-relaxed mb-4">{p.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.subScores.map((s) => (
                            <span key={s} className="text-xs px-2.5 py-1 rounded-lg text-neutral-300 bg-white/[0.04] border border-white/8">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                    <h3 className="text-sm font-semibold text-white mb-2">Overall Score Calculation</h3>
                    <CodeBlock
                      lang="formula"
                      code={`Rain Score = (AI Readability × 0.36) + (Digital Authority × 0.27) + (Conversion Readiness × 0.27) + (Product Discoverability × 0.00) + (Local Presence × 0.00) + (RAG Readiness × 0.10)`}
                    />
                  </div>
                </div>
              </Section>

              <Section id="solutions" title="Solution Modules">
                <div className="space-y-6">
                  <p className="text-neutral-400 leading-relaxed">
                    Beyond the six core pillars, rain OS offers specialized modules for specific use cases. Each module
                    has its own weighted scoring system built for that content type.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        color: '#e5e5e5',
                        Icon: BrainCircuit,
                        name: 'Writers & Marketers',
                        badge: 'General module',
                        desc: 'The default module. Optimized for blog posts, articles, landing pages, and marketing copy. Uses the six-pillar scoring framework (AI Readability 36%, Digital Authority 27%, Conversion Readiness 27%, Product Discoverability 0% by default, RAG Readiness 10%).',
                        module: 'general',
                      },
                      {
                        color: '#e5e5e5',
                        Icon: Package,
                        name: 'Product Sellers',
                        badge: 'Product Discoverability module',
                        desc: 'Dedicated scoring for ecommerce and product pages. Product Discoverability jumps to 50% weight, covering pricing transparency, variant coverage, availability signals, merchant identity, and comparative context. AI Readability 20%, Digital Authority 15%, Conversion Readiness 15%, RAG Readiness 10%.',
                        module: 'product_sellers',
                      },
                      {
                        color: '#e5e5e5',
                        Icon: BookOpen,
                        name: 'Developers',
                        badge: 'Documentation module',
                        desc: 'Specialized scoring for technical documentation. Reweights the six-pillar engine so AI Readability (32%), Digital Authority (32%), and Conversion Readiness (26%) matter most, with RAG Readiness at 10% — built for READMEs, API references, guides, and developer docs.',
                        module: 'developers',
                      },
                      {
                        color: '#e5e5e5',
                        Icon: Zap,
                        name: 'Vibe Coders',
                        badge: 'Vibe builder module',
                        desc: 'Same scoring weights as the Developers module (32/32/26/10), but positioned for builders using Bolt, Lovable, Cursor, v0, and Replit. Scans GitHub repos to catch gaps that URL scanning misses — missing llms.txt, JS-only rendering, no schema, and incomplete meta tags.',
                        module: 'vibe_coders',
                      },
                      {
                        color: '#e5e5e5',
                        Icon: MapPin,
                        name: 'Local Businesses',
                        badge: 'Local SEO module',
                        desc: 'Built for service businesses and local shops. Local Presence rises to 30% because local trust signals are primary. AI Readability 20%, Digital Authority 20%, Conversion Readiness 20%, RAG Readiness 10%. Checks NAP consistency, LocalBusiness schema, review signals, Google Business Profile mentions, and click-to-call CTAs.',
                        module: 'local_business',
                      },
                    ].map((s) => (
                      <div key={s.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <s.Icon className="w-5 h-5" style={{ color: s.color }} />
                          <h3 className="font-semibold text-white">{s.name}</h3>
                          <span className="text-xs text-neutral-500 bg-white/[0.04] border border-white/8 px-2.5 py-0.5 rounded-md ml-auto">
                            {s.badge}
                          </span>
                        </div>
                        <p className="text-neutral-400 text-sm leading-relaxed mb-4">{s.desc}</p>
                        <CodeBlock
                          lang="json"
                          code={`{ "action": "full_analysis", "content": "...", "module": "${s.module}" }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section id="analysis-modes" title="Analysis Modes">
                <div className="space-y-6">
                  <p className="text-neutral-400 leading-relaxed">
                    rain OS offers three ways to analyze content, each surfacing different signals.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        Icon: FileText,
                        color: '#e5e5e5',
                        name: 'Content Analyzer',
                        path: '/analyze',
                        desc: 'Paste any text content — blog posts, product descriptions, landing page copy, documentation. Returns a full Rain Score with pillar breakdowns and recommendations.',
                        endpoint: 'POST /api/analyze',
                      },
                      {
                        Icon: Globe,
                        color: '#e5e5e5',
                        name: 'URL Scanner',
                        path: '/url-scanner',
                        desc: 'Enter any live URL. We fetch the page, parse the HTML, and surface every technical AEO signal: schema markup, llms.txt, JS rendering risk, open graph, and more.',
                        endpoint: 'POST /api/url-scan',
                      },
                      {
                        Icon: GitBranch,
                        color: '#e5e5e5',
                        name: 'Repo Analysis',
                        path: '/repo-analysis',
                        desc: 'Connect your GitHub repo and we scan the actual source files — README, package.json, llms.txt, robots.txt, index.html. Catches issues invisible in the rendered output.',
                        endpoint: 'POST /api/github/analyze',
                      },
                    ].map((m) => (
                      <div key={m.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <m.Icon className="w-5 h-5" style={{ color: m.color }} />
                          <h3 className="font-semibold text-white">{m.name}</h3>
                          <code className="text-xs font-mono text-neutral-500 bg-white/[0.04] border border-white/8 px-2.5 py-0.5 rounded ml-auto">
                            {m.endpoint}
                          </code>
                        </div>
                        <p className="text-neutral-400 text-sm leading-relaxed">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section id="api-reference" title="API Reference">
                <div className="space-y-8 text-neutral-400">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Base URL</h3>
                    <CodeBlock lang="http" code={`https://api.getrainos.com`} />
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-4">Endpoints</h3>
                    <div className="space-y-6">
                      {[
                        {
                          method: 'GET',
                          path: '/api/users/me',
                          desc: 'Returns authenticated user info including email, subscription status, and usage counts.',
                          response: `{
  "email": "user@example.com",
  "subscriptionStatus": "active",
  "stripePriceId": "price_...",
  "usage": { "count": 12, "limit": 100 }
}`,
                        },
                        {
                          method: 'POST',
                          path: '/api/analyze',
                          desc: 'Analyze content and return a Rain Score. Pass module to use a specialized scoring framework.',
                          body: `{
  "action": "full_analysis",
  "content": "string (required)",
  "industry": "string (optional)",
  "module": "general | product_sellers | developers | vibe_coders | local_business (optional)"
}`,
                          response: `{
  "success": true,
  "overallScore": 74,
  "pillarScores": {
    "aiReadability": 81,
    "digitalAuthority": 68,
    "conversionReadiness": 71,
    "productDiscoverability": 62,
    "localPresence": 0,
    "ragReadiness": 74
  },
  "recommendations": [...],
  "api_version": "2.4"
}`,
                        },
                        {
                          method: 'POST',
                          path: '/api/url-scan',
                          desc: 'Scan a live URL for technical AEO signals.',
                          body: `{
  "url": "https://example.com",
  "industry": "string (optional)",
  "module": "general | product_sellers | developers | vibe_coders | local_business (optional)"
}`,
                        },
                        {
                          method: 'GET',
                          path: '/api/history',
                          desc: 'Retrieve past analyses for the authenticated user.',
                          response: `{
  "success": true,
  "items": [
    { "id": 1, "title": "...", "overall_score": 74, "analyzed_at": "..." }
  ],
  "totalCount": 1
}`,
                        },
                      ].map((ep) => (
                        <div key={ep.path} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                            <span
                              className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                                ep.method === 'GET'
                                  ? 'bg-white/[0.03] text-white border border-white/10'
                                  : 'bg-white/[0.03] text-white border border-white/10'
                              }`}
                            >
                              {ep.method}
                            </span>
                            <code className="text-sm font-mono text-white">{ep.path}</code>
                          </div>
                          <div className="p-5 space-y-4">
                            <p className="text-sm leading-relaxed">{ep.desc}</p>
                            {ep.body && (
                              <div>
                                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Request body</p>
                                <CodeBlock lang="json" code={ep.body} />
                              </div>
                            )}
                            {ep.response && (
                              <div>
                                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Response</p>
                                <CodeBlock lang="json" code={ep.response} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-4">Response headers</h3>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                      <div className="flex items-start gap-4">
                        <code className="text-xs font-mono text-white shrink-0">X-Usage-Info</code>
                        <p className="text-sm">JSON object returned on every authenticated request containing <code className="text-xs font-mono text-neutral-300">count</code> and <code className="text-xs font-mono text-neutral-300">limit</code> for the current billing period.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            </main>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
