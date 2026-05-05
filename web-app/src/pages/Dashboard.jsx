import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { loadCitationHistory, buildCompetitorMap } from '../lib/citationHistory.js';
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Plus, TrendingUp, TrendingDown,
  FileText, Globe, GitBranch, ArrowRight,
  BrainCircuit, ShieldCheck, MousePointerClick, SearchCheck,
  Activity, Zap, Minus, Heart, Map as MapIcon, Radar,
} from 'lucide-react';
import styles from './Dashboard.module.css';

function getFavicon(domain) {
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

const PILLARS = [
  { key: 'ai_readability',          label: 'AI Readability',       color: '#06b6d4', Icon: BrainCircuit,
    subs: ['semantic_clarity','readability_score','logical_structure','aeo_alignment'],
    subLabels: ['Semantic Clarity','Readability Score','Logical Structure','AEO Alignment'] },
  { key: 'digital_authority',       label: 'Digital Authority',    color: '#22c55e', Icon: ShieldCheck,
    subs: ['entity_recognition','citation_readiness','descriptive_metadata'],
    subLabels: ['Entity Recognition','Citation Readiness','Descriptive Metadata'] },
  { key: 'conversion_readiness',    label: 'Conversion Readiness', color: '#a855f7', Icon: MousePointerClick,
    subs: ['schema_extraction','qa_format_detection','metadata_audit'],
    subLabels: ['Schema Extraction','QA-Format Detection','Metadata Audit'] },
  { key: 'product_discoverability', label: 'Discoverability',      color: '#f97316', Icon: SearchCheck,
    subs: ['schema_completeness','answer_layer_quality','freshness_signals','conversational_query_match'],
    subLabels: ['Schema Completeness','Answer Layer Quality','Freshness Signals','Query Match'] },
];

const QUICK_ACTIONS = [
  { to: '/analyze',       label: 'Content Analysis', sub: 'Paste and score any text',         Icon: FileText,  color: '#06b6d4' },
  { to: '/url-scanner',   label: 'URL Scanner',       sub: 'Audit a live URL for AEO signals', Icon: Globe,     color: '#a855f7' },
  { to: '/repo-analysis', label: 'Repo Analysis',     sub: 'Connect GitHub and score source',  Icon: GitBranch, color: '#22c55e' },
];

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  if (days === 0 && hours < 1) return 'Just now';
  if (days === 0) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function computeTrend(arr, key) {
  if (arr.length < 4) return null;
  const half = Math.min(7, Math.floor(arr.length / 2));
  const recent = arr.slice(0, half);
  const older = arr.slice(half, half * 2);
  if (!older.length) return null;
  const recentAvg = recent.reduce((s, h) => s + (h[key] ?? 0), 0) / recent.length;
  const olderAvg = older.reduce((s, h) => s + (h[key] ?? 0), 0) / older.length;
  if (olderAvg === 0) return null;
  return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
}

function scoreColor(s) {
  if (!s && s !== 0) return 'var(--text-dim)';
  if (s >= 75) return '#22c55e';
  if (s >= 50) return '#eab308';
  return '#ef4444';
}

function getItemType(item) {
  if (item.repo) return 'Repo';
  if (item.url) return 'URL';
  return 'Content';
}

/* ── Gas Gauge Arc ── */
function GaugeArc({ score = 0, color = '#0ea5e9', size = 120 }) {
  const cx = size / 2;
  const cy = size * 0.54;
  const r = size * 0.36;
  const sw = size * 0.062;
  const startDeg = 155;
  const span = 230;
  const endDeg = startDeg + span;
  const fillEnd = startDeg + (span * Math.min(Math.max(score, 0), 100) / 100);

  function pt(deg) {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function arc(s, e) {
    const a = pt(s), b = pt(e);
    const large = e - s > 180 ? 1 : 0;
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }

  const ticks = [0, 25, 50, 75, 100].map(v => {
    const d = startDeg + (span * v / 100);
    const inner = size * 0.28;
    const outer = size * 0.32;
    const p1 = { x: cx + inner * Math.cos((d - 90) * Math.PI / 180), y: cy + inner * Math.sin((d - 90) * Math.PI / 180) };
    const p2 = { x: cx + outer * Math.cos((d - 90) * Math.PI / 180), y: cy + outer * Math.sin((d - 90) * Math.PI / 180) };
    return { p1, p2 };
  });

  return (
    <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size * 0.72}`} style={{ display: 'block', overflow: 'visible' }}>
      {ticks.map((t, i) => (
        <line key={i} x1={t.p1.x.toFixed(2)} y1={t.p1.y.toFixed(2)} x2={t.p2.x.toFixed(2)} y2={t.p2.y.toFixed(2)}
          stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round" />
      ))}
      <path d={arc(startDeg, endDeg - 0.1)} fill="none" stroke="rgba(255,255,255,0.07)"
        strokeWidth={sw} strokeLinecap="round" />
      {score > 0 && (
        <path d={arc(startDeg, Math.min(fillEnd, endDeg - 0.1))} fill="none" stroke={color}
          strokeWidth={sw} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color}90)` }} />
      )}
    </svg>
  );
}

