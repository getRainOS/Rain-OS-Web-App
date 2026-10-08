import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './BrandVisibility.module.css';

function MentionBadge({ status }) {
  const map = {
    mentioned: { color: 'var(--green)', label: 'Mentioned by AI' },
    ambiguous: { color: 'var(--yellow)', label: 'Ambiguous mention' },
    not_mentioned: { color: 'var(--red)', label: 'Not mentioned' },
  };
  const cfg = map[status] || map.not_mentioned;
  return (
    <span className={styles.statusText} style={{ color: cfg.color }}>
      <span className={styles.statusDot} style={{ background: cfg.color }} />
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
  return <span className={styles.statusText} style={{ color: cfg.color }}>{cfg.label}</span>;
}

function CitedBadge() {
  return (
    <span className={styles.statusText} style={{ color: 'var(--text)' }}>
      <span className={styles.statusDot} style={{ background: 'var(--text)' }} />
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
    <div className={styles.disclaimer} style={{ padding: collapsed ? '8px 16px' : '12px 16px' }}>
      <div className={styles.disclaimerHeader}>
        <strong className={styles.disclaimerTitle}>How this works — and its limits.</strong>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand disclaimer' : 'Collapse disclaimer'}
          className={styles.disclaimerToggle}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <p className={styles.disclaimerText} style={{ marginTop: 8 }}>We query Google Gemini with live Google Search grounding for your topic, then check the real AI-generated answer for your brand name and, if you gave a URL, your domain among the cited sources. The mention status, citation, and sources are all drawn directly from that live data — nothing is scored or guessed. When your brand is mentioned, we ask Gemini a second, much smaller question — classifying tone only from the exact sentences that mention it — and label that "AI's read." However: this is a single-model, single-query snapshot — only Gemini, one phrasing, one moment in time. Ask the same question differently ("best project management software" vs "what tool should my team use for task tracking?") and you may get entirely different results. Use this for directional spot-checking and competitor discovery, not as comprehensive brand monitoring.</p>}
    </div>
  );
}

/* ── Collapsible "What does this mean?" ──────────────────────────────────── */
function WhatDoesThisMeanBox() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className={styles.disclaimer} style={{ padding: collapsed ? '8px 16px' : '12px 16px' }}>
      <div className={styles.disclaimerHeader}>
        <strong className={styles.disclaimerTitle}>What does this mean?</strong>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand explanation' : 'Collapse explanation'}
          className={styles.disclaimerToggle}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
      {!collapsed && <p className={styles.disclaimerText} style={{ marginTop: 8 }}>Whether you're mentioned comes from a direct check of Gemini's answer, not a guess. The sentiment label (positive, neutral, negative) is AI's judgment of the specific sentences that mention you; showing you those sentences lets you judge the tone yourself too.</p>}
    </div>
  );
}

