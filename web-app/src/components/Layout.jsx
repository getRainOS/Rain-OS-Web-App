import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api, clearApiKey } from '../api/client.js';
import { supabase } from '../lib/supabase.js';
import {
  LayoutDashboard, FileText, Globe, GitBranch, Radar, Eye,
  BarChart2, Clock, Settings, ArrowUp, LogOut, Wand2,
} from 'lucide-react';
import styles from './Layout.module.css';

const PRICE_TO_PLAN = {
  'price_1SeCJH3NMjs4uYdgpi0xB0XN': 'Business',
  'price_1SeCKM3NMjs4uYdgcBRhgIhD': 'Pro',
  'price_1SeCHg3NMjs4uYdguOgkr3SQ': 'Free',
};

const LANE_META = {
  general:         { label: 'Writers & Marketers',    color: '#06b6d4' },
  product_sellers: { label: 'Product Sellers',        color: '#f97316' },
  developers:      { label: 'Developers',             color: '#10b981' },
  local_business:  { label: 'Local Service Business', color: '#f43f5e' },
};

const TOOLS = {
  dashboard:  { to: '/dashboard',        label: 'Dashboard',           Icon: LayoutDashboard, tooltip: 'Your home base — scores, trends, and performance at a glance.' },
  analyze:    { to: '/analyze',          label: 'Content Optimizer',   Icon: FileText,         tooltip: 'Paste your content and get an AI readability score plus fix recommendations.' },
  urlScanner: { to: '/url-scanner',      label: 'URL Scanner',         Icon: Globe,            tooltip: 'Enter a website URL to check how well AI can read and understand your pages.' },
  repo:       { to: '/repo-analysis',    label: 'Repo Analysis',       Icon: GitBranch,        tooltip: 'Connect your GitHub repo to score docs and source code for AI readability.' },
  citation:   { to: '/citation-monitor', label: 'Citation Monitor',    Icon: Radar,            tooltip: 'Check whether AI systems like ChatGPT are mentioning you when people ask questions.' },
  visibility: { to: '/brand-visibility', label: 'Brand Sentiment',       Icon: Eye,              tooltip: 'See how AI describes your brand — is the sentiment positive and the facts correct?' },
  sov:        { to: '/share-of-voice',   label: 'Share of Voice',      Icon: BarChart2,        tooltip: 'Measure what % of AI answers include your brand vs. competitors.' },
  history:    { to: '/history',          label: 'Score History',       Icon: Clock,            tooltip: 'Browse all past analyses and track how your scores improve over time.' },
  settings:   { to: '/settings',         label: 'Settings',            Icon: Settings,         tooltip: 'Change your solution lane, API settings, and account preferences.' },
};

const LANE_GROUPS = {
  general: [
    { label: 'Optimize',  tools: ['analyze', 'urlScanner'] },
    { label: 'Monitor',   tools: ['citation', 'visibility'] },
    { label: 'Measure',   tools: ['sov', 'history'] },
  ],
  product_sellers: [
    { label: 'Optimize',  tools: ['analyze', 'urlScanner'] },
    { label: 'Monitor',   tools: ['citation', 'visibility'] },
    { label: 'Measure',   tools: ['sov', 'history'] },
  ],
  developers: [
    { label: 'Optimize',  tools: ['analyze', 'repo'] },
    { label: 'Monitor',   tools: ['citation'] },
    { label: 'Measure',   tools: ['sov', 'history'] },
  ],
  local_business: [
    { label: 'Optimize',  tools: ['analyze'] },
    { label: 'Monitor',   tools: ['citation', 'visibility'] },
    { label: 'Measure',   tools: ['sov', 'history'] },
  ],
};

const GROUP_TOOLTIPS = {
  Optimize:  'Tools to improve how AI reads and presents your content.',
  Monitor:   'Track where and how you appear in AI-generated answers.',
  Measure:   'Compare your performance and see progress over time.',
};

const LOCAL_GROUP_TOOLTIPS = {
  Optimize:  'Paste your website content to score it for local AI visibility and get plain-English fixes.',
  Monitor:   'Check if AI tools are recommending your business when local customers ask questions.',
  Measure:   'Track how often your business comes up in AI answers and see your scores improve.',
};

