import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/client.js';

const S = {
  page: { padding: '32px 40px', maxWidth: 900, margin: '0 auto' },
  header: { marginBottom: 32 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  badge: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    background: 'rgba(168,85,247,0.15)', color: '#c084fc',
    border: '1px solid rgba(168,85,247,0.3)',
    borderRadius: 6, padding: '2px 8px',
  },
  sub: { color: '#64748b', fontSize: 14, margin: 0 },

  card: {
    background: '#040714', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: 24, marginBottom: 20,
  },

  label: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    padding: '10px 14px', color: '#f1f5f9', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 },

  btn: {
    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '11px 28px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', transition: 'opacity 0.15s',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },

  scoreRing: {
    width: 80, height: 80, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  scoreNum: { fontSize: 26, fontWeight: 800, lineHeight: 1 },
  scoreLabel: { fontSize: 10, fontWeight: 600, color: '#64748b', marginTop: 2 },

  resultRow: { display: 'flex', alignItems: 'flex-start', gap: 24 },
  resultMeta: { flex: 1 },
  resultTitle: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 },
  resultSub: { fontSize: 14, color: '#94a3b8', lineHeight: 1.6 },

  pill: { display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 },

  sourceItem: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 8,
  },
  favicon: { width: 16, height: 16, borderRadius: 2, marginTop: 2, flexShrink: 0, background: 'rgba(255,255,255,0.1)' },
  sourceDomain: { fontSize: 13, fontWeight: 600, color: '#e2e8f0' },
  sourceSnippet: { fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.5 },

  rec: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '10px 14px', background: 'rgba(14,165,233,0.05)',
    border: '1px solid rgba(14,165,233,0.15)', borderRadius: 10, marginBottom: 8,
  },
  recDot: { width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', marginTop: 6, flexShrink: 0 },
  recText: { fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 },

  competitorGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  competitorChip: {
    fontSize: 12, fontWeight: 500, color: '#94a3b8',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20, padding: '4px 12px',
  },

  excerpt: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10, padding: '14px 16px',
    fontSize: 13, color: '#94a3b8', lineHeight: 1.7,
    fontStyle: 'italic',
  },

  errorBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10, padding: '12px 16px',
    fontSize: 13, color: '#f87171', marginBottom: 20,
  },
  spinner: {
    width: 20, height: 20, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.15)',
    borderTop: '2px solid #0ea5e9',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block', marginRight: 8, verticalAlign: 'middle',
  },
};

