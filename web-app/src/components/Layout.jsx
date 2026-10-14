import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api, clearApiKey } from '../api/client.js';
import { supabase } from '../lib/supabase.js';
import {
  LayoutDashboard, FileText, Globe, GitBranch, Radar, Eye,
  BarChart2, Settings, ArrowUp, LogOut, Wand2, Menu, X,
  ChevronLeft, ChevronRight, ChevronsUpDown, MessageSquareText, Lightbulb, CreditCard, Target, ScanSearch,
} from 'lucide-react';
import KnowledgeBase from './KnowledgeBase.jsx';
import { urlScannerLabel } from '../lib/laneLabels.js';
import { PRICE_TO_PLAN } from '../lib/plans.js';
import styles from './Layout.module.css';

const LANE_META = {
  general:         { label: 'Writers & Marketers',    color: '#f5f5f5' },
  product_sellers: { label: 'Product Sellers',        color: '#f5f5f5' },
  developers:      { label: 'Developers',             color: '#f5f5f5' },
  local_business:  { label: 'Local Service Business', color: '#f5f5f5' },
  vibe_coders:     { label: 'Vibe Coders',             color: '#f5f5f5' },
};

const TOOLS = {
  dashboard:  { to: '/dashboard',        label: 'Dashboard',           Icon: LayoutDashboard, tooltip: 'Your home base — scores, trends, and performance at a glance.' },
  analyze:    { to: '/analyze',          label: 'Content Optimizer',   Icon: FileText,         tooltip: 'Paste your content and get an AI readability score plus fix recommendations.' },
  urlScanner: { to: '/url-scanner',      label: 'URL Scanner',         Icon: Globe,            tooltip: 'Enter a website URL to check how well AI can read and understand your pages.' },
  repo:       { to: '/repo-analysis',    label: 'Repo Analysis',       Icon: GitBranch,        tooltip: 'Connect your GitHub repo to score docs and source code for AI readability.' },
  questions:  { to: '/prompt-research',  label: 'Prompt Research',     Icon: MessageSquareText, tooltip: 'Find the questions your customers ask AI, then check or track them.' },
  fullcheck:  { to: '/full-check',       label: 'Full Check',          Icon: ScanSearch,       tooltip: 'Enter your website and run the page scan and the AI visibility checks together, with one report.' },
  improve:    { to: '/improve',         label: 'Improve a Question',  Icon: Target,           tooltip: 'Pick a question, compare your page with the sources Gemini cited, and get the specific changes that help you get chosen.' },
  opportunities: { to: '/opportunities', label: 'Opportunities',    Icon: Lightbulb,        tooltip: 'Your to-do list for showing up in AI answers, built from your checks and scans.' },
  citation:   { to: '/citation-monitor', label: 'Citation Monitor',    Icon: Radar,            tooltip: 'Check whether Gemini cites your brand for your topics, using live Google Search grounding.' },
  visibility: { to: '/brand-visibility', label: 'Brand Sentiment',       Icon: Eye,              tooltip: 'See how Gemini describes your brand, using live Google Search grounding — is the sentiment positive and are the facts correct?' },
  sov:        { to: '/share-of-voice',   label: 'Share of Voice',      Icon: BarChart2,        tooltip: 'See how visible your brand is when Gemini answers your topic three ways, using live Google Search grounding.' },
  settings:   { to: '/settings',         label: 'Settings',            Icon: Settings,         tooltip: 'Change your solution lane, API settings, and account preferences.' },
};

