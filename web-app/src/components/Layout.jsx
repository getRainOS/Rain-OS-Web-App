import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api, clearApiKey } from '../api/client.js';
import { supabase } from '../lib/supabase.js';
import {
  LayoutDashboard, FileText, Globe, GitBranch, Radar, Eye,
  BarChart2, Clock, Settings, ArrowUp, LogOut,
} from 'lucide-react';
import styles from './Layout.module.css';

const PRICE_TO_PLAN = {
  'price_1SeCJH3NMjs4uYdgpi0xB0XN': 'Business',
  'price_1SeCKM3NMjs4uYdgcBRhgIhD': 'Pro',
  'price_1SeCHg3NMjs4uYdguOgkr3SQ': 'Free',
};

// 0=Dashboard 1=Analyze 2=URL 3=Repo 4=Citation 5=Visibility 6=SOV(new) 7=History 8=Settings
const NAV = [
  { to: '/dashboard',        label: 'Dashboard',        Icon: LayoutDashboard },
  { to: '/analyze',          label: 'Content Analyzer', Icon: FileText },
  { to: '/url-scanner',      label: 'URL Scanner',      Icon: Globe },
  { to: '/repo-analysis',    label: 'Repo Analysis',    Icon: GitBranch },
  { to: '/citation-monitor', label: 'Citation Monitor', Icon: Radar },
  { to: '/brand-visibility', label: 'AI Visibility',    Icon: Eye },
  { to: '/share-of-voice',   label: 'Share of Voice',   Icon: BarChart2 },
  { to: '/history',          label: 'Score History',    Icon: Clock },
  { to: '/settings',         label: 'Settings',         Icon: Settings },
];

export default function Layout({ children }) {
  const { user, setUser, onLogout, isDemo } = useApp();
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

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandRain}>rain</span>
          <span className={styles.brandOS}> OS</span>
          {isDemo && <span className={styles.demoBadge}>DEMO</span>}
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>Analyze</span>
            {NAV.slice(1, 7).map(n => (
              <NavItem key={n.to} {...n} />
            ))}
          </div>
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>Reports</span>
            {[NAV[0], NAV[7]].map(n => (
              <NavItem key={n.to} {...n} />
            ))}
          </div>
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>Account</span>
            <NavItem key={NAV[8].to} {...NAV[8]} />
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

function NavItem({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
      }
    >
      <Icon className={styles.navIcon} />
      {label}
    </NavLink>
  );
}
