import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import {
  BarChart2, Search, CheckCircle2, AlertCircle,
  Clock, Trash2, Info, ChevronDown, ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { buildCitationShare } from '../lib/citationShare.js';
import styles from './ShareOfVoice.module.css';

/* ── Shared inline styles ─────────────────────────────────────────────────── */
const S = {
  page:  { padding: '32px 40px', maxWidth: 960, margin: '0 auto' },
  header: { marginBottom: 32 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 },
  sub: { color: 'var(--text-muted)', fontSize: 14, margin: 0, lineHeight: 1.6 },
  tagline: { color: 'var(--text)', fontSize: 14, fontWeight: 600, margin: '0 0 6px' },

  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, padding: 24, marginBottom: 20,
  },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' },
  input: {
    width: '100%', background: 'var(--surface-2)',
    border: '1px solid var(--border)', borderRadius: 10,
    padding: '10px 14px', color: 'var(--text)', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  },
  hint: { fontSize: 11, color: 'var(--text-dim)', marginTop: 6 },
  urlScannerCta: {
    display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
    color: 'var(--accent)', fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
  },
  btn: {
    background: 'var(--accent)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '11px 28px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', transition: 'background 0.15s',
    display: 'inline-flex', alignItems: 'center', gap: 8,
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)',
    border: '1px solid var(--border)', borderRadius: 10,
    padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, marginTop: 0 },
  errorBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--red)', marginBottom: 20,
  },
  infoBox: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)',
    display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, lineHeight: 1.7,
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
  statusText: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 },
  modelCard: {
    background: 'var(--surface-2)', border: '1px solid var(--border)',
    borderRadius: 14, padding: 20,
  },
  shareLegendRowWrap: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 20px' },
  shareLegendInline: { display: 'inline-flex', alignItems: 'center', gap: 6 },
  shareLegendDot: { width: 9, height: 9, borderRadius: '50%', flexShrink: 0 },
  shareLegendLabel: { fontSize: 12.5, color: 'var(--text)', whiteSpace: 'nowrap' },
  shareLegendPct: { fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 },
};

/* ── Per-prompt card ──────────────────────────────────────────────────────── */
const MODEL_META = {
  gemini:          { label: 'Informational question' },
  chatgpt_style:   { label: 'Conversational request' },
  perplexity_style:{ label: 'Research comparison' },
};

