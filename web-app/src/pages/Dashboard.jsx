import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { PILLAR_COLORS } from '../lib/pillarColors.js';
import { buildCitationShare } from '../lib/citationShare.js';
import { urlScannerLabel } from '../lib/laneLabels.js';
import { LANES as LANE_META } from '../lib/lanes.js';
import { groupPieces, pieceName, pieceKey } from '../lib/analysisSeries.js';
import { domainOf } from '../lib/opportunities.js';
import Select from '../components/Select.jsx';
import NewAnalysisMenu from '../components/NewAnalysisMenu.jsx';
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
  Activity, Zap, Minus, Heart, Map as MapIcon, MapPin, Radar,
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
  { key: 'local_presence',          label: 'Local Presence',       color: PILLAR_COLORS.local_presence, Icon: MapPin },
];

// product_sellers and local_business already have their content live on a
// page, not drafted fresh — URL Scanner (point at the live page) is the
// right default action, not Content Optimizer (paste raw text). Other lanes
// keep the Content Optimizer fallback unchanged.
const LANE_DEFAULT_ROUTES = {
  product_sellers: '/url-scanner',
  local_business: '/url-scanner',
};

const LANE_VISUALS = {
  general:         { color: '#f5f5f5', Icon: FileText },
  product_sellers: { color: '#f5f5f5', Icon: SearchCheck },
  vibe_coders:     { color: '#f5f5f5', Icon: GitBranch },
  developers:      { color: '#f5f5f5', Icon: GitBranch },
  local_business:  { color: '#f5f5f5', Icon: MapIcon },
};
const LANES = LANE_META.map(l => ({ ...l, ...LANE_VISUALS[l.id] }));

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

const CONTENT_TYPE_TOGGLES = [
  { id: 'content', label: 'Content' },
  { id: 'url', label: 'URL' },
  { id: 'repo', label: 'Repo' },
];

const CONTENT_TYPE_ROUTES = {
  content: '/analyze',
  url: '/url-scanner',
  repo: '/repo-analysis',
};

