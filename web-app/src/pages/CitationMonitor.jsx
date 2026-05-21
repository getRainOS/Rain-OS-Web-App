import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import {
  Radar, Search, ExternalLink, CheckCircle2, AlertCircle,
  Map as MapIcon, Trophy, Trash2, Info,
  History as HistoryIcon, TrendingUp, TrendingDown, Minus,
  Clock,
} from 'lucide-react';
import { buildCompetitorMap } from '../lib/citationHistory.js';
import styles from './CitationMonitor.module.css';

const EXAMPLE_TOPICS = [
  'best AI content optimizer for bloggers',
  'how to improve AEO for a SaaS landing page',
  'what is answer engine optimization',
];

function getFavicon(domain) {
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function scoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#0EA5E9';
  if (score >= 30) return '#f59e0b';
  return '#ef4444';
}

function normalizeDomain(input) {
  if (!input) return null;
  let candidate = input.trim();
  if (!candidate) return null;
  try {
    if (!/^https?:\/\//i.test(candidate)) candidate = 'https://' + candidate;
    const u = new URL(candidate);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/* ── Trend sparkline (SVG mini-chart) ────────────────────────────────────── */
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

export default function CitationMonitor() {
  const { isDemo, refreshUser } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'map' ? 'map' : searchParams.get('tab') === 'history' ? 'history' : 'check';
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const next = searchParams.get('tab') === 'map' ? 'map' : searchParams.get('tab') === 'history' ? 'history' : 'check';
    setTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function changeTab(nextTab) {
    setTab(nextTab);
    const params = new URLSearchParams(searchParams);
    if (nextTab === 'map') {
      params.set('tab', 'map');
    } else if (nextTab === 'history') {
      params.set('tab', 'history');
    } else {
      params.delete('tab');
    }
    setSearchParams(params, { replace: true });
  }

  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  // Cross-topic citation history from the backend (drives Competitor Map + Trend History)
  const [mapHistory, setMapHistory] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  // Backend per-topic timeline (drives "Previous checks for this topic")
  const [topicHistory, setTopicHistory] = useState([]);

  async function fetchMapHistory() {
    setMapLoading(true);
    try {
      const { data } = await api.citationHistory();
      const items = Array.isArray(data) ? data : data?.items ?? [];
      setMapHistory(items);
    } catch (_) {
      setMapHistory([]);
    } finally {
      setMapLoading(false);
    }
  }

  // Load cross-topic history from the backend on mount / when demo flag flips
  useEffect(() => {
    fetchMapHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  async function loadTopicHistory(forTopic) {
    if (!forTopic || forTopic.trim().length < 3) {
      setTopicHistory([]);
      return;
    }
    try {
      const { data } = await api.citationHistory({ topic: forTopic.trim() });
      const items = Array.isArray(data) ? data : data?.items ?? [];
      setTopicHistory(items);
    } catch (_) {
      setTopicHistory([]);
    }
  }

  async function handleCheck(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.citationCheck({ topic: topic.trim(), url: url.trim() || undefined });
      setResult(data);
      // Prefer the per-topic history payload that came back with the check; fall back to a fetch.
      if (Array.isArray(data?.history) && data.history.length > 0) {
        setTopicHistory(data.history);
      } else {
        loadTopicHistory(topic);
      }
      // Refresh cross-topic history for the Competitor Map
      fetchMapHistory();
    } catch (err) {
      setError(err.message || 'Citation check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const ownDomain = normalizeDomain(url);

  const competitorMap = useMemo(() => buildCompetitorMap(mapHistory, ownDomain), [mapHistory, ownDomain]);

  async function handleClearHistory() {
    if (!window.confirm('Clear all saved citation checks? This permanently deletes your citation history from your account.')) return;
    try {
      await api.deleteCitationHistory();
      setMapHistory([]);
      setTopicHistory([]);
    } catch (err) {
      setError(err.message || 'Failed to clear citation history.');
    }
  }

  // ── Trend History: group by topic ──────────────────────────────────────
  const trendGroups = useMemo(() => {
    const map = new Map();
    for (const h of mapHistory) {
      const key = (h.topic || '').toLowerCase().trim();
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(h);
    }
    const out = [];
    for (const [, arr] of map) {
      arr.sort((a, b) => new Date(a.checkedAt || a.checked_at) - new Date(b.checkedAt || b.checked_at));
      const latest = arr[arr.length - 1];
      const prev   = arr[arr.length - 2];
      const scoreLatest = latest.alignmentScore ?? latest.alignment_score ?? 0;
      const scorePrev   = prev ? (prev.alignmentScore ?? prev.alignment_score ?? 0) : null;
      const delta  = scorePrev !== null ? scoreLatest - scorePrev : null;
      out.push({
        topic: latest.topic || key,
        latestScore: scoreLatest,
        cited: latest.cited,
        delta,
        spark: arr.map(h => h.alignmentScore ?? h.alignment_score ?? 0),
        checkedAt: latest.checkedAt || latest.checked_at,
        checks: arr.length,
      });
    }
    out.sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt));
    return out;
  }, [mapHistory]);

  return (
    <div className={`${styles.page} fade-in`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Radar className={styles.iconTitle} />
          <h1 className={styles.title}>Citation Monitor</h1>
        </div>
        <p className={styles.sub}>
          Track whether ChatGPT, Perplexity, Gemini, and Google AI Search recommend your brand for the topics that matter to you.
        </p>
      </div>

      <div className={styles.disclaimer}>
        <p className={styles.disclaimerText}>
          <strong>How this works — and its limits.</strong> We query Google Gemini with live Google Search grounding using your exact topic, then check whether your domain appears among the sources Gemini used to generate its answer. This matters now more than ever: Google recently launched AI Search ads that cite sources within AI-generated answers (Google Marketing Live 2026). The <em>cited / not cited</em> result is a real, factual snapshot of what Gemini pulled right now. However: it reflects only one AI model (Gemini) and one query phrasing; different phrasings or models may yield different sources. The alignment score and recommendations come from a second AI analysis pass and are directional, not quantitative. Run checks on multiple topic variations and re-run regularly to track trends — a single check is a data point, not a verdict.
        </p>
      </div>

      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'check'}
          className={`${styles.tab} ${tab === 'check' ? styles.tabActive : ''}`}
          onClick={() => changeTab('check')}
        >
          <Search style={{ width: 14, height: 14 }} /> New Check
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'history'}
          className={`${styles.tab} ${tab === 'history' ? styles.tabActive : ''}`}
          onClick={() => changeTab('history')}
        >
          <Clock style={{ width: 14, height: 14 }} /> Trend History
          {mapHistory.length > 0 && <span className={styles.tabCount}>{trendGroups.length}</span>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'map'}
          className={`${styles.tab} ${tab === 'map' ? styles.tabActive : ''}`}
          onClick={() => changeTab('map')}
        >
          <MapIcon style={{ width: 14, height: 14 }} /> Competitor Map
          {mapHistory.length > 0 && <span className={styles.tabCount}>{mapHistory.length}</span>}
        </button>
      </div>

      {tab === 'map' ? (
        <CompetitorMapView
          map={competitorMap}
          history={mapHistory}
          ownDomain={ownDomain}
          loading={mapLoading}
          onRunCheck={() => changeTab('check')}
          onClearHistory={handleClearHistory}
        />
      ) : tab === 'history' ? (
        <TrendHistoryView
          groups={trendGroups}
          loading={mapLoading}
          onRunCheck={() => changeTab('check')}
          onClearHistory={handleClearHistory}
          onTopicClick={(t) => { setTopic(t); changeTab('check'); }}
        />
      ) : (
        <>
      {!result && (
        <form onSubmit={handleCheck} className={`card ${styles.formCard}`}>
          <label className={styles.label} htmlFor="cm-topic">
            Topic or question
            <span className={styles.labelHint}>What you want AI to recommend you for</span>
          </label>
          <input
            id="cm-topic"
            type="text"
            className={styles.input}
            placeholder="e.g. best AI content optimizer for bloggers"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            maxLength={500}
            required
          />

          <label className={styles.label} htmlFor="cm-url">
            Your website URL
            <span className={styles.labelHint}>Optional — we'll check if your domain appears in cited sources</span>
          </label>
          <input
            id="cm-url"
            type="url"
            className={styles.input}
            placeholder="https://yourdomain.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />

          <div className={styles.formRow}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Checking Gemini…
                </>
              ) : (
                <>
                  <Radar style={{ width: 14, height: 14 }} />
                  Check citations
                </>
              )}
            </button>
            <div className={styles.examples}>
              Try: {EXAMPLE_TOPICS.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.exampleLink}
                  onClick={() => setTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
          {error}
        </div>
      )}

      {result && (
        <div className={styles.resultsWrap}>
          <div className={`card ${styles.resultCard}`}>
            <div className={styles.resultMain}>
              <div className={styles.resultCite}>
                {result.cited ? (
                  <div className={styles.resultCiteGood}>
                    <CheckCircle2 style={{ width: 18, height: 18 }} />
                    <span>Cited</span>
                  </div>
                ) : (
                  <div className={styles.resultCiteBad}>
                    <AlertCircle style={{ width: 18, height: 18 }} />
                    <span>Not cited</span>
                  </div>
                )}
                <div className={styles.resultTopic}>
                  {result.topic || topic}
                </div>
                <div className={styles.resultSummary}>{result.summary}</div>
              </div>
              <div
                className={styles.resultScore}
                style={{ borderColor: scoreColor(result.alignmentScore) }}
              >
                <span
                  className={styles.resultScoreNum}
                  style={{ color: scoreColor(result.alignmentScore) }}
                >
                  {result.alignmentScore}
                </span>
                <span className={styles.resultScoreLabel}>Alignment</span>
              </div>
            </div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div className={`card ${styles.sourcesCard}`}>
              <h3 className={styles.sectionTitle}>
                Sources Gemini cited
                <span className={styles.sectionCount}>{result.sources.length}</span>
              </h3>
              <div className={styles.sourceGrid}>
                {result.sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.sourceItem}
                  >
                    <img
                      src={getFavicon(s.domain)}
                      alt=""
                      className={styles.sourceFavicon}
                      loading="lazy"
                      onError={e => { e.target.style.visibility = 'hidden'; }}
                    />
                    <div className={styles.sourceBody}>
                      <span className={styles.sourceTitle}>{s.title || s.domain}</span>
                      <span className={styles.sourceDomain}>{s.domain}</span>
                    </div>
                    <ExternalLink style={{ width: 12, height: 12, opacity: 0.5, flexShrink: 0 }} />
                  </a>
                ))}
              </div>
              {mapHistory.length >= 2 && (
                <button
                  type="button"
                  className={styles.viewMapLink}
                  onClick={() => changeTab('map')}
                >
                  <MapIcon style={{ width: 12, height: 12 }} />
                  See how these domains compare across all your tracked queries
                </button>
              )}
            </div>
          )}

          {/* AI answer excerpt */}
          {result.answerExcerpt && (
            <div className={`card ${styles.answerCard}`}>
              <h3 className={styles.sectionTitle}>What AI Actually Said</h3>
              <p className={styles.sectionSub}>The grounded answer Gemini gave for your query.</p>
              <blockquote className={styles.answerQuote}>{result.answerExcerpt}</blockquote>
            </div>
          )}

          {/* Previous checks for this topic (backend-driven per-topic timeline) */}
          {topicHistory.length > 1 && (
            <div className={`card ${styles.timelineCard}`}>
              <h3 className={styles.sectionTitle}>
                <HistoryIcon style={{ width: 14, height: 14, marginRight: 6, verticalAlign: '-2px' }} />
                Previous checks for this topic
                <span className={styles.sectionCount}>{topicHistory.length}</span>
              </h3>
              <p className={styles.sectionSub}>
                Track how your alignment score and citation status have changed over time for this query.
              </p>
              <ol className={styles.timelineList}>
                {topicHistory.map((h, i) => {
                  const next = topicHistory[i + 1];
                  const delta = next ? h.alignmentScore - next.alignmentScore : 0;
                  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
                  const trendColor = delta > 0 ? '#22c55e' : delta < 0 ? '#ef4444' : 'var(--text-dim)';
                  return (
                    <li key={h.id ?? i} className={styles.timelineItem}>
                      <div className={styles.timelineDot} style={{ background: scoreColor(h.alignmentScore) }} />
                      <div className={styles.timelineMain}>
                        <div className={styles.timelineRow}>
                          <span className={styles.timelineDate}>
                            {new Date(h.checkedAt).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </span>
                          <span
                            className={styles.timelineStatus}
                            style={{ color: h.cited ? '#22c55e' : 'var(--text-dim)' }}
                          >
                            {h.cited ? 'Cited' : 'Not cited'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.timelineScore} style={{ color: scoreColor(h.alignmentScore) }}>
                        {h.alignmentScore}
                      </div>
                      {next && (
                        <div className={styles.timelineDelta} style={{ color: trendColor }}>
                          <TrendIcon style={{ width: 12, height: 12 }} />
                          {delta > 0 ? `+${delta}` : delta}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className={`card ${styles.recoCard}`}>
              <h3 className={styles.sectionTitle}>Recommendations</h3>
              <p className={styles.sectionSub}>
                Specific actions to {result.cited ? 'protect and extend' : 'earn'} your citation position.
              </p>
              <ul className={styles.recoList}>
                {result.recommendations.map((r, i) => (
                  <li key={i} className={styles.recoItem}>
                    <span className={styles.recoNum}>{i + 1}</span>
                    <span className={styles.recoText}>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Trend History View                                                         */
/* ══════════════════════════════════════════════════════════════════════════ */
function TrendHistoryView({ groups, loading, onRunCheck, onClearHistory, onTopicClick }) {
  if (loading && !groups.length) {
    return (
      <div className={`card ${styles.emptyMap}`}>
        <span className="spinner" />
        <p className={styles.emptyMapDesc} style={{ marginTop: 16 }}>
          Loading your citation history…
        </p>
      </div>
    );
  }
  if (!groups.length) {
    return (
      <div className={`card ${styles.emptyMap}`}>
        <HistoryIcon className={styles.emptyMapIcon} />
        <h3 className={styles.emptyMapTitle}>No citation checks yet</h3>
        <p className={styles.emptyMapDesc}>
          Run checks on the topics you care about to track how your citation status and alignment score trend over time.
        </p>
        <button type="button" className="btn btn-primary" onClick={onRunCheck}>
          <Search style={{ width: 14, height: 14 }} /> Run your first check
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={onClearHistory} style={{
          background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
          padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Trash2 size={12} /> Clear history
        </button>
      </div>

      {groups.map((g, i) => {
        const dUp   = g.delta !== null && g.delta > 0;
        const dDown = g.delta !== null && g.delta < 0;
        const color = scoreColor(g.latestScore);
        return (
          <div key={i} className={`card ${styles.trendRow}`} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', marginBottom: 12, cursor: 'pointer' }}
            onClick={() => onTopicClick(g.topic)}
            onMouseEnter={e => e.currentTarget.style.background = '#060a18'}
            onMouseLeave={e => e.currentTarget.style.background = ''}
          >
            <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontSize: 26, fontWeight: 600, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{g.latestScore}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Alignment</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {g.topic}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {g.cited ? 'Cited' : 'Not cited'} · {g.checks} check{g.checks > 1 ? 's' : ''}
              </div>
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
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Competitor Map View                                                        */
/* ══════════════════════════════════════════════════════════════════════════ */
function CompetitorMapView({ map, history, ownDomain, loading, onRunCheck, onClearHistory }) {
  if (loading && !history.length) {
    return (
      <div className={`card ${styles.emptyMap}`}>
        <span className="spinner" />
        <p className={styles.emptyMapDesc} style={{ marginTop: 16 }}>
          Loading your citation history…
        </p>
      </div>
    );
  }
  if (!history.length) {
    return (
      <div className={`card ${styles.emptyMap}`}>
        <MapIcon className={styles.emptyMapIcon} />
        <h3 className={styles.emptyMapTitle}>No citation checks yet</h3>
        <p className={styles.emptyMapDesc}>
          Run a few citation checks to see which competitor domains AI engines disproportionately favour for your topics.
          Roll-ups across multiple queries reveal the strategic citation targets in your niche.
        </p>
        <button type="button" className="btn btn-primary" onClick={onRunCheck}>
          <Search style={{ width: 14, height: 14 }} /> Run your first check
        </button>
      </div>
    );
  }

  const { totalQueries, domains } = map;
  const topDomain = domains[0];
  const maxCount = topDomain?.queryCount || 1;

  return (
    <div className={`${styles.mapWrap} fade-in`}>
      <div className={styles.mapStatsRow}>
        <div className={styles.mapStat}>
          <div className={styles.mapStatLabel}>Tracked queries</div>
          <div className={styles.mapStatValue}>{totalQueries}</div>
        </div>
        <div className={styles.mapStat}>
          <div className={styles.mapStatLabel}>Unique domains cited</div>
          <div className={styles.mapStatValue}>{domains.length}</div>
        </div>
        <div className={styles.mapStat}>
          <div className={styles.mapStatLabel}>Top competitor</div>
          <div className={styles.mapStatValueSm}>
            {topDomain ? topDomain.domain : '—'}
            {topDomain && (
              <span className={styles.mapStatHint}>
                cited in {topDomain.queryCount}/{totalQueries}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.mapNote}>
        <Info className={styles.mapNoteIcon} />
        <span>
          Synced to your account — {totalQueries} check{totalQueries === 1 ? '' : 's'} saved
          {ownDomain ? `, excluding your domain ${ownDomain}` : ''}.
          {' '}Your map follows you across devices and sessions.
        </span>
      </div>

      <div className={`card ${styles.mapCard}`}>
        <div className={styles.mapCardHeader}>
          <h3 className={styles.sectionTitle}>
            <Trophy style={{ width: 14, height: 14, color: 'var(--accent)' }} />
            Domains dominating your topics
            <span className={styles.sectionCount}>{domains.length}</span>
          </h3>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={onClearHistory}
            title="Permanently delete your saved citation history"
          >
            <Trash2 style={{ width: 12, height: 12 }} /> Clear history
          </button>
        </div>
        <p className={styles.sectionSub}>
          Aggregated across all your saved citation checks — ranked by how many of your queries each domain
          appears in. Earning a mention or guest post on the top domains is the highest-leverage path to
          AI citations in your niche.
        </p>

        {domains.length === 0 ? (
          <p className={styles.mapEmptyInner}>
            No competitor domains found yet — your saved checks haven't returned any external sources.
          </p>
        ) : (
          <ul className={styles.domainList}>
            {domains.map((d, i) => {
              const widthPct = Math.max(8, Math.round((d.queryCount / maxCount) * 100));
              const coveragePct = Math.round(d.coverage * 100);
              return (
                <li key={d.domain} className={styles.domainItem}>
                  <div className={styles.domainRank}>{i + 1}</div>
                  <img
                    className={styles.domainFavicon}
                    src={getFavicon(d.domain)}
                    alt=""
                    loading="lazy"
                    onError={e => { e.target.style.visibility = 'hidden'; }}
                  />
                  <div className={styles.domainBody}>
                    <div className={styles.domainHeadRow}>
                      <a
                        href={d.sampleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.domainName}
                      >
                        {d.domain}
                        <ExternalLink style={{ width: 11, height: 11 }} />
                      </a>
                      <div className={styles.domainMetrics}>
                        <span className={styles.metric} title="Queries citing this domain">
                          <strong>{d.queryCount}</strong>/{totalQueries} queries
                        </span>
                        <span className={styles.metricDot}>·</span>
                        <span className={styles.metric} title="Average rank in cited sources">
                          avg rank <strong>{d.avgRank}</strong>
                        </span>
                        {d.bestRank && (
                          <>
                            <span className={styles.metricDot}>·</span>
                            <span className={styles.metric} title="Best position seen">
                              best #<strong>{d.bestRank}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={styles.domainBarWrap}>
                      <div
                        className={styles.domainBar}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <div className={styles.domainMeta}>
                      <span className={styles.domainMetaLabel}>
                        appears in {coveragePct}% of your tracked queries
                      </span>
                      {d.sampleUrl && (
                        <span className={styles.domainMetaLink}>
                          cited page: <a href={d.sampleUrl} target="_blank" rel="noopener noreferrer">{d.sampleTitle || 'View'}</a>
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
