import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, BrainCircuit, ShieldCheck, FileSearch, CheckCircle } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';

export default function AIReadabilityPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#020410', color: '#f1f5f9' }}>
      <MarketingNav />

      {/* Hero */}
      <div style={{ padding: '140px 24px 60px', maxWidth: '760px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-4 block">
            What we measure
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            How rain OS Scores Content for AI Citation
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-6">
            Every piece of content you create — blog posts, product pages, docs, or landing pages — gets scored across five pillars. The weights change based on what you are optimizing for, but the goal is the same: make sure AI can read, trust, and cite your content.
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        {/* The Core Idea */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            The core idea
          </h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              When someone asks an AI a question, the AI does not hand them a web page. It reads, understands, and summarizes the answer from sources it trusts. AI Readability is about making sure your content is one of those sources.
            </p>
            <p>
              Think of it like this: an AI needs to do two things to use your content. First, it needs to read and understand it clearly. Second, it needs to explain that understanding to the person asking the question. We call the first step <strong className="text-white">translation</strong> and the second step <strong className="text-white">interpretation</strong>.
            </p>
            <p>
              Rain OS makes sure your content is translated well so the AI can interpret it accurately. If your content is poorly structured, ambiguous, or missing key signals, the AI either skips it or misrepresents it.
            </p>
          </div>
        </motion.div>

        {/* The Five Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-sky-400" />
            </div>
            The five pillars of scoring
          </h2>
          <p className="text-slate-400 leading-relaxed mb-6">
            Every analysis returns a 0–100 Rain Score built from five pillars. The exact weights depend on your content type — writers, product sellers, developers, and vibe coders each get a different blend. Here is how they work.
          </p>

          <div className="space-y-6">
            {/* Pillar 1 */}
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.03] p-6">
              <h3 className="text-base font-semibold text-white mb-3">
                <span className="text-sky-400 mr-2">36% (general)</span>
                AI Readability
              </h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Can the AI read and understand your content clearly? This pillar checks the structural basics that make content machine-readable. Weight varies by lane — 36% for writers, 20% for product sellers, 32% for developers and vibe coders, 27% for local business.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Clear heading structure — H1, H2, H3 that organize ideas logically</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Schema markup — structured data that tells AI what each part of your page means</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Meta tags — accurate title and description that match your content</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>LLM-ready files — llms.txt or similar that give AI a clean map of your content</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6">
              <h3 className="text-base font-semibold text-white mb-3">
                <span className="text-emerald-400 mr-2">27% (general)</span>
                Digital Authority
              </h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Does the AI trust your content? This pillar checks the signals that make an AI confident your content is reliable. Weight varies by lane — 27% for writers, 15% for product sellers, 32% for developers, 36% for local business.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Credible sources — citations and links that back up your claims</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Consistent expertise — depth on a topic over time, not surface-level coverage</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>robots.txt and canonicals — clear signals about which content to index and which to avoid</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Open Graph tags — social metadata that reinforces your content's identity</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-6">
              <h3 className="text-base font-semibold text-white mb-3">
                <span className="text-violet-400 mr-2">27% (general)</span>
                Conversion Readiness
              </h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                Is your content organized so that AI can extract the answer and point the user to the next step? Weight varies by lane — 27% for writers, 15% for product sellers, 26% for developers, 27% for local business.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <span>Direct answers — clear, concise answers to likely questions near the top</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <span>FAQ sections — structured questions and answers that AI can quote directly</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <span>Clear CTAs — next steps that are obvious without extra navigation</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <span>Lead paragraph quality — the first paragraph says what the page is about and why it matters</span>
                </li>
              </ul>
            </div>

            {/* Pillar 4 — Product Discoverability */}
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.03] p-6">
              <h3 className="text-base font-semibold text-white mb-3">
                <span className="text-orange-400 mr-2">0% (general) → 50% (product sellers)</span>
                Product Discoverability
              </h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                For product-focused content, this pillar measures how well AI can surface your products in shopping and discovery contexts. It is 0% for writers, developers, and local business — but jumps to 50% for product sellers, where it becomes the most important pillar.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>Product schema completeness — all required fields for AI shopping engines</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>Pricing transparency — clear, visible pricing that AI can extract</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>Variant coverage — sizes, colors, options fully described</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>Availability signals — stock status, shipping info, delivery estimates</span>
                </li>
              </ul>
            </div>

            {/* Pillar 5 — RAG Readiness */}
            <div className="rounded-2xl border border-pink-500/20 bg-pink-500/[0.03] p-6">
              <h3 className="text-base font-semibold text-white mb-3">
                <span className="text-pink-400 mr-2">10% (all lanes)</span>
                RAG Readiness
              </h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                How well is your content optimized for Retrieval-Augmented Generation (RAG) systems — vector databases, embedding models, and chunk-based retrieval? This stays at 10% across every lane. It is distinct from citation scoring: RAG readiness measures whether an AI retrieval system can accurately find, chunk, and synthesize your content.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <span>Information density — deep, exhaustive coverage per content chunk</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <span>Semantic mapping — rich vocabulary, synonyms, entity relationships</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <span>Hierarchical formatting — clean markdown, logical headers, descriptive titles</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <span>Explicit Q&A structures — FAQ sections, direct definitions, problem-solution frameworks</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <span>Authority signals — external links, author bios, verifiable data points</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Why It Matters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
            Why this matters now
          </h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Search is changing. People ask ChatGPT, Perplexity, and Gemini questions instead of typing keywords into Google. When they do, the AI answers directly — often without sending anyone to your website.
            </p>
            <p>
              If your content is not AI-readable, you are invisible in the most important search channel of the next decade. Not because your content is bad, but because the AI cannot read it well enough to use it.
            </p>
            <p>
              This is not a technical upgrade for large companies. It is a basic requirement for anyone who wants their content, products, or docs to be discoverable when people ask AI for help — whether you are a writer, a developer shipping with Cursor, or a store owner on Shopify.
            </p>
          </div>
        </motion.div>

        {/* What Rain OS Does */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <FileSearch className="w-5 h-5 text-sky-400" />
            </div>
            What Rain OS does about it
          </h2>
          <div className="space-y-4 text-slate-400 leading-relaxed">
            <p>
              Rain OS scans your content, URL, or repository and scores it across all five pillars — using the right weights for your lane. You get a single number — your Rain Score — plus a breakdown of exactly which signals are strong and which are missing.
            </p>
            <p>
              More importantly, you get specific recommendations. Not vague advice like "improve your SEO." Exact, actionable steps like "Add an FAQ section with these questions" or "Your H2 structure is missing — add these three subheadings."
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-violet-400/20 bg-violet-500/[0.03] p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-3">
              Ready to see how AI-readable your content is?
            </h3>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto leading-relaxed">
              Run your first analysis free. No credit card. No setup. Just paste your content or enter a URL and see your score.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-white rounded-xl px-8 py-3.5 text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)',
                boxShadow: '0 8px 24px rgba(139,92,246,0.25)',
              }}
            >
              Scan my content free
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