// Every lane gets every tool — a lane is a scoring context (which pillars
// apply, how they're weighted, what the sidebar calls things), not a gate
// on which tools you're allowed to reach. A developer can still have
// marketing copy to optimize; a writer can still have a repo. Only the
// ordering changes per lane, surfacing the most relevant tool for that
// lane first.
const LANE_GROUPS = {
  general: [
    { label: 'Prompts',    tools: ['questions'] },
    { label: 'Visibility', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Actions',    tools: ['fullcheck', 'opportunities', 'improve', 'analyze', 'urlScanner', 'repo'] },
  ],
  product_sellers: [
    { label: 'Prompts',    tools: ['questions'] },
    { label: 'Visibility', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Actions',    tools: ['fullcheck', 'opportunities', 'improve', 'urlScanner', 'analyze', 'repo'] },
  ],
  developers: [
    { label: 'Prompts',    tools: ['questions'] },
    { label: 'Visibility', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Actions',    tools: ['fullcheck', 'opportunities', 'improve', 'repo', 'urlScanner', 'analyze'] },
  ],
  local_business: [
    { label: 'Prompts',    tools: ['questions'] },
    { label: 'Visibility', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Actions',    tools: ['fullcheck', 'opportunities', 'improve', 'urlScanner', 'analyze', 'repo'] },
  ],
  vibe_coders: [
    { label: 'Prompts',    tools: ['questions'] },
    { label: 'Visibility', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Actions',    tools: ['fullcheck', 'opportunities', 'improve', 'repo', 'urlScanner', 'analyze'] },
  ],
};

const GROUP_TOOLTIPS = {
  Prompts:    'Find the questions your customers ask AI.',
  Visibility: 'See whether and how AI mentions you for those questions.',
  Actions:    'Fix what is holding you back, starting with the biggest gaps.',
};

const LOCAL_GROUP_TOOLTIPS = {
  Prompts:    'Find the questions local customers ask AI about businesses like yours.',
  Visibility: 'Check if AI tools recommend your business when local customers ask.',
  Actions:    'Plain-English fixes to get your business recommended more often.',
};

// Local Service Business gets its own section labels in the sidebar — not
// just reworded tooltips — so the lane reads as a distinct experience
// rather than the generic tool groups with a relabeled pillar or two.
const LOCAL_GROUP_LABELS = {
  Visibility: 'Reputation',
  Actions:    'Get Found',
};

export default function Layout({ children }) {
  const { user, setUser, onLogout, userLane } = useApp();
  const navigate = useNavigate();
  const [usage, setUsage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    if (!accountOpen) return;
    const onDown = e => { if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setAccountOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [accountOpen]);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('rain_os_sidebar_collapsed') === '1'; } catch { return false; }
  });

  function toggleCollapsed() {
    setCollapsed(c => {
      const next = !c;
      try { localStorage.setItem('rain_os_sidebar_collapsed', next ? '1' : '0'); } catch {}
      return next;
    });
  }

  useEffect(() => {
    api.me()
      .then(({ data }) => setUser(data))
      .catch(() => {});
  }, []);

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
      <button className={styles.mobileMenuBtn} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        {menuOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
      </button>
      <div className={`${styles.overlay} ${menuOpen ? styles.show : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ''} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.brand}>
          {!collapsed && <span className={styles.brandWordmark}>r<span className={styles.brandAccent}>ai</span>n</span>}
        </div>

        <nav className={styles.nav} onClick={() => setMenuOpen(false)}>
          {/* Overview — always visible */}
          <div className={styles.navGroup}>
            <NavItem {...TOOLS.dashboard} />
          </div>

          {/* Lane indicator */}
          {laneMeta ? (
            <button
              className={styles.laneChip}
              onClick={() => navigate('/dashboard?selectLane=1')}
              title="Change lane"
            >
              <span className={styles.laneDot} style={{ background: laneMeta.color }} />
              <span className={styles.laneChipLabel}>{laneMeta.label}</span>
              <ChevronsUpDown className={styles.laneChangeIcon} />
            </button>
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
                  <span className={styles.navLabel}>{isLocal ? (LOCAL_GROUP_LABELS[group.label] || group.label) : group.label}</span>
                  {groupTooltips[group.label] && (
                    <NavGroupTooltip text={groupTooltips[group.label]} />
                  )}
                </div>
                {group.tools.map(key => (
                  <NavItem key={key} {...TOOLS[key]} label={key === 'urlScanner' ? urlScannerLabel(userLane) : TOOLS[key].label} />
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

        {!collapsed && <KnowledgeBase />}

        <div className={styles.bottom}>
          {usage && !collapsed && (
            <div className={styles.usageBox}>
              <div className={styles.usageRow}>
                <span className={styles.usageLabel}>{isFree ? 'Free analyses' : 'Analyses this month'}</span>
                <span
                  className={styles.usageCount}
                  style={{ color: isAtLimit ? 'var(--red)' : isNearLimit ? 'var(--yellow)' : undefined }}
                >
                  {isFree ? `${remaining} left` : `${Math.max(0, usage.limit - usage.count)} left`}
                </span>
              </div>
              <div className={styles.usageTrack}>
                <div
                  className={styles.usageFill}
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: isAtLimit ? 'var(--red)' : isNearLimit ? 'var(--yellow)' : 'var(--text-muted)',
                  }}
                />
              </div>
              {isAtLimit && (
                <button className={styles.limitCta} onClick={() => navigate('/upgrade')}>
                  Upgrade to continue
                </button>
              )}
            </div>
          )}

          {isFree && (
            <NavLink to="/upgrade" className={styles.upgradeBtn} title="Upgrade">
              <ArrowUp style={{ width: 12, height: 12 }} />
              <span>Upgrade</span>
            </NavLink>
          )}

          <div className={styles.accountRow} ref={accountRef}>
            {accountOpen && (
              <div className={styles.accountMenu} role="menu">
                {user?.email && <div className={styles.accountMenuEmail}>{user.email}</div>}
                <NavLink to="/settings" role="menuitem" className={styles.accountMenuItem} onClick={() => { setAccountOpen(false); setMenuOpen(false); }}>
                  <Settings size={14} /> Settings
                </NavLink>
                <NavLink to="/upgrade" role="menuitem" className={styles.accountMenuItem} onClick={() => { setAccountOpen(false); setMenuOpen(false); }}>
                  <CreditCard size={14} /> Plan &amp; billing
                </NavLink>
                <div className={styles.accountMenuDivider} />
                <button type="button" role="menuitem" className={styles.accountMenuItem} onClick={handleLogout}>
                  <LogOut size={14} /> Log out
                </button>
              </div>
            )}
            <button
              type="button"
              className={styles.userRow}
              onClick={() => setAccountOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              title="Account"
            >
              <div className={styles.avatar}>{(user?.email?.[0] || '?').toUpperCase()}</div>
              <div className={styles.userInfo}>
                <span className={styles.userEmail}>{user?.email || 'Account'}</span>
                <span className={styles.userTier}>{tier} plan</span>
              </div>
              <ChevronsUpDown className={styles.accountChevron} />
            </button>
            <div className={styles.iconActions}>
              <button
                className={`${styles.iconBtn} ${styles.collapseBtn}`}
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed
                  ? <ChevronRight style={{ width: 14, height: 14 }} />
                  : <ChevronLeft style={{ width: 14, height: 14 }} />}
              </button>
            </div>
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
  const [pos, setPos] = useState({ top: 0, left: 232 });

  return (
    <div className={styles.navItemWrap}
      onMouseEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setShow(true);
        setPos({ top: r.top + 10, left: r.right + 10 });
      }}
      onMouseLeave={() => setShow(false)}
    >
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
        }
      >
        <Icon className={styles.navIcon} />
        <span className={styles.navItemLabel}>{label}</span>
      </NavLink>
      {show && tooltip && (
        <div className={styles.navTooltip} style={{ top: pos.top, left: pos.left }}>
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
