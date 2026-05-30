import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, BrainCircuit, ShieldCheck, MousePointerClick, SearchCheck, GitBranch, MapPin, Zap, Phone, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import styles from './KnowledgeBase.module.css';

const KB_DATA = {
  general: {
    pillars: [
      { key: 'ai_readability',    label: 'AI Readability',       weight: '36%', color: '#06b6d4', Icon: BrainCircuit,
        desc: 'How easily ChatGPT, Gemini, and Perplexity extract answers from your content. Focus on clear headings, answer-first formatting, and semantic structure.' },
      { key: 'digital_authority', label: 'Digital Authority',      weight: '27%', color: '#22c55e', Icon: ShieldCheck,
        desc: 'Trust signals that make AI engines choose your content over competitors. Schema markup, citations, entity recognition, and topical depth.' },
      { key: 'conversion',        label: 'Conversion Readiness',   weight: '27%', color: '#a855f7', Icon: MousePointerClick,
        desc: 'How effectively your content turns AI-referred readers into customers. Strong CTAs, social proof, and clear value propositions.' },
      { key: 'rag_readiness',     label: 'RAG Readiness',        weight: '10%', color: '#ec4899', Icon: Layers,
        desc: 'How well your content is optimized for Retrieval-Augmented Generation (RAG) systems — vector databases, embedding models, and chunk-based retrieval. Measures information density, semantic mapping, and structured Q&A.' },
    ],
    tools: [
      { label: 'Content Optimizer', desc: 'Paste any article, landing page, or blog post to get a full AI readability score with specific fix recommendations.' },
      { label: 'URL Scanner',       desc: 'Enter a live website URL to audit how well AI crawlers can read and understand your pages.' },
      { label: 'Citation Monitor',  desc: 'Track whether ChatGPT, Perplexity, and Gemini are mentioning your brand when people ask relevant questions.' },
      { label: 'Brand Sentiment',   desc: 'See how AI describes your brand — is the sentiment positive, negative, or neutral?' },
      { label: 'Share of Voice',    desc: 'Measure what percentage of AI answers include your brand versus your competitors.' },
      { label: 'Score History',     desc: 'Browse every past analysis to track improvement trends and identify what moves the needle.' },
    ],
    tips: [
      'Lead with the answer — put the key takeaway in the first sentence.',
      'Use H2/H3 headings as questions AI might be asked.',
      'Add schema markup for your key entities and citations.',
      'Re-scan after every major content revision to track progress.',
    ],
    aiSearchNote: 'Google Marketing Live 2026: AI Search now includes conversational ad placements that cite sources directly in answers. High Rain Scores improve both organic citations and paid AI ad eligibility.',
  },

  product_sellers: {
    pillars: [
      { key: 'discoverability', label: 'Product Discoverability', weight: '50%', color: '#f97316', Icon: SearchCheck,
        desc: 'How easily AI shopping engines find and recommend your products. Structured data, rich descriptions, and attribute completeness matter most.' },
      { key: 'ai_readability',  label: 'AI Readability',          weight: '20%', color: '#06b6d4', Icon: BrainCircuit,
        desc: 'How well AI can parse your product descriptions and extract key features, benefits, and comparisons.' },
      { key: 'authority',       label: 'Authority',              weight: '15%', color: '#22c55e', Icon: ShieldCheck,
        desc: 'Brand trust signals — reviews, certifications, and third-party mentions that make AI confident recommending you.' },
      { key: 'conversion',      label: 'Conversion',           weight: '15%', color: '#a855f7', Icon: MousePointerClick,
        desc: 'Purchase intent signals like clear pricing, availability, and compelling calls to action.' },
      { key: 'rag_readiness',   label: 'RAG Readiness',         weight: '10%', color: '#ec4899', Icon: Layers,
        desc: 'How well your product descriptions are optimized for AI retrieval and vector database search. Structured Q&A and semantic mapping help AI surface your products for relevant queries.' },
    ],
    tools: [
      { label: 'Content Optimizer', desc: 'Paste product descriptions to score them for AI shopping and discovery signals.' },
      { label: 'URL Scanner',       desc: 'Audit live product pages for schema markup, meta tags, and AI readability.' },
      { label: 'Citation Monitor',  desc: 'Track if AI engines recommend your products when shoppers ask for comparisons.' },
      { label: 'Brand Sentiment',   desc: 'Check how AI describes your brand in product-related conversations.' },
      { label: 'Share of Voice',    desc: 'Compare your product visibility against competitors in AI-generated answers.' },
      { label: 'Score History',     desc: 'Track every product analysis and see which changes improved discoverability.' },
    ],
    tips: [
      'Add Product schema with price, availability, and reviews.',
      'Write descriptions as answers to shopper questions.',
      'Include comparison tables AI can easily extract.',
      'Monitor competitor citations to spot gaps.',
    ],
    aiSearchNote: 'Google\u2019s AI Search ads (launched May 2026) surface product offers directly in AI-generated answers — making Product Discoverability scoring critical. Strong schema and AI-readable product pages increase both organic and paid placement odds.',
  },

  vibe_coders: {
    pillars: [
      { key: 'ai_readability',    label: 'AI Readability',       weight: '32%', color: '#06b6d4', Icon: BrainCircuit,
        desc: 'How well your vibe-coded landing pages and app copy translate into machine-extractable answers. Headings, structure, and semantic HTML matter.' },
      { key: 'digital_authority', label: 'Digital Authority',      weight: '32%', color: '#22c55e', Icon: ShieldCheck,
        desc: 'Trust signals that make AI engines treat your domain as a quotable source. Schema, entity clarity, and credibility markup.' },
      { key: 'conversion',        label: 'Conversion Readiness',   weight: '26%', color: '#a855f7', Icon: MousePointerClick,
        desc: 'How effectively your AI-built site turns visitors into users. CTAs, onboarding clarity, and feature explanations.' },
      { key: 'rag_readiness',     label: 'RAG Readiness',        weight: '10%', color: '#ec4899', Icon: Layers,
        desc: 'How well your project docs and README are optimized for AI retrieval and vector database search. Structured Q&A and semantic mapping matter.' },
    ],
    tools: [
      { label: 'Content Optimizer', desc: 'Paste your vibe-coded landing page copy to audit AI readability before launch.' },
      { label: 'URL Scanner',       desc: 'Check your live site — especially important if it relies on client-side JS rendering.' },
      { label: 'Repo Analysis',     desc: 'Connect your GitHub repo to score README, package.json, and docs for AI discoverability.' },
      { label: 'Citation Monitor',  desc: 'Track if AI tools mention your project when developers ask for solutions like yours.' },
      { label: 'Brand Sentiment',   desc: 'See how AI describes your vibe-coded product in developer conversations.' },
      { label: 'Share of Voice',    desc: 'Measure your visibility against competing tools in AI-generated developer answers.' },
      { label: 'Score History',     desc: 'Track every repo scan and URL check as you iterate on your project.' },
    ],
    tips: [
      'Add llms.txt and robots.txt so AI crawlers understand your project.',
      'Ensure your README has clear H2s for features, install, and usage.',
      'Server-render critical content — AI does not execute JS.',
      'Re-scan after every major feature ship to track AI discoverability.',
    ],
    aiSearchNote: 'Google Marketing Live 2026: AI Search is now agentic — AI can act on behalf of users (coding, shopping, booking). Well-structured docs with schema and clear entity definitions make your project discoverable to both AI agents and Google\u2019s AI Search ad system.',
  },

  developers: {
    pillars: [
      { key: 'doc_structure',    label: 'Doc Structure',       weight: '32%', color: '#0ea5e9', Icon: BrainCircuit,
        desc: 'README and documentation organization. Clear hierarchy, navigation, and heading structure so AI can index your docs properly.' },
      { key: 'tech_completeness', label: 'Tech Completeness',    weight: '32%', color: '#22c55e', Icon: GitBranch,
        desc: 'Coverage of API endpoints, error handling, code examples, and installation steps. Missing sections cost you visibility.' },
      { key: 'technical_clarity', label: 'Technical Clarity',  weight: '26%', color: '#f59e0b', Icon: ShieldCheck,
        desc: 'Plain-language explanations alongside technical depth. AI prefers docs that explain the "why" not just the "how".' },
      { key: 'rag_readiness',     label: 'RAG Readiness',      weight: '10%', color: '#ec4899', Icon: Layers,
        desc: 'How well your docs are optimized for AI retrieval and vector database search. Structured Q&A and semantic mapping matter.' },
    ],
    tools: [
      { label: 'Content Optimizer', desc: 'Paste documentation sections to score them for AI readability and structure.' },
      { label: 'URL Scanner',       desc: 'Audit your docs site for meta tags, structured data, and crawler accessibility.' },
      { label: 'Repo Analysis',     desc: 'Score your GitHub repo README, package.json, and source files for AI discoverability.' },
      { label: 'Citation Monitor',  desc: 'Track whether AI coding assistants cite your library when developers ask for solutions.' },
      { label: 'Score History',     desc: 'Track every docs revision and see which structural changes improved your score.' },
    ],
    tips: [
      'Structure README with Install, Usage, API, and Examples as H2s.',
      'Add code examples for every major feature.',
      'Document error cases — AI engines value completeness.',
      'Keep package.json description keyword-rich but natural.',
    ],
    aiSearchNote: 'Google\u2019s AI Search is now agentic \u2014 AI agents and coding assistants act on behalf of users. Well-structured API docs with schema, entity clarity, and machine-readable endpoints make your library discoverable in both organic AI answers and Google\u2019s AI Search ad placements.',
  },

  local_business: {
    pillars: [
      { key: 'local_authority',  label: 'Local Authority',   weight: '36%', color: '#f43f5e', Icon: MapPin,
        desc: 'NAP consistency, LocalBusiness schema, Google Business Profile signals, and local citation strength.' },
      { key: 'ai_presence',      label: 'AI Presence',        weight: '27%', color: '#06b6d4', Icon: BrainCircuit,
        desc: 'How often AI engines mention your business for local service queries. Structured data and local content matter.' },
      { key: 'trust_conversion', label: 'Trust & Conversion', weight: '27%', color: '#22c55e', Icon: ShieldCheck,
        desc: 'Reviews, testimonials, and contact intent signals that make AI confident recommending your services.' },
      { key: 'rag_readiness',    label: 'RAG Readiness',      weight: '10%', color: '#ec4899', Icon: Layers,
        desc: 'How well your local business content is optimized for AI retrieval. Structured Q&A, service descriptions, and semantic mapping help AI surface you for local queries.' },
    ],
    tools: [
      { label: 'Content Optimizer', desc: 'Paste your website content or GBP description to score it for local AI visibility.' },
      { label: 'URL Scanner',       desc: 'Audit your site for local schema, NAP consistency, and mobile usability.' },
      { label: 'Citation Monitor',  desc: 'Check if AI recommends your business when local customers ask for services you offer.' },
      { label: 'Brand Sentiment',   desc: 'See how AI describes your local business — are the facts and sentiment correct?' },
      { label: 'Score History',     desc: 'Track every local analysis and monitor your local AI visibility over time.' },
    ],
    tips: [
      'Ensure NAP (Name, Address, Phone) is identical across your site and GBP.',
      'Add LocalBusiness schema with service area and opening hours.',
      'Create location-specific content that answers common local queries.',
      'Make phone numbers clickable and prominently displayed.',
    ],
    aiSearchNote: 'Google Marketing Live 2026: AI Search now shows local business recommendations and "Direct Offers" directly in conversational results. Consistent NAP, LocalBusiness schema, and GBP signals are prerequisites for appearing in both organic AI answers and paid AI ad placements.',
  },
};

