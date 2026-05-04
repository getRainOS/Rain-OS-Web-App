import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import {
  Radar, Search, ExternalLink, CheckCircle2, AlertCircle,
  Map as MapIcon, Trophy, Trash2, Info,
  History as HistoryIcon, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import {
  loadCitationHistory,
  saveCitationCheck,
  clearCitationHistory,
  buildCompetitorMap,
} from '../lib/citationHistory.js';
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

const DEMO_SEED = [
  {
    topic: 'best AI content optimizer for bloggers',
    url: 'https://getrainos.com',
    cited: false,
    citedSourceIndex: null,
    alignmentScore: 58,
    sources: [
      { title: 'Top 10 AI Writing Tools for Bloggers', url: 'https://www.searchenginejournal.com/ai-writing-tools-bloggers/', domain: 'searchenginejournal.com' },
      { title: 'Surfer vs Frase vs Clearscope', url: 'https://www.semrush.com/blog/content-optimizer-comparison/', domain: 'semrush.com' },
      { title: 'How AI Picks Citations', url: 'https://blog.hubspot.com/marketing/ai-search-citation', domain: 'blog.hubspot.com' },
      { title: 'AEO 101', url: 'https://ahrefs.com/blog/answer-engine-optimization/', domain: 'ahrefs.com' },
    ],
    competitorDomains: ['searchenginejournal.com', 'semrush.com', 'blog.hubspot.com', 'ahrefs.com'],
  },
  {
    topic: 'how to improve AEO for a SaaS landing page',
    url: 'https://getrainos.com',
    cited: false,
    citedSourceIndex: null,
    alignmentScore: 62,
    sources: [
      { title: 'AEO for SaaS', url: 'https://blog.hubspot.com/marketing/aeo-saas', domain: 'blog.hubspot.com' },
      { title: 'Optimizing for AI Answers', url: 'https://ahrefs.com/blog/aeo-saas-landing/', domain: 'ahrefs.com' },
      { title: 'Schema Markup for SaaS', url: 'https://www.semrush.com/blog/saas-schema/', domain: 'semrush.com' },
      { title: 'Landing Page AEO Audit', url: 'https://moz.com/blog/landing-page-aeo', domain: 'moz.com' },
    ],
    competitorDomains: ['blog.hubspot.com', 'ahrefs.com', 'semrush.com', 'moz.com'],
  },
  {
    topic: 'what is answer engine optimization',
    url: 'https://getrainos.com',
    cited: false,
    citedSourceIndex: null,
    alignmentScore: 55,
    sources: [
      { title: 'Answer Engine Optimization Guide', url: 'https://blog.hubspot.com/marketing/aeo-guide', domain: 'blog.hubspot.com' },
      { title: 'Defining AEO', url: 'https://searchengineland.com/what-is-aeo', domain: 'searchengineland.com' },
      { title: 'AEO vs SEO', url: 'https://ahrefs.com/blog/aeo-vs-seo/', domain: 'ahrefs.com' },
      { title: 'AEO Strategy Playbook', url: 'https://www.gartner.com/en/articles/aeo-playbook', domain: 'gartner.com' },
    ],
    competitorDomains: ['blog.hubspot.com', 'searchengineland.com', 'ahrefs.com', 'gartner.com'],
  },
];

export default function CitationMonitor() {
  const { isDemo, refreshUser, user, apiKey } = useApp();
  const scope = isDemo ? '__demo__' : (user?.id || apiKey || 'anon');

  const [tab, setTab] = useState('check');
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  // Local cross-topic history (drives the Competitor Map)
  const [mapHistory, setMapHistory] = useState([]);
  // Backend per-topic timeline (drives "Previous checks for this topic")
  const [topicHistory, setTopicHistory] = useState([]);

  // Load local map history (and seed demo if needed) on mount / scope change
  useEffect(() => {
    let h = loadCitationHistory(scope);
    if (isDemo && h.length === 0) {
      let next = h;
      DEMO_SEED.forEach(seed => { next = saveCitationCheck(scope, seed); });
      h = next;
    }
    setMapHistory(h);
  }, [scope, isDemo]);

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
      // Persist to local store for the cross-topic Competitor Map
      const next = saveCitationCheck(scope, data);
      setMapHistory(next);
      // Prefer the per-topic history payload that came back with the check; fall back to a fetch.
      if (Array.isArray(data?.history) && data.history.length > 0) {
        setTopicHistory(data.history);
      } else {
        loadTopicHistory(data?.topic || topic.trim());
      }
      refreshUser?.();
    } catch (err) {
      setError(err.message || 'Citation check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleExample(t) {
    setTopic(t);
    setResult(null);
    setError('');
  }

  function handleReset() {
    setResult(null);
    setError('');
    setTopicHistory([]);
  }

  function handleClearHistory() {
    if (!window.confirm('Clear all saved citation checks? This only removes locally stored history in this browser.')) return;
    clearCitationHistory(scope);
    setMapHistory([]);
  }

  const ownDomain = useMemo(() => {
    const fromHistory = mapHistory.find(h => h.url)?.url;
    return normalizeDomain(url) || normalizeDomain(fromHistory);
  }, [url, mapHistory]);

  const competitorMap = useMemo(
    () => buildCompetitorMap(mapHistory, ownDomain),
    [mapHistory, ownDomain]
  );

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Radar className={styles.titleIcon} />
          <h1 className={styles.title}>Citation Monitor</h1>
          <span className={styles.newBadge}>NEW</span>
        </div>
        <p className={styles.sub}>
          When someone asks an AI engine about your topic, does your content get cited?
          We run the query through Gemini with live Google Search grounding and show you the real sources AI is citing — and how to get yours among them.
        </p>
      </div>

      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'check'}
          className={`${styles.tab} ${tab === 'check' ? styles.tabActive : ''}`}
          onClick={() => setTab('check')}
        >
          <Search style={{ width: 14, height: 14 }} /> New Check
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'map'}
          className={`${styles.tab} ${tab === 'map' ? styles.tabActive : ''}`}
          onClick={() => setTab('map')}
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
          onRunCheck={() => setTab('check')}
          onClearHistory={handleClearHistory}
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
            type="text"
            className={styles.input}
            placeholder="https://yoursite.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />

          <div className={styles.examples}>
            <span className={styles.examplesLabel}>Try:</span>
            {EXAMPLE_TOPICS.map(t => (
              <button
                key={t}
                type="button"
                className={styles.exampleChip}
                onClick={() => handleExample(t)}
                disabled={loading}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading || !topic.trim()}
          >
            {loading
              ? <><span className="spinner" /> Checking citations…</>
              : <><Search style={{ width: 14, height: 14 }} /> Check Citations</>}
          </button>

          {error && <p className={styles.error}>{error}</p>}

          {isDemo && (
            <p className={styles.demoNote}>
              Demo mode — results are illustrative. Sign in to run real grounded citation checks.
            </p>
          )}
        </form>
      )}

      {result && (
        <div className={`${styles.results} fade-in`}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>"{result.topic}"</h2>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resultsUrl}
                >
                  {result.url} <ExternalLink style={{ width: 11, height: 11 }} />
                </a>
              )}
            </div>
            <button onClick={handleReset} className="btn btn-ghost">
              ← New Check
            </button>
          </div>

          {/* Citation status banner */}
          <div
            className={styles.statusBanner}
            style={{
              background: result.cited ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
              borderColor: result.cited ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)',
            }}
          >
            {result.cited ? (
              <>
                <CheckCircle2 className={styles.statusIcon} style={{ color: '#22c55e' }} />
                <div>
                  <div className={styles.statusTitle} style={{ color: '#22c55e' }}>
                    Your domain is being cited
                  </div>
                  <div className={styles.statusDesc}>
                    AI cited your site as source #{(result.citedSourceIndex ?? 0) + 1} for this query.
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className={styles.statusIcon} style={{ color: '#ef4444' }} />
                <div>
                  <div className={styles.statusTitle} style={{ color: '#ef4444' }}>
                    {result.url ? 'Your domain is not cited' : 'No domain provided'}
                  </div>
                  <div className={styles.statusDesc}>
                    {result.url
                      ? `AI is currently citing ${result.sources.length} other source${result.sources.length === 1 ? '' : 's'} for this query — see the gap analysis below.`
                      : 'Add your URL above to check whether your domain appears in the cited sources.'}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Alignment score */}
          <div className={`card ${styles.scoreCard}`}>
            <div className={styles.scoreHeader}>
              <div>
                <h3 className={styles.scoreLabel}>Citation Alignment Score</h3>
                <p className={styles.scoreSub}>How well-positioned you are to be cited for this query</p>
              </div>
              <div className={styles.scoreValue} style={{ color: scoreColor(result.alignmentScore) }}>
                {result.alignmentScore}
                <span className={styles.scoreOutOf}>/100</span>
              </div>
            </div>
            <div className={styles.scoreTrack}>
              <div
                className={styles.scoreFill}
                style={{
                  width: `${result.alignmentScore}%`,
                  background: scoreColor(result.alignmentScore),
                }}
              />
            </div>
            {result.summary && <p className={styles.scoreSummary}>{result.summary}</p>}
          </div>

          {/* Sources cited */}
          {result.sources.length > 0 && (
            <div className={`card ${styles.sourcesCard}`}>
              <h3 className={styles.sectionTitle}>
                Sources AI Cited
                <span className={styles.sectionCount}>{result.sources.length}</span>
              </h3>
              <p className={styles.sectionSub}>
                These are the actual sources Gemini retrieved via Google Search to answer your query.
              </p>
              <div className={styles.sourcesList}>
                {result.sources.map((s, i) => {
                  const isUserSource = i === result.citedSourceIndex;
                  return (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.sourceItem} ${isUserSource ? styles.sourceItemSelf : ''}`}
                    >
                      <div className={styles.sourceRank}>{i + 1}</div>
                      <img
                        className={styles.sourceFavicon}
                        src={getFavicon(s.domain)}
                        alt=""
                        loading="lazy"
                        onError={e => { e.target.style.visibility = 'hidden'; }}
                      />
                      <div className={styles.sourceContent}>
                        <div className={styles.sourceTitleRow}>
                          <span className={styles.sourceTitle}>{s.title}</span>
                          {isUserSource && <span className={styles.youBadge}>YOU</span>}
                        </div>
                        <div className={styles.sourceDomain}>{s.domain}</div>
                        {s.snippet && <p className={styles.sourceSnippet}>"{s.snippet}"</p>}
                      </div>
                      <ExternalLink className={styles.sourceExternal} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Competitor gap analysis — competitor domains being cited instead of you */}
          {!result.cited && result.competitorDomains?.length > 0 && (
            <div className={`card ${styles.gapCard}`}>
              <h3 className={styles.sectionTitle}>
                {result.url ? 'Competitor Gap' : 'Who Owns This Topic'}
                <span className={styles.sectionCount}>{result.competitorDomains.length}</span>
              </h3>
              <p className={styles.sectionSub}>
                {result.url
                  ? `These domains are being cited for this query instead of yours. Earning citations from them, or out-ranking them with similar content, is your most direct path to inclusion.`
                  : `These domains dominate AI citations for this query. They define the competitive bar for content.`}
              </p>
              <div className={styles.gapList}>
                {result.competitorDomains.map((domain, i) => {
                  const matchingSource = result.sources.find(s => s.domain === domain);
                  return (
                    <a
                      key={domain + i}
                      href={matchingSource?.url || `https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.gapItem}
                    >
                      <img
                        className={styles.gapFavicon}
                        src={getFavicon(domain)}
                        alt=""
                        loading="lazy"
                        onError={e => { e.target.style.visibility = 'hidden'; }}
                      />
                      <span className={styles.gapDomain}>{domain}</span>
                      <ExternalLink className={styles.gapExternal} />
                    </a>
                  );
                })}
              </div>
              {mapHistory.length >= 2 && (
                <button
                  type="button"
                  className={styles.viewMapLink}
                  onClick={() => setTab('map')}
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

function CompetitorMapView({ map, history, ownDomain, onRunCheck, onClearHistory }) {
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
          History is stored locally in this browser ({totalQueries} check{totalQueries === 1 ? '' : 's'} saved
          {ownDomain ? `, excluding your domain ${ownDomain}` : ''}).
          {' '}Once persistent history ships, this map will follow you across devices.
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
            title="Clear locally stored citation history"
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
                    <div className={styles.coverageTrack}>
                      <div
                        className={styles.coverageFill}
                        style={{ width: `${widthPct}%` }}
                      />
                      <span className={styles.coverageLabel}>{coveragePct}% topic coverage</span>
                    </div>
                    <p className={styles.domainInsight}>{d.insight}</p>
                    {d.topics.length > 0 && (
                      <div className={styles.topicChips}>
                        {d.topics.slice(0, 4).map(t => (
                          <span key={t} className={styles.topicChip} title={t}>
                            {t.length > 60 ? t.slice(0, 57) + '…' : t}
                          </span>
                        ))}
                        {d.topics.length > 4 && (
                          <span className={styles.topicChipMore}>+{d.topics.length - 4} more</span>
                        )}
                      </div>
                    )}
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
