import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../App.jsx';
import { api, clearApiKey } from '../api/client.js';
import styles from './Layout.module.css';

const PRICE_TO_PLAN = {
  'price_1SeCJH3NMjs4uYdgpi0xB0XN': 'Business',
  'price_1SeCKM3NMjs4uYdgcBRhgIhD': 'Pro',
  'price_1SeCHg3NMjs4uYdguOgkr3SQ': 'Free',
};

const NAV = [
  { to: '/dashboard',   label: 'Dashboard',         icon: '⊞' },
  { to: '/analyze',     label: 'Content Analyzer',  icon: '✦' },
  { to: '/url-scanner', label: 'URL Scanner',        icon: '◎' },
  { to: '/history',     label: 'Score History',      icon: '≡' },
  { to: '/settings',    label: 'Settings',           icon: '⚙' },
];

export default function Layout({ children }) {
  const { user, setUser, onLogout } = useApp();
  const navigate = useNavigate();
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    api.me()
      .then(({ data }) => setUser(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setUsage({ count: user.usage?.count ?? 0, limit: user.usage?.limit ?? 100 });
    }
  }, [user]);

  function handleLogout() {
    clearApiKey();
    onLogout();
    navigate('/');
  }

  const pct = usage ? Math.round((usage.count / usage.limit) * 100) : 0;
  const tier = (user?.subscriptionStatus === 'active' && user?.stripePriceId)
    ? (PRICE_TO_PLAN[user.stripePriceId] ?? 'Pro')
    : 'Free';

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandRain}>rain</span>
          <span className={styles.brandOS}> OS</span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>Analyze</span>
            {NAV.slice(1, 3).map(n => (
              <NavItem key={n.to} {...n} />
            ))}
          </div>
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>Reports</span>
            {[NAV[0], NAV[3]].map(n => (
              <NavItem key={n.to} {...n} />
            ))}
          </div>
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>Account</span>
            <NavItem key={NAV[4].to} {...NAV[4]} />
          </div>
        </nav>

        <div className={styles.bottom}>
          {usage && (
            <div className={styles.usageBox}>
              <div className={styles.usageRow}>
                <span className={styles.usageLabel}>API Usage</span>
                <span className={styles.usageCount}>
                  {Math.max(0, usage.limit - usage.count)} remaining
                </span>
              </div>
              <div className={styles.usageTrack}>
                <div
                  className={styles.usageFill}
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: pct > 80 ? 'var(--red)' : pct > 60 ? 'var(--yellow)' : 'var(--accent)',
                  }}
                />
              </div>
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
            <NavLink to="/upgrade" className={styles.upgradeBtn}>
              ↑ Upgrade
            </NavLink>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Sign out
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

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
      }
    >
      <span className={styles.navIcon}>{icon}</span>
      {label}
    </NavLink>
  );
}