function ModelCard({ m }) {
  const meta  = MODEL_META[m.modelKey] || MODEL_META.gemini;
  const mentioned = m.mentioned ?? m.cited ?? false;
  return (
    <div style={S.modelCard}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{meta.label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.promptStyle}</div>
      </div>

      {/* Mentioned status */}
      <div style={{ marginBottom: 12 }}>
        {mentioned ? (
          <span style={{ ...S.statusText, color: 'var(--green)' }}>
            <CheckCircle2 size={11} /> Mentioned
          </span>
        ) : (
          <span style={{ ...S.statusText, color: 'var(--red)' }}>
            <AlertCircle size={11} /> Not mentioned
          </span>
        )}
      </div>

      {/* Answer excerpt */}
      {m.answerExcerpt && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 12px', borderLeft: '2px solid var(--border)', paddingLeft: 10 }}>
          "{m.answerExcerpt}"
        </p>
      )}

      {/* Sources */}
      {m.sources?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Cited sources</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {m.sources.slice(0, 4).map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', textDecoration: 'none' }}>
                <img src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=16`} alt="" style={{ width: 12, height: 12, borderRadius: 2 }} onError={e => e.currentTarget.style.display='none'} />
                {s.title || s.domain}
                <ExternalLink size={9} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MentionCountBadge({ count }) {
  const allGood = count === 3;
  const none    = count === 0;
  const color = allGood ? 'var(--green)' : none ? 'var(--red)' : 'var(--yellow)';
  return (
    <span style={{ ...S.statusText, color, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
      {count} of 3
    </span>
  );
}

function ShareTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{d.name}</div>
      <div style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{d.pct}% of citations</div>
    </div>
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

/* ── Collapsible Info Box ───────────────────────────────────────────────── */
function InfoBox() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div style={{ ...S.infoBox, display: 'block', padding: collapsed ? '8px 16px' : '12px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <strong>How this works — and its limits.</strong>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand disclaimer' : 'Collapse disclaimer'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <span style={{ display: 'block', marginTop: 8, fontSize: 12, lineHeight: 1.7, color: 'var(--text-muted)' }}>We ask Google Gemini about your topic three different ways — an <em>informational</em> question, a <em>conversational</em> request, and a <em>research</em>-style comparison — each grounded in live Google Search. For each, we check whether your brand's name appears in the answer. If you gave a URL, we also check what share of all the sources cited across the three prompts is your own domain. Every number here — the mention count, the domain share, and the competitor list — comes directly from that live data; nothing is scored or guessed. However: this covers Gemini only, three phrasings, one moment in time. Run checks on multiple topic variations and track over time — use for trend spotting and competitor discovery, not as ground-truth market share data.</span>}
    </div>
  );
}

/* ── Collapsible "What does this mean?" ──────────────────────────────────── */
function WhatDoesThisMeanBox() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div style={{ ...S.infoBox, display: 'block', padding: collapsed ? '8px 16px' : '12px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <strong>What does this mean?</strong>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand explanation' : 'Collapse explanation'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <span style={{ display: 'block', marginTop: 8, fontSize: 12, lineHeight: 1.7, color: 'var(--text-muted)' }}>We send your topic as three differently-worded prompts and check each real answer for your brand and your domain. "Mentioned in 2 of 3" and your citation share are exact counts from those three checks, not a market-wide statistic. Run it again later to see whether your presence is growing.</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function ShareOfVoice() {
  const [name,  setName]    = useState('');
  const [brand, setBrand]   = useState('');
  const [topic, setTopic]   = useState('');
  const [url,   setUrl]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [planGated, setPlanGated] = useState(false);
  const [result,  setResult]  = useState(null);

  const [history, setHistory]         = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [tab, setTab]                 = useState('check'); // 'check' | 'history'

  useEffect(() => {
    api.sovHistory()
      .then(({ data }) => setHistory(Array.isArray(data) ? data : data?.data ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistLoading(false));
  }, []);

  async function handleCheck(e) {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setPlanGated(false);
    try {
      const { data } = await api.shareOfVoice({ name: name.trim(), brand: brand.trim(), topic: topic.trim(), url: url.trim() || undefined });
      setResult(data?.data ?? data);
      // prepend to history without refetch
      setHistory(prev => [{ ...(data?.data ?? data), checkedAt: new Date().toISOString(), id: Date.now() }, ...prev]);
    } catch (err) {
      if (err.status === 403) {
        setPlanGated(true);
      } else {
        setError(err.message || 'Share of voice check failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    if (!window.confirm('Delete all saved Share of Voice history? This cannot be undone.')) return;
    try {
      await api.clearSovHistory();
      setHistory([]);
    } catch (err) {
      setError(err.message || 'Failed to clear history.');
    }
  }

  function handleReset() { setResult(null); setError(''); }

  const citationShare = useMemo(() => buildCitationShare(result), [result]);

  // Group history by brand/topic. Old rows still render: the mention count
  // comes from the stored cited_count (repurposed to mean "mentioned in X
  // of 3 prompts"), and there is no score to display or chart for any row.
  const trendGroups = useMemo(() => {
    const map = new Map();
    for (const h of history) {
      const b = (h.brand || '').toLowerCase();
      const t = (h.topic || '').toLowerCase();
      if (!b || !t) continue;
      const key = `${b}:::${t}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(h);
    }
    const out = [];
    for (const [, arr] of map) {
      arr.sort((a, b) => new Date(a.checkedAt || a.checked_at) - new Date(b.checkedAt || b.checked_at));
      const latest = arr[arr.length - 1];
      const mentionedCount = latest.mentionedCount ?? latest.citedCount ?? latest.cited_count ?? 0;
      out.push({
        brand: latest.brand,
        topic: latest.topic,
        mentionedCount,
        checkedAt: latest.checkedAt || latest.checked_at,
        checks: arr.length,
      });
    }
    out.sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt));
    return out;
  }, [history]);

  return (
    <div className="fade-in" style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <div style={S.titleRow}>
          <BarChart2 size={22} style={{ color: 'var(--accent)' }} />
          <h1 style={S.title}>Share of Voice</h1>
        </div>
        <p style={S.tagline}>Real counts across 3 real prompts — not an estimate.</p>
        <p style={S.sub}>
          See whether Gemini cites your brand for any topic — checked three ways, powered by real Google Search grounding.
          Track your visibility over time and see which competitors show up in the answers instead.
        </p>
      </div>

      {/* What does this mean? */}
      <WhatDoesThisMeanBox />
      {/* Info box */}
      <InfoBox />

      {/* Tabs */}
      <div style={S.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'check'}
          onClick={() => setTab('check')}
          style={{ ...S.tab, ...(tab === 'check' ? S.tabActive : {}) }}
        >
          <Search size={13} />
          New Check
        </button>
        <button
          role="tab"
          aria-selected={tab === 'history'}
          onClick={() => setTab('history')}
          style={{ ...S.tab, ...(tab === 'history' ? S.tabActive : {}) }}
        >
          <Clock size={13} />
          Trend History
          {history.length > 0 && <span style={S.tabCount}>{trendGroups.length}</span>}
        </button>
      </div>

      {/* ── Check tab ─────────────────────────────────────────────────────── */}
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
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>Business plan required</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Share of Voice runs 3 Google Search-grounded Gemini checks per topic — an informational question, a conversational request, and a research-style comparison. Available on Business plan.
                </div>
              </div>
              <a href="/upgrade" style={{
                background: 'var(--accent)',
                color: '#fff', borderRadius: 8, padding: '10px 22px',
                fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                Upgrade to Business →
              </a>
            </div>
          )}
          {error && <div style={S.errorBox}>{error}</div>}

          {!result ? (
            <form onSubmit={handleCheck} style={S.card}>
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Analysis name</label>
                <input style={S.input} type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Acme Roofing SOV check" maxLength={120} required />
                <div style={S.hint}>Required — so you can find this check again later.</div>
              </div>
              <div className={styles.formGrid2}>
                <div>
                  <label style={S.label}>Brand / product name</label>
                  <input style={S.input} type="text" value={brand} onChange={e => setBrand(e.target.value)}
                    placeholder="e.g. Rain OS" maxLength={200} required />
                  <div style={S.hint}>Use your name as people write it publicly.</div>
                </div>
                <div>
                  <label style={S.label}>Question or Prompt to Determine Share of Voice For</label>
                  <input style={S.input} type="text" value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. AI content optimization tools" maxLength={300} required />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Your website URL <span style={{ color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none' }}>(optional — used to check if your domain is in cited sources)</span></label>
                <input style={S.input} type="text" value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://yourdomain.com" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button type="submit" style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Checking 3 query phrasings…</> : <><BarChart2 size={14} /> Check Share of Voice</>}
                </button>
                {loading && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>This takes ~30 seconds — we run three separate grounded Gemini checks.</span>}
              </div>
            </form>
          ) : (
            /* ── Results ─────────────────────────────────────────────────── */
            <>
              {/* Overview card */}
              <div style={S.card}>
                <div style={{ marginBottom: 20 }}>
                  {result.name && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{result.name}</div>
                  )}
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{result.brand}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>"{result.topic}"</div>

                  <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: result.domainSharePercent !== null ? 4 : 12, fontVariantNumeric: 'tabular-nums' }}>
                    Mentioned in {result.mentionedCount} of 3 prompts
                  </div>
                  {result.domainSharePercent !== null && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontVariantNumeric: 'tabular-nums' }}>
                      Your domain is {result.domainCitedCount} of {result.domainSourceCount} cited sources ({result.domainSharePercent}%)
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                    {result.modelResults.map(m => {
                      const meta = MODEL_META[m.modelKey] || MODEL_META.gemini;
                      const mentioned = m.mentioned ?? m.cited ?? false;
                      return (
                        <span key={m.modelKey} style={{ ...S.statusText, fontSize: 11, color: mentioned ? 'var(--green)' : 'var(--text-dim)' }}>
                          {mentioned ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                          {meta.label}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{result.summary}</div>

                  {result.mentionedCount === 0 && result.url && (
                    <Link to={`/url-scanner?url=${encodeURIComponent(result.url)}`} style={S.urlScannerCta}>
                      Check what your page needs in URL Scanner →
                    </Link>
                  )}
                </div>

                <button onClick={handleReset} style={S.btnSecondary}>← Run another check</button>
              </div>

              {/* Per-prompt cards */}
              <h3 style={{ ...S.sectionTitle, marginBottom: 16 }}>Results by query phrasing</h3>
              <div className={styles.resultsGrid3}>
                {result.modelResults.map(m => <ModelCard key={m.modelKey} m={m} />)}
              </div>

              {/* Citation share */}
              {citationShare.length > 0 && (
                <div style={{ ...S.card, marginBottom: 20 }}>
                  <p style={S.sectionTitle}>Citation share</p>
                  <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                    {citationShare[0].name}
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 8 }}>
                      {citationShare[0].pct}% of citations
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={citationShare}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={62}
                          outerRadius={95}
                          paddingAngle={6}
                          cornerRadius={8}
                          stroke="none"
                        >
                          {citationShare.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip content={<ShareTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={S.shareLegendRowWrap}>
                    {citationShare.map((d, i) => (
                      <div key={i} style={S.shareLegendInline}>
                        <span style={{ ...S.shareLegendDot, background: d.color }} />
                        <span style={S.shareLegendLabel}>{d.name}{d.isOwn ? ' (you)' : ''}</span>
                        <span style={S.shareLegendPct}>{d.pct}%</span>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 11.5, color: 'var(--text-dim)', margin: '16px 0 0', textAlign: 'center' }}>
                    Share of all sources cited across the 3 query phrasings for this topic — real counts, not an estimate.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── History tab ───────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <>
          {histLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <span className="spinner" style={{ display: 'inline-block', width: 24, height: 24, borderWidth: 3 }} />
            </div>
          ) : trendGroups.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '48px 24px' }}>
              <BarChart2 size={32} style={{ color: 'var(--text-dim)', marginBottom: 12 }} />
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No Share of Voice checks yet. Run your first check to start tracking trends.</p>
              <button onClick={() => setTab('check')} style={S.btn}><Search size={13} /> Run first check</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button onClick={handleClear} style={{ ...S.btnSecondary, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--red)' }}>
                  <Trash2 size={12} /> Clear history
                </button>
              </div>

              {trendGroups.map((g, i) => (
                <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px' }}>
                  <div style={{ flexShrink: 0 }}>
                    <MentionCountBadge count={g.mentionedCount} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{g.brand}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{g.topic}" · {g.checks} check{g.checks > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, fontSize: 11, color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>{timeAgo(g.checkedAt)}</div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
