import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import {
  BarChart2, Search, CheckCircle2, AlertCircle,
  Clock, Trash2, Info, ChevronDown, ChevronUp,
  ExternalLink,
} from 'lucide-react';

/* ── Shared inline styles ─────────────────────────────────────────────────── */
const S = {
  page:  { padding: '32px 40px', maxWidth: 960, margin: '0 auto' },
  header: { marginBottom: 32 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  sub: { color: '#64748b', fontSize: 14, margin: 0, lineHeight: 1.6 },
  tagline: { color: '#f1f5f9', fontSize: 14, fontWeight: 600, margin: '0 0 6px' },

  card: {
    background: '#040714', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: 24, marginBottom: 20,
  },
  label: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    padding: '10px 14px', color: '#f1f5f9', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  hint: { fontSize: 11, color: '#475569', marginTop: 6 },
  urlScannerCta: {
    display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
    color: '#0ea5e9', fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
  },
  btn: {
    background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '11px 28px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', transition: 'opacity 0.15s',
    display: 'inline-flex', alignItems: 'center', gap: 8,
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, marginTop: 0 },
  errorBox: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 20,
  },
  infoBox: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 8, padding: '12px 16px', fontSize: 12, color: '#64748b',
    display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, lineHeight: 1.7,
  },
};

