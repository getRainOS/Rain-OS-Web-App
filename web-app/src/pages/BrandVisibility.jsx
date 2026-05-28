import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import { ChevronDown, ChevronUp } from 'lucide-react';

const S = {
  page: { padding: '32px 40px', maxWidth: 900, margin: '0 auto' },
  header: { marginBottom: 32 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 600, color: '#f1f5f9', margin: 0 },
  sub: { color: '#64748b', fontSize: 14, margin: 0 },

  disclaimer: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 8, padding: '12px 16px', marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12, lineHeight: 1.7, color: '#64748b', margin: 0,
  },
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
    display: 'inline-flex', alignItems: 'center', gap: 8,
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  btnSecondary: {
    background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  },

  scoreRing: {
    width: 80, height: 80, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  scoreNum: { fontSize: 26, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  scoreLabel: { fontSize: 10, fontWeight: 600, color: '#64748b', marginTop: 2 },

  resultRow: { display: 'flex', alignItems: 'flex-start', gap: 24 },
  resultMeta: { flex: 1 },
  resultTitle: { fontSize: 18, fontWeight: 600, color: '#f1f5f9', marginBottom: 6 },
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

/* ── Trend sparkline ──────────────────────────────────────────── */
function Spark({ values, color = '#6366f1', width = 80, height = 28 }) {
  if (!values || values.length < 2) return <span style={{ color: '#475569' }}>—</span>;
  const pad = 2, w = width - pad * 2, h = height - pad * 2;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + h - (Math.min(Math.max(v, 0), 100) / 100) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function timeAgo(str) {
  if (!str) return '—';
  const diff = Date.now() - new Date(str).getTime();
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor(diff / 3600000);
  if (days === 0 && hrs < 1) return 'Just now';
  if (days === 0) return `${hrs}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Icons (simple SVG fallbacks) ───────────────────────────────────────────────── */
function SearchIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function ClockIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function TrashIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}
function TrendUpIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}
function TrendDownIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
    </svg>
  );
}
function MinusIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function AlertIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
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

/* ── Collapsible Disclaimer ─────────────────────────────────────────────── */
function DisclaimerBox() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ ...S.disclaimer, padding: collapsed ? '8px 16px' : '12px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <strong style={{ color: '#94a3b8', fontWeight: 600 }}>How this works — and its limits.</strong>
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#64748b', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <p style={{ ...S.disclaimerText, marginTop: 8 }}>We query Google Gemini with live Google Search grounding for your topic, then analyse the real AI-generated answer to see if and how your brand appears. The mention status and sources are drawn from live search data. However: this is a single-model, single-query snapshot — only Gemini, one phrasing, one moment in time. Sentiment scoring and recommendations come from a second AI analysis pass and are interpretive, not empirical. Ask the same question differently ("best project management software" vs "what tool should my team use for task tracking?") and you may get entirely different results. Use this for directional spot-checking and competitor discovery, not as comprehensive brand monitoring.</p>}
    </div>
  );
}

export default function BrandVisibility() {
  const { isDemo } = useApp();
  const [brand, setBrand] = useState('');
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [planGated, setPlanGated] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tab, setTab] = useState('check'); // 'check' | 'history'

  useEffect(() => {
    if (isDemo) return;
    setHistoryLoading(true);
    api.brandVisHistory()
      .then(({ data }) => setHistory(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [isDemo]);

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
        // Refresh history
        const h = await api.brandVisHistory();
        setHistory(Array.isArray(h.data.data) ? h.data.data : Array.isArray(h.data) ? h.data : []);
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

  async function clearHistory() {
    if (!window.confirm('Clear all Brand Sentiment history? This cannot be undone.')) return;
    try {
      await api.clearBrandVisHistory();
      setHistory([]);
    } catch (err) {
      setError(err.message || 'Failed to clear history.');
    }
  }

  // Group history by brand+topic for trend sparklines
  const trendGroups = useMemo(() => {
    const map = new Map();
    for (const h of history) {
      const b = (h.brand || '').toLowerCase().trim();
      const t = (h.topic || '').toLowerCase().trim();
      if (!b || !t) continue;
      const key = `${b}::${t}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(h);
    }
    const out = [];
    for (const [, arr] of map) {
      arr.sort((a, b) => new Date(a.checked_at || a.checkedAt) - new Date(b.checked_at || b.checkedAt));
      const latest = arr[arr.length - 1];
      const prev   = arr[arr.length - 2];
      const scoreLatest = latest.visibility_score ?? latest.visibilityScore ?? 0;
      const scorePrev   = prev ? (prev.visibility_score ?? prev.visibilityScore ?? 0) : null;
      const delta  = scorePrev !== null ? scoreLatest - scorePrev : null;
      out.push({
        brand: latest.brand,
        topic: latest.topic,
        latestScore: scoreLatest,
        latestSentiment: latest.sentiment || 'not_applicable',
        latestMention: latest.mention_status || latest.mentionStatus || 'not_mentioned',
        delta,
        spark: arr.map(h => h.visibility_score ?? h.visibilityScore ?? 0),
        checkedAt: latest.checked_at || latest.checkedAt,
        checks: arr.length,
      });
    }
    out.sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt));
    return out;
  }, [history]);

  const colors = result ? scoreColor(result.visibilityScore) : null;

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={S.header}>
        <div style={S.titleRow}>
          <h1 style={S.title}>Brand Sentiment</h1>
        </div>
        <p style={S.sub}>See how AI answers mention your brand — and what to do if they don't.</p>
      </div>

      <DisclaimerBox />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ key: 'check', label: 'New Check', Icon: SearchIcon }, { key: 'history', label: `Trend History${history.length ? ` (${trendGroups.length})` : ''}`, Icon: ClockIcon }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: tab === t.key ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.05)',
              color: tab === t.key ? '#c084fc' : '#64748b',
              boxShadow: tab === t.key ? '0 0 0 1px rgba(168,85,247,0.35)' : '0 0 0 1px rgba(255,255,255,0.06)',
            }}>
            <t.Icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Check tab ─────────────────────────────────────────────────────────────────── */}
      {tab === 'check' && (
        <>
      {planGated && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.08))',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: 14, padding: '24px 28px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#c084fc', marginBottom: 6 }}>Business plan required</div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              Brand Sentiment tracks how AI models mention your brand across live answers. It runs multiple Gemini calls per check and is available on the Business plan.
            </div>
          </div>
          <a href="/upgrade" style={{
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            color: '#fff', borderRadius: 8, padding: '10px 22px',
            fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Upgrade to Business →
          </a>
        </div>
      )}
      {error && <div style={S.errorBox}>{error}</div>}

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
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              type="submit"
              style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}
              disabled={loading}
            >
              {loading && <span style={S.spinner} />}
              {loading ? 'Checking AI answers…' : 'Check brand sentiment'}
            </button>
            {loading && <span style={{ fontSize: 12, color: '#64748b' }}>This takes ~20 seconds — we run multiple AI checks.</span>}
          </div>
        </form>
      </div>

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
        </>
      )}

      {/* ── History tab ─────────────────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <>
          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <span style={{ ...S.spinner, width: 24, height: 24, borderWidth: 3 }} />
            </div>
          ) : trendGroups.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '48px 24px' }}>
              <ClockIcon size={32} />
              <p style={{ color: '#64748b', marginBottom: 16 }}>No Brand Sentiment checks yet. Run your first check to start tracking trends.</p>
              <button onClick={() => setTab('check')} style={S.btn}><SearchIcon size={13} /> Run first check</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button onClick={clearHistory} style={{ ...S.btnSecondary, color: '#ef4444' }}>
                  <TrashIcon size={12} /> Clear history
                </button>
              </div>

              {trendGroups.map((g, i) => {
                const color = scoreColor(g.latestScore);
                const dUp   = g.delta !== null && g.delta > 0;
                const dDown = g.delta !== null && g.delta < 0;
                return (
                  <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', cursor: 'pointer' }}
                    onClick={() => { setBrand(g.brand); setTopic(g.topic); setTab('check'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    onMouseEnter={e => e.currentTarget.style.background = '#060a18'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 60 }}>
                      <div style={{ fontSize: 26, fontWeight: 600, color: color.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{g.latestScore}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>Score</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {g.brand} — {g.topic}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {g.latestMention.replace('_', ' ')} · {g.latestSentiment.replace('_', ' ')} · {g.checks} check{g.checks > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <Spark values={g.spark} color={color.text} width={80} height={28} />
                      <div style={{ fontSize: 10, color: '#475569' }}>{g.checks} check{g.checks > 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      {g.delta !== null && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                          color: dUp ? '#4ade80' : dDown ? '#f87171' : '#64748b',
                          background: dUp ? 'rgba(34,197,94,0.1)' : dDown ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)' }}>
                          {dUp ? <TrendUpIcon size={11} /> : dDown ? <TrendDownIcon size={11} /> : <MinusIcon size={11} />}
                          {dUp ? '+' : ''}{g.delta}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{timeAgo(g.checkedAt)}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}
