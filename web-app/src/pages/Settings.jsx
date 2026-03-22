import { useState } from 'react';
import { useApp } from '../App.jsx';
import { api, setApiKey, clearApiKey, getApiKey } from '../api/client.js';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, setUser, onLogout } = useApp();
  const [newKey, setNewKey] = useState('');
  const [keyLoading, setKeyLoading] = useState(false);
  const [keySuccess, setKeySuccess] = useState('');
  const [keyError, setKeyError] = useState('');

  const maskedKey = (() => {
    const k = getApiKey();
    if (!k) return '—';
    if (k.length <= 8) return '••••••••';
    return k.slice(0, 4) + '•'.repeat(k.length - 8) + k.slice(-4);
  })();

  async function handleChangeKey(e) {
    e.preventDefault();
    if (!newKey.trim()) return;
    setKeyLoading(true);
    setKeyError('');
    setKeySuccess('');
    const previousKey = getApiKey();
    setApiKey(newKey.trim());
    try {
      const { data } = await api.me();
      setUser(data);
      setKeySuccess('API key updated and verified successfully.');
      setNewKey('');
    } catch (err) {
      setApiKey(previousKey);
      setKeyError(err.status === 401
        ? 'Invalid API key. Your previous key has been restored.'
        : err.message || 'Could not verify the key. Please try again.');
    } finally {
      setKeyLoading(false);
    }
  }

  function handleSignOut() {
    clearApiKey();
    onLogout();
  }

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.sub}>Manage your Rain OS account and API key</p>
      </div>

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
                <span className={styles.accountValue} style={{ color: 'var(--accent)' }}>
                  {user.subscriptionStatus === 'active' ? 'Active' : 'Free'}
                </span>
              </div>
              <div className={styles.accountRow}>
                <span className={styles.accountLabel}>Usage</span>
                <span className={styles.accountValue}>
                  {user.usage?.count ?? 0} / {user.usage?.limit ?? 100} analyses
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>API Key</h2>
          <div className={styles.currentKey}>
            <span className={styles.currentKeyLabel}>Current key</span>
            <code className={styles.keyMask}>{maskedKey}</code>
          </div>

          <form onSubmit={handleChangeKey} className={styles.keyForm}>
            <div className={styles.field}>
              <label htmlFor="newkey" className={styles.label}>New API Key</label>
              <input
                id="newkey"
                type="password"
                className={styles.input}
                placeholder="rain_os_xxxxxxxxxxxxxxxx"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {keySuccess && <p className={styles.success}>{keySuccess}</p>}
            {keyError && <p className={styles.error}>{keyError}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={keyLoading || !newKey.trim()}
            >
              {keyLoading ? <><span className="spinner" /> Verifying…</> : 'Update API Key'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>Session</h2>
          <p className={styles.dangerText}>
            Sign out will clear your API key from this browser. You'll need to enter it again to access the app.
          </p>
          <button onClick={handleSignOut} className="btn btn-danger" style={{ marginTop: 16 }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
