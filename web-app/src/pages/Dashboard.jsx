import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { buildCompetitorMap } from '../lib/citationHistory.js';
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
  CheckCircle2, AlertCircle,
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

const LANES = [
  { id: 'general',         label: 'Writers & Marketers',    desc: 'Optimize articles, landing pages, and marketing copy for AI citation.', color: '#06b6d4', Icon: FileText },
  { id: 'product_sellers', label: 'Product Sellers',        desc: 'Maximize AI product discovery with Discoverability scoring at 50% weight.', color: '#f97316', Icon: SearchCheck },
  { id: 'developers',      label: 'Developers',             desc: 'Analyze tech docs, READMEs, and API references for AI readability signals.', color: '#10b981', Icon: GitBranch },
  { id: 'local_business',  label: 'Local Service Business', desc: 'Get your professional services business cited by AI when customers search locally.', color: '#f43f5e', Icon: MapIcon },
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
  if (s >= 75) return '#94a3b8';
  if (s >= 50) return '#94a3b8';
  return '#94a3b8';
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
          strokeWidth={sw} strokeLinecap="round" />
      )}
    </svg>
  );
}

/* ── Donut Center Label ── */
function DonutLabel({ score }) {
  return (
    <div className={styles.donutCenter}>
      <span className={styles.donutScore}>{score ?? '—'}</span>
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

/* ── Inline sparkline (citations widget) ── */
function Sparkline({ values, color, width = 86, height = 26 }) {
  if (!values || values.length < 2) {
    return <span className={styles.sparkPlaceholder}>—</span>;
  }
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const clamp = (v) => Math.min(Math.max(v ?? 0, 0), 100);
  const points = values
    .map((v, i) => `${(pad + i * step).toFixed(2)},${(pad + h - (clamp(v) / 100) * h).toFixed(2)}`)
    .join(' ');
  const last = values[values.length - 1];
  const lastX = pad + (values.length - 1) * step;
  const lastY = pad + h - (clamp(last) / 100) * h;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={styles.sparkSvg}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
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

/* ── Lane Selector ── */
function LaneSelector({ onSelect }) {
  return (
    <div className={styles.laneSelector}>
      <div className={styles.laneSelectorHeader}>
        <h2 className={styles.laneSelectorTitle}>What are you optimizing for?</h2>
        <p className={styles.laneSelectorSub}>Choose your solution lane to get the right scoring weights and KPIs across your dashboard and analysis tools.</p>
      </div>
      <div className={styles.laneCards}>
        {LANES.map(lane => (
          <button
            key={lane.id}
            className={styles.laneCard}
            style={{ '--lane-color': lane.color }}
            onClick={() => onSelect(lane.id)}
          >
            <div className={styles.laneCardIcon} style={{ background: `${lane.color}15`, border: `1px solid ${lane.color}30` }}>
              <lane.Icon size={20} style={{ color: lane.color }} />
            </div>
            <div className={styles.laneCardLabel}>{lane.label}</div>
            <div className={styles.laneCardDesc}>{lane.desc}</div>
            <div className={styles.laneCardCta} style={{ color: lane.color }}>Select this lane →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ */
export default function Dashboard() {
  const { user, userLane, setUserLane } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState(14);
  const [citations, setCitations] = useState([]);
  const [citationsLoading, setCitationsLoading] = useState(true);
  const [citationHistory, setCitationHistory] = useState([]);
  const urlWantsLaneSelect = searchParams.get('selectLane') === '1';
  const [showLaneSelector, setShowLaneSelector] = useState(!userLane || urlWantsLaneSelect);

  useEffect(() => {
    if (urlWantsLaneSelect) {
      setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('selectLane'); return n; }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.history({ limit: 50 })
      .then(({ data }) => setHistory(Array.isArray(data) ? data : data?.items ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.citationHistory()
      .then(({ data }) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : data?.items ?? [];
        setCitationHistory(items);
      })
      .catch(() => { if (!cancelled) setCitationHistory([]); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const competitorMap = useMemo(
    () => buildCompetitorMap(citationHistory, null),
    [citationHistory]
  );
  const topCompetitors = competitorMap.domains.slice(0, 3);

  useEffect(() => {
    api.citationHistory({ limit: 50 })
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : data?.items ?? [];
        setCitations(items);
      })
      .catch(() => setCitations([]))
      .finally(() => setCitationsLoading(false));
  }, []);

  const trackedTopics = useMemo(() => {
    if (!citations.length) return [];
    const groups = new Map();
    for (const c of citations) {
      const key = (c.topic || '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(c);
    }
    const out = [];
    for (const [key, arr] of groups) {
      arr.sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
      const latest = arr[0];
      const previous = arr[1];
      const delta = previous
        ? (latest.alignmentScore ?? 0) - (previous.alignmentScore ?? 0)
        : null;
      const spark = arr
        .slice(0, 8)
        .reverse()
        .map((h) => h.alignmentScore ?? 0);
      out.push({
        key,
        topic: latest.topic,
        latestScore: latest.alignmentScore ?? 0,
        cited: !!latest.cited,
        checkedAt: latest.checkedAt,
        delta,
        checkCount: arr.length,
        spark,
      });
    }
    out.sort(
      (a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
    );
    return out.slice(0, 5);
  }, [citations]);

  const activePillars = useMemo(() => {
    if (userLane === 'product_sellers') return [
      { ...PILLARS[3], weight: 50 },
      { ...PILLARS[0], weight: 20 },
      { ...PILLARS[1], weight: 15 },
      { ...PILLARS[2], weight: 15 },
    ];
    if (userLane === 'developers') return [
      { ...PILLARS[0], label: 'Doc Structure', weight: 35 },
      { ...PILLARS[1], label: 'Tech Completeness', weight: 35 },
      { ...PILLARS[2], label: 'Technical Clarity', weight: 30 },
    ];
    if (userLane === 'local_business') return [
      { ...PILLARS[1], label: 'Local Authority', weight: 40 },
      { ...PILLARS[0], label: 'AI Presence', weight: 30 },
      { ...PILLARS[2], label: 'Trust & Conversion', weight: 30 },
    ];
    return [
      { ...PILLARS[0], weight: 40 },
      { ...PILLARS[1], weight: 30 },
      { ...PILLARS[2], weight: 30 },
    ];
  }, [userLane]);

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

  const pillarAvgs = activePillars.map(p => ({
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
    ? activePillars.map(p => {
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

  const citationTotal = citations.length;
  const citationCitedCount = citations.filter(c => c.cited).length;
  const citationRate = citationTotal > 0 ? Math.round((citationCitedCount / citationTotal) * 100) : null;
  const avgAlignment = citationTotal > 0 ? Math.round(citations.reduce((s, c) => s + (c.alignmentScore ?? 0), 0) / citationTotal) : null;

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
    {
      label: 'Citation Health',
      value: citationsLoading ? '—' : citationRate !== null ? `${citationRate}%` : '—',
      sub: citationTotal > 0 ? `${citationTotal} checks · avg ${avgAlignment}` : 'No checks yet',
      color: citationRate === null ? '#94a3b8' : citationRate >= 60 ? '#a78bfa' : citationRate >= 30 ? '#eab308' : '#ef4444',
      Icon: Radar,
      trend: null,
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

      {/* ── Lane Banner / Selector ── */}
      {showLaneSelector ? (
        <LaneSelector onSelect={(id) => { setUserLane(id); setShowLaneSelector(false); }} />
      ) : userLane ? (
        <div className={styles.laneBanner}>
          {(() => {
            const lane = LANES.find(l => l.id === userLane);
            if (!lane) return null;
            return (
              <>
                <div className={styles.laneBadge}>
                  <lane.Icon size={13} style={{ color: '#94a3b8' }} />
                  <span className={styles.laneBadgeLabel}>{lane.label}</span>
                </div>
                <p className={styles.laneBannerSub}>
                  {userLane === 'local_business'
                    ? 'Scoring tuned for local trust signals, AI findability, and getting customers to call or book.'
                    : 'Your scoring weights and KPIs are optimized for this lane.'}
                </p>
                <button className={styles.laneChangeBtn} onClick={() => setShowLaneSelector(true)}>Change lane</button>
              </>
            );
          })()}
        </div>
      ) : null}

      {/* ── KPI Cards ── */}
      <div className={styles.kpis}>
        {kpis.map((k) => (
          <div key={k.label} className={`${styles.kpiCard} ${k.isGauge ? styles.kpiGaugeCard : ''}`}>
            <>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>{k.label}</span>
                <div className={styles.kpiIconWrap}>
                  <k.Icon className={styles.kpiIcon} />
                </div>
              </div>
              <div className={styles.kpiValueRow}>
                <span className={styles.kpiValue}>{k.value}</span>
                {k.suffix && <span className={styles.kpiSuffix}>{k.suffix}</span>}
              </div>
              <div className={styles.kpiBottom}>
                <span className={styles.kpiSub}>{k.sub}</span>
                {k.trend !== null && <TrendBadge pct={k.trend} />}
              </div>
            </>
          </div>
        ))}
      </div>

      {/* ── Insight callout ── */}
      {weakestPillar && weakestPillar.avg < 70 && (
        <div className={styles.insight}>
          <div className={styles.insightDot} style={{ background: '#94a3b8' }} />
          <span className={styles.insightText}>
            <strong>{weakestPillar.label}</strong> is your weakest pillar — averaging{' '}
            <strong>{weakestPillar.avg}/100</strong> across recent analyses.
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
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.06} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="idx" stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={1.5}
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
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%"
                      innerRadius={30} outerRadius={54}
                      paddingAngle={2} dataKey="value" strokeWidth={0}
                      startAngle={90} endAngle={-270}>
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutLabel score={avgScore} />
              </div>

              <div className={styles.donutLegend}>
                {pillarAvgs.map(p => (
                  <div key={p.key} className={styles.donutLegendRow}>
                    <div className={styles.donutLegendDot} style={{ background: p.color }} />
                    <span className={styles.donutLegendLabel}>{p.label}</span>
                    <div className={styles.donutLegendBarWrap}>
                      <div className={styles.donutLegendBar}>
                        <div style={{ width: `${p.avg}%`, background: p.color, height: '100%', borderRadius: 2 }} />
                      </div>
                    </div>
                    <span className={styles.donutLegendScore}>{p.avg}</span>
                  </div>
                ))}
                <div className={styles.contentHealth}>
                  <Heart style={{ width: 11, height: 11, color: '#94a3b8' }} />
                  <span>Content Health: </span>
                  <strong>{contentHealth}%</strong>
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
                    <span className={styles.analysisScore}>
                      {item.overall_score ?? '—'}
                    </span>
                    <span className={styles.analysisDate}>{timeAgo(item.analyzed_at)}</span>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I scored ${item.overall_score ?? '—'}/100 on rain OS for ${item.title || item.url || 'my content'}. How does yours rank?`)}&url=${encodeURIComponent(window.location.origin + '/analyze')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share to X"
                      className={styles.shareX}
                      onClick={e => e.stopPropagation()}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
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
                <div className={styles.actionIconWrap} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <a.Icon className={styles.actionIcon} style={{ color: '#94a3b8' }} />
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
                ? `Use this as a before/after snapshot across your ${competitorMap.totalQueries} tracked ${competitorMap.totalQueries === 1 ? 'query' : 'queries'}`
                : 'Use Citation Monitor to capture a real-time AI citation snapshot after you optimize'}
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
              Optimize first, then run a citation check →
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

      {/* ── Citations Being Tracked ── */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>
              <Radar style={{ width: 14, height: 14, marginRight: 6, verticalAlign: '-2px', color: '#0EA5E9' }} />
              Citations Being Tracked
            </h2>
            <p className={styles.chartSub}>A live snapshot of how AI engines are citing you after optimization</p>
          </div>
          <Link to="/citation-monitor" className={styles.viewAll}>Open Citation Monitor →</Link>
        </div>

        {citationsLoading ? (
          <div className={styles.chartEmpty}><span className="spinner" /></div>
        ) : trackedTopics.length === 0 ? (
          <div className={styles.chartEmpty}>
            <div className={styles.emptyState}>
              <Radar className={styles.emptyIcon} />
              <p>No citation checks yet</p>
              <Link to="/citation-monitor" className={styles.emptyLink}>Optimize, then verify citations →</Link>
            </div>
          </div>
        ) : (
          <div className={styles.citationsList}>
            {trackedTopics.map((t) => {
              const sColor = '#94a3b8';
              const deltaUp = t.delta !== null && t.delta > 0;
              const deltaDown = t.delta !== null && t.delta < 0;
              const deltaColor = deltaUp ? '#22c55e' : deltaDown ? '#ef4444' : 'var(--text-dim)';
              const DeltaIcon = deltaUp ? TrendingUp : deltaDown ? TrendingDown : Minus;
              return (
                <Link
                  key={t.key}
                  to={`/citation-monitor?topic=${encodeURIComponent(t.topic)}`}
                  className={styles.citationRow}
                >
                  <div
                    className={styles.citationStatus}
                    style={{
                      color: t.cited ? '#22c55e' : '#ef4444',
                      background: t.cited ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
                      borderColor: t.cited ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)',
                    }}
                    title={t.cited ? 'Your domain is being cited' : 'Your domain is not currently cited'}
                  >
                    {t.cited
                      ? <CheckCircle2 className={styles.citationStatusIcon} />
                      : <AlertCircle className={styles.citationStatusIcon} />}
                    {t.cited ? 'Cited' : 'Not cited'}
                  </div>
                  <div className={styles.citationMain}>
                    <span className={styles.citationTopic}>{t.topic}</span>
                    <span className={styles.citationMeta}>
                      {t.checkCount} check{t.checkCount === 1 ? '' : 's'} · {timeAgo(t.checkedAt)}
                    </span>
                  </div>
                  <div className={styles.citationSpark}>
                    <Sparkline values={t.spark} color={sColor} />
                  </div>
                  <span className={styles.citationScore} style={{ color: sColor }}>
                    {t.latestScore}
                    <span className={styles.citationScoreSuffix}>/100</span>
                  </span>
                  <div className={styles.citationDelta} style={{ color: deltaColor }}>
                    {t.delta === null ? (
                      <span className={styles.citationDeltaNone}>new</span>
                    ) : (
                      <>
                        <DeltaIcon style={{ width: 11, height: 11 }} />
                        {t.delta === 0 ? '0' : `${t.delta > 0 ? '+' : ''}${t.delta}`}
                      </>
                    )}
                  </div>
                  <ArrowRight className={styles.citationArrow} />
                </Link>
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
                  <p.Icon style={{ width: 13, height: 13, color: '#94a3b8' }} />
                  <span className={styles.subScorePillarLabel}>{p.label}</span>
                  <span className={styles.subScorePillarScore}>{p.pillarScore}</span>
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
