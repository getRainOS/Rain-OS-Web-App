import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Key, Zap, BrainCircuit, ShieldCheck, MousePointerClick,
  Target, Globe, GitBranch, FileText, Code2, ChevronRight, Terminal,
  ArrowRight, Layers, Package, Search, SearchCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';

const sections = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'five-pillars', label: 'The Five Pillars' },
  { id: 'solutions', label: 'Solution Modules' },
  { id: 'analysis-modes', label: 'Analysis Modes' },
  { id: 'api-reference', label: 'API Reference' },
  { id: 'wordpress', label: 'WordPress Plugin' },
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
        <span className="text-xs font-mono text-slate-500">{lang}</span>
      </div>
      <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
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
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Documentation</p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={() => setActiveSection(s.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === s.id
                          ? 'bg-sky-500/10 text-sky-300 border border-sky-400/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
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
                    className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
                  >
                    Get started free
                  </button>
                </div>
              </div>
            </aside>

            <main className="flex-grow min-w-0 space-y-16">
              <div className="mb-12">
                <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">Documentation</span>
                <h1 className="text-4xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
                  rain OS Documentation
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                  Everything you need to get your content, products, and documentation scoring high for AI readability.
                </p>
              </div>

              <Section id="getting-started" title="Getting Started">
                <div className="space-y-6 text-slate-400 leading-relaxed">
                  <p>
                    rain OS is an AEO (Answer Engine Optimization) and GEO (Generative Engine Optimization) platform.
                    It analyzes your content and scores it against the signals that ChatGPT, Perplexity, Gemini, and Claude
                    use to decide what to cite and recommend.
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
                        <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
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

              <Section id="five-pillars" title="The Five Pillars">
                <div className="space-y-6">
                  <p className="text-slate-400 leading-relaxed">
                    Every analysis returns a weighted Rain Score built from five core pillars. These are the exact signals
                    AI engines use to decide what gets cited and recommended.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        color: '#38bdf8',
                        bg: 'rgba(14,165,233,0.08)',
                        border: 'rgba(14,165,233,0.2)',
                        Icon: BrainCircuit,
                        name: 'AI Readability',
                        weight: '36%',
                        desc: 'How well AI systems can parse, chunk, and extract answers from your content. Covers structural clarity, answer-first formatting, semantic precision, context sufficiency, and section concept isolation.',
                        subScores: ['Structural Clarity', 'Answer-First Formatting', 'Semantic Precision', 'Context Sufficiency', 'Section Concept Isolation'],
                      },
                      {
                        color: '#34d399',
                        bg: 'rgba(16,185,129,0.08)',
                        border: 'rgba(16,185,129,0.2)',
                        Icon: ShieldCheck,
                        name: 'Digital Authority',
                        weight: '27%',
                        desc: 'Whether your content signals expertise, trustworthiness, and citability to AI. Covers citation signals, entity clarity, topical authority, freshness signals, and social proof markup.',
                        subScores: ['Citation Signals', 'Entity Clarity', 'Topical Authority', 'Freshness Signals', 'Social Proof Markup'],
                      },
                      {
                        color: '#a78bfa',
                        bg: 'rgba(139,92,246,0.08)',
                        border: 'rgba(139,92,246,0.2)',
                        Icon: MousePointerClick,
                        name: 'Conversion Readiness',
                        weight: '27%',
                        desc: 'Whether your content guides the reader toward a clear next action. Covers CTA clarity, trust signals, value proposition, and friction reduction.',
                        subScores: ['CTA Clarity', 'Trust Signals', 'Value Proposition', 'Friction Reduction'],
                      },
                      {
                        color: '#f97316',
                        bg: 'rgba(249,115,22,0.08)',
                        border: 'rgba(249,115,22,0.2)',
                        Icon: SearchCheck,
                        name: 'Product Discoverability',
                        weight: '0% (general)',
                        desc: 'For product-focused content: how well AI surfaces products in shopping and discovery contexts. 50% weight in the Product Sellers module.',
                        subScores: ['Product Variant Coverage', 'Merchant Identity', 'Pricing Transparency', 'Availability Signals', 'Comparative Context'],
                      },
                      {
                        color: '#ec4899',
                        bg: 'rgba(236,72,153,0.08)',
                        border: 'rgba(236,72,153,0.2)',
                        Icon: Layers,
                        name: 'RAG Readiness',
                        weight: '10%',
                        desc: 'How well content is optimized for Retrieval-Augmented Generation (RAG) systems — vector databases, embedding models, and chunk-based retrieval.',
                        subScores: ['Information Density', 'Semantic Mapping', 'Narrative Nuance', 'Hierarchical Formatting', 'Explicit Q&A', 'Authority Signals'],
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
                            className="text-xs font-bold rounded-full px-2.5 py-0.5 ml-auto"
                            style={{ color: p.color, background: `${p.bg}`, border: `1px solid ${p.border}` }}
                          >
                            {p.weight} weight
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">{p.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.subScores.map((s) => (
                            <span key={s} className="text-xs px-2.5 py-1 rounded-lg text-slate-300 bg-white/[0.04] border border-white/8">
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
                      code={`Rain Score = (AI Readability × 0.36) + (Digital Authority × 0.27) + (Conversion Readiness × 0.27) + (Product Discoverability × 0.00) + (RAG Readiness × 0.10)`}
                    />
                  </div>
                </div>
              </Section>

              <Section id="solutions" title="Solution Modules">
                <div className="space-y-6">
                  <p className="text-slate-400 leading-relaxed">
                    Beyond the five core pillars, rain OS offers specialized modules for specific use cases. Each module
                    has its own weighted scoring system built for that content type.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        color: '#38bdf8',
                        Icon: BrainCircuit,
                        name: 'Writers & Marketers',
                        badge: 'General module',
                        desc: 'The default module. Optimized for blog posts, articles, landing pages, and marketing copy. Uses the five-pillar scoring framework (AI Readability 36%, Digital Authority 27%, Conversion Readiness 27%, Product Discoverability 0% by default, RAG Readiness 10%).',
                        module: 'general',
                      },
                      {
                        color: '#fb923c',
                        Icon: Package,
                        name: 'Product Sellers',
                        badge: 'Product Discoverability module',
                        desc: 'Dedicated scoring for ecommerce and product pages. Product Discoverability jumps to 50% weight, covering pricing transparency, variant coverage, availability signals, merchant identity, and comparative context. AI Readability 20%, Digital Authority 15%, Conversion Readiness 15%, RAG Readiness 10%.',
                        module: 'product_sellers',
                      },
                      {
                        color: '#34d399',
                        Icon: BookOpen,
                        name: 'Developers',
                        badge: 'Documentation module',
                        desc: 'Specialized scoring for technical documentation. Reweights the five-pillar engine so AI Readability (32%), Digital Authority (32%), and Conversion Readiness (26%) matter most, with RAG Readiness at 10% — built for READMEs, API references, guides, and developer docs.',
                        module: 'developers',
                      },
                      {
                        color: '#10b981',
                        Icon: Zap,
                        name: 'Vibe Coders',
                        badge: 'Vibe builder module',
                        desc: 'Same scoring weights as the Developers module (32/32/26/10), but positioned for builders using Bolt, Lovable, Cursor, v0, and Replit. Scans GitHub repos to catch gaps that URL scanning misses — missing llms.txt, JS-only rendering, no schema, and incomplete meta tags.',
                        module: 'vibe_coders',
                      },
                      {
                        color: '#fb7185',
                        Icon: MapPin,
                        name: 'Local Businesses',
                        badge: 'Local SEO module',
                        desc: 'Built for service businesses and local shops. Digital Authority rises to 36% because local trust signals are primary. AI Readability 27%, Conversion Readiness 27%, RAG Readiness 10%. Checks NAP consistency, LocalBusiness schema, review signals, Google Business Profile mentions, and click-to-call CTAs.',
                        module: 'local_business',
                      },
                    ].map((s) => (
                      <div key={s.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <s.Icon className="w-5 h-5" style={{ color: s.color }} />
                          <h3 className="font-semibold text-white">{s.name}</h3>
                          <span className="text-xs text-slate-500 bg-white/[0.04] border border-white/8 px-2.5 py-0.5 rounded-full ml-auto">
                            {s.badge}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">{s.desc}</p>
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
                  <p className="text-slate-400 leading-relaxed">
                    rain OS offers three ways to analyze content, each surfacing different signals.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        Icon: FileText,
                        color: '#38bdf8',
                        name: 'Content Analyzer',
                        path: '/analyze',
                        desc: 'Paste any text content — blog posts, product descriptions, landing page copy, documentation. Returns a full Rain Score with pillar breakdowns and recommendations.',
                        endpoint: 'POST /api/analyze',
                      },
                      {
                        Icon: Globe,
                        color: '#a78bfa',
                        name: 'URL Scanner',
                        path: '/url-scanner',
                        desc: 'Enter any live URL. We fetch the page, parse the HTML, and surface every technical AEO signal: schema markup, llms.txt, JS rendering risk, open graph, and more.',
                        endpoint: 'POST /api/scan',
                      },
                      {
                        Icon: GitBranch,
                        color: '#34d399',
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
                          <code className="text-xs font-mono text-slate-500 bg-white/[0.04] border border-white/8 px-2.5 py-0.5 rounded ml-auto">
                            {m.endpoint}
                          </code>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              <Section id="api-reference" title="API Reference">
                <div className="space-y-8 text-slate-400">
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
  "module": "general | product_sellers | developers (optional)"
}`,
                          response: `{
  "success": true,
  "overallScore": 74,
  "pillarScores": {
    "aiReadability": 81,
    "digitalAuthority": 68,
    "conversionReadiness": 71,
    "productDiscoverability": 62,
    "ragReadiness": 74
  },
  "recommendations": [...],
  "api_version": "2.4"
}`,
                        },
                        {
                          method: 'POST',
                          path: '/api/scan',
                          desc: 'Scan a live URL for technical AEO signals.',
                          body: `{
  "url": "https://example.com",
  "industry": "string (optional)"
}`,
                        },
                        {
                          method: 'GET',
                          path: '/api/history',
                          desc: 'Retrieve past analyses for the authenticated user.',
                          response: `[{ "id": "...", "title": "...", "overallScore": 74, "createdAt": "..." }]`,
                        },
                      ].map((ep) => (
                        <div key={ep.path} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                            <span
                              className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                                ep.method === 'GET'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/20'
                                  : 'bg-sky-500/10 text-sky-400 border border-sky-400/20'
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
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Request body</p>
                                <CodeBlock lang="json" code={ep.body} />
                              </div>
                            )}
                            {ep.response && (
                              <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Response</p>
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
                        <code className="text-xs font-mono text-sky-400 shrink-0">X-Usage-Info</code>
                        <p className="text-sm">JSON object returned on every authenticated request containing <code className="text-xs font-mono text-slate-300">count</code> and <code className="text-xs font-mono text-slate-300">limit</code> for the current billing period.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              <Section id="wordpress" title="WordPress Plugin">
                <div className="space-y-6 text-slate-400">
                  <p className="leading-relaxed">
                    The rain OS WordPress plugin brings full Rain Score analysis directly into your WordPress editor — both Gutenberg and Classic Editor.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Requirements', items: ['WordPress 5.8+', 'PHP 7.4+', 'curl, json, mbstring extensions', 'Active rain OS API key'] },
                      { title: 'Features', items: ['Gutenberg sidebar panel', 'Classic editor meta box', 'URL Scanner', 'Built-in rewrite tools', 'Product Discoverability toggle'] },
                    ].map((g) => (
                      <div key={g.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                        <h3 className="text-sm font-semibold text-white mb-3">{g.title}</h3>
                        <ul className="space-y-1.5">
                          {g.items.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                              <span className="w-1 h-1 rounded-full bg-sky-400 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Installation</h3>
                    <ol className="space-y-3">
                      {[
                        'Download the latest plugin ZIP from the WordPress Plugin page',
                        'Go to Plugins → Add New → Upload Plugin in your WordPress admin',
                        'Upload the ZIP file and click Install Now',
                        'Activate the plugin and go to Settings → rain OS',
                        'Enter your API key and save. The sidebar will appear in your next post.',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                          <span className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-white mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <a
                      href="/wordpress-plugin"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500/10 border border-sky-400/25 text-sky-300 text-sm font-semibold hover:bg-sky-500/15 transition-all"
                    >
                      WordPress Plugin page
                      <ChevronRight className="w-4 h-4" />
                    </a>
                    <a
                      href="mailto:support@getrainos.com"
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      Need help? Contact support →
                    </a>
                  </div>
                </div>
              </Section>
            </main>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-midnight py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <span className="font-bold text-3xl tracking-tighter text-white">
            r<span className="text-sky-400">ai</span>n
          </span>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/support" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="text-right text-xs text-slate-600">© {new Date().getFullYear()} rain OS. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
