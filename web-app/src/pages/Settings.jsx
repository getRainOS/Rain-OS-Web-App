import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api, getApiKey, clearApiKey } from '../api/client.js';
import { supabase } from '../lib/supabase.js';
import { LANES } from '../lib/lanes.js';
import { PRICE_TO_PLAN } from '../lib/plans.js';
import PageHeader from '../components/PageHeader.jsx';
import Select from '../components/Select.jsx';
import { US_STATES } from '../lib/usStates.js';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, onLogout, refreshUser, userLane, setUserLane } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  // /settings#account (the dashboard's API Usage card) opens on plan and usage.
  useEffect(() => {
    if (location.hash !== '#account') return;
    const t = setTimeout(() => document.getElementById('account')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    return () => clearTimeout(t);
  }, [location.hash]);
  const [copied, setCopied] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');
  const [githubStatus, setGithubStatus] = useState(null);
  const [githubReason, setGithubReason] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [alertsError, setAlertsError] = useState('');

  useEffect(() => {
    if (typeof user?.citationAlerts === 'boolean') setAlertsEnabled(user.citationAlerts);
  }, [user?.citationAlerts]);

  async function handleAlertsChange(e) {
    const next = e.target.checked;
    setAlertsEnabled(next);
    setSavingAlerts(true);
    setAlertsError('');
    try {
      await api.setCitationAlerts(next);
      refreshUser?.();
    } catch (err) {
      setAlertsEnabled(!next);
      setAlertsError(err.message || 'Could not save. Try again.');
    } finally {
      setSavingAlerts(false);
    }
  }

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
      setGithubReason(params.get('reason') || '');
    }
  }, [location.search]);

  const apiKey = getApiKey();
  const plan = user?.isAdmin ? 'Staff' : user?.subscriptionStatus === 'active' && user?.stripePriceId
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

  const [locState, setLocState] = useState(user?.locationState || '');
  const [locNote, setLocNote] = useState('');
  useEffect(() => { setLocState(user?.locationState || ''); }, [user?.locationState]);
  async function handleLocation(next) {
    setLocState(next);
    setLocNote('');
    try {
      await api.setLocationState(next || null);
      setLocNote(next ? 'Saved. ChatGPT checks now run as someone in this state would see them.' : 'Saved. ChatGPT checks run without a location.');
      refreshUser?.();
    } catch (err) {
      setLocNote(err.message || 'Could not save.');
    }
  }

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const emailMatches = !!user?.email && deleteConfirm.trim().toLowerCase() === user.email.toLowerCase();

  async function handleDeleteAccount() {
    if (!emailMatches) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.deleteAccount(deleteConfirm.trim());
      handleSignOut();
    } catch (err) {
      setDeleteError(err.message || 'Deleting your account failed. Nothing was removed.');
      setDeleting(false);
    }
  }

  function handleSignOut() {
    supabase.auth.signOut().catch(() => {});
    clearApiKey();
    onLogout();
    navigate('/');
  }

  async function handleConnectGithub(switchAccount = false) {
    try {
      const { data } = await api.github.connect('/settings', switchAccount);
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

  function startEditingName() {
    setNameInput(user?.name || '');
    setNameError('');
    setEditingName(true);
  }

  async function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError('Name cannot be empty.');
      return;
    }
    setSavingName(true);
    setNameError('');
    try {
      await api.updateName(trimmed);
      refreshUser();
      setEditingName(false);
    } catch (err) {
      setNameError(err.message || 'Failed to update name.');
    } finally {
      setSavingName(false);
    }
  }

  async function handleManageBilling() {
    setError('');
    setPortalLoading(true);
    try {
      const { data } = await api.createBillingPortal(window.location.origin + '/settings');
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
      <PageHeader title="Settings" subtitle="Your account, plan, API key and alerts." />

      {error && <p className={styles.errorBanner}>{error}</p>}

      <div className={styles.sections}>
        <div className="card" id="account" style={{ scrollMarginTop: 80 }}>
          <h2 className={styles.sectionTitle}>Account</h2>
          {user && (
            <div className={styles.accountGrid}>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Name</span>
                {editingName ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="text"
                      className={styles.input}
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      maxLength={100}
                      autoFocus
                      style={{ padding: '4px 8px', fontSize: 13, width: 180 }}
                    />
                    <button className={styles.inlineLink} onClick={handleSaveName} disabled={savingName}>
                      {savingName ? 'Saving…' : 'Save'}
                    </button>
                    <button className={styles.inlineLink} onClick={() => { setEditingName(false); setNameError(''); }} disabled={savingName}>
                      Cancel
                    </button>
                  </span>
                ) : (
                  <span className={styles.accountValue} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {user.name || '—'}
                    <button className={styles.inlineLink} onClick={startEditingName}>
                      {user.name ? 'Edit' : 'Add name'}
                    </button>
                  </span>
                )}
              </div>
              {nameError && <p className={styles.errorBanner} style={{ margin: 0 }}>{nameError}</p>}
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Email</span>
                <span className={styles.accountValue}>{user.email ?? '—'}</span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Plan</span>
                <span className={styles.accountValue} style={{ color: isFree ? 'var(--text-muted)' : 'var(--text)' }}>
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
                    background: usagePct >= 100 ? 'var(--red)' : usagePct > 75 ? 'var(--yellow)' : 'var(--text-muted)',
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
                disabled={portalLoading}
              >
                {portalLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Opening…</> : 'Manage Subscription →'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/upgrade')}
              >
                Upgrade Plan →
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>API Key</h2>
          <p className={styles.wpDesc}>
            Use this key to authenticate direct API calls to rain OS.
          </p>

          <div className={styles.keyBox}>
            <code className={styles.keyDisplay}>
              {apiKey
                ? apiKey.slice(0, 8) + '•'.repeat(Math.max(0, apiKey.length - 16)) + apiKey.slice(-8)
                : '—'}
            </code>
            <button
              className={styles.copyBtn}
              onClick={handleCopyKey}
              disabled={!apiKey}
            >
              {copied ? '✓ Copied!' : 'Copy key'}
            </button>
          </div>
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
            <p className={styles.errorBanner}>
              {githubReason === 'already_linked'
                ? 'That GitHub account is already connected to a different rain OS account. Sign in to that account and disconnect it first, or connect a different GitHub account.'
                : 'GitHub connection failed. Please try again.'}
            </p>
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
                  disabled={disconnecting}
                >
                  {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => handleConnectGithub(false)}
            >
              Connect GitHub
            </button>
          )}

          <p className={`${styles.wpHint} ${styles.githubHint}`}>
            You'll authorize access on GitHub's site — nothing to configure here.
            {!user?.githubLogin && (
              <>
                {' '}Signed in to the wrong GitHub account?{' '}
                <button type="button" className={styles.linkBtn} onClick={() => handleConnectGithub(true)}>
                  Choose a different account
                </button>
              </>
            )}
          </p>
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>Solution Lane</h2>
          <p className={styles.wpDesc}>
            Choose the lane that best describes how you use rain OS. This adjusts scoring weights and KPI cards across your dashboard and all analysis tools.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {LANES.map(lane => (
              <button
                key={lane.id}
                onClick={() => setUserLane(lane.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '12px 16px',
                  background: userLane === lane.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${userLane === lane.id ? 'var(--text-muted)' : 'var(--border)'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{lane.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lane.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>Email updates</h2>
          <label className={styles.switchRow} htmlFor="citation-alerts">
            <span className={styles.switchText}>
              <span className={styles.switchLabel}>Email me about my tracked questions</span>
              <span className={styles.switchHint}>A short summary every Monday, plus an alert when an AI engine starts or stops citing you (confirmed by two checks in a row).</span>
            </span>
            <input
              id="citation-alerts"
              type="checkbox"
              role="switch"
              className={styles.switch}
              checked={alertsEnabled}
              onChange={handleAlertsChange}
              disabled={savingAlerts}
            />
          </label>
          {alertsError && <p className={styles.switchError} role="alert">{alertsError}</p>}
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>Your location</h2>
          <p className={styles.dangerText}>
            AI answers depend on where the person asking is. Pick your state and we run ChatGPT checks as someone there
            would see them. This matters most for local businesses. Put your city in the question too, like
            “best plumber in Austin”.
          </p>
          <div style={{ marginTop: 14, maxWidth: 320 }}>
            <Select
              value={locState}
              onChange={handleLocation}
              ariaLabel="Your US state"
              options={[{ value: '', label: 'No location' }, ...US_STATES.map(([code, nm]) => ({ value: code, label: nm }))]}
            />
          </div>
          {locNote && <p className={styles.dangerText} style={{ marginTop: 10 }} role="status">{locNote}</p>}
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

        <div className="card">
          <h2 className={styles.sectionTitle}>Delete account</h2>
          <p className={styles.dangerText}>
            Permanently deletes your account and everything saved in it: analyses, checks, tracked questions,
            brand links and your API key. Any paid plan is cancelled first. This cannot be undone, so export
            anything you want to keep from History before you start.
          </p>
          {!deleteOpen ? (
            <button onClick={() => setDeleteOpen(true)} className="btn btn-danger" style={{ marginTop: 16 }}>
              Delete my account
            </button>
          ) : (
            <div style={{ marginTop: 16, display: 'grid', gap: 10, maxWidth: 420 }}>
              <label htmlFor="delete-confirm" className={styles.dangerText} style={{ margin: 0 }}>
                Type <strong>{user?.email}</strong> to confirm.
              </label>
              <input
                id="delete-confirm"
                className={styles.input}
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                autoComplete="off"
                placeholder={user?.email}
                style={{ padding: '10px 12px', fontSize: 14 }}
              />
              {deleteError && <p className={styles.switchError} role="alert">{deleteError}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleDeleteAccount} className="btn btn-danger" disabled={!emailMatches || deleting}>
                  {deleting ? 'Deleting…' : 'Permanently delete'}
                </button>
                <button onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); setDeleteError(''); }} className="btn btn-ghost" disabled={deleting}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