/* ── Donut Center Label ── */
function DonutLabel({ score, color }) {
  return (
    <div className={styles.donutCenter}>
      <span className={styles.donutScore} style={{ color }}>{score ?? '—'}</span>
      <span className={styles.donutLabel}>avg score</span>
    </div>
  );
}

/* ── Trend Badge ── */
function TrendBadge({ pct }) {
  if (pct === null || pct === undefined) return null;
  const up = pct > 0, flat = pct === 0;
  return (
    <span className={styles.trendBadge} style={{
      color: flat ? 'var(--text-muted)' : up ? '#22c55e' : '#ef4444',
      background: flat ? 'rgba(255,255,255,0.05)' : up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
      borderColor: flat ? 'rgba(255,255,255,0.08)' : up ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
    }}>
      {flat ? <Minus className={styles.trendIcon} /> : up ? <TrendingUp className={styles.trendIcon} /> : <TrendingDown className={styles.trendIcon} />}
      {flat ? 'Flat' : `${up ? '+' : ''}${pct}%`}
    </span>
  );
}

/* ── Area chart tooltip ── */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.chartTooltip}>
      <div className={styles.tooltipDate}>{d.date}</div>
      <div className={styles.tooltipScore} style={{ color: scoreColor(d.score) }}>{d.score}</div>
      <div className={styles.tooltipLabel}>Overall score</div>
    </div>
  );
}

/* ── Donut tooltip ── */
function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.chartTooltip} style={{ minWidth: 140 }}>
      <div className={styles.tooltipDate} style={{ color: d.color }}>{d.name}</div>
      <div className={styles.tooltipScore} style={{ color: d.color }}>{d.value}</div>
      <div className={styles.tooltipLabel}>avg pillar score</div>
    </div>
  );
}

/* ── Sub-score bar ── */
function SubScoreBar({ label, value, color }) {
  return (
    <div className={styles.subScoreRow}>
      <span className={styles.subScoreLabel}>{label}</span>
      <div className={styles.subScoreTrack}>
        <div className={styles.subScoreFill} style={{ width: `${value ?? 0}%`, background: color }} />
      </div>
      <span className={styles.subScoreVal} style={{ color }}>{value ?? '—'}</span>
    </div>
  );
}

