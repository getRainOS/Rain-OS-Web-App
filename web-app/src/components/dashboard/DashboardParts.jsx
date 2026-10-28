import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import LaneWeights from '../LaneWeights.jsx';
import { PILLAR_CHART_COLORS } from '../../lib/pillarColors.js';
import { LANES as LANE_META } from '../../lib/lanes.js';
import Select from '../Select.jsx';
import { Area } from 'recharts';
import { TrendingUp, TrendingDown, FileText, GitBranch, ArrowRight, BrainCircuit, ShieldCheck, MousePointerClick, SearchCheck, Minus, Map as MapIcon, MapPin, HelpCircle, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import styles from '../../pages/Dashboard.module.css';

export function joinWithAnd(items) {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export const PILLAR_MEANING = {
  ai_readability: 'how easily AI can read the page and pull out a clear answer.',
  digital_authority: 'whether AI can trust it: who is behind it, proof, sources.',
  conversion_readiness: 'whether a reader knows what to do next, and why to choose you.',
  product_discoverability: 'whether AI shopping answers can find and describe the product: price, specs, stock, reviews.',
  local_presence: 'whether AI can tell where you are and who you serve: name, address, phone, area, reviews.',
  rag_readiness: 'how well the page splits into self-contained pieces AI can retrieve and quote.',
};

export const PILLARS = [
  { key: 'ai_readability',          label: 'AI Readability',       color: PILLAR_CHART_COLORS.ai_readability, Icon: BrainCircuit },
  { key: 'digital_authority',       label: 'Digital Authority',    color: PILLAR_CHART_COLORS.digital_authority, Icon: ShieldCheck },
  { key: 'conversion_readiness',    label: 'Conversion Readiness', color: PILLAR_CHART_COLORS.conversion_readiness, Icon: MousePointerClick },
  { key: 'product_discoverability', label: 'Product Discoverability',color: PILLAR_CHART_COLORS.product_discoverability, Icon: SearchCheck },
  { key: 'rag_readiness',           label: 'RAG Readiness',        color: PILLAR_CHART_COLORS.rag_readiness, Icon: Layers },
  { key: 'local_presence',          label: 'Local Presence',       color: PILLAR_CHART_COLORS.local_presence, Icon: MapPin },
];

export const LANE_DEFAULT_ROUTES = {
  product_sellers: '/url-scanner',
  local_business: '/url-scanner',
};

export const LANE_VISUALS = {
  general:         { color: '#f5f5f5', Icon: FileText },
  product_sellers: { color: '#f5f5f5', Icon: SearchCheck },
  vibe_coders:     { color: '#f5f5f5', Icon: GitBranch },
  developers:      { color: '#f5f5f5', Icon: GitBranch },
  local_business:  { color: '#f5f5f5', Icon: MapIcon },
};

export const LANES = LANE_META.map(l => ({ ...l, ...LANE_VISUALS[l.id] }));

export const SAMPLE_TREND = [42, 48, 45, 55, 60, 58, 67, 71, 68, 75].map((score, i) => ({ idx: i + 1, score }));

export const CONTENT_TYPE_TOGGLES = [
  { id: 'content', label: 'Content' },
  { id: 'url', label: 'URL' },
  { id: 'repo', label: 'Repo' },
];

export const CONTENT_TYPE_ROUTES = {
  content: '/analyze',
  url: '/url-scanner',
  repo: '/repo-analysis',
};

export const CONTENT_TYPE_TOOL_NAMES = {
  content: 'Content Optimizer',
  url: 'URL Scanner',
  repo: 'Repo Analysis',
};

export function timeAgo(dateStr) {
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

export function computeTrend(arr, key) {
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

export function scoreColor(s) {
  if (!s && s !== 0) return 'var(--text-dim)';
  if (s >= 75) return '#94a3b8';
  if (s >= 50) return '#94a3b8';
  return '#94a3b8';
}

export function getItemType(item) {
  if (item.repo) return 'Repo';
  if (item.url) return 'URL';
  return 'Content';
}

/* ── Gas Gauge Arc ── */

export function GaugeArc({ score = 0, color = '#d4d4d4', size = 120 }) {
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

export function TrendBadge({ pct }) {
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

export function CustomTooltip({ active, payload }) {
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

export const NOISE_PTS = 3;

export function DeltaPts({ value, noise = NOISE_PTS }) {
  if (value === null || value === undefined) return null;
  if (Math.abs(value) <= noise) {
    return (
      <span
        className={styles.deltaPts}
        style={{ color: 'var(--text-muted)' }}
        title={`A change of ${noise} points or less is within normal scoring variation, so it isn't counted as a real change.`}
      >
        no change
      </span>
    );
  }
  const color = value > 0 ? 'var(--success)' : 'var(--danger)';
  return <span className={styles.deltaPts} style={{ color }}>{value > 0 ? '+' : ''}{value} pts</span>;
}

export function PillarLineTooltip({ active, payload, pillars }) {
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
            <span className={styles.pillarTooltipValue}>{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Inline sparkline (citations widget) ── */

export function Sparkline({ values, color, width = 86, height = 26 }) {
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

export function PillarBars({ pillars, width = 120, height = 28 }) {
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

export function WhatDoesThisMean({ tagline, children }) {
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

/* ── Mini hit/miss dot row (tool card accent) ── */

export function DotRow({ values }) {
  if (!values || values.length === 0) {
    return <span className={styles.sparkPlaceholder}>—</span>;
  }
  return (
    <div className={styles.dotRow}>
      {values.map((hit, i) => (
        <span
          key={i}
          className={styles.dot}
          style={{ background: hit ? '#ffffff' : 'rgba(255,255,255,0.12)' }}
        />
      ))}
    </div>
  );
}

/* ── Lane Selector ── */

export function LaneSelector({ onSelect, current }) {
  const [stats, setStats] = useState({});
  const [helpOpen, setHelpOpen] = useState(false);
  useEffect(() => { api.laneStats().then(({ data }) => setStats(data?.lanes || {})).catch(() => {}); }, []);
  const shortDay = d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return (
    <div className={styles.laneSelector}>
      <div className={styles.laneSelectorHeader}>
        <h2 className={styles.laneSelectorTitle}>
          What are you optimizing for?
          <span className={styles.focusHelp} style={{ verticalAlign: 'middle', marginLeft: 6 }}>
            <button type="button" className={styles.focusHelpBtn} aria-label="What do the numbers on each lane mean?" aria-expanded={helpOpen}
              onClick={() => setHelpOpen(o => !o)}>
              <HelpCircle size={18} />
            </button>
            {helpOpen && (
              <div className={styles.focusHelpPop} role="note" style={{ textAlign: 'left', fontWeight: 400 }}>
                <p><strong>Analyses</strong> score a page, post or repo: Content Optimizer, URL Scanner and Repo Analysis.</p>
                <p><strong>Checks</strong> ask AI engines a question: Citation Monitor, Share of Voice and Brand Sentiment. One Citation Monitor run counts once, however many engines it asks. Automatic weekly re-checks aren't counted.</p>
                <p>Each is counted in the lane you were in when you ran it. Checks from before lanes were recorded aren't included; they're all still in History.</p>
              </div>
            )}
          </span>
        </h2>
        <p className={styles.laneSelectorSub}>Choose your solution lane to get the right scoring weights and KPIs across your dashboard and analysis tools.</p>
      </div>
      <div className={styles.laneCards}>
        {LANES.map(lane => (
          <button
            key={lane.id}
            className={`${styles.laneCard} ${lane.id === current ? styles.laneCardCurrent : ''}`}
            aria-current={lane.id === current ? 'true' : undefined}
            onClick={() => onSelect(lane.id)}
          >
            <div className={styles.laneCardIcon}>
              <lane.Icon size={15} style={{ color: 'var(--text)' }} />
            </div>
            <div className={styles.laneCardLabel}>{lane.label}</div>
            <div className={styles.laneCardDesc}>{lane.desc}</div>
            {stats[lane.id] && (
              <div className={styles.laneCardStats}>
                {stats[lane.id].analyses} {stats[lane.id].analyses === 1 ? 'analysis' : 'analyses'} · {stats[lane.id].checks} {stats[lane.id].checks === 1 ? 'check' : 'checks'}
                {stats[lane.id].lastUsed ? ` · last used ${shortDay(stats[lane.id].lastUsed)}` : ''}
              </div>
            )}
            <div className={styles.laneCardCta}>{lane.id === current ? 'Current lane' : 'Select →'}</div>
          </button>
        ))}
      </div>
      <div className={styles.laneWeightsHead}>
        <h3>How each lane is scored</h3>
        <p>Every lane is scored on the same core pillars. Your lane sets how much each one counts, and stores and local businesses add their own pillar.</p>
      </div>
      <LaneWeights current={current} />
    </div>
  );
}

/* ══════════════════════════════════════════ */

export function LocalVerdict({ subject, checks, topic, brandRate, styles }) {
  if (!subject) return null;
  const href = `/citation-monitor?subject=${encodeURIComponent(subject.key)}`;
  const total = checks.length;
  const yes = checks.filter(c => c.mentioned === true || !!c.cited).length;
  const state = !total ? 'none' : yes === 0 ? 'no' : yes / total >= 0.5 ? 'yes' : 'some';
  const headline = { none: 'Not checked yet', no: 'Not yet', some: 'Sometimes', yes: 'Yes' }[state];
  return (
    <div className={`${styles.chartCard} ${styles.verdictCard}`} style={{ marginBottom: 12 }}>
      <div className={styles.chartHeader}>
        <div>
          <p className={styles.verdictAsk}>Is AI recommending {subject.name}?</p>
          <h2 className={styles.verdictAnswer} data-state={state}>{headline}</h2>
          <p className={styles.chartSub}>
            {total
              ? <>Named or cited in {yes} of your last {total} check{total === 1 ? '' : 's'} of “{topic}”{brandRate != null ? ` · mentioned in ${brandRate}% of sentiment checks` : ''}.</>
              : 'Check a question your customers ask, like “best dentist near me”, to see if AI recommends you.'}
          </p>
          {total > 0 && (
            <div className={styles.verdictDots} aria-label="Recent checks, oldest first">
              {checks.slice(0, 10).reverse().map((c, i) => <span key={i} data-yes={c.mentioned === true || !!c.cited ? '1' : '0'} />)}
            </div>
          )}
        </div>
        <Link to={href} className={styles.improveBtn}>{total ? 'Check again' : 'Check now'} <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}