/* ── Per-prompt card ──────────────────────────────────────────────────────── */
const MODEL_META = {
  gemini:          { label: 'Informational question',          color: '#06b6d4', bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.2)' },
  chatgpt_style:   { label: 'Conversational request',         color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)' },
  perplexity_style:{ label: 'Research comparison',      color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
};

function ModelCard({ m }) {
  const meta  = MODEL_META[m.modelKey] || MODEL_META.gemini;
  const color = meta.color;
  const mentioned = m.mentioned ?? m.cited ?? false;
  return (
    <div style={{ background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 14, padding: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{meta.label}</div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{m.promptStyle}</div>
      </div>

      {/* Mentioned pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {mentioned ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
            <CheckCircle2 size={11} /> Mentioned
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
            <AlertCircle size={11} /> Not mentioned
          </span>
        )}
      </div>

      {/* Answer excerpt */}
      {m.answerExcerpt && (
        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 12px', borderLeft: `2px solid ${color}40`, paddingLeft: 10 }}>
          "{m.answerExcerpt.slice(0, 220)}{m.answerExcerpt.length > 220 ? '…' : ''}"
        </p>
      )}

      {/* Sources */}
      {m.sources?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Cited sources</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {m.sources.slice(0, 4).map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: color, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 6, padding: '3px 8px', textDecoration: 'none' }}>
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
  const color  = allGood ? '#4ade80' : none ? '#f87171' : '#fbbf24';
  const bg     = allGood ? 'rgba(74,222,128,0.12)' : none ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.12)';
  const border = allGood ? 'rgba(74,222,128,0.3)' : none ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.3)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, background: bg, color, border: `1px solid ${border}`, whiteSpace: 'nowrap' }}>
      {count} of 3
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
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#64748b', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <span style={{ display: 'block', marginTop: 8, fontSize: 12, lineHeight: 1.7, color: '#64748b' }}>We ask Google Gemini about your topic three different ways — an <em>informational</em> question, a <em>conversational</em> request, and a <em>research</em>-style comparison — each grounded in live Google Search. For each, we check whether your brand's name appears in the answer. If you gave a URL, we also check what share of all the sources cited across the three prompts is your own domain. Every number here — the mention count, the domain share, and the competitor list — comes directly from that live data; nothing is scored or guessed. However: this covers Gemini only, three phrasings, one moment in time. Run checks on multiple topic variations and track over time — use for trend spotting and competitor discovery, not as ground-truth market share data.</span>}
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
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#64748b', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <span style={{ display: 'block', marginTop: 8, fontSize: 12, lineHeight: 1.7, color: '#64748b' }}>We send your topic as three differently-worded prompts and check each real answer for your brand and your domain. "Mentioned in 2 of 3" and your citation share are exact counts from those three checks, not a market-wide statistic. Run it again later to see whether your presence is growing.</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function ShareOfVoice() {
  const { isDemo } = useApp();

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

  // Demo result placeholder
  const DEMO_RESULT = useMemo(() => ({
    brand: brand || 'Rain OS',
    topic: topic || 'AI content optimization tools',
    url: url || null,
    mentionedCount: 1,
    domainCitedCount: url ? 1 : null,
    domainSourceCount: url ? 3 : null,
    domainSharePercent: url ? 33 : null,
    competitors: ['clearscope.io', 'surferseo.com', 'frase.io', 'semrush.com'],
    summary: url
      ? 'Rain OS was mentioned in 1 of 3 query phrasings for this topic. Your domain is 1 of 3 cited sources (33%).'
      : 'Rain OS was mentioned in 1 of 3 query phrasings for this topic.',
    modelResults: [
      { modelKey: 'gemini',          modelLabel: 'Informational question',     promptStyle: '"What are the best tools for…?"',           mentioned: true,  answerExcerpt: 'Rain OS is a newer entrant in the AEO optimization space, offering multi-pillar scoring and AI readability analysis alongside established tools like Clearscope and Surfer SEO…', sources: [{ title:'Clearscope Blog', url:'https://clearscope.io', domain:'clearscope.io' }, { title:'Surfer SEO', url:'https://surferseo.com', domain:'surferseo.com' }] },
      { modelKey: 'chatgpt_style',   modelLabel: 'Conversational request',    promptStyle: '"I need help with… what do you recommend?"', mentioned: false, answerExcerpt: 'For AI content optimization I\'d recommend Clearscope for keyword research depth, Surfer SEO for on-page optimization, or Frase for AI-assisted drafting. Each has a free trial.', sources: [] },
      { modelKey: 'perplexity_style', modelLabel: 'Research comparison', promptStyle: '"Compare the top solutions for… with sources"',   mentioned: false, answerExcerpt: 'The leading AI content optimization tools are Clearscope (enterprise), Surfer SEO (mid-market), and Frase (SMB). Semrush and Ahrefs also offer AI writing assistance. Emerging players include…', sources: [{ title:'G2 Reviews', url:'https://g2.com', domain:'g2.com' }] },
    ],
  }), [brand, topic, url]);

  useEffect(() => {
    if (isDemo) { setHistLoading(false); setHistory([]); return; }
    api.sovHistory()
      .then(({ data }) => setHistory(Array.isArray(data) ? data : data?.data ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistLoading(false));
  }, [isDemo]);

  async function handleCheck(e) {
    e.preventDefault();
    if (!brand.trim() || !topic.trim()) return;
    if (isDemo) { setResult(DEMO_RESULT); setTab('check'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    setPlanGated(false);
    try {
      const { data } = await api.shareOfVoice({ brand: brand.trim(), topic: topic.trim(), url: url.trim() || undefined });
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
          <BarChart2 size={22} style={{ color: '#6366f1' }} />
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ key: 'check', label: 'New Check', Icon: Search }, { key: 'history', label: `Trend History${history.length ? ` (${trendGroups.length})` : ''}`, Icon: Clock }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: tab === t.key ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
              color: tab === t.key ? '#818cf8' : '#64748b',
              boxShadow: tab === t.key ? '0 0 0 1px rgba(99,102,241,0.35)' : '0 0 0 1px rgba(255,255,255,0.06)',
            }}>
            <t.Icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Check tab ─────────────────────────────────────────────────────── */}
      {tab === 'check' && (
        <>
          {planGated && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.08))',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 14, padding: '24px 28px', marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#818cf8', marginBottom: 6 }}>Business plan required</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                  Share of Voice runs 3 Google Search-grounded Gemini checks per topic — an informational question, a conversational request, and a research-style comparison. Available on Business plan.
                </div>
              </div>
              <a href="/upgrade" style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff', borderRadius: 8, padding: '10px 22px',
                fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
                boxShadow: '0 0 20px rgba(99,102,241,0.25)',
              }}>
                Upgrade to Business →
              </a>
            </div>
          )}
          {error && <div style={S.errorBox}>{error}</div>}

          {!result ? (
            <form onSubmit={handleCheck} style={S.card}>
              <div style={S.grid2}>
                <div>
                  <label style={S.label}>Brand / product name</label>
                  <input style={S.input} type="text" value={brand} onChange={e => setBrand(e.target.value)}
                    placeholder="e.g. Rain OS" maxLength={200} required />
                  <div style={S.hint}>Use your name as people write it publicly.</div>
                </div>
                <div>
                  <label style={S.label}>Topic / query to check</label>
                  <input style={S.input} type="text" value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. AI content optimization tools" maxLength={300} required />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Your website URL <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none' }}>(optional — used to check if your domain is in cited sources)</span></label>
                <input style={S.input} type="text" value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://yourdomain.com" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button type="submit" style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Checking 3 query phrasings…</> : <><BarChart2 size={14} /> Check Share of Voice</>}
                </button>
                {loading && <span style={{ fontSize: 12, color: '#64748b' }}>This takes ~30 seconds — we run three separate grounded Gemini checks.</span>}
              </div>
            </form>
          ) : (
            /* ── Results ─────────────────────────────────────────────────── */
            <>
              {/* Overview card */}
              <div style={S.card}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{result.brand}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>"{result.topic}"</div>

                  <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: result.domainSharePercent !== null ? 4 : 12 }}>
                    Mentioned in {result.mentionedCount} of 3 prompts
                  </div>
                  {result.domainSharePercent !== null && (
                    <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                      Your domain is {result.domainCitedCount} of {result.domainSourceCount} cited sources ({result.domainSharePercent}%)
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {result.modelResults.map(m => {
                      const meta = MODEL_META[m.modelKey] || MODEL_META.gemini;
                      const mentioned = m.mentioned ?? m.cited ?? false;
                      return (
                        <span key={m.modelKey} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                          background: mentioned ? `${meta.color}18` : 'rgba(255,255,255,0.04)',
                          color: mentioned ? meta.color : '#475569',
                          border: `1px solid ${mentioned ? `${meta.color}35` : 'rgba(255,255,255,0.08)'}` }}>
                          {mentioned ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                          {meta.label}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{result.summary}</div>

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {result.modelResults.map(m => <ModelCard key={m.modelKey} m={m} />)}
              </div>

              {/* Competitors */}
              {result.competitors?.length > 0 && (
                <div style={{ ...S.card, marginBottom: 20 }}>
                  <p style={S.sectionTitle}>Sites Gemini cited</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {result.competitors.map((d, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px' }}>
                        <img src={`https://www.google.com/s2/favicons?domain=${d}&sz=16`} alt="" style={{ width: 12, height: 12, borderRadius: 2 }} onError={e => e.currentTarget.style.display='none'} />
                        {d}
                      </span>
                    ))}
                  </div>
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
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <span className="spinner" style={{ display: 'inline-block', width: 24, height: 24, borderWidth: 3 }} />
            </div>
          ) : trendGroups.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '48px 24px' }}>
              <BarChart2 size={32} style={{ color: '#334155', marginBottom: 12 }} />
              <p style={{ color: '#64748b', marginBottom: 16 }}>No Share of Voice checks yet. Run your first check to start tracking trends.</p>
              <button onClick={() => setTab('check')} style={S.btn}><Search size={13} /> Run first check</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button onClick={handleClear} style={{ ...S.btnSecondary, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#ef4444' }}>
                  <Trash2 size={12} /> Clear history
                </button>
              </div>

              {trendGroups.map((g, i) => (
                <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px' }}>
                  <div style={{ flexShrink: 0 }}>
                    <MentionCountBadge count={g.mentionedCount} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{g.brand}</div>
                    <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{g.topic}" · {g.checks} check{g.checks > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, fontSize: 11, color: '#475569' }}>{timeAgo(g.checkedAt)}</div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
