import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api, getApiKey, clearApiKey } from '../api/client.js';
import { supabase } from '../lib/supabase.js';
import styles from './Settings.module.css';

const PRICE_TO_PLAN = {
  'price_1SeCJH3NMjs4uYdgpi0xB0XN': 'Business',
  'price_1SeCKM3NMjs4uYdgcBRhgIhD': 'Pro',
  'price_1SeCHg3NMjs4uYdguOgkr3SQ': 'Free',
};

export default function Settings() {
  const { user, onLogout, isDemo, refreshUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');
  const [githubStatus, setGithubStatus] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ghParam = params.get('github');
    if (ghParam === 'connected') {
      setGithubStatus('just_connected');
      refreshUser();
    } else if (ghParam === 'cancelled') {
      setGithubStatus('cancelled');
    } else if (ghParam === 'error') {
      setGithubStatus('error');
    }
  }, [location.search]);

  const apiKey = getApiKey();
  const plan = user?.subscriptionStatus === 'active' && user?.stripePriceId
    ? (PRICE_TO_PLAN[user.stripePriceId] ?? 'Pro')
    : 'Free';
  const usageCount = user?.usage?.count ?? 0;
  const usageLimit = user?.usage?.limit ?? 5;
  const usagePct = Math.min(Math.round((usageCount / usageLimit) * 100), 100);
  const isFree = plan === 'Free';

  function handleCopyKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSignOut() {
    supabase.auth.signOut().catch(() => {});
    clearApiKey();
    onLogout();
    navigate('/');
  }

  async function handleConnectGithub() {
    if (isDemo) return;
    try {
      const { data } = await api.github.initOAuth();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError('Could not start GitHub connection. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Could not start GitHub connection. Please try again.');
    }
  }

  async function handleDisconnectGithub() {
    setDisconnecting(true);
    try {
      await api.github.disconnect();
      setGithubStatus('disconnected');
      refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to disconnect GitHub');
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleManageBilling() {
    setError('');
    setPortalLoading(true);
    try {
      const { data } = await api.createBillingPortal(window.location.origin + '/#/settings');
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      setError(err.message || 'Could not open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Account Settings</h1>
        <p className={styles.sub}>Manage your Rain OS account and plan</p>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      <div className={styles.sections}>
        <div className="card">
          <h2 className={styles.sectionTitle}>Account</h2>
          {user && (
            <div className={styles.accountGrid}>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Email</span>
                <span className={styles.accountValue}>{user.email ?? '—'}</span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Plan</span>
                <span className={styles.accountValue} style={{ color: isFree ? '#94a3b8' : 'var(--accent)' }}>
                  {plan}
                </span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Analyses used</span>
                <span className={styles.accountValue}>
                  {usageCount} / {usageLimit}
                </span>
              </div>
            </div>
          )}

          {user && (
            <div className={styles.usageBar}>
              <div className={styles.usageTrack}>
                <div
                  className={styles.usageFill}
                  style={{
                    width: `${usagePct}%`,
                    background: usagePct >= 100 ? 'var(--red)' : usagePct > 75 ? 'var(--yellow)' : 'var(--accent)',
                  }}
                />
              </div>
              {isFree && usagePct >= 80 && (
                <p className={styles.usageWarning}>
                  {usagePct >= 100
                    ? 'You\'ve used all your free analyses.'
                    : `${usageLimit - usageCount} free ${usageLimit - usageCount === 1 ? 'analysis' : 'analyses'} remaining.`}
                  {' '}
                  <button className={styles.inlineLink} onClick={() => navigate('/upgrade')}>
                    Upgrade now →
                  </button>
                </p>
              )}
            </div>
          )}

          <div className={styles.billingActions}>
            {user?.subscriptionStatus === 'active' ? (
              <button
                className="btn btn-ghost"
                onClick={handleManageBilling}
                disabled={portalLoading || isDemo}
              >
                {portalLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Opening…</> : 'Manage Subscription →'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/upgrade')}
                disabled={isDemo}
              >
                Upgrade Plan →
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>WordPress Plugin Connection</h2>
          <p className={styles.wpDesc}>
            To connect Rain OS to your WordPress site, copy the key below and paste it into the
            Rain OS plugin settings inside your WordPress admin panel.
          </p>

          <div className={styles.keyBox}>
            <code className={styles.keyDisplay}>
              {apiKey && apiKey !== '__demo__'
                ? apiKey.slice(0, 8) + '•'.repeat(Math.max(0, apiKey.length - 16)) + apiKey.slice(-8)
                : '—'}
            </code>
            <button
              className={styles.copyBtn}
              onClick={handleCopyKey}
              disabled={!apiKey || apiKey === '__demo__'}
            >
              {copied ? '✓ Copied!' : 'Copy key'}
            </button>
          </div>

          <p className={styles.wpHint}>
            In WordPress: go to <strong>Rain OS → Settings</strong> and paste your key in the API Key field.
          </p>
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>GitHub Integration</h2>
          <p className={styles.wpDesc}>
            Connect your GitHub account to analyze source code repositories for AI readability and AEO performance.
          </p>

          {githubStatus === 'just_connected' && (
            <p className={styles.successBanner}>✓ GitHub connected successfully!</p>
          )}
          {githubStatus === 'error' && (
            <p className={styles.errorBanner}>GitHub connection failed. Please try again.</p>
          )}
          {githubStatus === 'cancelled' && (
            <p className={styles.warningBanner}>GitHub connection was cancelled.</p>
          )}
          {githubStatus === 'disconnected' && (
            <p className={styles.warningBanner}>GitHub account disconnected.</p>
          )}

          {user?.githubLogin ? (
            <div className={styles.githubConnected}>
              <div className={styles.githubInfo}>
                <span className={styles.githubIcon}>⊕</span>
                <div>
                  <div className={styles.githubLogin}>@{user.githubLogin}</div>
                  <div className={styles.githubLabel}>Connected</div>
                </div>
              </div>
              <div className={styles.githubActions}>
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate('/repo-analysis')}
                >
                  Analyze Repos →
                </button>
                <button
                  className={styles.disconnectBtn}
                  onClick={handleDisconnectGithub}
                  disabled={disconnecting || isDemo}
                >
                  {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleConnectGithub}
              disabled={isDemo}
              style={{ marginTop: 12 }}
            >
              Connect GitHub
            </button>
          )}

          <p className={styles.wpHint}>
            Requires a GitHub OAuth App. Set <strong>GITHUB_CLIENT_ID</strong> and <strong>GITHUB_CLIENT_SECRET</strong> in your backend environment.
          </p>
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>Session</h2>
          <p className={styles.dangerText}>
            You will be signed out of this browser session.
          </p>
          <button onClick={handleSignOut} className="btn btn-danger" style={{ marginTop: 16 }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