const CONTENT_TYPE_TOOL_NAMES = {
  content: 'Content Optimizer',
  url: 'URL Scanner',
  repo: 'Repo Analysis',
};

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
function GaugeArc({ score = 0, color = '#1C73C4', size = 120 }) {
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

/* ── Trend indicator — plain text, colored by direction. Only the delta
   itself carries semantic color, never the whole card it sits in. ── */
function TrendBadge({ pct }) {
  if (pct === null || pct === undefined) return null;
  const up = pct > 0, flat = pct === 0;
  const color = flat ? 'var(--text-muted)' : up ? 'var(--success)' : 'var(--danger)';
  return (
    <span className={styles.trendBadge} style={{ color }}>
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
/* ── Change since the previous run of the same piece, in points ── */
function DeltaPts({ value }) {
  if (value === null || value === undefined) return null;
  const color = value === 0 ? 'var(--text-muted)' : value > 0 ? 'var(--success)' : 'var(--danger)';
  return <span className={styles.deltaPts} style={{ color }}>{value > 0 ? '+' : ''}{value} pts</span>;
}

function PillarLineTooltip({ active, payload, pillars }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload || {};
  return (
    <div className={styles.chartTooltip} style={{ minWidth: 150 }}>
      {point.label && (
        <div className={styles.pieceTooltipHead}>
          <strong>{point.label}</strong>{point.date ? ` · ${point.date}` : ''}
          {point.title && <div className={styles.pieceTooltipTitle}>{point.title}</div>}
        </div>
      )}
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

/* ── Mini hit/miss dot row (tool card accent) ── */
function DotRow({ values }) {
  if (!values || values.length === 0) {
    return <span className={styles.sparkPlaceholder}>—</span>;
  }
  return (
    <div className={styles.dotRow}>
      {values.map((hit, i) => (
        <span
          key={i}
          className={styles.dot}
          style={{ background: hit ? 'var(--accent)' : 'rgba(255,255,255,0.12)' }}
        />
      ))}
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
            onClick={() => onSelect(lane.id)}
          >
            <div className={styles.laneCardIcon}>
              <lane.Icon size={15} style={{ color: 'var(--text)' }} />
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
  const [pieceSel, setPieceSel] = useState(null);
  // What the whole dashboard is about: '' (each tool's latest), 'site:<domain>'
  // (that site's pages plus every check run for it) or 'piece:<key>'.
  const [focus, setFocus] = useState(() => {
    try { return localStorage.getItem('rain_os_dash_focus') || ''; } catch { return ''; }
  });
  const [citations, setCitations] = useState([]);
  const [brandVisHistory, setBrandVisHistory] = useState([]);
  const [brandVisLoading, setBrandVisLoading] = useState(true);
  const [sovHistory, setSovHistory] = useState([]);
  const [sovLoading, setSovLoading] = useState(true);
  const urlWantsLaneSelect = searchParams.get('selectLane') === '1';
  const [showLaneSelector, setShowLaneSelector] = useState(!userLane || urlWantsLaneSelect);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAllFixes, setShowAllFixes] = useState(false);
  const laneSectionRef = useRef(null);
  const typeFilterAutoSet = useRef(false);

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
        const items = Array.isArray(data) ? data : data?.items ?? [];
        setHistory(items);
        setTotalCount(typeof data?.totalCount === 'number' ? data.totalCount : null);
        // Default the Content Health type toggle to whichever type the user
        // most recently ran — not a blended "all", and only on first load so
        // a manual switch sticks for the rest of the session.
        if (!typeFilterAutoSet.current && items.length > 0) {
          setTypeFilter(getItemType(items[0]).toLowerCase());
          typeFilterAutoSet.current = true;
        }
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [userLane]);

  const siteOfItem = h => (h.repo ? null : domainOf(h.url));

  const focusOptions = useMemo(() => {
    const sites = new Map();
    const site = d => {
      if (!sites.has(d)) sites.set(d, { pieces: new Set(), checks: 0 });
      return sites.get(d);
    };
    for (const h of history) {
      const d = siteOfItem(h);
      if (d) site(d).pieces.add(pieceKey(h));
    }
    for (const c of [...citations, ...brandVisHistory, ...sovHistory]) {
      const d = domainOf(c.url);
      if (d) site(d).checks += 1;
    }
    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    const siteOpts = [...sites].map(([d, v]) => ({
      value: `site:${d}`,
      label: d,
      hint: `${plural(v.pieces.size, 'page')} · ${plural(v.checks, 'check')}`,
    }));
    const loose = groupPieces(history.filter(h => !siteOfItem(h))).map(p => ({
      value: `piece:${p.key}`,
      label: p.name.length > 48 ? `${p.name.slice(0, 45)}…` : p.name,
      hint: p.latest.repo ? 'Repo' : 'Content',
    }));
    return [{ value: '', label: 'Latest of each tool' }, ...siteOpts.slice(0, 30), ...loose.slice(0, 30)];
  }, [history, citations, brandVisHistory, sovHistory]);

  // A remembered focus that no longer exists (data cleared) falls back quietly.
  const activeFocus = focusOptions.some(o => o.value === focus) ? focus : '';
  const focusSite = activeFocus.startsWith('site:') ? activeFocus.slice(5) : null;

  function changeFocus(next) {
    setFocus(next);
    setPieceSel(next.startsWith('piece:') ? next.slice(6) : null);
    try { localStorage.setItem('rain_os_dash_focus', next); } catch { /* not remembered */ }
  }

  const scopeChecks = rows => (focusSite ? rows.filter(r => domainOf(r.url) === focusSite) : activeFocus ? [] : rows);

  const filteredHistory = useMemo(() => {
    let out = history;
    if (focusSite) out = out.filter(h => siteOfItem(h) === focusSite);
    else if (activeFocus.startsWith('piece:')) out = out.filter(h => pieceKey(h) === activeFocus.slice(6));
    else if (typeFilter !== 'all') out = out.filter(h => getItemType(h).toLowerCase() === typeFilter);
    return out;
  }, [history, typeFilter, activeFocus, focusSite]);

  // Pillar Breakdown follows one piece at a time: the same repo, URL, or
  // re-analysis chain. Unrelated analyses are never drawn on one line.
  const pieces = useMemo(() => groupPieces(filteredHistory), [filteredHistory]);
  const selectedPiece = pieces.find(p => p.key === pieceSel) || pieces[0] || null;

  const filtersActive = typeFilter !== 'all';
  const clearFilters = () => { setTypeFilter('all'); };
  const typeRoute = CONTENT_TYPE_ROUTES[typeFilter] || LANE_DEFAULT_ROUTES[userLane] || '/analyze';

  const dashboardHeroCopy = userLane === 'product_sellers'
    ? { title: 'See what AI shopping assistants see on your product pages', sub: "Scan a product page and score it against the pricing, availability, and spec signals AI shopping tools look for — then fix what's holding it back.", cta: 'Open Product Page Optimization', route: '/url-scanner' }
    : userLane === 'local_business'
    ? { title: 'Make sure AI assistants can find your business', sub: "Scan a page from your site and score it against the name, address, phone, and hours signals local AI search relies on — then fix what's holding it back.", cta: 'Open Product Page Optimization', route: '/url-scanner' }
    : userLane === 'developers'
    ? { title: 'See what AI tools can actually parse in your repo', sub: "Connect a repo and score your docs and app structure against the signals AI coding assistants and crawlers rely on — then fix what's holding it back.", cta: 'Open Repo Analysis', route: '/repo-analysis' }
    : userLane === 'vibe_coders'
    ? { title: 'Audit your build before AI tools try to read it', sub: "Connect the repo you just shipped and score it against the signals AI assistants rely on — then fix what's holding it back before launch.", cta: 'Open Repo Analysis', route: '/repo-analysis' }
    : { title: 'Create content that increases your AI visibility', sub: "Paste a draft and score it against the same signals AI engines use to decide what to cite — then fix what's holding it back.", cta: 'Open Content Optimizer', route: '/analyze' };

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
      { ...PILLARS[5], weight: 30 },
      { ...PILLARS[0], label: 'AI Presence', weight: 20 },
      { ...PILLARS[1], label: 'Digital Authority', weight: 20 },
      { ...PILLARS[2], label: 'Trust & Conversion', weight: 20 },
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
  // Prefer the user's real name (set in Settings, or pulled from their
  // Google profile at sign-in) — only fall back to guessing one from the
  // email's local part when no real name is on file.
  const rawName = user?.name || user?.email?.split('@')[0]?.replace(/[._]/g, ' ');
  const displayName = rawName ? (user?.name ? rawName.split(' ')[0] : rawName.charAt(0).toUpperCase() + rawName.slice(1)) : '';

  const totalAnalyses = filtersActive ? filteredHistory.length : (totalCount ?? history.length);

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

  // The single most recent analysis for the selected type — fixes shown
  // below are scoped to this one scan, not blended across several.
  const latestTypedAnalysis = selectedPiece?.latest ?? filteredHistory[0] ?? null;

  const allFixes = useMemo(() => {
    if (!latestTypedAnalysis) return [];
    const seen = new Set();
    const fixes = [];
    for (const rec of latestTypedAnalysis.recommendations || []) {
      if (!rec) continue;
      const text = typeof rec === 'string' ? rec : rec.text;
      const pillar = typeof rec === 'string' ? null : (rec.pillar ?? null);
      if (!text || seen.has(text)) continue;
      seen.add(text);
      fixes.push({ text, pillar });
    }
    return fixes;
  }, [latestTypedAnalysis]);

  const quickWins = showAllFixes ? allFixes : allFixes.slice(0, 3);

  const chartData = [...filteredHistory]
    .slice(0, chartRange)
    .reverse()
    .map((h, i) => ({
      idx: i + 1,
      score: h.overall_score ?? 0,
      date: h.analyzed_at ? timeAgo(h.analyzed_at) : '',
    }));

  const pieceRuns = selectedPiece ? selectedPiece.runs : [];
  const shownRuns = pieceRuns.slice(-chartRange);
  const firstShownNumber = pieceRuns.length - shownRuns.length + 1;
  const piecePoints = shownRuns.map((h, i) => {
    const n = firstShownNumber + i;
    const point = { idx: n, label: `Analysis ${n}`, date: h.analyzed_at ? timeAgo(h.analyzed_at) : '', title: pieceName(h) };
    activePillars.forEach(p => { point[p.key] = h[p.key] ?? 0; });
    return point;
  });
  const latestRun = pieceRuns[pieceRuns.length - 1] || null;
  const prevRun = pieceRuns.length > 1 ? pieceRuns[pieceRuns.length - 2] : null;
  const ptsDelta = (key) => (latestRun && prevRun && latestRun[key] != null && prevRun[key] != null)
    ? Math.round(latestRun[key] - prevRun[key]) : null;
  const piecePillars = activePillars.map(p => ({
    ...p,
    score: latestRun ? Math.round(latestRun[p.key] ?? 0) : 0,
    delta: ptsDelta(p.key),
  }));

  // Mentions follows one question (the most recently checked), capped at
  // its last 10 checks, so unrelated questions are never blended.
  const citationSorted = [...scopeChecks(citations)].sort(
    (a, b) => new Date(b.checkedAt || b.checked_at) - new Date(a.checkedAt || a.checked_at)
  );
  const topicKeyOf = t => (t || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const citationLatestTopic = citationSorted[0]?.topic || null;
  const citationScoped = citationLatestTopic
    ? citationSorted.filter(c => topicKeyOf(c.topic) === topicKeyOf(citationLatestTopic)).slice(0, 10)
    : [];
  const citationTotal = citationScoped.length;
  const citationCitedCount = citationScoped.filter(c => c.cited).length;
  const citationRate = citationTotal > 0 ? Math.round((citationCitedCount / citationTotal) * 100) : null;

  // Brand Sentiment: mention rate scoped to the most recently checked brand
  // (case-insensitive match), capped at its last 10 checks. mention_status
  // is read directly off each row so old rows (saved before this was
  // deterministic) still count correctly; only 'mentioned' counts as a hit
  // — 'ambiguous' and 'not_mentioned' both count as not mentioned.
  const brandVisSorted = [...scopeChecks(brandVisHistory)].sort(
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
  const sovSorted = [...scopeChecks(sovHistory)].sort(
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

  // One set of cards, each named after the tool its number comes from.
  // Local businesses get plainer names for the same three numbers.
  const isLocal = userLane === 'local_business';
  const toolCards = [
    {
      key: 'citation',
      subject: citationLatestTopic ? `“${citationLatestTopic}”` : null,
      label: isLocal ? 'Cited by AI' : 'Citation Monitor',
      to: '/citation-monitor',
      hasData: citationTotal > 0,
      value: citationTotal > 0 ? `${citationRate}%` : null,
      sub: citationTotal > 0
        ? `Cited in ${citationCitedCount} of your last ${citationTotal} check${citationTotal > 1 ? 's' : ''}`
        : 'No data yet. Check a question your customers ask to see if AI cites you.',
      Icon: Radar,
      dots: citationTotal > 0 ? citationScoped.slice(0, 8).reverse().map(c => !!c.cited) : null,
      tooltip: 'How often Gemini cited your site for the question you checked most recently, over its last 10 checks. Each check uses live Google Search.',
    },
    {
      key: 'brand',
      subject: brandVisLatestBrand,
      label: isLocal ? 'Mentioned by AI' : 'Brand Sentiment',
      to: '/brand-visibility',
      hasData: brandVisTotal > 0,
      value: brandVisTotal > 0 ? `${brandVisRate}%` : null,
      sub: brandVisTotal > 0
        ? `Mentioned in ${brandVisMentionedCount} of your last ${brandVisTotal} check${brandVisTotal > 1 ? 's' : ''}`
        : 'No data yet. Run a check to see how Gemini describes you.',
      Icon: Heart,
      tooltip: 'How often Gemini mentioned your brand by name in your recent Brand Sentiment checks for this brand.',
    },
    {
      key: 'sov',
      subject: sovLatestBrand,
      label: isLocal ? 'Mentioned in 3 asks' : 'Share of Voice',
      to: '/share-of-voice',
      hasData: sovTotal > 0,
      value: sovTotal > 0 ? `${sovRate}%` : null,
      sub: sovTotal > 0
        ? `Mentioned in ${sovMentionedCount} of your last ${sovTotal} check${sovTotal > 1 ? 's' : ''}`
        : 'No data yet. Run a check to see how often Gemini mentions your brand.',
      Icon: BarChart2,
      donut: sovShare.length > 0 ? sovShare : null,
      tooltip: 'How many of your recent Share of Voice checks had Gemini mention your brand in at least one of the 3 different ways we ask about your topic.',
    },
    {
      key: 'usage',
      subject: 'This month',
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
            <Link to="/history" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }} title="Every saved analysis in your history — separate from 'API Usage', which counts billed API calls and may exclude imports or manual inserts.">You have a library of {totalCount ?? history.length} pieces analyzed</Link>
          </p>
        </div>
        <div className={styles.headerBtns}>
          <button onClick={() => navigate('/full-check')} className={styles.fullBtn}>Full check</button>
          <NewAnalysisMenu lane={userLane} firstTime={!loading && history.length === 0} />
        </div>
      </div>

      {/* ── Lane Banner / Selector ── */}
      <div ref={laneSectionRef}>
        {showLaneSelector ? (
          <LaneSelector onSelect={(id) => { setUserLane(id); setShowLaneSelector(false); }} />
        ) : null}
      </div>

      {/* ── Create Content hero — one-time per-lane onboarding prompt, gone once the lane has any analysis history ── */}
      {!loading && history.length === 0 && (
        <div className={styles.contentHero}>
          <div className={styles.contentHeroIcon}>
            <Sparkles size={18} />
          </div>
          <h2 className={styles.contentHeroTitle}>{dashboardHeroCopy.title}</h2>
          <p className={styles.contentHeroSub}>{dashboardHeroCopy.sub}</p>
          <button onClick={() => navigate(dashboardHeroCopy.route)} className={`btn btn-primary ${styles.contentHeroBtn}`}>
            {dashboardHeroCopy.cta}
            <ArrowRight size={14} />
          </button>
          <span className={styles.contentHeroCaption}>
            <Sparkles size={11} /> Scored in seconds, not days
          </span>
        </div>
      )}

      {!loading && focusOptions.length > 1 && (
        <div className={styles.focusBar}>
          <span className="eyebrow">Showing</span>
          <Select
            className={styles.focusSelect}
            value={activeFocus}
            onChange={changeFocus}
            ariaLabel="Choose what the dashboard shows"
            options={focusOptions}
          />
          <span className={styles.focusNote}>
            {focusSite
              ? `Everything below is for ${focusSite}: its pages, and every check run for it.`
              : activeFocus
              ? "Pasted content and repos aren't tied to a website, so checks aren't shown. Add your website when you analyze content to link them."
              : 'Each tool below shows its own latest result. Choose a site to see them all together.'}
          </span>
        </div>
      )}

      {/* ── Pillar Breakdown (above the fold, full-width hero) ── */}
      <div className={`${styles.chartCard} ${styles.dottedBg}`} style={{ marginBottom: 12 }}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>Pillar Breakdown</h2>
            <p className={styles.chartSub}>How one piece scores on each AEO pillar, analysis by analysis.</p>
            <span className={styles.chartHelp} title={`How your scores are distributed across your ${activePillars.length} pillars: ${joinWithAnd(activePillars.map(p => p.label))}.`}>
              <HelpCircle size={11} />
            </span>
          </div>
          {!activeFocus && (<div className={styles.framingToggle} role="tablist" aria-label="Analysis type">
            {CONTENT_TYPE_TOGGLES.map(ct => (
              <button
                key={ct.id}
                type="button"
                role="tab"
                aria-selected={typeFilter === ct.id}
                className={`${styles.framingBtn} ${typeFilter === ct.id ? styles.framingBtnActive : ''}`}
                onClick={() => { setTypeFilter(ct.id); setPieceSel(null); setShowAllFixes(false); typeFilterAutoSet.current = true; }}
              >
                {ct.label}
              </button>
            ))}
          </div>)}
        </div>

        <WhatDoesThisMean tagline="AI's structured read of your content.">
          Gemini grades your content against this pillar's fixed rubric — a consistent AI judgment of how well an AI could use it, not a literal count like word count or load speed, so scores stay comparable across your pages and over time.
        </WhatDoesThisMean>
        {userLane === 'product_sellers' && (
          <WhatDoesThisMean tagline="AI's read on how shoppable your page looks — specific to product sellers.">
            This pillar grades whether an AI could confidently describe, compare, and recommend your product from your page alone — clear pricing, specs, and availability — the same AI-judgment method as your other pillars, but scored for shopping questions specifically.
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
                <Link to={typeRoute} className={styles.emptyLink}>Run analysis →</Link>
              )}
            </div>
          </div>
        ) : (
          <>
          <div className={styles.pieceBar}>
            <div className={styles.pieceNameWrap}>
              <span className={styles.pieceEyebrow}>
                {pieceRuns.length === 1 ? 'Analysis 1' : `${pieceRuns.length} analyses`}
              </span>
              <h3 className={styles.pieceName} title={selectedPiece?.name}>{selectedPiece?.name}</h3>
            </div>
            {pieces.length > 1 && (
              <Select
                className={styles.pieceSelect}
                value={selectedPiece?.key || ''}
                onChange={setPieceSel}
                ariaLabel="Choose which piece to show"
                menuAlign="right"
                options={pieces.map(p => ({
                  value: p.key,
                  label: p.name.length > 48 ? `${p.name.slice(0, 45)}…` : p.name,
                  hint: p.runs.length > 1 ? `${p.runs.length} runs` : undefined,
                }))}
              />
            )}
          </div>
          <div className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <div className={styles.heroStatRow}>
                <span className={styles.heroStatValue}>{latestRun ? Math.round(latestRun.overall_score ?? 0) : 0}</span>
                <span className={styles.heroStatMax}>/100</span>
                <DeltaPts value={ptsDelta('overall_score')} />
                {prevRun && <span className={styles.deltaNote}>since the last analysis</span>}
              </div>
              <div className={styles.heroChartBg}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={piecePoints} margin={{ top: 8, right: 16, bottom: 0, left: -24 }}>
                    <XAxis dataKey="idx" stroke="transparent" type="category"
                      tickFormatter={n => `Analysis ${n}`} padding={{ left: 24, right: 24 }}
                      tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="transparent"
                      tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<PillarLineTooltip pillars={activePillars} />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                    {activePillars.map(p => (
                      <Line key={p.key} type="monotone" dataKey={p.key} stroke={p.color} strokeWidth={2}
                        isAnimationActive={false}
                        dot={piecePoints.length === 1 ? { r: 5, strokeWidth: 0, fill: p.color } : false}
                        activeDot={{ r: 4, strokeWidth: 0 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {latestRun && (() => {
                const weakest = [...piecePillars].sort((a, b) => a.score - b.score)[0];
                const fixCount = (latestRun.recommendations || []).length;
                const href = latestRun.repo
                  ? '/repo-analysis'
                  : latestRun.url && !latestRun.series_id
                  ? `/url-scanner?url=${encodeURIComponent(latestRun.url)}`
                  : `/analyze/${latestRun.id}`;
                return (
                  <div className={styles.improveBar}>
                    <div className={styles.improveText}>
                      <span className={styles.improveLabel}>Biggest opportunity</span>
                      <span className={styles.improveValue}>
                        <span className={styles.pillarTableDot} style={{ background: weakest?.color }} />
                        {weakest?.label} <strong>{weakest?.score}/100</strong>
                        {fixCount > 0 && <span className={styles.improveFixes}> · {fixCount} fix{fixCount !== 1 ? 'es' : ''} ready</span>}
                      </span>
                    </div>
                    <Link to={href} className={styles.improveBtn}>
                      Improve this score <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              })()}
              {pieceRuns.length === 1 && (
                <p className={styles.pieceHint}>
                  This is the first analysis of this piece. Make your changes, then choose <strong>Re-analyze</strong> on the result to see each pillar's trend here.
                </p>
              )}
            </div>

            <div className={styles.heroRank}>
              <div className={styles.heroRankHeader}>
                <span>Pillars ranked by score</span>
              </div>
              {[...piecePillars].sort((a, b) => b.score - a.score).map(p => (
                <div key={p.key} className={styles.heroRankRow}>
                  <div className={styles.heroRankLabelRow}>
                    <span className={styles.pillarTableDot} style={{ background: p.color }} />
                    <span className={styles.heroRankLabel}>{p.label}</span>
                  </div>
                  <div className={styles.heroRankValueRow}>
                    <span className={styles.heroRankScore}>{p.score}</span>
                    <DeltaPts value={p.delta} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>
        )}
      </div>

      {/* ── Tool Snapshot Cards ── */}
      <div className={styles.chartHeader}>
        <div>
          <h2 className={styles.chartTitle}>{userLane === 'local_business' ? 'Found by Local Customers' : 'Your AI Visibility'}</h2>
          <p className={styles.chartSub}>
            {userLane === 'local_business'
              ? "Whether AI cites and mentions your business when nearby customers ask, not just whether you rank."
              : 'How you show up when people ask AI about businesses like yours'}
          </p>
        </div>
      </div>
      <div className={styles.toolCards}>
        {toolCards.map((t, idx) => (
          <Link key={t.key} to={t.to} style={{ '--i': idx }} className={`reveal ${styles.toolCard} ${!t.hasData ? styles.toolCardEmpty : ''}`}>
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

            {t.hasData && t.subject && (
              <div className={styles.toolCardSubject} title={t.subject}>{t.subject}</div>
            )}

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
            ) : t.dots && t.dots.length > 0 ? (
              <div className={styles.toolCardSpark}>
                <DotRow values={t.dots} />
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

      {/* ── Quick Wins ── */}
      {quickWins.length > 0 && (
        <div className={styles.chartCard} style={{ marginBottom: 12 }}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Quick wins</h2>
              <p className={styles.chartSub}>
                From "{latestTypedAnalysis.title || latestTypedAnalysis.url || latestTypedAnalysis.repo || 'Untitled'}"
                {latestTypedAnalysis.analyzed_at ? ` · ${timeAgo(latestTypedAnalysis.analyzed_at)}` : ''}
              </p>
              <span className={styles.chartHelp} title="The top recommendations from your most recent analysis of this type — switch the toggle above to see fixes for a different tool.">
                <HelpCircle size={11} />
              </span>
            </div>
            {allFixes.length > 3 && (
              <button type="button" className={styles.viewAll} onClick={() => setShowAllFixes(v => !v)}>
                {showAllFixes ? 'Show top 3' : `Show all ${allFixes.length} fixes`}
              </button>
            )}
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
                </div>
              );
            })}
          </div>
          <Link to={typeRoute} className={styles.insightAction} style={{ marginTop: 10, display: 'inline-flex' }}>
            Open in {typeFilter === 'url' ? urlScannerLabel(userLane) : (CONTENT_TYPE_TOOL_NAMES[typeFilter] || 'Content Optimizer')} to fix →
          </Link>
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
              <span className={styles.chartHelp} title="How your overall content scores have changed over time — higher means AI engines are more likely to cite your content.">
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
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={1.5}
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
                  <Link to={typeRoute} className={styles.emptyLink}>Get started →</Link>
                )}
              </div>
            </div>
          ) : (
            <ResponsiveContainer key={`chart-${chartRange}`} width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="idx" stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="transparent"
                  tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={1.5}
                  fill="url(#scoreGrad)" dot={false}
                  activeDot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }} />
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
              <span className={styles.chartHelp} title="Your latest analyses with overall scores and pillar breakdowns — click any row to view the full analysis.">
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
                  <Link to={typeRoute} className={styles.emptyLink}>Run your first →</Link>
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

      </div>

    </div>
  );
}