function scoreColor(score) {
  if (score >= 70) return { text: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' };
  if (score >= 40) return { text: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' };
  return { text: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' };
}

function MentionBadge({ status }) {
  if (status === 'mentioned') return (
    <span style={{ ...S.pill, background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
      Mentioned by AI
    </span>
  );
  if (status === 'ambiguous') return (
    <span style={{ ...S.pill, background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} />
      Ambiguous mention
    </span>
  );
  return (
    <span style={{ ...S.pill, background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', display: 'inline-block' }} />
      Not mentioned
    </span>
  );
}

function SentimentBadge({ sentiment }) {
  const map = {
    positive: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80', border: 'rgba(74,222,128,0.25)', label: 'Positive' },
    neutral: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.25)', label: 'Neutral' },
    negative: { bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.25)', label: 'Negative' },
    not_applicable: { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'rgba(100,116,139,0.2)', label: 'N/A' },
  };
  const cfg = map[sentiment] || map.not_applicable;
  return (
    <span style={{ ...S.pill, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.label} sentiment
    </span>
  );
}

const DEMO_RESULT = {
  brand: 'rain OS',
  topic: 'AI readability optimization tools',
  url: 'https://getrainos.com',
  visibilityScore: 34,
  mentionStatus: 'not_mentioned',
  mentionPosition: null,
  sentiment: 'not_applicable',
  sentimentExplanation: 'rain OS was not found in AI answers for this topic — an opportunity to build content that gets cited.',
  answerExcerpt: 'AI readability optimization involves structuring content so that large language models can parse, understand, and cite it accurately. Tools in this space include Clearscope for content grading, Surfer SEO for on-page optimization, and Frase for answer-engine targeting. Structured data, FAQ schema, and clear heading hierarchies are all important signals...',
  sources: [
    { title: 'Clearscope Blog', url: 'https://clearscope.io', domain: 'clearscope.io', snippet: 'How to optimize content for AI readability and search engines.' },
    { title: 'Surfer SEO Guide', url: 'https://surferseo.com', domain: 'surferseo.com', snippet: 'On-page optimization for AI-first search.' },
  ],
  competitors: ['clearscope.io', 'surferseo.com', 'frase.io', 'marketmuse.com'],
  recommendations: [
    'Publish a definitive guide titled "What is AI Readability?" — this is the top question AI answers for your topic.',
    'Add FAQ schema to your homepage and key landing pages so AI engines can extract your brand as an authoritative source.',
    'Build comparison content: "rain OS vs Clearscope" and "rain OS vs Surfer SEO" — these pages signal competitive relevance to AI.',
    'Get cited on authoritative marketing and SEO blogs; backlinks from sources AI already trusts will lift your visibility score.',
  ],
  summary: 'rain OS is not currently visible when AI answers questions about AI readability optimization. Competitors like Clearscope and Surfer SEO dominate this topic — targeted content and schema markup can change that.',
};

export default function BrandVisibility() {
  const { isDemo } = useApp();
  const [brand, setBrand] = useState('');
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [planGated, setPlanGated] = useState(false);

  async function handleCheck(e) {
    e.preventDefault();
    if (!brand.trim() || !topic.trim()) return;
    setLoading(true);
    setError('');
    setPlanGated(false);
    setResult(null);
    try {
      if (isDemo) {
        await new Promise(r => setTimeout(r, 1200));
        setResult({ ...DEMO_RESULT, brand: brand || DEMO_RESULT.brand, topic: topic || DEMO_RESULT.topic });
      } else {
        const { data } = await api.brandVisibility({ brand: brand.trim(), topic: topic.trim(), url: url.trim() || undefined });
        setResult(data.data || data);
      }
    } catch (err) {
      if (err.status === 403) {
        setPlanGated(true);
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const colors = result ? scoreColor(result.visibilityScore) : null;

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={S.header}>
        <div style={S.titleRow}>
          <h1 style={S.title}>AI Brand Visibility</h1>
          <span style={S.badge}>NEW</span>
        </div>
        <p style={S.sub}>See how AI answers mention your brand — and what to do if they don't.</p>
      </div>

      <div style={S.card}>
        <form onSubmit={handleCheck}>
          <div style={S.grid2}>
            <div>
              <label style={S.label}>Brand or product name</label>
              <input
                style={S.input}
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. rain OS, Acme Widgets"
                required
                maxLength={200}
              />
            </div>
            <div>
              <label style={S.label}>Topic or keyword</label>
              <input
                style={S.input}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. AI content optimization tools"
                required
                maxLength={300}
              />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Your website URL <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input
              style={S.input}
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://yourdomain.com"
              type="url"
            />
          </div>
          <button
            type="submit"
            style={{ ...S.btn, ...(loading || !brand.trim() || !topic.trim() ? S.btnDisabled : {}) }}
            disabled={loading || !brand.trim() || !topic.trim()}
          >
            {loading
              ? <><span style={S.spinner} />Checking visibility…</>
              : 'Check AI Visibility'}
          </button>
        </form>
      </div>

      {planGated && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.08))',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: 14, padding: '24px 28px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#c084fc', marginBottom: 6 }}>Business plan required</div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              AI Visibility tracks how AI models mention your brand across live answers. It runs multiple Gemini calls per check and is available on the Business plan.
            </div>
          </div>
          <a href="#/upgrade" style={{
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            color: '#fff', borderRadius: 8, padding: '10px 22px',
            fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 0 20px rgba(168,85,247,0.25)',
          }}>
            Upgrade to Business →
          </a>
        </div>
      )}
      {error && <div style={S.errorBox}>{error}</div>}

      {result && (
        <div>
          <div style={S.card}>
            <div style={S.resultRow}>
              <div style={{
                ...S.scoreRing,
                background: colors.bg,
                border: `2px solid ${colors.border}`,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ ...S.scoreNum, color: colors.text }}>{result.visibilityScore}</div>
                  <div style={S.scoreLabel}>SCORE</div>
                </div>
              </div>
              <div style={S.resultMeta}>
                <div style={S.resultTitle}>
                  {result.brand}
                  {result.mentionPosition ? ` — mentioned #${result.mentionPosition}` : ''}
                </div>
                <p style={S.resultSub}>{result.summary}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  <MentionBadge status={result.mentionStatus} />
                  <SentimentBadge sentiment={result.sentiment} />
                </div>
              </div>
            </div>
            {result.sentimentExplanation && (
              <p style={{ ...S.resultSub, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {result.sentimentExplanation}
              </p>
            )}
          </div>

          {result.answerExcerpt && (
            <div style={S.card}>
              <div style={S.sectionTitle}>What AI answered for "{result.topic}"</div>
              <div style={S.excerpt}>"{result.answerExcerpt}"</div>
            </div>
          )}

          {result.competitors && result.competitors.length > 0 && (
            <div style={S.card}>
              <div style={S.sectionTitle}>Brands AI mentioned instead</div>
              <div style={S.competitorGrid}>
                {result.competitors.map((c, i) => (
                  <span key={i} style={S.competitorChip}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {result.sources && result.sources.length > 0 && (
            <div style={S.card}>
              <div style={S.sectionTitle}>Sources AI cited ({result.sources.length})</div>
              {result.sources.map((s, i) => (
                <div key={i} style={S.sourceItem}>
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=16`}
                    alt=""
                    style={S.favicon}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <div style={S.sourceDomain}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#e2e8f0', textDecoration: 'none' }}>{s.title || s.domain}</a>
                    </div>
                    {s.snippet && <div style={S.sourceSnippet}>{s.snippet}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div style={S.card}>
              <div style={S.sectionTitle}>How to improve AI visibility</div>
              {result.recommendations.map((r, i) => (
                <div key={i} style={S.rec}>
                  <div style={S.recDot} />
                  <div style={S.recText}>{r}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
