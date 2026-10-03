import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { PILLAR_COLORS } from '../lib/pillarColors.js';
import { buildCitationShare } from '../lib/citationShare.js';
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Plus, TrendingUp, TrendingDown,
  FileText, Globe, GitBranch, ArrowRight,
  BrainCircuit, ShieldCheck, MousePointerClick, SearchCheck,
  Activity, Zap, Minus, Heart, Map as MapIcon, Radar,
  BarChart2, Lock, Clock, Sparkles, HelpCircle, Layers,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import styles from './Dashboard.module.css';

function joinWithAnd(items) {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

const PILLARS = [
  { key: 'ai_readability',          label: 'AI Readability',       color: PILLAR_COLORS.ai_readability, Icon: BrainCircuit },
  { key: 'digital_authority',       label: 'Digital Authority',    color: PILLAR_COLORS.digital_authority, Icon: ShieldCheck },
  { key: 'conversion_readiness',    label: 'Conversion Readiness', color: PILLAR_COLORS.conversion_readiness, Icon: MousePointerClick },
  { key: 'product_discoverability', label: 'Discoverability',      color: PILLAR_COLORS.product_discoverability, Icon: SearchCheck },
  { key: 'rag_readiness',           label: 'RAG Readiness',        color: PILLAR_COLORS.rag_readiness, Icon: Layers },
];

const QUICK_ACTIONS_ALL = {
  general: [
    { to: '/analyze',       label: 'Content Optimizer', sub: 'Paste and score any text',         Icon: FileText,  color: '#6b9bc4' },
    { to: '/url-scanner',   label: 'URL Scanner',       sub: 'Audit a live URL for AEO signals', Icon: Globe,     color: '#8f93c7' },
  ],
  product_sellers: [
    { to: '/analyze',       label: 'Content Optimizer', sub: 'Paste and score product copy',     Icon: FileText,  color: '#6b9bc4' },
    { to: '/url-scanner',   label: 'URL Scanner',       sub: 'Audit product pages for AI signals', Icon: Globe,   color: '#8f93c7' },
  ],
  vibe_coders: [
    { to: '/repo-analysis', label: 'Repo Analysis',     sub: 'Connect GitHub and score docs',     Icon: GitBranch, color: '#7cae8f' },
    { to: '/url-scanner',   label: 'URL Scanner',       sub: 'Audit your live app for AI signals', Icon: Globe,     color: '#8f93c7' },
  ],
  developers: [
    { to: '/repo-analysis', label: 'Repo Analysis',     sub: 'Connect GitHub and score source',  Icon: GitBranch, color: '#7cae8f' },
    { to: '/url-scanner',   label: 'URL Scanner',       sub: 'Audit docs site for AI signals',   Icon: Globe,     color: '#8f93c7' },
  ],
  local_business: [
    { to: '/analyze',       label: 'Content Optimizer', sub: 'Paste and score your page copy',   Icon: FileText,  color: '#6b9bc4' },
    { to: '/url-scanner',   label: 'URL Scanner',       sub: 'Audit your site for local signals', Icon: Globe,     color: '#8f93c7' },
  ],
};

const LANES = [
  { id: 'general',         label: 'Writers & Marketers',    desc: 'Optimize articles, landing pages, and marketing copy for AI citation.', color: '#5b5fc7', Icon: FileText },
  { id: 'product_sellers', label: 'Product Sellers',        desc: 'Maximize AI product discovery with Discoverability scoring at 50% weight.', color: '#5b5fc7', Icon: SearchCheck },
  { id: 'vibe_coders',     label: 'Vibe Coders',            desc: 'Ship fast with AI-built projects? Audit your content, repo, and discoverability before you launch.', color: '#8f93c7', Icon: GitBranch },
  { id: 'developers',      label: 'Developers',             desc: 'Analyze tech docs, READMEs, and API references for AI readability signals.', color: '#8f93c7', Icon: GitBranch },
  { id: 'local_business',  label: 'Local Service Business', desc: 'Get your professional services business cited by AI when customers search locally.', color: '#5b5fc7', Icon: MapIcon },
];

const SAMPLE_TREND = [42, 48, 45, 55, 60, 58, 67, 71, 68, 75].map((score, i) => ({ idx: i + 1, score }));

const SAMPLE_PILLAR_LINES = [
  { key: 'ai_readability', color: PILLAR_COLORS.ai_readability },
  { key: 'digital_authority', color: PILLAR_COLORS.digital_authority },
  { key: 'conversion_readiness', color: PILLAR_COLORS.conversion_readiness },
  { key: 'rag_readiness', color: PILLAR_COLORS.rag_readiness },
];

const SAMPLE_PILLAR_TREND = [
  { idx: 1, ai_readability: 40, digital_authority: 35, conversion_readiness: 45, rag_readiness: 30 },
  { idx: 2, ai_readability: 48, digital_authority: 40, conversion_readiness: 50, rag_readiness: 38 },
  { idx: 3, ai_readability: 45, digital_authority: 46, conversion_readiness: 52, rag_readiness: 42 },
  { idx: 4, ai_readability: 58, digital_authority: 50, conversion_readiness: 60, rag_readiness: 50 },
  { idx: 5, ai_readability: 65, digital_authority: 58, conversion_readiness: 62, rag_readiness: 55 },
  { idx: 6, ai_readability: 71, digital_authority: 63, conversion_readiness: 68, rag_readiness: 60 },
];

const DATE_FILTERS = [
  { id: 'all', label: 'All time' },
  { id: '7', label: '7d' },
  { id: '30', label: '30d' },
  { id: '90', label: '90d' },
];

const TYPE_FILTERS = [
  { id: 'all', label: 'All types' },
  { id: 'content', label: 'Content' },
  { id: 'url', label: 'URL' },
  { id: 'repo', label: 'Repo' },
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

/* ── Trend indicator — plain text, no colored pill (retired per redesign) ── */
function TrendBadge({ pct }) {
  if (pct === null || pct === undefined) return null;
  const up = pct > 0, flat = pct === 0;
  return (
    <span className={styles.trendBadge}>
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

/* ── Pillar line chart tooltip — one row per pillar at the hovered point ── */
function PillarLineTooltip({ active, payload, pillars }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.chartTooltip} style={{ minWidth: 150 }}>
      {pillars.map(p => {
        const entry = payload.find(pl => pl.dataKey === p.key);
        if (!entry) return null;
        return (
          <div key={p.key} className={styles.pillarTooltipRow}>
            <span style={{ color: p.color }}>{p.label}</span>
            <span style={{ color: p.color }} className={styles.pillarTooltipValue}>{entry.value}</span>
          </div>
        );
      })}
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

/* ── Pillar mini bar chart ── */
function PillarBars({ pillars, width = 120, height = 28 }) {
  if (!pillars || pillars.length === 0) {
    return <span className={styles.sparkPlaceholder}>—</span>;
  }
  const gap = 3;
  const barW = (width - gap * (pillars.length - 1)) / pillars.length;
  return (
    <div className={styles.pillarBars} style={{ width, height }}>
      {pillars.map((p) => (
        <div
          key={p.key}
          className={styles.pillarBarTrack}
          style={{ width: barW }}
          title={`${p.label}: ${p.avg}/100`}
        >
          <div
            className={styles.pillarBarFill}
            style={{ height: `${Math.max(p.avg, 3)}%`, background: p.color }}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Collapsible "What does this mean?" ── */
function WhatDoesThisMean({ tagline, children }) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div>
      <p className={styles.pillarTagline}>{tagline}</p>
      <div className={styles.pillarDisclaimer} style={{ padding: collapsed ? '8px 16px' : '12px 16px' }}>
        <div className={styles.pillarDisclaimerHeader}>
          <strong className={styles.pillarDisclaimerTitle}>What does this mean?</strong>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand explanation' : 'Collapse explanation'}
            className={styles.pillarDisclaimerToggle}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
        {!collapsed && <p className={styles.pillarDisclaimerText}>{children}</p>}
      </div>
    </div>
  );
}

/* ── Mini citation-share donut (tool card accent) ── */
function MiniDonut({ data, size = 28 }) {
  if (!data || data.length === 0) {
    return <span className={styles.sparkPlaceholder}>—</span>;
  }
  return (
    <PieChart width={size} height={size}>
      <Pie data={data} dataKey="value" innerRadius={size * 0.3} outerRadius={size * 0.48} paddingAngle={3} stroke="none" isAnimationActive={false}>
        {data.map((d, i) => <Cell key={i} fill={d.color} />)}
      </Pie>
    </PieChart>
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
            onClick={() => onSelect(lane.id)}
          >
            <div className={styles.laneCardIcon}>
              <lane.Icon size={15} style={{ color: 'var(--accent)' }} />
            </div>
            <div className={styles.laneCardLabel}>{lane.label}</div>
            <div className={styles.laneCardDesc}>{lane.desc}</div>
            <div className={styles.laneCardCta}>Select →</div>
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
  const [totalCount, setTotalCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState(14);
  const [citations, setCitations] = useState([]);
  const [brandVisHistory, setBrandVisHistory] = useState([]);
  const [brandVisLoading, setBrandVisLoading] = useState(true);
  const [sovHistory, setSovHistory] = useState([]);
  const [sovLoading, setSovLoading] = useState(true);
  const urlWantsLaneSelect = searchParams.get('selectLane') === '1';
  const [showLaneSelector, setShowLaneSelector] = useState(!userLane || urlWantsLaneSelect);
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const laneSectionRef = useRef(null);

  useEffect(() => {
    if (urlWantsLaneSelect) {
      setShowLaneSelector(true);
      setSearchParams(prev => { const n = new URLSearchParams(prev); n.delete('selectLane'); return n; }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlWantsLaneSelect]);

  useEffect(() => {
    if (showLaneSelector) {
      laneSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showLaneSelector]);

  useEffect(() => {
    api.history({ limit: 50, lane: userLane })
      .then(({ data }) => {
        setHistory(Array.isArray(data) ? data : data?.items ?? []);
        setTotalCount(typeof data?.totalCount === 'number' ? data.totalCount : null);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [userLane]);

  const filteredHistory = useMemo(() => {
    let out = history;
    if (dateFilter !== 'all') {
      const cutoff = Date.now() - Number(dateFilter) * 86400000;
      out = out.filter(h => h.analyzed_at && new Date(h.analyzed_at).getTime() >= cutoff);
    }
    if (typeFilter !== 'all') {
      out = out.filter(h => getItemType(h).toLowerCase() === typeFilter);
    }
    return out;
  }, [history, dateFilter, typeFilter]);

  const filtersActive = dateFilter !== 'all' || typeFilter !== 'all';
  const clearFilters = () => { setDateFilter('all'); setTypeFilter('all'); };

  useEffect(() => {
    api.citationHistory({ limit: 50 })
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : data?.items ?? [];
        setCitations(items);
      })
      .catch(() => setCitations([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.brandVisHistory()
      .then(({ data }) => {
        if (cancelled) return;
        const items = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        setBrandVisHistory(items);
      })
      .catch(() => { if (!cancelled) setBrandVisHistory([]); })
      .finally(() => { if (!cancelled) setBrandVisLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    api.sovHistory()
      .then(({ data }) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : data?.data ?? [];
        setSovHistory(items);
      })
      .catch(() => { if (!cancelled) setSovHistory([]); })
      .finally(() => { if (!cancelled) setSovLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const activePillars = useMemo(() => {
    if (userLane === 'product_sellers') return [
      { ...PILLARS[3], weight: 50 },
      { ...PILLARS[0], weight: 20 },
      { ...PILLARS[1], weight: 15 },
      { ...PILLARS[2], weight: 15 },
      { ...PILLARS[4], weight: 10 },
    ];
    if (userLane === 'developers') return [
      { ...PILLARS[0], label: 'Doc Structure', weight: 32 },
      { ...PILLARS[1], label: 'Tech Completeness', weight: 32 },
      { ...PILLARS[2], label: 'Technical Clarity', weight: 26 },
      { ...PILLARS[4], label: 'RAG Readiness', weight: 10 },
    ];
    if (userLane === 'local_business') return [
      { ...PILLARS[1], label: 'Local Authority', weight: 36 },
      { ...PILLARS[0], label: 'AI Presence', weight: 27 },
      { ...PILLARS[2], label: 'Trust & Conversion', weight: 27 },
      { ...PILLARS[4], label: 'RAG Readiness', weight: 10 },
    ];
    if (userLane === 'vibe_coders') return [
      { ...PILLARS[0], label: 'AI Readability', weight: 32 },
      { ...PILLARS[1], label: 'Discoverability', weight: 32 },
      { ...PILLARS[2], label: 'Conversion', weight: 26 },
      { ...PILLARS[4], label: 'RAG Readiness', weight: 10 },
    ];
    return [
      { ...PILLARS[0], weight: 36 },
      { ...PILLARS[1], weight: 27 },
      { ...PILLARS[2], weight: 27 },
      { ...PILLARS[4], weight: 10 },
    ];
  }, [userLane]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const rawName = user?.email?.split('@')[0]?.replace(/[._]/g, ' ');
  const displayName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';

  const totalAnalyses = filtersActive ? filteredHistory.length : (totalCount ?? history.length);
  const avgScore = filteredHistory.length > 0
    ? Math.round(filteredHistory.reduce((s, h) => s + (h.overall_score ?? 0), 0) / filteredHistory.length)
    : 0;

  const scoreTrend = computeTrend(filteredHistory, 'overall_score');
  const usagePct = user ? Math.round(((user.usage?.count ?? 0) / (user.usage?.limit ?? 100)) * 100) : 0;

  const tier = (user?.subscriptionStatus === 'active' && user?.stripePriceId)
    ? ({ 'price_1SeCJH3NMjs4uYdgpi0xB0XN': 'Pro', 'price_1SeCKM3NMjs4uYdgcBRhgIhD': 'Business', 'price_1SeCHg3NMjs4uYdguOgkr3SQ': 'Free' }[user.stripePriceId] ?? 'Pro')
    : 'Free';

  const pillarAvgs = activePillars.map(p => ({
    ...p,
    avg: filteredHistory.length > 0
      ? Math.round(filteredHistory.reduce((s, h) => s + (h[p.key] ?? 0), 0) / filteredHistory.length)
      : 0,
    trend: computeTrend(filteredHistory, p.key),
  }));

  const contentHealth = pillarAvgs.some(p => p.avg > 0)
    ? Math.round(pillarAvgs.reduce((s, p) => s + p.avg, 0) / pillarAvgs.length)
    : 0;

  const quickWins = useMemo(() => {
    const seen = new Set();
    const wins = [];
    for (const item of filteredHistory.slice(0, 5)) {
      for (const rec of item.recommendations || []) {
        if (!rec) continue;
        const text = typeof rec === 'string' ? rec : rec.text;
        const pillar = typeof rec === 'string' ? null : (rec.pillar ?? null);
        if (!text || seen.has(text)) continue;
        seen.add(text);
        wins.push({ text, pillar });
        if (wins.length >= 3) return wins;
      }
    }
    return wins;
  }, [filteredHistory]);

  const weakestPillar = totalAnalyses >= 3
    ? [...pillarAvgs].sort((a, b) => a.avg - b.avg)[0]
    : null;

  const chartData = [...filteredHistory]
    .slice(0, chartRange)
    .reverse()
    .map((h, i) => ({
      idx: i + 1,
      score: h.overall_score ?? 0,
      date: h.analyzed_at ? timeAgo(h.analyzed_at) : '',
    }));

  const pillarChartData = [...filteredHistory]
    .slice(0, chartRange)
    .reverse()
    .map((h, i) => {
      const point = { idx: i + 1, date: h.analyzed_at ? timeAgo(h.analyzed_at) : '' };
      activePillars.forEach(p => { point[p.key] = h[p.key] ?? 0; });
      return point;
    });

  const citationTotal = citations.length;
  const citationCitedCount = citations.filter(c => c.cited).length;
  const citationRate = citationTotal > 0 ? Math.round((citationCitedCount / citationTotal) * 100) : null;

  // Brand Sentiment: mention rate scoped to the most recently checked brand
  // (case-insensitive match), capped at its last 10 checks. mention_status
  // is read directly off each row so old rows (saved before this was
  // deterministic) still count correctly; only 'mentioned' counts as a hit
  // — 'ambiguous' and 'not_mentioned' both count as not mentioned.
  const brandVisSorted = [...brandVisHistory].sort(
    (a, b) => new Date(b.checked_at || b.checkedAt) - new Date(a.checked_at || a.checkedAt)
  );
  const brandVisLatestBrand = brandVisSorted[0]?.brand || null;
  const brandVisScoped = brandVisLatestBrand
    ? brandVisSorted
        .filter(h => (h.brand || '').toLowerCase() === brandVisLatestBrand.toLowerCase())
        .slice(0, 10)
    : [];
  const brandVisTotal = brandVisScoped.length;
  const brandVisMentionedCount = brandVisScoped.filter(
    h => (h.mention_status || h.mentionStatus) === 'mentioned'
  ).length;
  const brandVisRate = brandVisTotal > 0 ? Math.round((brandVisMentionedCount / brandVisTotal) * 100) : null;

  // Share of Voice: mention rate scoped to the most recently checked brand
  // (case-insensitive match), capped at its last 10 checks — same pattern
  // as the Brand Sentiment tile. mentionedCount/cited_count is read
  // directly off each row so old rows still count correctly.
  const sovSorted = [...sovHistory].sort(
    (a, b) => new Date(b.checkedAt || b.checked_at) - new Date(a.checkedAt || a.checked_at)
  );
  const sovLatestBrand = sovSorted[0]?.brand || null;
  const sovScoped = sovLatestBrand
    ? sovSorted
        .filter(h => (h.brand || '').toLowerCase() === sovLatestBrand.toLowerCase())
        .slice(0, 10)
    : [];
  const sovTotal = sovScoped.length;
  const sovMentionedCount = sovScoped.filter(
    h => (h.mentionedCount ?? h.citedCount ?? h.cited_count ?? 0) > 0
  ).length;
  const sovRate = sovTotal > 0 ? Math.round((sovMentionedCount / sovTotal) * 100) : null;
  const sovShare = sovScoped.length > 0 ? buildCitationShare(sovScoped[0]) : [];

  // Build tool-specific KPI cards
  const toolCards = [
    {
      key: 'content',
      label: 'Content Health',
      to: '/analyze',
      hasData: totalAnalyses > 0,
      value: totalAnalyses > 0 ? `${avgScore}` : null,
      suffix: '/100',
      sub: totalAnalyses > 0 ? `${totalAnalyses} analyses · ${weakestPillar ? `${weakestPillar.label} weakest` : 'all balanced'}` : 'No analysis data yet — paste content to score',
      trend: scoreTrend,
      Icon: FileText,
      pillars: totalAnalyses > 0 ? pillarAvgs : null,
      tooltip: `Average of your ${joinWithAnd(activePillars.map(p => p.label))} scores — the same signals that make AI search engines more likely to cite you. Bars below show each pillar.`,
    },
    {
      key: 'citation',
      label: 'Citation Monitor',
      to: '/citation-monitor',
      hasData: citationTotal > 0,
      value: citationTotal > 0 ? `${citationRate}%` : null,
      sub: citationTotal > 0 ? `${citationCitedCount}/${citationTotal} topics cited` : 'No citation data yet — run a topic check to see if AI cites you',
      Icon: Radar,
      spark: null,
      tooltip: 'Percentage of tracked topics where Gemini cites your brand, using live Google Search grounding. The higher the number, the more often Gemini treats you as a source.',
    },
    {
      key: 'brand',
      label: 'Brand Sentiment',
      to: '/brand-visibility',
      hasData: brandVisTotal > 0,
      value: brandVisTotal > 0 ? `${brandVisRate}%` : null,
      sub: brandVisTotal > 0
        ? `${brandVisLatestBrand} — mentioned in ${brandVisMentionedCount} of your last ${brandVisTotal} check${brandVisTotal > 1 ? 's' : ''}`
        : 'No brand sentiment data yet — run a check to see how Gemini describes you',
      Icon: Heart,
      spark: null,
      tooltip: 'Percentage of your recent checks where Gemini mentioned your brand by name when answering your topic.',
    },
    {
      key: 'sov',
      label: 'Share of Voice',
      to: '/share-of-voice',
      hasData: sovTotal > 0,
      value: sovTotal > 0 ? `${sovRate}%` : null,
      sub: sovTotal > 0
        ? `${sovLatestBrand} — mentioned in ${sovMentionedCount} of your last ${sovTotal} check${sovTotal > 1 ? 's' : ''}`
        : 'No Share of Voice data yet — run a check to see how often Gemini cites your brand',
      Icon: BarChart2,
      donut: sovShare.length > 0 ? sovShare : null,
      tooltip: 'How many of your recent checks had Gemini mention your brand in at least one of the three query phrasings.',
    },
    {
      key: 'usage',
      label: 'API Usage',
      to: '/upgrade',
      hasData: !!user,
      value: user ? `${user.usage?.count ?? 0}` : null,
      suffix: `/${user?.usage?.limit ?? 100}`,
      sub: tier ? `${tier} plan` : 'Sign in to track',
      Icon: Zap,
      bar: user ? Math.min(100, Math.round(((user.usage?.count ?? 0) / (user.usage?.limit || 1)) * 100)) : null,
      tooltip: 'How many AI analyses you have used versus your plan limit. The Free plan includes 5 in total; paid plans reset each billing period.',
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
            <Link to="/history" style={{ color: 'var(--accent)' }} title="Rows in the analysis history table (includes all saved analyses). 'API Usage' shows counted API calls against your plan and may exclude imports or manual inserts.">You have a library of {totalCount ?? history.length} pieces analyzed</Link>
          </p>
        </div>
        <button onClick={() => navigate('/analyze')} className={styles.newBtn}>
          <Plus className={styles.newBtnIcon} />
          New Analysis
        </button>
      </div>

      {/* ── Lane Banner / Selector ── */}
      <div ref={laneSectionRef}>
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
      </div>

      {/* ── Pillar Breakdown (above the fold, full-width hero) ── */}
      <div className={styles.chartCard} style={{ marginBottom: 12 }}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>Pillar Breakdown</h2>
            <p className={styles.chartSub}>How your content performs across each AEO pillar, over time.</p>
            <span className={styles.chartHelp} title={`How your scores are distributed across your ${activePillars.length} pillars: ${joinWithAnd(activePillars.map(p => p.label))}.`}>
              <HelpCircle size={11} />
            </span>
          </div>
        </div>

        <WhatDoesThisMean tagline="AI's structured read of your content — not a raw measurement.">
          Gemini reads your content and scores it against a fixed set of criteria for this pillar, the same way each time. It's not counting anything concrete, like word count or load speed — it's a graded read of how well your content works for an AI trying to understand and use it. Because the criteria stay fixed, the score is meaningful to compare across your own pages, or the same page over time, even though it's a judgment rather than a fact.
        </WhatDoesThisMean>
        {userLane === 'product_sellers' && (
          <WhatDoesThisMean tagline="AI's read on how shoppable your page looks — specific to product sellers.">
            This pillar checks something the other four don't: whether an AI could confidently describe, compare, and recommend your product from your page alone — things like clear pricing, specs, and availability. It's graded the same way as your other pillar scores, an AI's structured read rather than a technical measurement, but scored specifically for how AI tools use product pages when answering shopping questions.
          </WhatDoesThisMean>
        )}

        {loading ? (
          <div className={styles.chartEmpty}><span className="spinner" /></div>
        ) : !pillarAvgs.some(p => p.avg > 0) ? (
          <div className={styles.chartEmptyRich}>
            <div className={styles.sampleBackdrop}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={SAMPLE_PILLAR_TREND}>
                  {SAMPLE_PILLAR_LINES.map(l => (
                    <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={1.5} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.emptyStateOverlay}>
              <Activity className={styles.emptyIcon} />
              <p>{filtersActive && history.length > 0 ? 'No analyses match these filters' : 'No pillar data yet'}</p>
              {filtersActive && history.length > 0 ? (
                <button type="button" className={styles.emptyLink} onClick={clearFilters}>Clear filters →</button>
              ) : (
                <Link to="/analyze" className={styles.emptyLink}>Run analysis →</Link>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <div className={styles.heroStatRow}>
                <span className={styles.heroStatValue}>{avgScore}</span>
                <span className={styles.heroStatMax}>/100</span>
                <TrendBadge pct={scoreTrend} />
              </div>
              <div className={styles.heroChartBg}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={pillarChartData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                    <XAxis dataKey="idx" stroke="transparent"
                      tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="transparent"
                      tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<PillarLineTooltip pillars={activePillars} />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                    {activePillars.map(p => (
                      <Line key={p.key} type="monotone" dataKey={p.key} stroke={p.color} strokeWidth={2}
                        dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.contentHealth}>
                <Heart style={{ width: 11, height: 11, color: '#94a3b8' }} />
                <span>Content Health: </span>
                <strong>{contentHealth}%</strong>
              </div>
            </div>

            <div className={styles.heroRank}>
              <div className={styles.heroRankHeader}>
                <span>Pillars ranked by score</span>
              </div>
              {[...pillarAvgs].sort((a, b) => b.avg - a.avg).map(p => (
                <div key={p.key} className={styles.heroRankRow}>
                  <div className={styles.heroRankLabelRow}>
                    <span className={styles.pillarTableDot} style={{ background: p.color }} />
                    <span className={styles.heroRankLabel}>{p.label}</span>
                  </div>
                  <div className={styles.heroRankValueRow}>
                    <span className={styles.heroRankScore}>{p.avg}</span>
                    <TrendBadge pct={p.trend} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Tool Snapshot Cards ── */}
      <div className={styles.toolCards}>
        {toolCards.map(t => (
          <Link key={t.key} to={t.to} className={`${styles.toolCard} ${!t.hasData ? styles.toolCardEmpty : ''}`}>
            <div className={styles.toolCardTop}>
              <div className={styles.toolCardLabelRow}>
                <span className={styles.toolCardLabel}>{t.label}</span>
                {t.tooltip && (
                  <span className={styles.toolCardInfo} data-tooltip={t.tooltip}>
                    <HelpCircle size={11} />
                  </span>
                )}
                {!t.hasData && (
                  <span className={styles.toolCardBadgeEmpty}>
                    <Lock size={9} /> No data yet
                  </span>
                )}
              </div>
              <div className={styles.kpiIconWrap}>
                <t.Icon className={styles.kpiIcon} />
              </div>
            </div>

            <div className={styles.toolCardValueRow}>
              {t.hasData && t.value !== null ? (
                <>
                  <span className={styles.kpiValue}>{t.value}</span>
                  {t.suffix && <span className={styles.kpiSuffix}>{t.suffix}</span>}
                </>
              ) : (
                <span className={styles.toolCardPlaceholder}>No data yet</span>
              )}
            </div>

            <div className={styles.toolCardBottom}>
              <span className={styles.kpiSub}>{t.sub}</span>
              {t.trend !== null && t.trend !== undefined && <TrendBadge pct={t.trend} />}
            </div>

            {t.pillars && t.pillars.length > 0 ? (
              <div className={styles.toolCardSpark}>
                <PillarBars pillars={t.pillars} />
              </div>
            ) : t.donut && t.donut.length > 0 ? (
              <div className={styles.toolCardSpark}>
                <MiniDonut data={t.donut} />
              </div>
            ) : t.spark && t.spark.length > 1 && (
              <div className={styles.toolCardSpark}>
                <Sparkline values={t.spark} color="#94a3b8" width={120} height={24} />
              </div>
            )}

            {t.bar !== null && t.bar !== undefined && (
              <div className={styles.toolCardBarWrap}>
                <div className={styles.toolCardBarTrack}>
                  <div className={styles.toolCardBarFill} style={{ width: `${t.bar}%` }} />
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* ── Filters ── */}
      {!loading && history.length > 0 && (
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            {DATE_FILTERS.map(f => (
              <button key={f.id} type="button"
                className={`${styles.filterBtn} ${dateFilter === f.id ? styles.filterBtnActive : ''}`}
                onClick={() => setDateFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className={styles.filterGroup}>
            {TYPE_FILTERS.map(f => (
              <button key={f.id} type="button"
                className={`${styles.filterBtn} ${typeFilter === f.id ? styles.filterBtnActive : ''}`}
                onClick={() => setTypeFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          {filtersActive && (
            <span className={styles.filterSummary}>
              {filteredHistory.length} of {history.length}
              <button type="button" className={styles.filterClear} onClick={clearFilters}>Clear</button>
            </span>
          )}
        </div>
      )}

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

      {/* ── Quick Wins ── */}
      {quickWins.length > 0 && (
        <div className={styles.chartCard} style={{ marginBottom: 12 }}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Quick wins</h2>
              <p className={styles.chartSub}>Top fixes from your recent analyses</p>
              <span className={styles.chartHelp} title="The highest-impact recommendations pulled from your most recent analyses.">
                <HelpCircle size={11} />
              </span>
            </div>
          </div>
          <div className={styles.quickWinsList}>
            {quickWins.map((rec, i) => {
              const pillarInfo = rec.pillar ? PILLARS.find(p => p.key === rec.pillar) : null;
              return (
                <div key={i} className={styles.quickWinRow}>
                  <span className={styles.quickWinIndex}>{i + 1}</span>
                  {pillarInfo && (
                    <span
                      className={styles.quickWinTag}
                      style={{ background: `${pillarInfo.color}26`, color: pillarInfo.color }}
                    >
                      {pillarInfo.label}
                    </span>
                  )}
                  <span className={styles.quickWinText}>{rec.text}</span>
                  <Link to="/analyze" className={styles.insightAction}>Fix this →</Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom row ── */}
      <div className={styles.bottomRow}>

        {/* Score Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Score Trend</h2>
              <p className={styles.chartSub}>Last {chartRange} analyses</p>
              <span className={styles.chartHelp} title="How your overall content scores have changed over time. Higher scores mean AI engines are more likely to cite your content.">
                <HelpCircle size={11} />
              </span>
            </div>
            <div className={styles.rangeToggle}>
              {[7, 14, 30].map(r => (
                <button key={r} type="button"
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
            <div className={styles.chartEmptyRich}>
              <div className={styles.sampleBackdrop}>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={SAMPLE_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                    <defs>
                      <linearGradient id="scoreGradSample" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5b5fc7" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="#5b5fc7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="score" stroke="#5b5fc7" strokeWidth={1.5}
                      fill="url(#scoreGradSample)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.emptyStateOverlay}>
                <Activity className={styles.emptyIcon} />
                <p>{filtersActive && history.length > 0 ? 'No analyses match these filters' : 'Run your first analysis to see trends here'}</p>
                {filtersActive && history.length > 0 ? (
                  <button type="button" className={styles.emptyLink} onClick={clearFilters}>Clear filters →</button>
                ) : (
                  <Link to="/analyze" className={styles.emptyLink}>Get started →</Link>
                )}
              </div>
            </div>
          ) : (
            <ResponsiveContainer key={`chart-${chartRange}`} width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5b5fc7" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#5b5fc7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="idx" stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="score" stroke="#5b5fc7" strokeWidth={1.5}
                  fill="url(#scoreGrad)" dot={false}
                  activeDot={{ r: 4, fill: '#5b5fc7', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Analyses */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Recent Analyses</h2>
              <p className={styles.chartSub}>Your latest content scores</p>
              <span className={styles.chartHelp} title="A quick list of your latest analyses with overall scores and pillar breakdowns. Click to view the full analysis.">
                <HelpCircle size={11} />
              </span>
            </div>
            <Link to="/history" className={styles.viewAll}>View all →</Link>
          </div>

          {loading ? (
            <div className={styles.chartEmpty}><span className="spinner" /></div>
          ) : filteredHistory.length === 0 ? (
            <div className={styles.chartEmpty}>
              <div className={styles.emptyState}>
                <FileText className={styles.emptyIcon} />
                <p>{filtersActive && history.length > 0 ? 'No analyses match these filters' : 'No analyses yet'}</p>
                {filtersActive && history.length > 0 ? (
                  <button type="button" className={styles.emptyLink} onClick={clearFilters}>Clear filters →</button>
                ) : (
                  <Link to="/analyze" className={styles.emptyLink}>Run your first →</Link>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.analysesList}>
              {filteredHistory.slice(0, 7).map((item, i) => {
                const type = getItemType(item);
                const typeColor = type === 'URL' ? '#8f93c7' : type === 'Repo' ? '#7cae8f' : '#6b9bc4';
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
              <span className={styles.chartHelp} title="Quick shortcuts to run different types of analysis: Content Optimizer, URL Scanner, Repo Analysis, and more.">
                <HelpCircle size={11} />
              </span>
            </div>
          </div>
          <div className={styles.actionList}>
            {(QUICK_ACTIONS_ALL[userLane] || QUICK_ACTIONS_ALL.general).map(a => (
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

    </div>
  );
}
