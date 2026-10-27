import Logo from './Logo.jsx';
import { isDemo, exitDemo } from '../lib/demo.js';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api, clearApiKey } from '../api/client.js';
import { supabase } from '../lib/supabase.js';
import {
  LayoutDashboard, FileText, Globe, GitBranch, Radar, Eye,
  BarChart2, Settings, ArrowUp, LogOut, Wand2, Menu, X,
  ChevronLeft, ChevronRight, ChevronsUpDown, MessageSquareText, Lightbulb, CreditCard, Target, ScanSearch,
  Activity, Package, ChevronDown } from 'lucide-react';
import KnowledgeBase from './KnowledgeBase.jsx';
import { urlScannerLabel } from '../lib/laneLabels.js';
import { PRICE_TO_PLAN } from '../lib/plans.js';
import styles from './Layout.module.css';

const LANE_META = {
  general:         { label: 'Writers & Marketers',    color: '#f5f5f5' },
  product_sellers: { label: 'Online Sellers',        color: '#f5f5f5' },
  developers:      { label: 'Developers',             color: '#f5f5f5' },
  local_business:  { label: 'Local Service Business', color: '#f5f5f5' },
  vibe_coders:     { label: 'Vibe Coders',             color: '#f5f5f5' },
};

const TOOLS = {
  dashboard:  { to: '/dashboard',        label: 'Dashboard',           Icon: LayoutDashboard, tooltip: 'Your home base — scores, trends, and performance at a glance.' },
  analyze:    { to: '/analyze',          label: 'Content Optimizer',   Icon: FileText,         tooltip: 'Paste your content and get an AI readability score plus fix recommendations.' },
  urlScanner: { to: '/url-scanner',      label: 'URL Scanner',         Icon: Globe,            tooltip: 'Enter a website URL to check how well AI can read and understand your pages.' },
  products:   { to: '/products',         label: 'Product Fact Sheets', Icon: Package,          tooltip: 'Enter each product\'s facts once (price, variants, specs, shipping). The AI rewrite uses them, and they generate your product schema.' },
  repo:       { to: '/repo-analysis',    label: 'Repo Analysis',       Icon: GitBranch,        tooltip: 'Connect your GitHub repo to score docs and source code for AI readability.' },
  questions:  { to: '/prompt-research',  label: 'AI Question Research', Icon: MessageSquareText, tooltip: 'Find the questions your customers ask AI, then check or track them.' },
  fullcheck:  { to: '/full-check',       label: 'Full Check',          Icon: ScanSearch,       tooltip: 'Enter your website and run the page scan and the AI visibility checks together, with one report.' },
  improve:    { to: '/improve',         label: 'Improve a Question',  Icon: Target,           tooltip: 'Pick a question, compare your page with the sources AI cited, and get the specific changes that help you get chosen.' },
  opportunities: { to: '/opportunities', label: 'Opportunities',    Icon: Lightbulb,        tooltip: 'Your to-do list for showing up in AI answers, built from your checks and scans.' },
  citation:   { to: '/citation-monitor', label: 'Citation Monitor',    Icon: Radar,            tooltip: 'Check whether AI engines cite your site for the questions your customers ask.' },
  visibility: { to: '/brand-visibility', label: 'Brand Sentiment',       Icon: Eye,              tooltip: 'See how AI engines describe your brand: is the tone positive and are the facts right?' },
  sov:        { to: '/share-of-voice',   label: 'Share of Voice',      Icon: BarChart2,        tooltip: 'See how often AI names your brand versus competitors when it answers your topic.' },
  adminUsage: { to: '/admin/usage',      label: 'Usage (staff)',       Icon: Activity,         tooltip: 'Daily Google Search calls against the free allowance. Only rain OS staff see this.' },
  settings:   { to: '/settings',         label: 'Settings',            Icon: Settings,         tooltip: 'Change your solution lane, API settings, and account preferences.' },
};