export default function KnowledgeBase() {
  const { userLane } = useApp();
  const [open, setOpen] = useState(false);
  const data = KB_DATA[userLane || 'general'];

  return (
    <div className={styles.wrap}>
      <button className={styles.toggle} onClick={() => setOpen(!open)}>
        <BookOpen style={{ width: 13, height: 13, opacity: 0.6 }} />
        <span>Knowledge Base</span>
        {open ? <ChevronUp style={{ width: 12, height: 12, opacity: 0.5 }} /> : <ChevronDown style={{ width: 12, height: 12, opacity: 0.5 }} />}
      </button>

      {open && (
        <div className={styles.panel}>
          {data.aiSearchNote && (
            <div className={styles.aiSearchBanner}>
              <span className={styles.aiSearchLabel}>Google AI Search</span>
              <p className={styles.aiSearchText}>{data.aiSearchNote}</p>
            </div>
          )}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Pillars</h4>
            {data.pillars.map(p => (
              <div key={p.key} className={styles.pillarRow}>
                <div className={styles.pillarHeader}>
                  <p.Icon style={{ width: 12, height: 12, color: p.color }} />
                  <span className={styles.pillarLabel}>{p.label}</span>
                  <span className={styles.pillarWeight} style={{ color: p.color }}>{p.weight}</span>
                </div>
                <p className={styles.pillarDesc}>{p.desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Tools</h4>
            {data.tools.map((t, i) => (
              <div key={i} className={styles.toolRow}>
                <span className={styles.toolLabel}>{t.label}</span>
                <p className={styles.toolDesc}>{t.desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>How to Improve</h4>
            <ul className={styles.tipList}>
              {data.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
