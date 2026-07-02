import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus, Mail, MessageSquare, BookOpen, Plug } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import { useNavigate } from 'react-router-dom';

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
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-slate-400 leading-relaxed text-sm">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const faqGroups = [
  {
    label: 'Getting Started',
    items: [
      {
        q: 'How do I get my API key?',
        a: 'After signing up at getrainos.com, your API key is shown on the Settings page under "WordPress Plugin Connection." Copy it from there. The same key works in the web app, the WordPress plugin, and any direct API calls.',
      },
      {
        q: 'How do I connect the WordPress plugin to rain OS?',
        a: 'Install and activate the rain OS plugin in WordPress. Go to rain OS → Settings in your WP admin, paste your API key in the API Key field, and click Save. The plugin will verify the key and show your plan status. Once connected, you can analyze any post or page directly from the editor.',
      },
      {
        q: 'I signed up but my API key is not working — what should I do?',
        a: 'First, check that you are copying the full key without extra spaces. If the issue persists, try signing out and back in on the web app — your key is shown fresh on the Settings page. If you still cannot authenticate, email support@getrainos.com with your account email and we will look it up within one business day.',
      },
      {
        q: 'Can I try rain OS before paying?',
        a: 'Yes. The free plan includes a generous number of monthly analyses across Content Analyzer, URL Scanner, and Repo Analysis. No credit card required to get started. You can also use the live demo on the homepage (no sign-in required) to see how the scoring works before creating an account.',
      },
    ],
  },
  {
    label: 'Scores & Analysis',
    items: [
      {
        q: 'What does the Rain Score mean?',
        a: 'The Rain Score is a weighted 0–100 measure of how well your content is optimized for AI engines. The weights change based on your lane: Writers & Marketers (AI Readability 36%, Digital Authority 27%, Conversion Readiness 27%, RAG Readiness 10%), Product Sellers (Product Discoverability 50%, AI Readability 20%, Digital Authority 15%, Conversion Readiness 15%, RAG Readiness 10%), Developers and Vibe Coders (AI Readability 32%, Digital Authority 32%, Conversion Readiness 26%, RAG Readiness 10%), and Local Businesses (Digital Authority 36%, AI Readability 27%, Conversion Readiness 27%, RAG Readiness 10%). Each pillar has sub-scores so you know exactly what to improve.',
      },
      {
        q: 'Why is my score different between URL Scanner and Content Analyzer?',
        a: 'URL Scanner fetches and parses the live, rendered HTML of your page and checks technical signals like schema, open graph, llms.txt, and heading structure. Content Analyzer scores the raw text you paste for semantic clarity, readability, and answer-engine alignment. They are measuring different things. Use both for a complete picture.',
      },
      {
        q: 'My score seems low even though my content looks good — why?',
        a: 'A common reason is JavaScript-rendered content. If your site is built with React, Vue, or another SPA framework without server-side rendering, URL Scanner sees mostly empty HTML because the content is injected by JS at runtime. AI crawlers have the same problem. Try pasting your actual content into Content Analyzer for a text-level score, or connect your GitHub repo for a source-level analysis.',
      },
      {
        q: 'How often should I re-analyze after making changes?',
        a: 'Re-analyze after any significant content or structural update. Most users run a content analysis before and after revising a page, and a URL scan after deploying changes. The Score History tab tracks every run so you can see what improved and what did not.',
      },
    ],
  },
  {
    label: 'WordPress Plugin',
    items: [
      {
        q: 'The Gutenberg sidebar is not appearing — how do I fix it?',
        a: 'Make sure your API key is saved in rain OS → Settings. Then open a post or page in the block editor and look for the rain OS panel in the right sidebar (you may need to expand it). If it is missing, try disabling other plugins temporarily to check for conflicts, and ensure the plugin is up to date.',
      },
      {
        q: 'The plugin says "API key invalid" but I am sure it is correct.',
        a: 'Check for hidden whitespace — the key field can sometimes capture a trailing space when pasting. Also confirm you are using the key from your rain OS account Settings page, not a WordPress application password. If the issue continues, email support@getrainos.com.',
      },
      {
        q: 'Can I use the plugin with Classic Editor?',
        a: 'Yes. If the Gutenberg block editor is not active, rain OS adds a meta box to the Classic Editor below your post content. You will see the Rain Score panel with Analyze and URL Scan buttons in the post edit screen.',
      },
      {
        q: 'Does the plugin work with product pages?',
        a: 'Yes — it works on any public post type including product pages and custom post types. Product Discoverability scoring is especially useful for e-commerce: it checks whether AI shopping assistants can surface your products when users ask for recommendations in natural language.',
      },
    ],
  },
  {
    label: 'Billing & Plans',
    items: [
      {
        q: 'How do I upgrade my plan?',
        a: 'Go to Upgrade in the web app sidebar. Choose your plan and click the upgrade button — you will be taken to a Stripe checkout page. Once payment is confirmed your limits update immediately. You can also manage your subscription from Settings → Manage Subscription.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, at any time. Go to Settings → Manage Subscription to open the Stripe billing portal and cancel. Cancellation takes effect at the end of your current billing period. You keep access to paid features until then.',
      },
      {
        q: 'I was charged but my plan did not update.',
        a: 'This is rare but can happen if there is a delay between payment and our webhook. Wait a few minutes and refresh the app. If your plan still shows Free after 10 minutes, email support@getrainos.com with your account email and the last 4 digits of the card charged — we will fix it manually.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'We offer refunds within 7 days of the original charge if you have not used the Service during that period. Contact support@getrainos.com within the refund window with your account email and reason for the request.',
      },
    ],
  },
  {
    label: 'Privacy & Data',
    items: [
      {
        q: 'Is my content stored after analysis?',
        a: 'No. Your raw text, URL content, and repository file contents are processed to generate your scores and are not permanently retained on our servers after the request completes. We store your Rain Score history (scores and timestamps) but not the original content.',
      },
      {
        q: 'Is the GitHub integration secure?',
        a: 'Yes. We request read-only access to your repos, encrypt your GitHub token at rest using AES-256-CBC, and never store your source code after analysis completes. You can disconnect GitHub at any time from Settings, which permanently deletes your stored token.',
      },
    ],
  },
];

