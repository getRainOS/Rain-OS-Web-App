import Logo from './Logo.tsx';
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
  dashboard:  { to: '/dashboard',        label: 'Dashboard',           Icon: LayoutDashboard, tooltip: 'Your home base: your scores and trends at a glance.' },
  analyze:    { to: '/analyze',          label: 'Check My Writing',   Icon: FileText,         tooltip: 'Paste your writing and see how easy it is for AI to read, with tips to improve it.' },
  urlScanner: { to: '/url-scanner',      label: 'Check a Web Page',         Icon: Globe,            tooltip: 'Enter a web page address to see how easily AI can read it, and what to fix.' },
  products:   { to: '/products',         label: 'Product Details', Icon: Package,          tooltip: 'Enter each product once: price, sizes, materials, shipping. AI uses these facts when it answers shoppers.' },
  repo:       { to: '/repo-analysis',    label: 'GitHub Code Check',       Icon: GitBranch,        tooltip: 'Connect your GitHub project to see how easily AI can read its docs and code.' },
  questions:  { to: '/prompt-research',  label: 'Find Customer Questions', Icon: MessageSquareText, tooltip: 'Find the questions your customers ask AI, then check them or track them each week.' },
  fullcheck:  { to: '/full-check',       label: 'Full Check',          Icon: ScanSearch,       tooltip: 'Enter your website and get one report: how readable your pages are, and whether AI mentions you.' },
  improve:    { to: '/improve',         label: 'Fix One Question',  Icon: Target,           tooltip: 'Pick one question, compare your page with the sites AI quoted, and get the changes that could get you quoted too.' },
  opportunities: { to: '/opportunities', label: 'To-Do List',    Icon: Lightbulb,        tooltip: 'Your list of what to do next to show up in AI answers, most important first.' },
  citation:   { to: '/citation-monitor', label: 'Is AI Citing Me?',    Icon: Radar,            tooltip: 'See whether AI links to your website when customers ask the questions you care about.' },
  visibility: { to: '/brand-visibility', label: 'How AI Describes Me',       Icon: Eye,              tooltip: 'See what AI says about your business: is it positive, and are the facts right?' },
  sov:        { to: '/share-of-voice',   label: 'Who AI Recommends',      Icon: BarChart2,        tooltip: 'See how often AI names your business compared with competitors when customers ask about your topic.' },
  adminUsage: { to: '/admin/usage',      label: 'Usage (staff)',       Icon: Activity,         tooltip: 'Daily Google Search calls against the free allowance. Only rain OS staff see this.' },
  settings:   { to: '/settings',         label: 'Settings',            Icon: Settings,         tooltip: 'Change your business type, connections, and account details.' },
};

// Each lane's sidebar shows only the tools that kind of user acts on, so a
// busy business owner isn't faced with tools built for marketers or coders.
// Nothing is gated: the rest sit under "More tools" at the bottom, and the
// lane still sets the scoring (which pillars apply and how they're weighted).
const LANE_GROUPS = {
  general: [
    { label: 'Make It Readable',   tools: ['analyze', 'urlScanner'] },
    { label: 'Customer Questions',    tools: ['questions', 'improve'] },
    { label: 'Am I Showing Up', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Fix It',    tools: ['fullcheck', 'opportunities'] },
  ],
  product_sellers: [
    { label: 'Make It Readable',   tools: ['urlScanner', 'products', 'analyze'] },
    { label: 'Customer Questions',    tools: ['questions'] },
    { label: 'Am I Showing Up', tools: ['citation', 'visibility'] },
    { label: 'Fix It',    tools: ['fullcheck', 'opportunities'] },
  ],
  developers: [
    { label: 'Make It Readable',   tools: ['repo', 'urlScanner', 'analyze'] },
    { label: 'Customer Questions',    tools: ['questions', 'improve'] },
    { label: 'Am I Showing Up', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Fix It',    tools: ['fullcheck', 'opportunities'] },
  ],
  local_business: [
    { label: 'Make It Readable',   tools: ['urlScanner'] },
    { label: 'Am I Showing Up', tools: ['citation', 'visibility'] },
    { label: 'Fix It',    tools: ['opportunities'] },
  ],
  vibe_coders: [
    { label: 'Make It Readable',   tools: ['repo', 'urlScanner', 'analyze'] },
    { label: 'Customer Questions',    tools: ['questions', 'improve'] },
    { label: 'Am I Showing Up', tools: ['citation', 'sov', 'visibility'] },
    { label: 'Fix It',    tools: ['fullcheck', 'opportunities'] },
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
  'Customer Questions':    'The questions your customers ask AI. Pick one to see how to get your page chosen for it.',
  'Am I Showing Up': 'See whether AI mentions your business for those questions, and what it says.',
  'Fix It':    'Find the biggest gaps first, and what to do about each one.',
  'Make It Readable':   'Make your pages and writing easy for AI to read and quote.',
};

const LOCAL_GROUP_TOOLTIPS = {
  'Customer Questions':    'The questions local customers ask AI. Pick one to see how to get your business chosen for it.',
  'Am I Showing Up': 'See whether AI recommends your business when local customers ask.',
  'Fix It':    'Simple steps to get your business recommended more often.',
  'Make It Readable':   'Make your website easy for AI to read, so it can recommend you.',
};

// Local Service Business gets its own section labels in the sidebar — not
// just reworded tooltips — so the lane reads as a distinct experience
// rather than the generic tool groups with a relabeled pillar or two.
const LOCAL_GROUP_LABELS = {
  'Am I Showing Up': 'Reputation',
  'Fix It':    'Get Found',
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
    <div className={`${styles.root} ${isDemo() ? styles.rootDemo : ''}`}>
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

