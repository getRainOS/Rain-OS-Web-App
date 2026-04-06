import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Plus, TrendingUp, TrendingDown,
  FileText, Globe, GitBranch, ArrowRight,
  BrainCircuit, ShieldCheck, MousePointerClick, SearchCheck,
  Activity, Zap, Minus,
} from 'lucide-react';
import styles from './Dashboard.module.css';

const PILLARS = [
  { key: 'ai_readability',        label: 'AI Readability',       color: '#06b6d4', Icon: BrainCircuit },
  { key: 'digital_authority',     label: 'Digital Authority',    color: '#22c55e', Icon: ShieldCheck },
  { key: 'conversion_readiness',  label: 'Conversion Readiness', color: '#a855f7', Icon: MousePointerClick },
  { key: 'product_discoverability', label: 'Discoverability',    color: '#f97316', Icon: SearchCheck },
];

const QUICK_ACTIONS = [
  { to: '/analyze',       label: 'Content Analysis', sub: 'Paste and score any text',       Icon: FileText,  color: '#06b6d4' },
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

function TrendBadge({ pct }) {
  if (pct === null || pct === undefined) return null;
  const up = pct > 0;
  const flat = pct === 0;
  return (
    <span
      className={styles.trendBadge}
      style={{
        color: flat ? 'var(--text-muted)' : up ? '#22c55e' : '#ef4444',
        background: flat ? 'rgba(255,255,255,0.05)' : up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        borderColor: flat ? 'rgba(255,255,255,0.08)' : up ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
      }}
    >
      {flat ? <Minus className={styles.trendIcon} /> : up ? <TrendingUp className={styles.trendIcon} /> : <TrendingDown className={styles.trendIcon} />}
      {flat ? 'Flat' : `${up ? '+' : ''}${pct}%`}
    </span>
  );
}

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

export default function Dashboard() {
  const { user, isDemo } = useApp();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState(14);

  useEffect(() => {
    api.history({ limit: 50 })
      .then(({ data }) => setHistory(Array.isArray(data) ? data : data?.items ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

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
      value: loading ? '—' : `${avgScore}`,
      sub: 'Last 30 analyses',
      color: scoreColor(avgScore),
      Icon: Zap,
      trend: scoreTrend,
      suffix: '/100',
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
    {
      label: 'Plan',
      value: tier,
      sub: tier === 'Free' ? 'Upgrade for more analyses' : 'Active subscription',
      color: tier === 'Business' ? '#f97316' : tier === 'Pro' ? '#a855f7' : '#475569',
      Icon: Zap,
      trend: null,
    },
  ];

  return (
    <div className={`${styles.root} fade-in`}>

      {/* Header */}
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
        <button
          onClick={() => navigate('/analyze')}
          className={styles.newBtn}
        >
          <Plus className={styles.newBtnIcon} />
          New Analysis
        </button>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpis}>
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpiCard} style={{ '--kpi-color': k.color }}>
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
          </div>
        ))}
      </div>

      {/* Insight callout */}
      {weakestPillar && weakestPillar.avg < 70 && (
        <div className={styles.insight}>
          <div className={styles.insightDot} style={{ background: weakestPillar.color }} />
          <span className={styles.insightText}>
            <strong style={{ color: weakestPillar.color }}>{weakestPillar.label}</strong> is your weakest pillar — averaging <strong style={{ color: 'var(--text)' }}>{weakestPillar.avg}/100</strong> across recent analyses.
          </span>
          <Link to="/analyze" className={styles.insightAction}>Improve it →</Link>
        </div>
      )}

      {/* Charts row */}
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
                <button
                  key={r}
                  className={`${styles.rangeBtn} ${chartRange === r ? styles.rangeBtnActive : ''}`}
                  onClick={() => setChartRange(r)}
                >
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
                <XAxis
                  dataKey="idx"
                  stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(14,165,233,0.2)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#scoreGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pillar Health */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Pillar Health</h2>
              <p className={styles.chartSub}>Average across {totalAnalyses} {totalAnalyses === 1 ? 'analysis' : 'analyses'}</p>
            </div>
          </div>
          <div className={styles.pillarList}>
            {pillarAvgs.map(p => (
              <div key={p.key} className={styles.pillarRow}>
                <div className={styles.pillarMeta}>
                  <p.Icon className={styles.pillarIcon} style={{ color: p.color }} />
                  <span className={styles.pillarLabel}>{p.label}</span>
                </div>
                <div className={styles.pillarBarWrap}>
                  <div className={styles.pillarTrack}>
                    <div
                      className={styles.pillarFill}
                      style={{
                        width: loading ? '0%' : `${p.avg}%`,
                        background: p.color,
                        boxShadow: `0 0 8px ${p.color}60`,
                      }}
                    />
                  </div>
                  <span className={styles.pillarScore} style={{ color: p.color }}>{loading ? '—' : p.avg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className={styles.bottomRow}>

        {/* Recent Analyses */}
        <div className={styles.chartCard} style={{ flex: '1 1 0' }}>
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
                const typeIcon = type === 'URL' ? Globe : type === 'Repo' ? GitBranch : FileText;
                const TypeIcon = typeIcon;
                return (
                  <div key={i} className={styles.analysisRow}>
                    <div className={styles.analysisBadge} style={{ color: typeColor, background: `${typeColor}12`, borderColor: `${typeColor}30` }}>
                      <TypeIcon className={styles.analysisBadgeIcon} />
                      {type}
                    </div>
                    <span className={styles.analysisTitle}>
                      {item.title || item.url || 'Untitled'}
                    </span>
                    <div className={styles.pillarDots}>
                      {PILLARS.map(p => (
                        <span
                          key={p.key}
                          className={styles.pillarDot}
                          style={{ background: p.color, opacity: item[p.key] ? (item[p.key] / 100) * 0.7 + 0.3 : 0.2 }}
                          title={`${p.label}: ${item[p.key] ?? '—'}`}
                        />
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
    </div>
  );
}
