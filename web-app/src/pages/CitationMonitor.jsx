import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import {
  Radar, Search, ExternalLink, CheckCircle2, AlertCircle,
  Map as MapIcon, Trophy, Trash2, Info,
  History as HistoryIcon,
  Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { buildCompetitorMap } from '../lib/citationHistory.js';
import styles from './CitationMonitor.module.css';

const EXAMPLE_TOPICS = [
  'best AI content optimizer for bloggers',
  'how to improve AEO for a SaaS landing page',
  'what is answer engine optimization',
];

/* ── Collapsible Disclaimer ─────────────────────────────────────────────── */
function DisclaimerBlock() {
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
      {!collapsed && <p className={styles.disclaimerText} style={{ marginTop: 8 }}>We check real Google Search grounding — live data from the search engine that still handles the vast majority of how people (and increasingly, AI systems) find businesses like yours. Not a simulation, not a guess: this is what Google's AI can actually find and say about you right now. We query Google Gemini with live Google Search grounding using your exact topic, then check whether your domain appears among the sources Gemini used to generate its answer. This matters now more than ever: Google recently launched AI Search ads that cite sources within AI-generated answers (Google Marketing Live 2026). The <em>cited / not cited</em> result is a real, factual snapshot of what Gemini pulled right now. However: it reflects only one AI model (Gemini) and one query phrasing; different phrasings or models may yield different sources. Run checks on multiple topic variations and re-run regularly to track trends — a single check is a data point, not a verdict.</p>}
    </div>
  );
}

/* ── Collapsible "What does this mean?" ──────────────────────────────────── */
function WhatDoesThisMeanBlock() {
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
      {!collapsed && <p className={styles.disclaimerText} style={{ marginTop: 8 }}>We ask Gemini your exact question and look at the sources it actually cites in its answer. "Cited" or "Not cited" reflects that one real answer, at that moment — not a guess, and not a lasting rank. AI answers can shift from one search to the next, so think of each check as a snapshot of how you're showing up right now, worth tracking over time rather than judging on a single result.</p>}
    </div>
  );
}

function getFavicon(domain) {
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
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
      out.push({
        topic: latest.topic || key,
        cited: latest.cited,
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
        <p className={styles.tagline}>A real check against live AI answers — not a prediction.</p>
        <p className={styles.sub}>
          See whether Gemini cites your brand for the topics that matter to you — powered by real Google Search grounding, not a simulation.
        </p>
      </div>

      <WhatDoesThisMeanBlock />
      <DisclaimerBlock />

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
            Question or Prompt to Be Cited For
            <span className={styles.labelHint}>The exact question or prompt you want AI to cite your site for when answering.</span>
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
                {!result.url ? (
                  <div className={styles.resultCiteNeutral}>
                    <Info style={{ width: 18, height: 18 }} />
                    <span>Enter your website above to check citation status</span>
                  </div>
                ) : result.cited ? (
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
                {result.url && !result.cited && (
                  <Link to={`/url-scanner?url=${encodeURIComponent(result.url)}`} className={styles.urlScannerCta}>
                    Check what your page needs in URL Scanner →
                  </Link>
                )}
                <div className={styles.resultTopic}>
                  {result.topic || topic}
                </div>
                <div className={styles.resultSummary}>{result.summary}</div>
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
                Track how your citation status has changed over time for this query.
              </p>
              <ol className={styles.timelineList}>
                {topicHistory.map((h, i) => (
                  <li key={h.id ?? i} className={styles.timelineItem}>
                    <div className={styles.timelineDot} style={{ background: h.cited ? 'var(--green)' : 'var(--red)' }} />
                    <div className={styles.timelineMain}>
                      <div className={styles.timelineRow}>
                        <span className={styles.timelineDate}>
                          {new Date(h.checkedAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </span>
                        <span
                          className={styles.timelineStatus}
                          style={{ color: h.cited ? 'var(--green)' : 'var(--red)' }}
                        >
                          {h.cited ? 'Cited' : 'Not cited'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
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
          Run checks on the topics you care about to track how your citation status changes over time.
        </p>
        <button type="button" className="btn btn-primary" onClick={onRunCheck}>
          <Search style={{ width: 14, height: 14 }} /> Run your first check
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className={styles.trendActions}>
        <button type="button" className={styles.clearBtn} onClick={onClearHistory}>
          <Trash2 size={12} /> Clear history
        </button>
      </div>

      {groups.map((g, i) => (
        <div
          key={i}
          className={`card ${styles.trendRow}`}
          onClick={() => onTopicClick(g.topic)}
        >
          <div className={styles.trendStatus}>
            {g.cited
              ? <CheckCircle2 style={{ width: 22, height: 22, color: 'var(--green)' }} />
              : <AlertCircle style={{ width: 22, height: 22, color: 'var(--red)' }} />}
            <div className={styles.trendStatusLabel}>{g.cited ? 'Cited' : 'Not cited'}</div>
          </div>
          <div className={styles.trendBody}>
            <div className={styles.trendTopic}>{g.topic}</div>
            <div className={styles.trendMeta}>
              {g.checks} check{g.checks > 1 ? 's' : ''}
            </div>
          </div>
          <div className={styles.trendTime}>{timeAgo(g.checkedAt)}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Competitor scatter tooltip ──────────────────────────────────────────── */
function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.scatterTooltip}>
      <div className={styles.scatterTooltipDomain}>
        {d.domain}{d.isOwn ? ' (you)' : ''}
      </div>
      <div className={styles.scatterTooltipStat}>{d.x}% of tracked queries</div>
      <div className={styles.scatterTooltipStat}>avg rank {d.y}</div>
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

  const { totalQueries, domains, ownPoint } = map;
  const topDomain = domains[0];
  const maxCount = topDomain?.queryCount || 1;

  const scatterData = domains.map(d => ({
    domain: d.domain,
    x: Math.round(d.coverage * 1000) / 10,
    y: d.avgRank,
  }));
  const ownScatterData = ownPoint
    ? [{ domain: ownPoint.domain, x: Math.round(ownPoint.coverage * 1000) / 10, y: ownPoint.avgRank, isOwn: true }]
    : [];

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

        {(domains.length > 0 || ownScatterData.length > 0) && (
          <div className={styles.scatterWrap}>
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ top: 16, right: 24, bottom: 24, left: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0, 100]}
                  stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: '% of tracked queries', position: 'insideBottom', offset: -16, fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  reversed
                  stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Avg rank (lower = better)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                />
                <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.15)' }} />
                <Scatter name="Competitors" data={scatterData} fill="var(--accent)" />
                {ownScatterData.length > 0 && (
                  <Scatter name="You" data={ownScatterData} fill="var(--text)" shape="star" />
                )}
              </ScatterChart>
            </ResponsiveContainer>
            {ownScatterData.length > 0 && (
              <div className={styles.scatterLegend}>
                <span className={styles.scatterLegendDot} style={{ background: 'var(--accent)' }} />
                Competitors
                <span className={styles.scatterLegendDot} style={{ background: 'var(--text)', marginLeft: 14 }} />
                You
              </div>
            )}
          </div>
        )}

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