// Each lane's sidebar shows only the tools that kind of user acts on, so a
// busy business owner isn't faced with tools built for marketers or coders.
// Nothing is gated: the rest sit under "More tools" at the bottom, and the
// lane still sets the scoring (which pillars apply and how they're weighted).
const LANE_GROUPS = {
  general: [
    { label: 'Optimize',   tools: ['analyze', 'urlScanner'] },
    { label: 'Prompts',    tools: ['questions', 'improve'] },
    { label: 'Visibility', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Improve',    tools: ['fullcheck', 'opportunities'] },
  ],
  product_sellers: [
    { label: 'Optimize',   tools: ['urlScanner', 'products', 'analyze'] },
    { label: 'Prompts',    tools: ['questions'] },
    { label: 'Visibility', tools: ['citation', 'visibility'] },
    { label: 'Improve',    tools: ['fullcheck', 'opportunities'] },
  ],
  developers: [
    { label: 'Optimize',   tools: ['repo', 'urlScanner', 'analyze'] },
    { label: 'Prompts',    tools: ['questions', 'improve'] },
    { label: 'Visibility', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Improve',    tools: ['fullcheck', 'opportunities'] },
  ],
  local_business: [
    { label: 'Optimize',   tools: ['urlScanner'] },
    { label: 'Visibility', tools: ['citation', 'visibility'] },
    { label: 'Improve',    tools: ['opportunities'] },
  ],
  vibe_coders: [
    { label: 'Optimize',   tools: ['repo', 'urlScanner', 'analyze'] },
    { label: 'Prompts',    tools: ['questions', 'improve'] },
    { label: 'Visibility', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Improve',    tools: ['fullcheck', 'opportunities'] },
  ],
};

// Every tool a lane can reach, in sidebar order; the ones a lane doesn't show
// go under "More tools".
const ALL_LANE_TOOLS = ['urlScanner', 'products', 'analyze', 'repo', 'questions', 'improve', 'citation', 'sov', 'visibility', 'fullcheck', 'opportunities'];
const moreToolsFor = lane => {
  const shown = new Set((LANE_GROUPS[lane] || []).flatMap(g => g.tools));
  return ALL_LANE_TOOLS.filter(t => !shown.has(t) && (t !== 'products' || lane === 'product_sellers'));
};

const GROUP_TOOLTIPS = {
  Prompts:    'Find the questions your customers ask AI, and improve your page for a specific one.',
  Visibility: 'See whether and how AI mentions you for those questions.',
  Improve:    'Check where you stand and find the biggest gaps to fix first.',
  Optimize:   'Make your content, pages and code easy for AI to read and quote.',
};

const LOCAL_GROUP_TOOLTIPS = {
  Prompts:    'Find the questions local customers ask AI about businesses like yours, and improve your page for a specific one.',
  Visibility: 'Check if AI tools recommend your business when local customers ask.',
  Improve:    'Plain-English checks to get your business recommended more often.',
  Optimize:   'Make your site easy for AI to read, so it can recommend you.',
};

// Local Service Business gets its own section labels in the sidebar — not
// just reworded tooltips — so the lane reads as a distinct experience
// rather than the generic tool groups with a relabeled pillar or two.
const LOCAL_GROUP_LABELS = {
  Visibility: 'Reputation',
  Improve:    'Get Found',
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
  // rain OS staff get a staff allowance, not a paid plan.
  const tier = user?.isAdmin ? 'Staff' : (user?.subscriptionStatus === 'active' && user?.stripePriceId)
    ? (PRICE_TO_PLAN[user.stripePriceId] ?? 'Pro')
    : 'Free';
  const isFree = tier === 'Free';
  const isNearLimit = isFree && pct >= 60;
  const isAtLimit = isFree && pct >= 100;

  const laneMeta = userLane ? LANE_META[userLane] : null;
  const laneGroups = userLane ? LANE_GROUPS[userLane] : null;
  const moreTools = userLane ? moreToolsFor(userLane) : [];
  const onHiddenTool = moreTools.some(k => window.location.pathname.startsWith(TOOLS[k].to));
  const [moreOpen, setMoreOpen] = useState(() => { try { return localStorage.getItem('rain_os_more_tools') === '1'; } catch { return false; } });
  const toggleMore = () => setMoreOpen(o => { try { localStorage.setItem('rain_os_more_tools', o ? '0' : '1'); } catch {} return !o; });
  const isLocal = userLane === 'local_business';
  const groupTooltips = isLocal ? LOCAL_GROUP_TOOLTIPS : GROUP_TOOLTIPS;

  return (
    <div className={styles.root}>
      {isDemo() && (
        <div className={styles.demoBar} role="status">
          <span>You're exploring a demo with sample data.</span>
          <a href="/login" onClick={() => exitDemo()} className={styles.demoBarCta}>Sign up free</a>
          <button type="button" onClick={() => { exitDemo(); window.location.replace('/'); }} className={styles.demoBarExit}>Exit demo</button>
        </div>
      )}
      <button className={styles.mobileMenuBtn} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        {menuOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
      </button>
      <div className={`${styles.overlay} ${menuOpen ? styles.show : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ''} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.brand}>
          {!collapsed && <Logo size={30} className={styles.brandWordmark} />}
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
                <div className={styles.navLabelRow} title={groupTooltips[group.label] || undefined}>
                  <span className={styles.navLabel}>{isLocal ? (LOCAL_GROUP_LABELS[group.label] || group.label) : group.label}</span>
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

          {laneGroups && moreTools.length > 0 && (
            <div className={styles.navGroup}>
              <button type="button" className={styles.moreToggle} onClick={toggleMore} aria-expanded={moreOpen || onHiddenTool}>
                <span className={styles.navLabel}>More tools</span>
                <ChevronDown style={{ width: 12, height: 12, transform: moreOpen || onHiddenTool ? 'rotate(180deg)' : 'none' }} />
              </button>
              {(moreOpen || onHiddenTool) && moreTools.map(key => (
                <NavItem key={key} {...TOOLS[key]} label={key === 'urlScanner' ? urlScannerLabel(userLane) : TOOLS[key].label} />
              ))}
            </div>
          )}

          {/* Account — always at bottom */}
          <div className={styles.navGroup}>
            <div className={styles.navLabelRow}><span className={styles.navLabel}>Account</span></div>
            <NavItem {...TOOLS.settings} />
            {user?.isAdmin && <NavItem {...TOOLS.adminUsage} />}
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
                <span className={styles.userTier}>{tier === 'Staff' ? 'Staff' : `${tier} plan`}</span>
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

