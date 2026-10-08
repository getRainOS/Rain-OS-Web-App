import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2, Search, CheckCircle2, AlertCircle,
  Clock, Trash2, Info, ChevronDown, ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api/client.js';
import { buildCitationShare } from '../lib/citationShare.js';
import styles from './ShareOfVoice.module.css';

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
    <div className={styles.modelCard}>
      <div className={styles.modelHead}>
        <div className={styles.modelTitle}>{meta.label}</div>
        <div className={styles.modelPromptStyle}>{m.promptStyle}</div>
      </div>

      {/* Mentioned status */}
      <div className={styles.modelStatusRow}>
        {mentioned ? (
          <span className={styles.statusText} style={{ color: 'var(--green)' }}>
            <CheckCircle2 size={11} /> Mentioned
          </span>
        ) : (
          <span className={styles.statusText} style={{ color: 'var(--red)' }}>
            <AlertCircle size={11} /> Not mentioned
          </span>
        )}
      </div>

      {/* Answer excerpt */}
      {m.answerExcerpt && (
        <p className={styles.modelExcerpt}>
          "{m.answerExcerpt}"
        </p>
      )}

      {/* Sources */}
      {m.sources?.length > 0 && (
        <div>
          <div className={styles.modelSourcesLabel}>Cited sources</div>
          <div className={styles.modelSourcesGrid}>
            {m.sources.slice(0, 4).map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.modelSourceChip}>
                <img src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=16`} alt="" className={styles.modelSourceFavicon} onError={e => e.currentTarget.style.display='none'} />
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
    <span className={`${styles.statusText} ${styles.statusTextNum}`} style={{ color }}>
      {count} of 3
    </span>
  );
}

function ShareTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.shareTooltip}>
      <div className={styles.shareTooltipName}>{d.name}</div>
      <div className={styles.shareTooltipPct}>{d.pct}% of citations</div>
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
    <div className={styles.infoBox} style={{ padding: collapsed ? '8px 16px' : '12px 16px' }}>
      <div className={styles.infoBoxHeader}>
        <div className={styles.infoBoxHeadLeft}>
          <Info size={15} className={styles.infoBoxIcon} />
          <strong>How this works — and its limits.</strong>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand disclaimer' : 'Collapse disclaimer'}
          className={styles.infoBoxToggle}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <span className={styles.infoBoxText}>We ask Google Gemini about your topic three different ways — an <em>informational</em> question, a <em>conversational</em> request, and a <em>research</em>-style comparison — each grounded in live Google Search. For each, we check whether your brand's name appears in the answer. If you gave a URL, we also check what share of all the sources cited across the three prompts is your own domain. Every number here — the mention count, the domain share, and the competitor list — comes directly from that live data; nothing is scored or guessed. However: this covers Gemini only, three phrasings, one moment in time. Run checks on multiple topic variations and track over time — use for trend spotting and competitor discovery, not as ground-truth market share data.</span>}
    </div>
  );
}

/* ── Collapsible "What does this mean?" ──────────────────────────────────── */
function WhatDoesThisMeanBox() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className={styles.infoBox} style={{ padding: collapsed ? '8px 16px' : '12px 16px' }}>
      <div className={styles.infoBoxHeader}>
        <div className={styles.infoBoxHeadLeft}>
          <Info size={15} className={styles.infoBoxIcon} />
          <strong>What does this mean?</strong>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand explanation' : 'Collapse explanation'}
          className={styles.infoBoxToggle}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <span className={styles.infoBoxText}>We send your topic as three differently-worded prompts and check each real answer for your brand and your domain. "Mentioned in 2 of 3" and your citation share are exact counts from those three checks, not a market-wide statistic. Run it again later to see whether your presence is growing.</span>}
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
    <div className={`${styles.page} fade-in`}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <BarChart2 size={22} style={{ color: 'var(--text)' }} />
          <h1 className={styles.title}>Share of Voice</h1>
        </div>
        <p className={styles.tagline}>Real counts across 3 real prompts — not an estimate.</p>
        <p className={styles.sub}>
          See whether Gemini cites your brand for any topic — checked three ways, powered by real Google Search grounding.
          Track your visibility over time and see which competitors show up in the answers instead.
        </p>
      </div>

      {/* What does this mean? */}
      <WhatDoesThisMeanBox />
      {/* Info box */}
      <InfoBox />

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'check'}
          onClick={() => setTab('check')}
          className={`${styles.tab} ${tab === 'check' ? styles.tabActive : ''}`}
        >
          <Search size={13} />
          New Check
        </button>
        <button
          role="tab"
          aria-selected={tab === 'history'}
          onClick={() => setTab('history')}
          className={`${styles.tab} ${tab === 'history' ? styles.tabActive : ''}`}
        >
          <Clock size={13} />
          Trend History
          {history.length > 0 && <span className={styles.tabCount}>{trendGroups.length}</span>}
        </button>
      </div>

      {/* ── Check tab ─────────────────────────────────────────────────────── */}
      {tab === 'check' && (
        <>
          {planGated && (
            <div className={styles.planGated}>
              <div>
                <div className={styles.planGatedTitle}>Business plan required</div>
                <div className={styles.planGatedDesc}>
                  Share of Voice runs 3 Google Search-grounded Gemini checks per topic — an informational question, a conversational request, and a research-style comparison. Available on Business plan.
                </div>
              </div>
              <a href="/upgrade" className={styles.planGatedCta}>
                Upgrade to Business →
              </a>
            </div>
          )}
          {error && <div className={styles.errorBox}>{error}</div>}

          {!result ? (
            <form onSubmit={handleCheck} className={styles.card}>
              <div className={styles.field}>
                <label className={styles.label}>Analysis name</label>
                <input className={styles.input} type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Acme Roofing SOV check" maxLength={120} required />
                <div className={styles.hint}>Required — so you can find this check again later.</div>
              </div>
              <div className={styles.formGrid2}>
                <div>
                  <label className={styles.label}>Brand / product name</label>
                  <input className={styles.input} type="text" value={brand} onChange={e => setBrand(e.target.value)}
                    placeholder="e.g. Rain OS" maxLength={200} required />
                  <div className={styles.hint}>Use your name as people write it publicly.</div>
                </div>
                <div>
                  <label className={styles.label}>Question or Prompt to Determine Share of Voice For</label>
                  <input className={styles.input} type="text" value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. AI content optimization tools" maxLength={300} required />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Your website URL <span className={styles.optionalHint}>(optional — used to check if your domain is in cited sources)</span></label>
                <input className={styles.input} type="text" value={url} onChange={e => setUrl(e.target.value)}
                  placeholder="https://yourdomain.com" />
              </div>

              <div className={styles.submitRow}>
                <button type="submit" className={styles.btn} style={{ opacity: loading ? 0.6 : 1 }} disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Checking 3 query phrasings…</> : <><BarChart2 size={14} /> Check Share of Voice</>}
                </button>
                {loading && <span className={styles.loadingHint}>This takes ~30 seconds — we run three separate grounded Gemini checks.</span>}
              </div>
            </form>
          ) : (
            /* ── Results ─────────────────────────────────────────────────── */
            <>
              {/* Overview card */}
              <div className={styles.card}>
                <div className={styles.field}>
                  {result.name && (
                    <div className={styles.resultName}>{result.name}</div>
                  )}
                  <div className={styles.resultBrand}>{result.brand}</div>
                  <div className={styles.resultTopic}>"{result.topic}"</div>

                  <div className={styles.resultHeadline} style={{ marginBottom: result.domainSharePercent !== null ? 4 : 12 }}>
                    Mentioned in {result.mentionedCount} of 3 prompts
                  </div>
                  {result.domainSharePercent !== null && (
                    <div className={styles.resultDomainShare}>
                      Your domain is {result.domainCitedCount} of {result.domainSourceCount} cited sources ({result.domainSharePercent}%)
                    </div>
                  )}

                  <div className={styles.resultModelsRow}>
                    {result.modelResults.map(m => {
                      const meta = MODEL_META[m.modelKey] || MODEL_META.gemini;
                      const mentioned = m.mentioned ?? m.cited ?? false;
                      return (
                        <span key={m.modelKey} className={`${styles.statusText} ${styles.resultModelBadge}`} style={{ color: mentioned ? 'var(--green)' : 'var(--text-dim)' }}>
                          {mentioned ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                          {meta.label}
                        </span>
                      );
                    })}
                  </div>
                  <div className={styles.resultSummaryText}>{result.summary}</div>

                  {result.mentionedCount === 0 && result.url && (
                    <Link to={`/url-scanner?url=${encodeURIComponent(result.url)}`} className={styles.urlScannerCta}>
                      Check what your page needs in URL Scanner →
                    </Link>
                  )}
                </div>

                <button onClick={handleReset} className={styles.btnSecondary}>← Run another check</button>
              </div>

              {/* Per-prompt cards */}
              <h3 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Results by query phrasing</h3>
              <div className={styles.resultsGrid3}>
                {result.modelResults.map(m => <ModelCard key={m.modelKey} m={m} />)}
              </div>

              {/* Citation share */}
              {citationShare.length > 0 && (
                <div className={styles.card}>
                  <p className={styles.sectionTitle}>Citation share</p>
                  <div className={styles.shareHeadline}>
                    {citationShare[0].name}
                    <span className={styles.shareHeadlinePct}>
                      {citationShare[0].pct}% of citations
                    </span>
                  </div>

                  <div className={styles.shareChartWrap}>
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

                  <div className={styles.shareLegendRowWrap}>
                    {citationShare.map((d, i) => (
                      <div key={i} className={styles.shareLegendInline}>
                        <span className={styles.shareLegendDot} style={{ background: d.color }} />
                        <span className={styles.shareLegendLabel}>{d.name}{d.isOwn ? ' (you)' : ''}</span>
                        <span className={styles.shareLegendPct}>{d.pct}%</span>
                      </div>
                    ))}
                  </div>

                  <p className={styles.shareFootnote}>
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
            <div className={styles.historyLoading}>
              <span className="spinner" style={{ display: 'inline-block', width: 24, height: 24, borderWidth: 3 }} />
            </div>
          ) : trendGroups.length === 0 ? (
            <div className={styles.emptyCard}>
              <BarChart2 size={32} className={styles.emptyIcon} />
              <p className={styles.emptyDesc}>No Share of Voice checks yet. Run your first check to start tracking trends.</p>
              <button onClick={() => setTab('check')} className={styles.btn}><Search size={13} /> Run first check</button>
            </div>
          ) : (
            <>
              <div className={styles.clearRow}>
                <button onClick={handleClear} className={styles.btnSecondary} style={{ color: 'var(--red)' }}>
                  <Trash2 size={12} /> Clear history
                </button>
              </div>

              {trendGroups.map((g, i) => (
                <div
                  key={i}
                  className={styles.trendRow}
                  onClick={() => { setBrand(g.brand); setTopic(g.topic); setTab('check'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <MentionCountBadge count={g.mentionedCount} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.trendBrand}>{g.brand}</div>
                    <div className={styles.trendMeta}>
                      "{g.topic}" · {g.checks} check{g.checks > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className={styles.trendTime}>{timeAgo(g.checkedAt)}</div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