/* ══════════════════════════════════════════ */
export default function Dashboard() {
  const { user, isDemo, apiKey } = useApp();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState(14);
  const [citationHistory, setCitationHistory] = useState([]);

  const citationScope = isDemo ? '__demo__' : (user?.id || apiKey || 'anon');

  useEffect(() => {
    api.history({ limit: 50 })
      .then(({ data }) => setHistory(Array.isArray(data) ? data : data?.items ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCitationHistory(loadCitationHistory(citationScope));
  }, [citationScope]);

  const competitorMap = useMemo(
    () => buildCompetitorMap(citationHistory, null),
    [citationHistory]
  );
  const topCompetitors = competitorMap.domains.slice(0, 3);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const rawName = user?.email?.split('@')[0]?.replace(/[._]/g, ' ');
  const displayName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';

  const totalAnalyses = history.length;
  const avgScore = totalAnalyses > 0
    ? Math.round(history.reduce((s, h) => s + (h.overall_score ?? 0), 0) / totalAnalyses)
    : 0;

  const scoreTrend = computeTrend(history, 'overall_score');
  const usagePct = user ? Math.round(((user.usage?.count ?? 0) / (user.usage?.limit ?? 100)) * 100) : 0;

  const tier = (user?.subscriptionStatus === 'active' && user?.stripePriceId)
    ? ({ 'price_1SeCJH3NMjs4uYdgpi0xB0XN': 'Business', 'price_1SeCKM3NMjs4uYdgcBRhgIhD': 'Pro', 'price_1SeCHg3NMjs4uYdguOgkr3SQ': 'Free' }[user.stripePriceId] ?? 'Pro')
    : 'Free';

  const pillarAvgs = PILLARS.map(p => ({
    ...p,
    avg: totalAnalyses > 0
      ? Math.round(history.reduce((s, h) => s + (h[p.key] ?? 0), 0) / totalAnalyses)
      : 0,
    trend: computeTrend(history, p.key),
  }));

  const contentHealth = pillarAvgs.some(p => p.avg > 0)
    ? Math.round(pillarAvgs.reduce((s, p) => s + p.avg, 0) / pillarAvgs.length)
    : 0;

  const weakestPillar = totalAnalyses >= 3
    ? [...pillarAvgs].sort((a, b) => a.avg - b.avg)[0]
    : null;

  const chartData = [...history]
    .slice(0, chartRange)
    .reverse()
    .map((h, i) => ({
      idx: i + 1,
      score: h.overall_score ?? 0,
      date: h.analyzed_at ? timeAgo(h.analyzed_at) : '',
    }));

  const donutData = pillarAvgs.map(p => ({ name: p.label, value: p.avg || 1, color: p.color, real: p.avg }));

  /* ── sub-scores from most recent analysis ── */
  const latest = history[0];
  const latestSubs = latest
    ? PILLARS.map(p => {
        const detail = latest[`${p.key}_detail`] ?? {};
        return {
          ...p,
          pillarScore: latest[p.key] ?? 0,
          subscores: p.subs.map((sk, si) => ({
            label: p.subLabels[si],
            value: detail[sk] ?? null,
          })),
        };
      })
    : null;

  const kpis = [
    {
      label: 'Total Analyses',
      value: loading ? '—' : totalAnalyses,
      sub: 'All time',
      color: '#06b6d4',
      Icon: Activity,
      trend: null,
    },
    {
      label: 'Average Score',
      value: loading ? '—' : avgScore,
      sub: 'Last 30 analyses',
      color: scoreColor(avgScore),
      Icon: Zap,
      trend: scoreTrend,
      suffix: '/100',
      isGauge: true,
    },
    {
      label: 'Content Health',
      value: loading ? '—' : `${contentHealth}%`,
      sub: 'Across all pillars',
      color: scoreColor(contentHealth),
      Icon: Heart,
      trend: null,
    },
    {
      label: 'API Usage',
      value: user ? `${user.usage?.count ?? 0}` : '—',
      sub: `of ${user?.usage?.limit ?? 100} this cycle`,
      color: usagePct > 80 ? '#ef4444' : usagePct > 60 ? '#eab308' : '#a855f7',
      Icon: Activity,
      trend: null,
      suffix: `/${user?.usage?.limit ?? 100}`,
    },
  ];

  return (
    <div className={`${styles.root} fade-in`}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            {greeting}{displayName ? `, ${displayName}` : ''}
          </h1>
          <p className={styles.headerSub}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' · '}
            <span style={{ color: 'var(--accent)' }}>{totalAnalyses} total analyses</span>
          </p>
        </div>
        <button onClick={() => navigate('/analyze')} className={styles.newBtn}>
          <Plus className={styles.newBtnIcon} />
          New Analysis
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className={styles.kpis}>
        {kpis.map((k) => (
          <div key={k.label} className={`${styles.kpiCard} ${k.isGauge ? styles.kpiGaugeCard : ''}`}
            style={{ '--kpi-color': k.color }}>
            {k.isGauge ? (
              /* Gauge-style card */
              <>
                <div className={styles.kpiTop}>
                  <span className={styles.kpiLabel}>{k.label}</span>
                  {k.trend !== null && <TrendBadge pct={k.trend} />}
                </div>
                <div className={styles.gaugeWrap}>
                  <GaugeArc score={typeof k.value === 'number' ? k.value : 0} color={k.color} size={110} />
                  <div className={styles.gaugeCenter}>
                    <span className={styles.kpiValue} style={{ color: k.color, fontSize: 26 }}>
                      {k.value}
                    </span>
                    {k.suffix && <span className={styles.kpiSuffix}>{k.suffix}</span>}
                  </div>
                </div>
                <div className={styles.kpiBottom}>
                  <span className={styles.kpiSub}>{k.sub}</span>
                </div>
              </>
            ) : (
              /* Standard card */
              <>
                <div className={styles.kpiTop}>
                  <span className={styles.kpiLabel}>{k.label}</span>
                  <div className={styles.kpiIconWrap} style={{ background: `${k.color}15`, border: `1px solid ${k.color}30` }}>
                    <k.Icon className={styles.kpiIcon} style={{ color: k.color }} />
                  </div>
                </div>
                <div className={styles.kpiValueRow}>
                  <span className={styles.kpiValue} style={{ color: k.color === '#475569' ? 'var(--text)' : k.color }}>
                    {k.value}
                  </span>
                  {k.suffix && <span className={styles.kpiSuffix}>{k.suffix}</span>}
                </div>
                <div className={styles.kpiBottom}>
                  <span className={styles.kpiSub}>{k.sub}</span>
                  {k.trend !== null && <TrendBadge pct={k.trend} />}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Insight callout ── */}
      {weakestPillar && weakestPillar.avg < 70 && (
        <div className={styles.insight}>
          <div className={styles.insightDot} style={{ background: weakestPillar.color }} />
          <span className={styles.insightText}>
            <strong style={{ color: weakestPillar.color }}>{weakestPillar.label}</strong> is your weakest pillar — averaging{' '}
            <strong style={{ color: 'var(--text)' }}>{weakestPillar.avg}/100</strong> across recent analyses.
          </span>
          <Link to="/analyze" className={styles.insightAction}>Improve it →</Link>
        </div>
      )}

      {/* ── Charts row ── */}
      <div className={styles.chartsRow}>

        {/* Score Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Score Trend</h2>
              <p className={styles.chartSub}>Overall Rain Score over time</p>
            </div>
            <div className={styles.rangeToggle}>
              {[7, 14, 30].map(r => (
                <button key={r}
                  className={`${styles.rangeBtn} ${chartRange === r ? styles.rangeBtnActive : ''}`}
                  onClick={() => setChartRange(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className={styles.chartEmpty}><span className="spinner" /></div>
          ) : chartData.length < 2 ? (
            <div className={styles.chartEmpty}>
              <div className={styles.emptyState}>
                <Activity className={styles.emptyIcon} />
                <p>Run your first analysis to see trends here</p>
                <Link to="/analyze" className={styles.emptyLink}>Get started →</Link>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="idx" stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(14,165,233,0.2)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2}
                  fill="url(#scoreGrad)" dot={false}
                  activeDot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pillar Donut */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Pillar Breakdown</h2>
              <p className={styles.chartSub}>Relative score distribution</p>
            </div>
          </div>

          {loading ? (
            <div className={styles.chartEmpty}><span className="spinner" /></div>
          ) : !pillarAvgs.some(p => p.avg > 0) ? (
            <div className={styles.chartEmpty}>
              <div className={styles.emptyState}>
                <Activity className={styles.emptyIcon} />
                <p>No pillar data yet</p>
                <Link to="/analyze" className={styles.emptyLink}>Run analysis →</Link>
              </div>
            </div>
          ) : (
            <div className={styles.donutWrap}>
              <div className={styles.donutChartArea}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%"
                      innerRadius={48} outerRadius={72}
                      paddingAngle={2} dataKey="value" strokeWidth={0}
                      startAngle={90} endAngle={-270}>
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color}
                          style={{ filter: `drop-shadow(0 0 4px ${entry.color}50)` }} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutLabel score={avgScore} color={scoreColor(avgScore)} />
              </div>

              <div className={styles.donutLegend}>
                {pillarAvgs.map(p => (
                  <div key={p.key} className={styles.donutLegendRow}>
                    <div className={styles.donutLegendDot} style={{ background: p.color, boxShadow: `0 0 5px ${p.color}70` }} />
                    <span className={styles.donutLegendLabel}>{p.label}</span>
                    <div className={styles.donutLegendBarWrap}>
                      <div className={styles.donutLegendBar}>
                        <div style={{ width: `${p.avg}%`, background: p.color, height: '100%', borderRadius: 2 }} />
                      </div>
                    </div>
                    <span className={styles.donutLegendScore} style={{ color: p.color }}>{p.avg}</span>
                  </div>
                ))}
                <div className={styles.contentHealth}>
                  <Heart style={{ width: 11, height: 11, color: scoreColor(contentHealth) }} />
                  <span>Content Health: </span>
                  <strong style={{ color: scoreColor(contentHealth) }}>{contentHealth}%</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className={styles.bottomRow}>

        {/* Recent Analyses */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Recent Analyses</h2>
              <p className={styles.chartSub}>Your latest content scores</p>
            </div>
            <Link to="/history" className={styles.viewAll}>View all →</Link>
          </div>

          {loading ? (
            <div className={styles.chartEmpty}><span className="spinner" /></div>
          ) : history.length === 0 ? (
            <div className={styles.chartEmpty}>
              <div className={styles.emptyState}>
                <FileText className={styles.emptyIcon} />
                <p>No analyses yet</p>
                <Link to="/analyze" className={styles.emptyLink}>Run your first →</Link>
              </div>
            </div>
          ) : (
            <div className={styles.analysesList}>
              {history.slice(0, 7).map((item, i) => {
                const type = getItemType(item);
                const typeColor = type === 'URL' ? '#a855f7' : type === 'Repo' ? '#22c55e' : '#06b6d4';
                const TypeIcon = type === 'URL' ? Globe : type === 'Repo' ? GitBranch : FileText;
                return (
                  <div key={i} className={styles.analysisRow}>
                    <div className={styles.analysisBadge}
                      style={{ color: typeColor, background: `${typeColor}12`, borderColor: `${typeColor}30` }}>
                      <TypeIcon className={styles.analysisBadgeIcon} />
                      {type}
                    </div>
                    <span className={styles.analysisTitle}>{item.title || item.url || 'Untitled'}</span>
                    <div className={styles.pillarDots}>
                      {PILLARS.map(p => (
                        <span key={p.key} className={styles.pillarDot}
                          style={{ background: p.color, opacity: item[p.key] ? (item[p.key] / 100) * 0.7 + 0.3 : 0.2 }}
                          title={`${p.label}: ${item[p.key] ?? '—'}`} />
                      ))}
                    </div>
                    <span className={styles.analysisScore} style={{ color: scoreColor(item.overall_score) }}>
                      {item.overall_score ?? '—'}
                    </span>
                    <span className={styles.analysisDate}>{timeAgo(item.analyzed_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Analyze</h2>
              <p className={styles.chartSub}>Pick your analysis mode</p>
            </div>
          </div>
          <div className={styles.actionList}>
            {QUICK_ACTIONS.map(a => (
              <Link key={a.to} to={a.to} className={styles.actionCard}>
                <div className={styles.actionIconWrap} style={{ background: `${a.color}12`, borderColor: `${a.color}25` }}>
                  <a.Icon className={styles.actionIcon} style={{ color: a.color }} />
                </div>
                <div className={styles.actionText}>
                  <span className={styles.actionLabel}>{a.label}</span>
                  <span className={styles.actionSub}>{a.sub}</span>
                </div>
                <ArrowRight className={styles.actionArrow} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top cited competitors ── */}
      <div
        className={`${styles.competitorCard} ${topCompetitors.length > 0 ? styles.competitorCardClickable : ''}`}
        role={topCompetitors.length > 0 ? 'button' : undefined}
        tabIndex={topCompetitors.length > 0 ? 0 : undefined}
        onClick={topCompetitors.length > 0 ? () => navigate('/citation-monitor?tab=map') : undefined}
        onKeyDown={topCompetitors.length > 0 ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/citation-monitor?tab=map');
          }
        } : undefined}
      >
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>
              <MapIcon style={{ width: 13, height: 13, marginRight: 6, verticalAlign: '-2px', color: '#a855f7' }} />
              Top cited competitors
            </h2>
            <p className={styles.chartSub}>
              {competitorMap.totalQueries > 0
                ? `Dominating across your ${competitorMap.totalQueries} tracked ${competitorMap.totalQueries === 1 ? 'query' : 'queries'}`
                : 'AEO snapshot from your Citation Monitor history'}
            </p>
          </div>
          {topCompetitors.length > 0 && (
            <span className={styles.viewAll}>Open Competitor Map →</span>
          )}
        </div>

        {topCompetitors.length === 0 ? (
          <div className={styles.competitorEmpty}>
            <Radar className={styles.emptyIcon} />
            <p>No citation history yet</p>
            <Link
              to="/citation-monitor"
              className={styles.emptyLink}
              onClick={(e) => e.stopPropagation()}
            >
              Run your first citation check →
            </Link>
          </div>
        ) : (
          <div className={styles.competitorList}>
            {topCompetitors.map((c, i) => {
              const coveragePct = Math.round(c.coverage * 100);
              return (
                <div key={c.domain} className={styles.competitorRow}>
                  <span className={styles.competitorRank}>#{i + 1}</span>
                  <img
                    src={getFavicon(c.domain)}
                    alt=""
                    className={styles.competitorFavicon}
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                  />
                  <span className={styles.competitorDomain}>{c.domain}</span>
                  <div className={styles.competitorBarWrap}>
                    <div className={styles.competitorBar}>
                      <div
                        className={styles.competitorBarFill}
                        style={{ width: `${coveragePct}%` }}
                      />
                    </div>
                  </div>
                  <span className={styles.competitorCoverage}>
                    {coveragePct}%
                    <span className={styles.competitorCoverageSub}>
                      {c.queryCount}/{competitorMap.totalQueries}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pillar Sub-scores (last analysis) ── */}
      {latestSubs && latestSubs.some(p => p.subscores.some(s => s.value !== null)) && (
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Pillar Sub-scores</h2>
              <p className={styles.chartSub}>
                Detailed breakdown from{' '}
                <span style={{ color: 'var(--accent)' }}>{latest?.title || latest?.url || 'last analysis'}</span>
              </p>
            </div>
          </div>
          <div className={styles.subScoresGrid}>
            {latestSubs.map(p => (
              <div key={p.key} className={styles.subScorePillar}>
                <div className={styles.subScorePillarHeader}>
                  <p.Icon style={{ width: 13, height: 13, color: p.color }} />
                  <span className={styles.subScorePillarLabel} style={{ color: p.color }}>{p.label}</span>
                  <span className={styles.subScorePillarScore} style={{ color: p.color }}>{p.pillarScore}</span>
                </div>
                {p.subscores.map(s => (
                  s.value !== null && (
                    <SubScoreBar key={s.label} label={s.label} value={s.value} color={p.color} />
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