export default function BrandVisibility() {
  const [name, setName] = useState('');
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
    if (!name.trim() || !brand.trim() || !topic.trim()) return;
    setLoading(true);
    setError('');
    setPlanGated(false);
    setResult(null);
    try {
      const { data } = await api.brandVisibility({ name: name.trim(), brand: brand.trim(), topic: topic.trim(), url: url.trim() || undefined });
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
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Brand Sentiment</h1>
        </div>
        <p className={styles.tagline}>A real mention check, plus AI's read on tone.</p>
        <p className={styles.sub}>See how Gemini describes your brand, using live Google Search grounding — and what to do if it does not mention you.</p>
      </div>

      <WhatDoesThisMeanBox />
      <DisclaimerBox />

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'check'}
          onClick={() => setTab('check')}
          className={`${styles.tab} ${tab === 'check' ? styles.tabActive : ''}`}
        >
          <SearchIcon size={13} />
          New Check
        </button>
        <button
          role="tab"
          aria-selected={tab === 'history'}
          onClick={() => setTab('history')}
          className={`${styles.tab} ${tab === 'history' ? styles.tabActive : ''}`}
        >
          <ClockIcon size={13} />
          Trend History
          {history.length > 0 && <span className={styles.tabCount}>{trendGroups.length}</span>}
        </button>
      </div>

      {/* ── Check tab ─────────────────────────────────────────────────────────────────── */}
      {tab === 'check' && (
        <>
      {planGated && (
        <div className={styles.planGated}>
          <div>
            <div className={styles.planGatedTitle}>Business plan required</div>
            <div className={styles.planGatedDesc}>
              Brand Sentiment tracks how Gemini describes your brand across live, Google Search-grounded answers. It runs multiple Gemini calls per check and is available on the Business plan.
            </div>
          </div>
          <a href="/upgrade" className={styles.planGatedCta}>
            Upgrade to Business →
          </a>
        </div>
      )}
      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.card}>
        <form onSubmit={handleCheck}>
          <div className={styles.field}>
            <label className={styles.label}>Analysis name</label>
            <input
              className={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Acme Roofing brand check"
              required
              maxLength={120}
            />
            <div className={styles.hint}>Required — so you can find this check again later.</div>
          </div>
          <div className={styles.formGrid2}>
            <div>
              <label className={styles.label}>Brand or product name</label>
              <input
                className={styles.input}
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. rain OS, Acme Widgets"
                required
                maxLength={200}
              />
              <div className={styles.hint}>Use your name as people write it publicly.</div>
            </div>
            <div>
              <label className={styles.label}>Question or Prompt to View Sentiment For</label>
              <input
                className={styles.input}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. AI content optimization tools"
                required
                maxLength={300}
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Your website URL <span className={styles.optionalHint}>(optional)</span></label>
            <input
              className={styles.input}
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://yourdomain.com"
              type="url"
            />
          </div>
          <div className={styles.submitRow}>
            <button
              type="submit"
              className={styles.btn}
              disabled={loading}
            >
              {loading && <span className={styles.spinner} />}
              {loading ? 'Checking AI answers…' : 'Check brand sentiment'}
            </button>
            {loading && <span className={styles.loadingHint}>This takes ~20 seconds — we run multiple AI checks.</span>}
          </div>
        </form>
      </div>

      {result && (
        <div>
          <div className={styles.card}>
            <div className={styles.resultMeta}>
              {result.name && <div className={styles.resultName}>{result.name}</div>}
              <div className={styles.resultTitle}>{result.brand}</div>
              <p className={styles.resultSub}>{result.summary}</p>
              <div className={styles.badgeRow}>
                <MentionBadge status={result.mentionStatus} />
                {result.mentionStatus === 'mentioned' && <SentimentBadge sentiment={result.sentiment} />}
                {result.cited && <CitedBadge />}
              </div>
              {result.notMentionedHint && (
                <p className={styles.notMentionedHint}>{result.notMentionedHint}</p>
              )}
              {result.url && result.mentionStatus === 'not_mentioned' && (
                <Link to={`/url-scanner?url=${encodeURIComponent(result.url)}`} className={styles.urlScannerCta}>
                  Check what your page needs in URL Scanner →
                </Link>
              )}
            </div>
            {result.sentimentExplanation && (
              <div className={styles.sentimentBlock}>
                <div className={styles.sectionTitle}>AI's read</div>
                <p className={styles.resultSub}>{result.sentimentExplanation}</p>
              </div>
            )}
          </div>

          {result.answerExcerpt && (
            <div className={styles.card}>
              <div className={styles.sectionTitle}>What AI answered for "{result.topic}"</div>
              <div className={styles.excerpt}>"{result.answerExcerpt}"</div>
            </div>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <div className={styles.card}>
              <div className={styles.sectionTitle}>What you can do about it</div>
              <ul className={styles.recommendationsList}>
                {result.recommendations.map((r, i) => (
                  <li key={i} className={styles.recommendationItem}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {result.competitors && result.competitors.length > 0 && (
            <div className={styles.card}>
              <div className={styles.sectionTitle}>Sites Gemini cited</div>
              <div className={styles.competitorGrid}>
                {result.competitors.map((c, i) => (
                  <span key={i} className={styles.competitorChip}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {result.sources && result.sources.length > 0 && (
            <div className={styles.card}>
              <div className={styles.sectionTitle}>Sources AI cited ({result.sources.length})</div>
              {result.sources.map((s, i) => (
                <div key={i} className={styles.sourceItem}>
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=16`}
                    alt=""
                    className={styles.favicon}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <div className={styles.sourceDomain}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>{s.title || s.domain}</a>
                      {i === result.citedSourceIndex && (
                        <span className={styles.yourSiteBadge}>Your site</span>
                      )}
                    </div>
                    {s.snippet && <div className={styles.sourceSnippet}>{s.snippet}</div>}
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
            <div className={styles.historyLoading}>
              <span className={`${styles.spinner} ${styles.spinnerLg}`} />
            </div>
          ) : trendGroups.length === 0 ? (
            <div className={`${styles.card} ${styles.emptyCard}`}>
              <ClockIcon size={32} />
              <p className={styles.emptyDesc}>No Brand Sentiment checks yet. Run your first check to start tracking trends.</p>
              <button onClick={() => setTab('check')} className={styles.btn}><SearchIcon size={13} /> Run first check</button>
            </div>
          ) : (
            <>
              <div className={styles.clearRow}>
                <button onClick={clearHistory} className={styles.btnSecondary} style={{ color: 'var(--red)' }}>
                  <TrashIcon size={12} /> Clear history
                </button>
              </div>

              {trendGroups.map((g, i) => (
                <div
                  key={i}
                  className={styles.trendRow}
                  onClick={() => { setBrand(g.brand); setTopic(g.topic); setTab('check'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <MentionBadge status={g.latestMention} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.trendTitle}>
                      {g.brand} — {g.topic}
                    </div>
                    <div className={styles.trendMeta}>
                      {g.latestSentiment.replace('_', ' ')} sentiment · {g.checks} check{g.checks > 1 ? 's' : ''}
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