export default function Layout({ children }) {
  const { user, setUser, onLogout, isDemo, userLane } = useApp();
  const navigate = useNavigate();
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (isDemo) return;
    api.me()
      .then(({ data }) => setUser(data))
      .catch(() => {});
  }, [isDemo]);

  useEffect(() => {
    if (user) {
      setUsage({ count: user.usage?.count ?? 0, limit: user.usage?.limit ?? 5 });
    }
  }, [user]);

  function handleLogout() {
    supabase.auth.signOut().catch(() => {});
    clearApiKey();
    onLogout();
    navigate('/');
  }

  const remaining = usage ? Math.max(0, usage.limit - usage.count) : null;
  const pct = usage ? Math.round((usage.count / usage.limit) * 100) : 0;
  const tier = (user?.subscriptionStatus === 'active' && user?.stripePriceId)
    ? (PRICE_TO_PLAN[user.stripePriceId] ?? 'Pro')
    : 'Free';
  const isFree = tier === 'Free';
  const isNearLimit = isFree && pct >= 60;
  const isAtLimit = isFree && pct >= 100;

  const laneMeta = userLane ? LANE_META[userLane] : null;
  const laneGroups = userLane ? LANE_GROUPS[userLane] : null;
  const isLocal = userLane === 'local_business';
  const groupTooltips = isLocal ? LOCAL_GROUP_TOOLTIPS : GROUP_TOOLTIPS;

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandRain}>rain</span>
          <span className={styles.brandOS}> OS</span>
          {isDemo && <span className={styles.demoBadge}>DEMO</span>}
        </div>

        <nav className={styles.nav}>
          {/* Overview — always visible */}
          <div className={styles.navGroup}>
            <NavItem {...TOOLS.dashboard} />
          </div>

          {/* Lane indicator */}
          {laneMeta ? (
            <div className={styles.laneChip} style={{ borderColor: laneMeta.color + '40', background: laneMeta.color + '0d' }}>
              <span className={styles.laneDot} style={{ background: laneMeta.color }} />
              <span className={styles.laneChipLabel} style={{ color: laneMeta.color }}>{laneMeta.label}</span>
              <button className={styles.laneChangeBtn} onClick={() => navigate('/dashboard?selectLane=1')}>change</button>
            </div>
          ) : (
            <button className={styles.lanePrompt} onClick={() => navigate('/dashboard?selectLane=1')}>
              <Wand2 style={{ width: 13, height: 13, opacity: 0.6 }} />
              <span>Choose your lane</span>
            </button>
          )}

          {/* Lane-specific tool groups */}
          {laneGroups ? (
            laneGroups.map(group => (
              <div key={group.label} className={styles.navGroup}>
                <div className={styles.navLabelRow}>
                  <span className={styles.navLabel}>{group.label}</span>
                  {groupTooltips[group.label] && (
                    <NavGroupTooltip text={groupTooltips[group.label]} />
                  )}
                </div>
                {group.tools.map(key => (
                  <NavItem key={key} {...TOOLS[key]} />
                ))}
              </div>
            ))
          ) : (
            <div className={styles.noLaneMessage}>
              <p>Select a lane in Settings to unlock your personalized toolset.</p>
            </div>
          )}

          {/* Account — always at bottom */}
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>Account</span>
            <NavItem {...TOOLS.settings} />
          </div>
        </nav>

        <div className={styles.bottom}>
          {usage && (
            <div className={styles.usageBox}>
              <div className={styles.usageRow}>
                <span className={styles.usageLabel}>
                  {isFree ? 'Free analyses' : 'API Usage'}
                </span>
                <span
                  className={styles.usageCount}
                  style={{ color: isAtLimit ? 'var(--red)' : isNearLimit ? 'var(--yellow)' : undefined }}
                >
                  {isFree
                    ? `${remaining} remaining`
                    : `${Math.max(0, usage.limit - usage.count)} remaining`}
                </span>
              </div>
              <div className={styles.usageTrack}>
                <div
                  className={styles.usageFill}
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: isAtLimit ? 'var(--red)' : isNearLimit ? 'var(--yellow)' : 'var(--accent)',
                  }}
                />
              </div>
              {isAtLimit && (
                <button
                  className={styles.limitCta}
                  onClick={() => navigate('/upgrade')}
                >
                  Upgrade to continue →
                </button>
              )}
            </div>
          )}

          {user?.email && (
            <div className={styles.userRow}>
              <div className={styles.avatar}>{user.email[0].toUpperCase()}</div>
              <div className={styles.userInfo}>
                <span className={styles.userEmail}>{user.email}</span>
                <span className={styles.userTier}>{tier} Plan</span>
              </div>
            </div>
          )}

          <div className={styles.sidebarActions}>
            {!isDemo && isFree && (
              <NavLink to="/upgrade" className={styles.upgradeBtn}>
                <ArrowUp style={{ width: 12, height: 12 }} />
                Upgrade
              </NavLink>
            )}
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut style={{ width: 12, height: 12, opacity: 0.6 }} />
              {isDemo ? 'Exit Demo' : 'Sign out'}
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}

function NavItem({ to, label, Icon, tooltip }) {
  const [show, setShow] = useState(false);
  const [y, setY] = useState(0);

  return (
    <div className={styles.navItemWrap}
      onMouseEnter={(e) => { setShow(true); setY(e.currentTarget.getBoundingClientRect().top + 10); }}
      onMouseLeave={() => setShow(false)}
    >
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
        }
      >
        <Icon className={styles.navIcon} />
        {label}
      </NavLink>
      {show && tooltip && (
        <div className={styles.navTooltip} style={{ top: y }}>
          {tooltip}
        </div>
      )}
    </div>
  );
}

function NavGroupTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.groupTooltipWrap}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className={styles.groupInfoIcon}>?</span>
      {show && (
        <div className={styles.groupTooltip}>{text}</div>
      )}
    </div>
  );
}