const contactCards = [
  {
    icon: Mail,
    title: 'Email Support',
    desc: 'For account issues, billing questions, and bug reports.',
    cta: 'support@getrainos.com',
    href: 'mailto:support@getrainos.com',
    color: '#06b6d4',
    response: 'Typically within 1 business day',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    desc: 'API reference, plugin setup guide, and integration docs.',
    cta: 'Browse the docs →',
    href: '/docs',
    color: '#a855f7',
    response: 'Self-serve, available 24/7',
  },
  {
    icon: Plug,
    title: 'WordPress Plugin',
    desc: 'Plugin-specific help, changelog, and installation guide.',
    cta: 'Plugin page →',
    href: '/wordpress-plugin',
    color: '#22c55e',
    response: 'Plugin v1.x documentation',
  },
];

export default function SupportPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen text-slate-50 font-sans relative" style={{ background: '#020410' }}>
      <div className="fixed inset-0 z-0" style={{ background: '#020410' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]"
        style={{ background: 'rgba(14,165,233,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none z-[2]"
        style={{ background: 'rgba(168,85,247,0.05)', filter: 'blur(150px)', mixBlendMode: 'screen' }} />
      <div className="fixed inset-0 pointer-events-none z-[4]"
        style={{ background: 'linear-gradient(to bottom, rgba(2,4,16,0.4), transparent, #020410)' }} />

      <MarketingNav onLoginClick={() => navigate('/login?mode=login')} onGetStartedClick={() => navigate('/login')} />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-24">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-3 block">Help Center</span>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>How can we help?</h1>
          <p className="text-slate-400 max-w-xl mx-auto">Find answers to common questions, or reach out directly. We respond to all support emails within one business day.</p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {contactCards.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="group p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all flex flex-col gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}>
                <c.icon className="w-5 h-5" style={{ color: c.color }} />
              </div>
              <div>
                <div className="font-semibold text-white text-sm mb-1">{c.title}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{c.desc}</div>
              </div>
              <div className="mt-auto">
                <div className="text-sm font-medium group-hover:underline" style={{ color: c.color }}>{c.cta}</div>
                <div className="text-xs text-slate-600 mt-1">{c.response}</div>
              </div>
            </a>
          ))}
        </div>

        {/* FAQ groups */}
        {faqGroups.map((group) => (
          <div key={group.label} className="mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-4">{group.label}</h2>
            <div>
              {group.items.map((item, i) => (
                <AccordionItem key={i} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Still stuck */}
        <div className="mt-16 p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
          <MessageSquare className="w-8 h-8 text-sky-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Still stuck?</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            If you can not find an answer here, send us an email and include your account email address and a description of the issue. Screenshots are helpful.
          </p>
          <a
            href="mailto:support@getrainos.com"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-300 text-sm font-semibold hover:bg-sky-500/15 hover:border-sky-400/50 transition-all"
          >
            <Mail className="w-4 h-4" />
            Email support@getrainos.com
          </a>
        </div>

      </main>

      <footer className="border-t border-white/10 py-10 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/support" className="text-sky-400">Support</a>
          </div>
          <div className="text-xs text-slate-600">© {new Date().getFullYear()} rain OS. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
