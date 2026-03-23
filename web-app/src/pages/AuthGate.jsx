import { useState } from 'react';
import { setApiKey, api } from '../api/client.js';
import { DEMO_KEY, DEMO_USER } from '../demo/demoData.js';
import styles from './AuthGate.module.css';

export default function AuthGate({ onAuth, onBack }) {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleDemo() {
    setApiKey(DEMO_KEY);
    onAuth(DEMO_KEY, DEMO_USER);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError('');
    setApiKey(key.trim());
    try {
      const { data } = await api.me();
      onAuth(key.trim(), data);
    } catch (err) {
      setError(err.status === 401
        ? 'Invalid API key. Please check and try again.'
        : err.message || 'Could not connect. Please try again.');
      setApiKey('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.bg} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>rain</span>
          <span className={styles.logoOS}> OS</span>
        </div>
        <h1 className={styles.title}>AI Readability Optimizer</h1>
        <p className={styles.sub}>Enter your API key to get started</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="apikey" className={styles.label}>API Key</label>
            <input
              id="apikey"
              type="password"
              className={styles.input}
              placeholder="rain_os_xxxxxxxxxxxxxxxx"
              value={key}
              onChange={e => setKey(e.target.value)}
              autoFocus
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading || !key.trim()}
          >
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Connecting…' : 'Continue'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          type="button"
          className={`btn ${styles.demoBtn}`}
          onClick={handleDemo}
        >
          Try Demo — no key needed
        </button>

        <p className={styles.footer}>
          Don't have an API key?{' '}
          <a
            href="https://app.getrainos.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Get one at app.getrainos.com
          </a>
        </p>

        {onBack && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
          >
            ← Back to home
          </button>
        )}
      </div>
    </div>
  );
}
