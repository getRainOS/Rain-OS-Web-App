import { useState, useEffect, useMemo, lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import {
  Radar, ExternalLink, CheckCircle2, AlertCircle,
  Map as MapIcon, Trophy, Trash2, Info, Globe,
  History as HistoryIcon,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { buildCompetitorMap } from '../lib/citationHistory.js';
import styles from './CitationMonitor.module.css';

// Lazy: react-simple-maps + d3-geo only need to load for whoever actually
// has region data to render, not on every page in the app.
const CitationWorldMap = lazy(() => import('../components/CitationWorldMap.jsx'));

const EXAMPLE_TOPICS = [
  'best AI content optimizer for bloggers',
  'how to improve AEO for a SaaS landing page',
  'what is answer engine optimization',
];

const RECENT_PAGE_SIZE = 10;

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
  const { refreshUser } = useApp();
  const formRef = useRef(null);

  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  // Cross-topic citation history from the backend (drives the Competitor Map + Recent Analyses)
  const [mapHistory, setMapHistory] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  // Backend per-topic timeline (drives "Previous checks for this topic")
  const [topicHistory, setTopicHistory] = useState([]);
  const [visibleCount, setVisibleCount] = useState(RECENT_PAGE_SIZE);

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

  // Load cross-topic history from the backend on mount
  useEffect(() => {
    fetchMapHistory();
  }, []);

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
    if (!name.trim() || !topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.citationCheck({ name: name.trim(), topic: topic.trim(), url: url.trim() || undefined });
      setResult(data);
      // Prefer the per-topic history payload that came back with the check; fall back to a fetch.
      if (Array.isArray(data?.history) && data.history.length > 0) {
        setTopicHistory(data.history);
      } else {
        loadTopicHistory(topic);
      }
      // Refresh cross-topic history for the Competitor Map + Recent Analyses
      fetchMapHistory();
      refreshUser();
    } catch (err) {
      setError(err.message || 'Citation check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handlePickRecent(h) {
    setName(h.name || '');
    setTopic(h.topic || '');
    setUrl(h.url || '');
    setResult(null);
    setError('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleExampleClick(t) {
    setTopic(t);
    if (!name.trim()) {
      setName(t.length > 48 ? `${t.slice(0, 45)}…` : t);
    }
  }

  const ownDomain = normalizeDomain(url);

  // Most competitor domains use generic TLDs (.com, .io) that carry no
  // geographic signal, so TLD inference alone leaves the map mostly empty.
  // Once we know which domains TLD inference couldn't place, we ask the
  // backend (Gemini HQ lookup, cached server-side) for just those — results
  // land here and override the TLD guess on the next render.
  const [resolvedCountries, setResolvedCountries] = useState(() => new Map());

  const competitorMap = useMemo(
    () => buildCompetitorMap(mapHistory, ownDomain, resolvedCountries),
    [mapHistory, ownDomain, resolvedCountries]
  );

  useEffect(() => {
    const needsLookup = competitorMap.domains
      .filter(d => d.country === null && !resolvedCountries.has(d.domain))
      .map(d => d.domain);
    if (needsLookup.length === 0) return;
    let cancelled = false;
    api.resolveDomainCountries(needsLookup)
      .then(({ data }) => {
        if (cancelled || !data?.domains) return;
        setResolvedCountries(prev => {
          const next = new Map(prev);
          for (const [domain, country] of Object.entries(data.domains)) {
            next.set(domain, country);
          }
          return next;
        });
      })
      .catch(() => {
        // Best-effort only — the map still works with TLD-only inference.
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitorMap.domains]);

  async function handleClearHistory() {
    if (!window.confirm('Clear all saved citation checks? This permanently deletes your citation history from your account.')) return;
    try {
      await api.deleteCitationHistory();
      setMapHistory([]);
      setTopicHistory([]);
      setVisibleCount(RECENT_PAGE_SIZE);
    } catch (err) {
      setError(err.message || 'Failed to clear citation history.');
    }
  }

  const recentAnalyses = useMemo(() => {
    return [...mapHistory].sort((a, b) =>
      new Date(b.checkedAt || b.checked_at) - new Date(a.checkedAt || a.checked_at)
    );
  }, [mapHistory]);

  const hasMapDetail = competitorMap.domains.length > 0 || competitorMap.regions.length > 0;

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

      <div className={styles.workspace}>
        <div className={styles.formColumn} ref={formRef}>
          <form onSubmit={handleCheck} className={`card ${styles.formCard}`}>
            <label className={styles.label} htmlFor="cm-name">
              Analysis name
              <span className={styles.labelHint}>Required — so you can find this check again later.</span>
            </label>
            <input
              id="cm-name"
              type="text"
              className={styles.input}
              placeholder="e.g. Blog AEO guide — Q1 check"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={120}
              required
            />

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
                    onClick={() => handleExampleClick(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
              {error}
            </div>
          )}

          {result && (
            <div className={styles.resultsWrap}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => { setResult(null); setError(''); }}
              >
                ← Dismiss result
              </button>
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
                    <div className={styles.resultName}>{result.name || name}</div>
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
        </div>

        <div className={styles.mapColumn}>
          <MapSummaryPanel map={competitorMap} history={mapHistory} loading={mapLoading} />
        </div>
      </div>

      {hasMapDetail && (
        <MapDetailSection map={competitorMap} />
      )}

      <RecentAnalysesSection
        analyses={recentAnalyses}
        loading={mapLoading}
        visibleCount={visibleCount}
        onShowMore={() => setVisibleCount(v => v + RECENT_PAGE_SIZE)}
        onClearHistory={handleClearHistory}
        onSelect={handlePickRecent}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Recent Analyses                                                            */
/* ══════════════════════════════════════════════════════════════════════════ */
function RecentAnalysesSection({ analyses, loading, visibleCount, onShowMore, onClearHistory, onSelect }) {
  if (loading && !analyses.length) {
    return (
      <div className={`card ${styles.emptyMap}`} style={{ marginTop: 20 }}>
        <span className="spinner" />
        <p className={styles.emptyMapDesc} style={{ marginTop: 16 }}>
          Loading your recent analyses…
        </p>
      </div>
    );
  }

  const visible = analyses.slice(0, visibleCount);

  return (
    <div className={styles.recentSection}>
      <div className={styles.recentHeader}>
        <h3 className={styles.sectionTitle}>
          <HistoryIcon style={{ width: 14, height: 14 }} />
          Recent analyses
          {analyses.length > 0 && <span className={styles.sectionCount}>{analyses.length}</span>}
        </h3>
        {analyses.length > 0 && (
          <button type="button" className={styles.clearBtn} onClick={onClearHistory}>
            <Trash2 size={12} /> Clear analyses
          </button>
        )}
      </div>

      {analyses.length === 0 ? (
        <div className={`card ${styles.emptyMap}`}>
          <HistoryIcon className={styles.emptyMapIcon} />
          <h3 className={styles.emptyMapTitle}>No analyses yet</h3>
          <p className={styles.emptyMapDesc}>
            Run a named check above and it'll show up here, ready to revisit or re-run anytime.
          </p>
        </div>
      ) : (
        <>
          {visible.map((h) => (
            <div
              key={h.id}
              className={`card ${styles.trendRow}`}
              onClick={() => onSelect(h)}
            >
              <div className={styles.trendStatus}>
                {h.cited
                  ? <CheckCircle2 style={{ width: 22, height: 22, color: 'var(--green)' }} />
                  : <AlertCircle style={{ width: 22, height: 22, color: 'var(--red)' }} />}
                <div className={styles.trendStatusLabel}>{h.cited ? 'Cited' : 'Not cited'}</div>
              </div>
              <div className={styles.trendBody}>
                <div className={styles.trendTopic}>{h.name || h.topic}</div>
                <div className={styles.trendMeta}>{h.topic}</div>
              </div>
              <div className={styles.trendTime}>{timeAgo(h.checkedAt || h.checked_at)}</div>
            </div>
          ))}

          {analyses.length > visibleCount && (
            <button type="button" className={styles.showMoreBtn} onClick={onShowMore}>
              Show {Math.min(RECENT_PAGE_SIZE, analyses.length - visibleCount)} more analyses
            </button>
          )}
        </>
      )}
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

/* ── Decorative "what this will look like" visual for the map empty state ── */
function MapEmptyViz() {
  const dots = [
    { x: 18, y: 58, big: false },
    { x: 34, y: 34, big: true },
    { x: 48, y: 68, big: false },
    { x: 62, y: 46, big: false },
    { x: 78, y: 26, big: true },
    { x: 88, y: 56, big: false },
  ];
  return (
    <svg viewBox="0 0 100 78" className={styles.richEmptyMapViz} aria-hidden="true">
      <line x1="6" y1="72" x2="96" y2="72" stroke="var(--border)" strokeWidth="1" />
      <line x1="6" y1="6" x2="6" y2="72" stroke="var(--border)" strokeWidth="1" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.big ? 3.5 : 2.5} fill="var(--text)" opacity={d.big ? 0.4 : 0.22} />
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Competitor Map — compact summary panel (sits next to the form)            */
/* ══════════════════════════════════════════════════════════════════════════ */
function MapSummaryPanel({ map, history, loading }) {
  if (loading && !history.length) {
    return (
      <div className={`card ${styles.mapSummaryCard} ${styles.emptyMap}`}>
        <span className="spinner" />
        <p className={styles.emptyMapDesc} style={{ marginTop: 16 }}>
          Loading your citation map…
        </p>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className={`card ${styles.mapSummaryCard} ${styles.richEmptyMap}`}>
        <MapEmptyViz />
        <MapIcon className={styles.emptyMapIcon} />
        <h3 className={styles.emptyMapTitle}>Your competitor map starts here</h3>
        <p className={styles.emptyMapDesc}>
          Run your first named check on the left. Every topic you track plots the domains Gemini cites
          instead of you — so you can see exactly who's winning the citations you want.
        </p>
      </div>
    );
  }

  const { totalQueries, domains, ownPoint } = map;
  const topDomain = domains[0];

  const scatterData = domains.map(d => ({
    domain: d.domain,
    x: Math.round(d.coverage * 1000) / 10,
    y: d.avgRank,
  }));
  const ownScatterData = ownPoint
    ? [{ domain: ownPoint.domain, x: Math.round(ownPoint.coverage * 1000) / 10, y: ownPoint.avgRank, isOwn: true }]
    : [];

  return (
    <div className={`card ${styles.mapSummaryCard}`}>
      <h3 className={styles.sectionTitle}>
        <MapIcon style={{ width: 14, height: 14, color: 'var(--text)' }} />
        Competitor Map
        <span className={styles.sectionCount}>{domains.length}</span>
      </h3>

      <div className={styles.mapStatsRow}>
        <div className={styles.mapStat}>
          <div className={styles.mapStatLabel}>Tracked queries</div>
          <div className={styles.mapStatValue}>{totalQueries}</div>
        </div>
        <div className={styles.mapStat}>
          <div className={styles.mapStatLabel}>Domains cited</div>
          <div className={styles.mapStatValue}>{domains.length}</div>
        </div>
        <div className={styles.mapStat}>
          <div className={styles.mapStatLabel}>Top competitor</div>
          <div className={styles.mapStatValueSm}>
            {topDomain ? topDomain.domain : '—'}
          </div>
        </div>
      </div>

      {(domains.length > 0 || ownScatterData.length > 0) && (
        <div className={styles.scatterWrap}>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 16, right: 16, bottom: 20, left: 4 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 100]}
                stroke="transparent"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                reversed
                stroke="transparent"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
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
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Competitor Map — full-width detail (domain list + regional breakdown)     */
/* ══════════════════════════════════════════════════════════════════════════ */
function MapDetailSection({ map }) {
  const { totalQueries, domains, regions, unknownCount } = map;
  const maxCount = domains[0]?.queryCount || 1;

  return (
    <div className={`${styles.mapWrap} fade-in`}>
      {domains.length > 0 && (
        <div className={`card ${styles.mapCard}`}>
          <div className={styles.mapCardHeader}>
            <h3 className={styles.sectionTitle}>
              <Trophy style={{ width: 14, height: 14, color: 'var(--text)' }} />
              Domains dominating your topics
              <span className={styles.sectionCount}>{domains.length}</span>
            </h3>
          </div>
          <p className={styles.sectionSub}>
            Aggregated across all your saved citation checks — ranked by how many of your queries each domain
            appears in. Earning a mention or guest post on the top domains is the highest-leverage path to
            AI citations in your niche.
          </p>

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
        </div>
      )}

      {regions.length > 0 && (
        <div className={`card ${styles.mapCard}`}>
          <div className={styles.mapCardHeader}>
            <h3 className={styles.sectionTitle}>
              <Globe style={{ width: 14, height: 14, color: 'var(--text)' }} />
              Where citations come from
              <span className={styles.sectionCount}>{regions.length}</span>
            </h3>
          </div>
          <p className={styles.sectionSub}>
            Inferred from competitor domains' country-code TLDs (e.g. .de, .jp) — most domains use generic
            TLDs like .com that carry no geographic signal, so this is a partial, directional read, not a
            full regional breakdown.
          </p>
          <Suspense fallback={<div className={styles.mapLoadingFallback}><span className="spinner" /></div>}>
            <CitationWorldMap regions={regions} unknownCount={unknownCount} />
          </Suspense>
          <ul className={styles.regionList}>
            {regions.map(r => {
              const widthPct = Math.max(8, Math.round((r.queryCount / regions[0].queryCount) * 100));
              return (
                <li key={r.name} className={styles.regionItem}>
                  <span className={styles.regionFlag}>{r.flag}</span>
                  <div className={styles.regionBody}>
                    <div className={styles.regionHeadRow}>
                      <span className={styles.regionName}>{r.name}</span>
                      <span className={styles.regionCount}>{r.domainCount} domain{r.domainCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className={styles.domainBarWrap}>
                      <div className={styles.domainBar} style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
