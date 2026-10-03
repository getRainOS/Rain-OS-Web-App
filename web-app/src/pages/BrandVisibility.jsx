import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './BrandVisibility.module.css';

const S = {
  page: { padding: '32px 40px', maxWidth: 900, margin: '0 auto' },
  header: { marginBottom: 32 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: 0 },
  sub: { color: 'var(--text-muted)', fontSize: 14, margin: 0 },
  tagline: { color: 'var(--text)', fontSize: 14, fontWeight: 600, margin: '0 0 6px' },

  disclaimer: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border)',
    borderRadius: 8, padding: '12px 16px', marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12, lineHeight: 1.7, color: 'var(--text-dim)', margin: 0,
  },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, padding: 24, marginBottom: 20,
  },

  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' },
  input: {
    width: '100%', background: 'var(--surface-2)',
    border: '1px solid var(--border)', borderRadius: 10,
    padding: '10px 14px', color: 'var(--text)', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  hint: { fontSize: 11, color: 'var(--text-dim)', marginTop: 6 },
  notMentionedHint: { fontSize: 12.5, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 },
  urlScannerCta: {
    display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
    color: 'var(--accent)', fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
  },

  btn: {
    background: 'var(--accent)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '11px 28px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', transition: 'background 0.15s',
    display: 'inline-flex', alignItems: 'center', gap: 8,
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  btnSecondary: {
    background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
    border: '1px solid var(--border)', borderRadius: 10,
    padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  },

  resultMeta: { flex: 1 },
  resultTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 6 },
  resultSub: { fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 },

  statusText: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 },
  statusDot: { width: 6, height: 6, borderRadius: '50%', display: 'inline-block', flexShrink: 0 },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 },

  sourceItem: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8,
  },
  favicon: { width: 16, height: 16, borderRadius: 2, marginTop: 2, flexShrink: 0, background: 'rgba(255,255,255,0.1)' },
  sourceDomain: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  sourceSnippet: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 },

  competitorGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  competitorChip: {
    fontSize: 12, fontWeight: 500, color: 'var(--text-muted)',
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
    borderRadius: 20, padding: '4px 12px',
  },

  excerpt: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '14px 16px',
    fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7,
    fontStyle: 'italic',
  },

  errorBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10, padding: '12px 16px',
    fontSize: 13, color: 'var(--red)', marginBottom: 20,
  },
  spinner: {
    width: 20, height: 20, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.15)',
    borderTop: '2px solid var(--accent)',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block', marginRight: 8, verticalAlign: 'middle',
  },

  tabs: { display: 'flex', gap: 20, marginBottom: 24, borderBottom: '1px solid var(--border)' },
  tab: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 2px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: 'none', borderBottom: '2px solid transparent',
    background: 'transparent', color: 'var(--text-dim)',
  },
  tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  tabCount: {
    fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
    background: 'rgba(91,95,199,0.15)', color: 'var(--accent)',
    fontVariantNumeric: 'tabular-nums',
  },

  trendRow: {
    display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', cursor: 'pointer',
  },
  trendMeta: { fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' },
  trendTime: { flexShrink: 0, fontSize: 11, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' },
};

function MentionBadge({ status }) {
  const map = {
    mentioned: { color: 'var(--green)', label: 'Mentioned by AI' },
    ambiguous: { color: 'var(--yellow)', label: 'Ambiguous mention' },
    not_mentioned: { color: 'var(--red)', label: 'Not mentioned' },
  };
  const cfg = map[status] || map.not_mentioned;
  return (
    <span style={{ ...S.statusText, color: cfg.color }}>
      <span style={{ ...S.statusDot, background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function SentimentBadge({ sentiment }) {
  const map = {
    positive: { color: 'var(--green)', label: 'Positive sentiment' },
    neutral: { color: 'var(--text-muted)', label: 'Neutral sentiment' },
    negative: { color: 'var(--red)', label: 'Negative sentiment' },
    not_applicable: { color: 'var(--text-dim)', label: 'N/A sentiment' },
  };
  const cfg = map[sentiment] || map.not_applicable;
  return <span style={{ ...S.statusText, color: cfg.color }}>{cfg.label}</span>;
}

function CitedBadge() {
  return (
    <span style={{ ...S.statusText, color: 'var(--accent)' }}>
      <span style={{ ...S.statusDot, background: 'var(--accent)' }} />
      Your site was cited as a source
    </span>
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
function AlertIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

/* ── Collapsible Disclaimer ─────────────────────────────────────────────── */
function DisclaimerBox() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div style={{ ...S.disclaimer, padding: collapsed ? '8px 16px' : '12px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <strong style={{ color: 'var(--text-muted)', fontWeight: 600 }}>How this works — and its limits.</strong>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand disclaimer' : 'Collapse disclaimer'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <p style={{ ...S.disclaimerText, marginTop: 8 }}>We query Google Gemini with live Google Search grounding for your topic, then check the real AI-generated answer for your brand name and, if you gave a URL, your domain among the cited sources. The mention status, citation, and sources are all drawn directly from that live data — nothing is scored or guessed. When your brand is mentioned, we ask Gemini a second, much smaller question — classifying tone only from the exact sentences that mention it — and label that "AI's read." However: this is a single-model, single-query snapshot — only Gemini, one phrasing, one moment in time. Ask the same question differently ("best project management software" vs "what tool should my team use for task tracking?") and you may get entirely different results. Use this for directional spot-checking and competitor discovery, not as comprehensive brand monitoring.</p>}
    </div>
  );
}

/* ── Collapsible "What does this mean?" ──────────────────────────────────── */
function WhatDoesThisMeanBox() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div style={{ ...S.disclaimer, padding: collapsed ? '8px 16px' : '12px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <strong style={{ color: 'var(--text-muted)', fontWeight: 600 }}>What does this mean?</strong>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand explanation' : 'Collapse explanation'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <p style={{ ...S.disclaimerText, marginTop: 8 }}>Whether you're mentioned comes from a direct check of Gemini's answer, not a guess. The sentiment label (positive, neutral, negative) is AI's judgment of the specific sentences that mention you; showing you those sentences lets you judge the tone yourself too.</p>}
    </div>
  );
}

export default function BrandVisibility() {
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
    setHistoryLoading(true);
    api.brandVisHistory()
      .then(({ data }) => setHistory(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  async function handleCheck(e) {
    e.preventDefault();
    if (!brand.trim() || !topic.trim()) return;
    setLoading(true);
    setError('');
    setPlanGated(false);
    setResult(null);
    try {
      const { data } = await api.brandVisibility({ brand: brand.trim(), topic: topic.trim(), url: url.trim() || undefined });
      setResult(data.data || data);
      // Refresh history
      const h = await api.brandVisHistory();
      setHistory(Array.isArray(h.data.data) ? h.data.data : Array.isArray(h.data) ? h.data : []);
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

  // Group history by brand+topic. Old rows still render: mention status
  // comes from the stored mention_status field, and there is no score to
  // display or chart for any row, old or new.
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
      out.push({
        brand: latest.brand,
        topic: latest.topic,
        latestSentiment: latest.sentiment || 'not_applicable',
        latestMention: latest.mention_status || latest.mentionStatus || 'not_mentioned',
        checkedAt: latest.checked_at || latest.checkedAt,
        checks: arr.length,
      });
    }
    out.sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt));
    return out;
  }, [history]);

  return (
    <div style={S.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .bsTrendRow:hover { background: var(--surface-2); }
      `}</style>

      <div style={S.header}>
        <div style={S.titleRow}>
          <h1 style={S.title}>Brand Sentiment</h1>
        </div>
        <p style={S.tagline}>A real mention check, plus AI's read on tone.</p>
        <p style={S.sub}>See how Gemini describes your brand, using live Google Search grounding — and what to do if it does not mention you.</p>
      </div>

      <WhatDoesThisMeanBox />
      <DisclaimerBox />

      {/* Tabs */}
      <div style={S.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'check'}
          onClick={() => setTab('check')}
          style={{ ...S.tab, ...(tab === 'check' ? S.tabActive : {}) }}
        >
          <SearchIcon size={13} />
          New Check
        </button>
        <button
          role="tab"
          aria-selected={tab === 'history'}
          onClick={() => setTab('history')}
          style={{ ...S.tab, ...(tab === 'history' ? S.tabActive : {}) }}
        >
          <ClockIcon size={13} />
          Trend History
          {history.length > 0 && <span style={S.tabCount}>{trendGroups.length}</span>}
        </button>
      </div>

      {/* ── Check tab ─────────────────────────────────────────────────────────────────── */}
      {tab === 'check' && (
        <>
      {planGated && (
        <div style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 14, padding: '24px 28px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>Business plan required</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Brand Sentiment tracks how Gemini describes your brand across live, Google Search-grounded answers. It runs multiple Gemini calls per check and is available on the Business plan.
            </div>
          </div>
          <a href="/upgrade" style={{
            background: 'var(--accent)',
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
          <div className={styles.formGrid2}>
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
              <div style={S.hint}>Use your name as people write it publicly.</div>
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
            <label style={S.label}>Your website URL <span style={{ color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
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
            {loading && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>This takes ~20 seconds — we run multiple AI checks.</span>}
          </div>
        </form>
      </div>

      {result && (
        <div>
          <div style={S.card}>
            <div style={S.resultMeta}>
              <div style={S.resultTitle}>{result.brand}</div>
              <p style={S.resultSub}>{result.summary}</p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10 }}>
                <MentionBadge status={result.mentionStatus} />
                {result.mentionStatus === 'mentioned' && <SentimentBadge sentiment={result.sentiment} />}
                {result.cited && <CitedBadge />}
              </div>
              {result.notMentionedHint && (
                <p style={S.notMentionedHint}>{result.notMentionedHint}</p>
              )}
              {result.url && result.mentionStatus === 'not_mentioned' && (
                <Link to={`/url-scanner?url=${encodeURIComponent(result.url)}`} style={S.urlScannerCta}>
                  Check what your page needs in URL Scanner →
                </Link>
              )}
            </div>
            {result.sentimentExplanation && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={S.sectionTitle}>AI's read</div>
                <p style={S.resultSub}>{result.sentimentExplanation}</p>
              </div>
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
              <div style={S.sectionTitle}>Sites Gemini cited</div>
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
                      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'none' }}>{s.title || s.domain}</a>
                      {i === result.citedSourceIndex && (
                        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>Your site</span>
                      )}
                    </div>
                    {s.snippet && <div style={S.sourceSnippet}>{s.snippet}</div>}
                  </div>
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
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <span style={{ ...S.spinner, width: 24, height: 24, borderWidth: 3 }} />
            </div>
          ) : trendGroups.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '48px 24px' }}>
              <ClockIcon size={32} />
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No Brand Sentiment checks yet. Run your first check to start tracking trends.</p>
              <button onClick={() => setTab('check')} style={S.btn}><SearchIcon size={13} /> Run first check</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button onClick={clearHistory} style={{ ...S.btnSecondary, color: 'var(--red)' }}>
                  <TrashIcon size={12} /> Clear history
                </button>
              </div>

              {trendGroups.map((g, i) => (
                <div
                  key={i}
                  className={`card bsTrendRow`}
                  style={S.trendRow}
                  onClick={() => { setBrand(g.brand); setTopic(g.topic); setTab('check'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <MentionBadge status={g.latestMention} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {g.brand} — {g.topic}
                    </div>
                    <div style={S.trendMeta}>
                      {g.latestSentiment.replace('_', ' ')} sentiment · {g.checks} check{g.checks > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={S.trendTime}>{timeAgo(g.checkedAt)}</div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
