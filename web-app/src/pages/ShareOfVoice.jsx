import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import {
  BarChart2, Search, CheckCircle2, AlertCircle, Minus,
  TrendingUp, TrendingDown, Zap, Clock, Trash2, Info,
  ExternalLink,
} from 'lucide-react';

/* ── Shared inline styles ─────────────────────────────────────────────────── */
const S = {
  page:  { padding: '32px 40px', maxWidth: 960, margin: '0 auto' },
  header: { marginBottom: 32 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  badge: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    background: 'rgba(99,102,241,0.15)', color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 6, padding: '2px 8px',
  },
  sub: { color: '#64748b', fontSize: 14, margin: 0, lineHeight: 1.6 },

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

/* ── Score colour ─────────────────────────────────────────────────────────── */
function sovColor(score) {
  if (score >= 70) return '#22c55e';
  if (score >= 45) return '#eab308';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}

function volumeColor(label) {
  if (label === 'Very High') return '#22c55e';
  if (label === 'High')      return '#6366f1';
  if (label === 'Medium')    return '#0ea5e9';
  return '#64748b';
}

/* ── Big SOV ring ─────────────────────────────────────────────────────────── */
function SovRing({ score, citedCount }) {
  const color = sovColor(score);
  const r = 52, cx = 68, cy = 68, sw = 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      <svg width={136} height={136} viewBox="0 0 136 136">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={`${dash.toFixed(2)} ${circ.toFixed(2)}`}
          strokeLinecap="round" transform="rotate(-90 68 68)"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
        <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize={28} fontWeight={800} fontFamily="Inter,sans-serif">{score}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11} fontFamily="Inter,sans-serif">Share of Voice</text>
      </svg>
      <div>
        <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{citedCount}<span style={{ fontSize: 18, color: '#64748b' }}>/3</span></div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>AI models cited you</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Gemini', 'ChatGPT', 'Perplexity'].map((m, i) => {
            const wasCited = i < citedCount; // simplified — will be overridden below
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Per-model card ───────────────────────────────────────────────────────── */
const MODEL_META = {
  gemini:          { label: 'Gemini',          color: '#06b6d4', bg: 'rgba(6,182,212,0.08)',  border: 'rgba(6,182,212,0.2)' },
  chatgpt_style:   { label: 'ChatGPT',         color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)' },
  perplexity_style:{ label: 'Perplexity',      color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
};

function ModelCard({ m }) {
  const meta  = MODEL_META[m.modelKey] || MODEL_META.gemini;
  const color = meta.color;
  const sc    = sovColor(m.visibilityScore);
  return (
    <div style={{ background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{meta.label}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{m.promptStyle}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: sc, lineHeight: 1 }}>{m.visibilityScore}</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>visibility</div>
        </div>
      </div>

      {/* Cited pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {m.cited ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
            <CheckCircle2 size={11} /> Cited{m.mentionPosition ? ` #${m.mentionPosition}` : ''}
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
            <AlertCircle size={11} /> Not cited
          </span>
        )}
      </div>

      {/* Score bar */}
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 4, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ width: `${m.visibilityScore}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease', boxShadow: `0 0 6px ${color}60` }} />
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
                {s.domain}
                <ExternalLink size={9} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Trend sparkline ──────────────────────────────────────────────────────── */
function Spark({ values, color = '#6366f1', width = 80, height = 28 }) {
  if (!values || values.length < 2) return <span style={{ color: '#475569' }}>—</span>;
  const pad = 2, w = width - pad * 2, h = height - pad * 2;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${(pad + i * step).toFixed(1)},${(pad + h - (Math.min(Math.max(v, 0), 100) / 100) * h).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} style={{ filter: `drop-shadow(0 0 2px ${color}80)` }} />
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
    overallSov: 34,
    citedCount: 1,
    aiVolumeLabel: 'High',
    aiVolumeEstimate: '50k – 200k queries/mo (est.)',
    summary: 'Rain OS is cited by 1/3 AI models for this topic with a share of voice of 34/100.',
    topCompetitors: ['clearscope.io', 'surferseo.com', 'frase.io', 'semrush.com'],
    recommendations: [
      'Expand content to address conversational and research-style queries, not just informational ones.',
      'Target the 2 AI model styles that did not cite you with dedicated content formats.',
      'Consistently publish updated comparisons and case studies to reinforce authority.',
    ],
    modelResults: [
      { modelKey: 'gemini',          modelLabel: 'Gemini',     promptStyle: 'Informational — "What are the best tools for…?"',                      cited: true,  mentionPosition: 4, visibilityScore: 62, answerExcerpt: 'Rain OS is a newer entrant in the AEO optimization space, offering multi-pillar scoring and AI readability analysis alongside established tools like Clearscope and Surfer SEO…', sources: [{ title:'Clearscope Blog', url:'https://clearscope.io', domain:'clearscope.io' }, { title:'Surfer SEO', url:'https://surferseo.com', domain:'surferseo.com' }], competitorDomains: ['clearscope.io','surferseo.com','frase.io'] },
      { modelKey: 'chatgpt_style',   modelLabel: 'ChatGPT',    promptStyle: 'Conversational — "I need help with… what do you recommend?"',            cited: false, mentionPosition: null, visibilityScore: 18, answerExcerpt: 'For AI content optimization I\'d recommend Clearscope for keyword research depth, Surfer SEO for on-page optimization, or Frase for AI-assisted drafting. Each has a free trial.', sources: [], competitorDomains: ['clearscope.io','surferseo.com','frase.io','jasper.ai'] },
      { modelKey: 'perplexity_style', modelLabel: 'Perplexity', promptStyle: 'Research — "Compare the top solutions for… with sources"',              cited: false, mentionPosition: null, visibilityScore: 22, answerExcerpt: 'The leading AI content optimization tools are Clearscope (enterprise), Surfer SEO (mid-market), and Frase (SMB). Semrush and Ahrefs also offer AI writing assistance. Emerging players include…', sources: [{ title:'G2 Reviews', url:'https://g2.com', domain:'g2.com' }], competitorDomains: ['clearscope.io','surferseo.com','ahrefs.com','semrush.com'] },
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

  // Group history by brand/topic for trend lines
  const trendGroups = useMemo(() => {
    const map = new Map();
    for (const h of history) {
      const key = `${h.brand.toLowerCase()}:::${h.topic.toLowerCase()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(h);
    }
    const out = [];
    for (const [, arr] of map) {
      arr.sort((a, b) => new Date(a.checkedAt) - new Date(b.checkedAt));
      const latest = arr[arr.length - 1];
      const prev   = arr[arr.length - 2];
      const delta  = prev ? latest.overallSov - prev.overallSov : null;
      out.push({ brand: latest.brand, topic: latest.topic, latestSov: latest.overallSov, delta, spark: arr.map(h => h.overallSov), checkedAt: latest.checkedAt, checks: arr.length });
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
          <span style={S.badge}>NEW</span>
        </div>
        <p style={S.sub}>
          See how often your brand gets cited across Gemini, ChatGPT-style, and Perplexity-style AI answers for any topic.
          Track your share of voice over time and see who's winning the AI conversation in your space.
        </p>
      </div>

      {/* Info box */}
      <div style={S.infoBox}>
        <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong>How this works — and its limits.</strong> We simulate three AI answering styles using Google Gemini with grounded search: an <em>informational</em> style (like Gemini), a <em>conversational</em> style (like ChatGPT), and a <em>research</em> style (like Perplexity). For each, we check whether your brand is cited and score visibility, sentiment, and prominence. The cited / not cited results are real snapshots of what Gemini pulled from live web sources. However: we do not call actual ChatGPT or Perplexity APIs — the styles are simulated via prompt engineering. The SOV percentage, AI search volume estimate, and recommendations come from our own scoring formula and are directional, not industry-standard metrics. Run checks on multiple topic variations and track over time — use for trend spotting and competitor discovery, not as ground-truth market share data.
        </span>
      </div>

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
                  Share of Voice runs 3 AI model simulations per check — measuring your citation rate across Gemini, ChatGPT-style, and Perplexity-style answers. Available on Business plan.
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
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Checking 3 AI models…</> : <><BarChart2 size={14} /> Check Share of Voice</>}
                </button>
                {loading && <span style={{ fontSize: 12, color: '#64748b' }}>This takes ~30 seconds — we run three separate AI checks.</span>}
              </div>
            </form>
          ) : (
            /* ── Results ─────────────────────────────────────────────────── */
            <>
              {/* Overview card */}
              <div style={S.card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
                  {/* SOV ring */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                    {(() => {
                      const score = result.overallSov;
                      const color = sovColor(score);
                      const r = 52, cx = 68, cy = 68, sw = 8;
                      const circ = 2 * Math.PI * r;
                      const dash = (score / 100) * circ;
                      return (
                        <svg width={136} height={136} viewBox="0 0 136 136" style={{ flexShrink: 0 }}>
                          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw} />
                          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
                            strokeDasharray={`${dash.toFixed(2)} ${circ.toFixed(2)}`}
                            strokeLinecap="round" transform="rotate(-90 68 68)"
                            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
                          <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize={28} fontWeight={800} fontFamily="Inter,sans-serif">{score}</text>
                          <text x={cx} y={cy + 16} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11} fontFamily="Inter,sans-serif">Share of Voice</text>
                        </svg>
                      );
                    })()}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{result.brand}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>"{result.topic}"</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {result.modelResults.map(m => {
                          const meta = MODEL_META[m.modelKey] || MODEL_META.gemini;
                          return (
                            <span key={m.modelKey} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                              background: m.cited ? `${meta.color}18` : 'rgba(255,255,255,0.04)',
                              color: m.cited ? meta.color : '#475569',
                              border: `1px solid ${m.cited ? `${meta.color}35` : 'rgba(255,255,255,0.08)'}` }}>
                              {m.cited ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                              {meta.label}
                            </span>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{result.summary}</div>
                    </div>
                  </div>

                  {/* AI Volume badge */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px', minWidth: 160 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>AI Search Volume</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: volumeColor(result.aiVolumeLabel), marginBottom: 4 }}>{result.aiVolumeLabel}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{result.aiVolumeEstimate}</div>
                  </div>
                </div>

                <button onClick={handleReset} style={S.btnSecondary}>← Run another check</button>
              </div>

              {/* Per-model cards */}
              <h3 style={{ ...S.sectionTitle, marginBottom: 16 }}>Results by AI model</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {result.modelResults.map(m => <ModelCard key={m.modelKey} m={m} />)}
              </div>

              {/* Competitors */}
              {result.topCompetitors?.length > 0 && (
                <div style={{ ...S.card, marginBottom: 20 }}>
                  <p style={S.sectionTitle}>Top competitors across all models</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {result.topCompetitors.map((d, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px' }}>
                        <img src={`https://www.google.com/s2/favicons?domain=${d}&sz=16`} alt="" style={{ width: 12, height: 12, borderRadius: 2 }} onError={e => e.currentTarget.style.display='none'} />
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div style={S.card}>
                  <p style={S.sectionTitle}>How to grow your share of voice</p>
                  {result.recommendations.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 10, marginBottom: 8 }}>
                      <Zap size={13} style={{ color: '#6366f1', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{r}</span>
                    </div>
                  ))}
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

              {trendGroups.map((g, i) => {
                const color   = sovColor(g.latestSov);
                const dUp     = g.delta !== null && g.delta > 0;
                const dDown   = g.delta !== null && g.delta < 0;
                return (
                  <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px' }}>
                    <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 60 }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{g.latestSov}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>SOV</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{g.brand}</div>
                      <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{g.topic}"</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <Spark values={g.spark} color={color} width={80} height={28} />
                      <div style={{ fontSize: 10, color: '#475569' }}>{g.checks} check{g.checks > 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      {g.delta !== null && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                          color: dUp ? '#4ade80' : dDown ? '#f87171' : '#64748b',
                          background: dUp ? 'rgba(34,197,94,0.1)' : dDown ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)' }}>
                          {dUp ? <TrendingUp size={11} /> : dDown ? <TrendingDown size={11} /> : <Minus size={11} />}
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
