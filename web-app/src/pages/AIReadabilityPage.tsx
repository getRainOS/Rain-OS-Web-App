import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import SiteFooter from '@/components/marketing/SiteFooter';

// AI visibility: what it is, what it depends on, and how rain OS measures it.
// AI Readability is named only where it is one of the pillars.

const PILLARS = [
  {
    name: 'AI Readability',
    body: 'Whether an AI can read and understand your page: clear structure, headings, markup and text that does not depend on scripts.',
  },
  {
    name: 'Digital Authority',
    body: 'Whether an AI can trust the page and trace its claims: named authors, dates, sources and the details that identify the business.',
  },
  {
    name: 'Conversion Readiness',
    body: 'Whether the next step for a visitor is clear: what to do, who to contact, and how to book or buy.',
  },
  {
    name: 'Easy to Quote',
    body: 'Whether an AI can pull a clear, specific fact from your page and mention your business for it.',
  },
];

const LANE_PILLARS = [
  { name: 'Product Discoverability', who: 'Online sellers', body: 'Whether AI can find, compare and recommend your products: price, availability, variants and product details.' },
  { name: 'Local Presence', who: 'Local businesses', body: 'Whether AI can confidently recommend your business for a nearby search: address, hours, reviews and licence details.' },
];

const MEASURES = [
  { name: 'Run an analysis', body: 'Score a piece of content, a web page or a repository. You get one Rain Score, the pillar breakdown and the fixes for each gap.' },
  { name: 'Is AI Citing Me?', body: 'See which AI tools cite your pages as a source, which pages they link to, and whether they mention your business.' },
  { name: 'Who AI Recommends', body: 'See how often each AI tool names your business, compared with your competitors.' },
  { name: 'How AI Describes Me', body: 'See the description each AI gives of your business, and whether it reads as positive, neutral or negative.' },
];

export default function AIReadabilityPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#f1f5f9' }}>
      <MarketingNav />

      <div style={{ padding: '140px 24px 60px', maxWidth: '760px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to home
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="mb-4 block text-xs font-bold uppercase tracking-wider text-white">AI visibility</span>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl">
            Make your business easy for AI to find and use
          </h1>
          <p className="mb-6 text-lg leading-relaxed text-neutral-400">
            When someone asks an AI a question, the answer names a few businesses and links to a few sources. AI visibility is how often that happens to you. rain OS shows where you stand and what to change.
          </p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-3xl space-y-16 px-6 pb-24">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-white">The goal is AI visibility</h2>
          <p className="leading-relaxed text-neutral-400">
            AI visibility is being easy for AI to find, understand and use when people ask about what you offer. You cannot set it directly, so rain OS measures what shows up in AI answers: mentions and citations. Neither one is guaranteed, but both show whether your visibility is growing.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-white">How it fits together</h2>
          <ol className="space-y-3 leading-relaxed text-neutral-400">
            <li><span className="font-medium text-white">1. Make your content easy to read and state clear facts.</span> The pillars score this on your pages.</li>
            <li><span className="font-medium text-white">2. Visibility grows.</span> AI can find, understand and use what you offer. This is the goal.</li>
            <li><span className="font-medium text-white">3. Mention.</span> AI names your business in an answer.</li>
            <li><span className="font-medium text-white">4. Citation.</span> AI links to one of your pages as a source. Usually it follows a mention.</li>
            <li><span className="font-medium text-white">5. Recommendation.</span> AI names you as the choice when someone asks what to buy or hire.</li>
          </ol>
          <p className="mt-4 leading-relaxed text-neutral-400">
            Clear facts sit at the start of this chain rather than in it. An AI can use a fact from your page without naming you, so we score how clear your facts are but do not count them as a result.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-white">From mention to citation</h2>
          <ul className="space-y-4 leading-relaxed text-neutral-400">
            <li><span className="font-medium text-white">Mentioned:</span> the AI names your business in its answer, without linking to one of your pages. A mention often comes first.</li>
            <li><span className="font-medium text-white">Cited:</span> the AI links to one of your pages as a source for what it says. Mentions and citations go together, so rain OS tracks both.</li>
            <li><span className="font-medium text-white">Recommended:</span> the AI names you as a good choice when someone asks what to buy, hire or use.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-white">Using a fact is not the same as mentioning a business</h2>
          <p className="leading-relaxed text-neutral-400">
            An AI can repeat a fact from your page without naming your business or linking to it. That is why we score how clear your facts are, under Easy to Quote, but we count only mentions and citations as results.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-white">What your pages need</h2>
          <p className="mb-6 leading-relaxed text-neutral-400">
            Every analysis scores four core pillars. Online sellers and local businesses also get one pillar for their kind of business. The pillars in your lane are weighted equally.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {PILLARS.map(p => (
              <div key={p.name} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
                <div className="font-medium text-white">{p.name}</div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <div className="text-[12px] text-neutral-500">FOR ONE LANE ONLY</div>
            {LANE_PILLARS.map(p => (
              <div key={p.name} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="font-medium text-white">{p.name}</div>
                  <div className="text-[12px] text-neutral-500">{p.who}</div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-white">How rain OS measures it</h2>
          <div className="space-y-3">
            {MEASURES.map(m => (
              <div key={m.name} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5">
                <div className="font-medium text-white">{m.name}</div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-white">What we can and cannot promise</h2>
          <p className="leading-relaxed text-neutral-400">
            Each AI tool decides what to cite, and we cannot see how it chooses. We cannot guarantee a mention. What we can do is show you how the pillars score on your pages, tell you what to fix, and check the answers the AI tools give over time, so you see whether anything has changed.
          </p>
        </section>

        <div>
          <button
            onClick={() => navigate('/login')}
            className="h-11 rounded-md bg-white px-6 text-[15px] font-medium text-black transition-colors hover:bg-neutral-200"
          >
            Check my site free
          </button>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
