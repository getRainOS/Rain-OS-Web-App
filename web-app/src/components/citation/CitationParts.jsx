import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, CheckCircle2, AlertCircle, Map as MapIcon, Trophy, Trash2, Globe, Layers, History as HistoryIcon, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TabEmpty } from '../MonitorTabs.jsx';
import { isSharedPlatform } from '../../lib/sharedPlatforms.js';
import { TrackWeeklyButton } from '../TrackedQueries.jsx';
import styles from '../../pages/CitationMonitor.module.css';

export const CitationWorldMap = lazy(() => import('../CitationWorldMap.jsx'));

export const EXAMPLE_TOPICS = [
  'best AI content optimizer for bloggers',
  'how to improve AEO for a SaaS landing page',
  'what is answer engine optimization',
];

export const LOCAL_EXAMPLE_TOPICS = [
  'best wedding cake bakery in Austin',
  'emergency plumber in Denver open on weekends',
  'family dentist in Columbus that takes new patients',
];

export const RECENT_PAGE_SIZE = 10;

export function topicKey(t) {
  return (t || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getFavicon(domain) {
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export function normalizeDomain(input) {
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

export function ownPositionOf(entry) {
  const sources = Array.isArray(entry?.sources) ? entry.sources : [];
  const own = normalizeDomain(entry?.url || '');
  // A page on a shared platform (facebook.com...) cannot be matched to a cited source.
  if (!own || isSharedPlatform(own)) return { hasUrl: false, rank: null, total: sources.length };
  const idx = sources.findIndex(src => {
    const d = normalizeDomain(src?.domain || src?.url || '');
    return d && (d === own || d.endsWith('.' + own));
  });
  return { hasUrl: true, rank: idx >= 0 ? idx + 1 : null, total: sources.length };
}

export function byCheckedAtAsc(a, b) {
  return new Date(a.checkedAt || a.checked_at) - new Date(b.checkedAt || b.checked_at);
}

export function shortDate(str) {
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function timeAgo(str) {
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

export const RANK_LINE_COLORS = ['#e5e5e5', '#a3a3a3', '#737373'];

export function RankingsChart({ history, map }) {
  const checks = [...history].sort(byCheckedAtAsc);
  if (checks.length < 2) {
    return (
      <TabEmpty icon={Layers} title="Your trend starts with a second check">
        Rankings over time appear after this question has been checked twice. Run it again, or track it weekly.
      </TabEmpty>
    );
  }
  const rivals = [...map.domains].sort((x, y) => x.avgRank - y.avgRank).slice(0, 3).map(d => d.domain);
  const data = checks.map(h => {
    const row = { date: shortDate(h.checkedAt || h.checked_at), You: ownPositionOf(h).rank };
    const sources = Array.isArray(h.sources) ? h.sources : [];
    for (const d of rivals) {
      const idx = sources.findIndex(src => normalizeDomain(src?.domain || src?.url || '') === d);
      row[d] = idx >= 0 ? idx + 1 : null;
    }
    return row;
  });
  const maxRank = Math.max(3, ...data.flatMap(r => [r.You, ...rivals.map(d => r[d])]).filter(v => typeof v === 'number'));

  return (
    <div className={`card ${styles.mapCard}`}>
      <h3 className={styles.sectionTitle}>Position over time</h3>
      <p className={styles.sectionSub}>
        Where you and the top competitors appeared in Gemini's sources on each check (1 is cited first).
        Gaps mean that site wasn't cited that time.
      </p>
      <div className={styles.rankChart}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 12, right: 32, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" padding={{ left: 24, right: 24 }} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              reversed
              allowDecimals={false}
              domain={[0.5, maxRank + 0.5]}
              ticks={Array.from({ length: maxRank }, (_, i) => i + 1)}
              tickFormatter={v => `#${v}`}
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => [v == null ? 'Not cited' : `#${v}`, n]}
            />
            {rivals.map((d, i) => (
              <Line key={d} type="monotone" dataKey={d} stroke={RANK_LINE_COLORS[i]} strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 3.5, fill: RANK_LINE_COLORS[i], strokeWidth: 0 }} connectNulls={false} isAnimationActive={false} />
            ))}
            <Line type="monotone" dataKey="You" stroke="#2B8FE3" strokeWidth={2.5} dot={{ r: 5, fill: '#2B8FE3', strokeWidth: 0 }} connectNulls={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.rankLegend}>
        <span><i style={{ background: '#2B8FE3' }} />You</span>
        {rivals.map((d, i) => <span key={d}><i style={{ background: RANK_LINE_COLORS[i] }} />{d}</span>)}
      </div>
    </div>
  );
}

export function ResultConsole({ result, name, topicHistory, tracking, location }) {
  const sources = Array.isArray(result.sources) ? result.sources : [];
  const rank = result.citedSourceIndex != null ? result.citedSourceIndex + 1 : null;
  const history = [...topicHistory].sort(byCheckedAtAsc).slice(-12);

  let badge;
  if (result.siteShared) badge = <span className={`${styles.consoleBadge} ${styles.consoleBadgeMuted}`}>Can’t match your page</span>;
  else if (!result.url) badge = <span className={`${styles.consoleBadge} ${styles.consoleBadgeMuted}`}>No website given</span>;
  else if (rank) badge = <span className={`${styles.consoleBadge} ${styles.consoleBadgeGood}`}>Cited · source {rank}</span>;
  else badge = <span className={`${styles.consoleBadge} ${styles.consoleBadgeBad}`}>Not cited</span>;
  // Mentioned: did the answer name the brand? Works without a website.
  const mentionBadge = result.mentioned == null ? null : result.mentioned
    ? <span className={`${styles.consoleBadge} ${styles.consoleBadgeGood}`}>Mentioned · {result.brand}</span>
    : <span className={`${styles.consoleBadge} ${styles.consoleBadgeBad}`}>Not mentioned</span>;

  return (
    <div className={`card ${styles.console}`}>
      <div className={styles.consoleBar}>
        <span className={styles.consoleDots}><i /><i /><i /></span>
        <span className={styles.consoleName}>{result.name || name}</span>
        <span className={styles.consoleWhen}>Just now</span>
      </div>
      <div className={styles.consoleGrid}>
        <div className={styles.consoleLeft}>
          <div className={styles.consoleLabel}>Question</div>
          <div className={styles.consoleQuestion}>
            <Search size={14} aria-hidden="true" />
            <span>{result.topic}</span>
          </div>
          {mentionBadge && (
            <div className={styles.consoleLabelRow}>
              <span className={styles.consoleLabel}>Named in the answer</span>
              {mentionBadge}
            </div>
          )}
          <div className={styles.consoleLabelRow}>
            <span className={styles.consoleLabel}>Sources Gemini cited</span>
            {badge}
          </div>
          {sources.length ? (
            <ol className={styles.consoleSources}>
              {sources.map((src, i) => {
                const mine = rank === i + 1;
                return (
                  <li key={i}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`reveal ${styles.consoleSource} ${mine ? styles.consoleSourceMine : ''}`}
                      style={{ '--i': i }}
                      title={src.title || src.domain}
                    >
                      <span className={styles.consoleSourceNum}>{i + 1}</span>
                      <img
                        src={getFavicon(src.domain)}
                        alt=""
                        className={styles.consoleFavicon}
                        loading="lazy"
                        onError={e => { e.target.style.visibility = 'hidden'; }}
                      />
                      <span className={styles.consoleSourceDomain}>{src.domain}</span>
                      {mine
                        ? <span className={styles.consoleYou}>YOU</span>
                        : <ExternalLink size={12} className={styles.consoleSourceIcon} aria-hidden="true" />}
                    </a>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className={styles.consoleEmptyText}>Gemini answered without citing any sources for this question.</p>
          )}
        </div>

        <div className={styles.consoleRight}>
          <div className={styles.consoleLabel}>Your position</div>
          {!result.url ? (
            <>
              <div className={styles.positionBig}>—</div>
              <p className={styles.positionNote}>Add your website URL and run it again to see where you rank.</p>
            </>
          ) : rank ? (
            <>
              <div className={styles.positionBig}>#{rank}<span className={styles.positionOf}>of {sources.length}</span></div>
              <p className={styles.positionNote}>Gemini cited your site as source {rank} for this question.</p>
            </>
          ) : (
            <>
              <div className={`${styles.positionBig} ${styles.positionMissText}`}>Not cited</div>
              <p className={styles.positionNote}>
                Your site wasn't among the {sources.length} sources.{' '}
                <Link to={`/url-scanner?url=${encodeURIComponent(result.url)}`} className={styles.positionLink}>
                  See what your page needs
                </Link>
              </p>
            </>
          )}

          <div className={`${styles.consoleLabel} ${styles.consoleLabelSpaced}`}>This question over time</div>
          <div className={styles.historySquares}>
            {history.map((h, i) => {
              const pos = ownPositionOf(h);
              return (
                <span
                  key={h.id ?? i}
                  className={pos.rank ? styles.historyHit : styles.historyMiss}
                  title={`${shortDate(h.checkedAt || h.checked_at)}: ${pos.rank ? `#${pos.rank}` : 'not cited'}`}
                />
              );
            })}
          </div>
          <p className={styles.historyCaption}>
            {history.length} {history.length === 1 ? 'check' : 'checks'} so far
          </p>
          <div className={styles.consoleTrack}>
            <TrackWeeklyButton tracking={tracking} result={{ ...result, name: result.name || name, ...(location || {}) }} />
          </div>
        </div>
      </div>
      {result.summary && <p className={styles.consoleSummary}>{result.summary}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Recent Analyses                                                            */
/* ══════════════════════════════════════════════════════════════════════════ */

export function RecentAnalysesSection({ analyses, loading, visibleCount, onShowMore, onClearHistory, onSelect }) {
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

export function MapEmptyViz() {
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

export function MapSummaryPanel({ map, history, loading }) {
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
          Run a check and we'll plot the domains Gemini cites for that question, so you can see exactly
          who's winning the citations you want.
        </p>
      </div>
    );
  }

  const checks = [...history].sort(byCheckedAtAsc);
  const latest = ownPositionOf(checks[checks.length - 1]);
  const topSource = [...map.domains].sort((x, y) => x.avgRank - y.avgRank)[0];
  const latestLabel = !latest.hasUrl ? '—' : latest.rank ? `#${latest.rank}` : 'Not cited';

  return (
    <div className={`card ${styles.mapSummaryCard}`}>
      <h3 className={styles.sectionTitle}>
        <MapIcon style={{ width: 14, height: 14, color: 'var(--text)' }} />
        Your position
      </h3>

      <div className={styles.mapStatsRow}>
        <div className={styles.mapStat}>
          <div className={styles.mapStatLabel}>Latest check</div>
          <div className={`${styles.mapStatValue} ${latest.hasUrl && !latest.rank ? styles.positionMissText : ''}`}>{latestLabel}</div>
        </div>
        <div className={styles.mapStat}>
          <div className={styles.mapStatLabel}>Checks run</div>
          <div className={styles.mapStatValue}>{checks.length}</div>
        </div>
        <div className={styles.mapStat}>
          <div className={styles.mapStatLabel}>Usually cited first</div>
          <div className={styles.mapStatValueSm}>{topSource ? topSource.domain : '—'}</div>
        </div>
      </div>

      <div className={styles.positionTimeline}>
        {checks.slice(-12).map((h, i) => {
          const pos = ownPositionOf(h);
          const label = !pos.hasUrl ? 'No URL' : pos.rank ? `#${pos.rank} of ${pos.total}` : 'Not cited';
          return (
            <div key={h.id ?? i} className={styles.positionChip}>
              <span className={styles.positionChipDate}>{shortDate(h.checkedAt || h.checked_at)}</span>
              <span className={pos.rank ? styles.positionChipHit : pos.hasUrl ? styles.positionChipMiss : styles.positionChipNone}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Competitor Map — full-width detail (domain list + regional breakdown)     */
/* ══════════════════════════════════════════════════════════════════════════ */

export function MapDetailSection({ map, scopeLabel, part }) {
  const { regions, unknownCount } = map;
  const domains = [...map.domains].sort((x, y) => x.avgRank - y.avgRank || (x.bestRank ?? 99) - (y.bestRank ?? 99));

  return (
    <div className={`${styles.mapWrap} fade-in`}>
      {part === 'domains' && domains.length === 0 && (
        <TabEmpty icon={Trophy} title="No competing sources">No competing sources were cited for this question.</TabEmpty>
      )}
      {part === 'regions' && regions.length === 0 && (
        <TabEmpty icon={Globe} title="Nothing to place yet">None of the cited sites could be placed on the map yet.</TabEmpty>
      )}
      {part !== 'regions' && domains.length > 0 && (
        <div className={`card ${styles.mapCard}`}>
          <div className={styles.mapCardHeader}>
            <h3 className={styles.sectionTitle}>
              <Trophy style={{ width: 14, height: 14, color: 'var(--text)' }} />
              Domains Gemini cited for this question
              <span className={styles.sectionCount}>{domains.length}</span>
            </h3>
          </div>
          <p className={styles.sectionSub}>
            Ranked by their average position in Gemini's sources for "{scopeLabel}" (1 is cited first).
            Earning a mention or guest post on the top sites is the most direct path to being cited yourself.
          </p>

          <ul className={styles.domainList}>
            {domains.map((d, i) => {
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
                        <span className={styles.metric} title="Average position in Gemini's sources">
                          avg position <strong>{d.avgRank}</strong>
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
                    <div className={styles.domainMeta}>
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

      {part !== 'domains' && regions.length > 0 && (
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

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Source types — what kinds of sites AI leans on for this question          */
/* ══════════════════════════════════════════════════════════════════════════ */

export const pct = n => `${Math.round(n * 100)}%`;

export function SourceTypesSection({ data, scopeLabel }) {
  const { total, ownCitations, ownShare, types } = data;
  if (!total) {
    return <TabEmpty icon={Layers} title="No sources yet">No sources were cited for this question yet.</TabEmpty>;
  }
  return (
    <div className={`card ${styles.mapCard} fade-in`}>
      <div className={styles.mapCardHeader}>
        <h3 className={styles.sectionTitle}>
          <Layers style={{ width: 14, height: 14, color: 'var(--text)' }} />
          What kinds of sites AI cites
          <span className={styles.sectionCount}>{total} citation{total !== 1 ? 's' : ''}</span>
        </h3>
      </div>
      <p className={styles.sectionSub}>
        Every source Gemini cited for "{scopeLabel}", grouped by type. The biggest groups show where to show up next.
      </p>

      <div className={styles.typeStack} role="img" aria-label="Share of citations by source type">
        {types.map(t => (
          <span key={t.id} className={styles.typeSeg} data-type={t.id} style={{ flexGrow: t.citations }} title={`${t.label}: ${pct(t.share)}`} />
        ))}
        {ownCitations > 0 && <span className={styles.typeSeg} data-type="you" style={{ flexGrow: ownCitations }} title={`Your site: ${pct(ownShare)}`} />}
      </div>

      <ul className={styles.typeList}>
        {ownCitations > 0 && (
          <li className={styles.typeItem}>
            <div className={styles.typeHead}>
              <span className={styles.typeDot} data-type="you" />
              <span className={styles.typeLabel}>Your site</span>
              <span className={styles.typeShare}>{pct(ownShare)}</span>
            </div>
          </li>
        )}
        {types.map(t => (
          <li key={t.id} className={styles.typeItem}>
            <div className={styles.typeHead}>
              <span className={styles.typeDot} data-type={t.id} />
              <span className={styles.typeLabel}>{t.label}</span>
              <span className={styles.typeShare}>{pct(t.share)}</span>
            </div>
            <div className={styles.typeDomains}>
              {t.domains.slice(0, 5).map(d => (
                <a key={d.domain} href={d.sampleUrl || `https://${d.domain}`} target="_blank" rel="noopener noreferrer" className={styles.typeDomain}>
                  <img src={getFavicon(d.domain)} alt="" loading="lazy" onError={e => { e.target.style.visibility = 'hidden'; }} />
                  {d.domain}
                </a>
              ))}
              {t.domains.length > 5 && <span className={styles.typeMore}>+{t.domains.length - 5} more</span>}
            </div>
            <p className={styles.typeAction}>{t.action}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
