import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import PillarScores from '../components/PillarScores.jsx';
import ArtifactBlock from '../components/ArtifactBlock.jsx';
import styles from './UrlScanner.module.css';

export default function UrlScanner() {
  const { refreshUser } = useApp();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleScan(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.scanUrl(url.trim());
      setResult(data);
      refreshUser();
    } catch (err) {
      setError(err.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError('');
  }

  const techRecs = result?.technical_recommendations;
  const geminiRecs = result?.recommendations;
  const recommendations = (Array.isArray(techRecs) && techRecs.length > 0)
    ? techRecs
    : (Array.isArray(geminiRecs) && geminiRecs.length > 0)
      ? geminiRecs
      : [];

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>URL Scanner</h1>
        <p className={styles.sub}>Scan any URL to analyze its AI readability and AEO performance</p>
      </div>

      <form onSubmit={handleScan} className={styles.form}>
        <div className={styles.inputRow}>
          <input
            type="url"
            className={styles.urlInput}
            placeholder="https://example.com/page"
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !url.trim()}
          >
            {loading ? <><span className="spinner" /> Scanning…</> : '◎ Scan URL'}
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </form>

      {result && (
        <div className={`${styles.results} fade-in`}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>Scan Results</h2>
              <p className={styles.resultsUrl}>{result.url || url}</p>
            </div>
            <button onClick={handleReset} className="btn btn-ghost">
              ← New Scan
            </button>
          </div>

          {(result.technical_signals?.isJsRendered || result.signals?.isJsRendered) && (
            <div className={styles.jsWarningBanner}>
              <div className={styles.jsWarningIcon}>⚠</div>
              <div className={styles.jsWarningBody}>
                <strong className={styles.jsWarningTitle}>JavaScript-rendered site detected</strong>
                <p className={styles.jsWarningText}>
                  AI crawlers (ChatGPT, Perplexity, Claude) see an empty page — they don't execute JavaScript.
                  The scores below reflect what they actually see, not your full app.
                </p>
                <button
                  className={styles.jsWarningCta}
                  onClick={() => navigate('/repo-analysis')}
                >
                  Analyze source code instead →
                </button>
              </div>
            </div>
          )}

          <PillarScores result={result} />

          {(result.signals ?? result.technical_signals)?.length > 0 && (
            <div className={`card ${styles.signalsCard}`}>
              <h3 className={styles.sectionTitle}>Technical Signals</h3>
              <div className={styles.signalGrid}>
                {(result.signals ?? result.technical_signals).map((s, i) => (
                  <div key={i} className={styles.signal}>
                    <span
                      className={styles.signalDot}
                      style={{
                        background: s.pass ? 'var(--green)' : 'var(--red)',
                        boxShadow: `0 0 6px ${s.pass ? 'var(--green)' : 'var(--red)'}`,
                      }}
                    />
                    <div>
                      <div className={styles.signalName}>{s.label || s.name}</div>
                      {s.detail && <div className={styles.signalDetail}>{s.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className={`card ${styles.recoCard}`}>
              <h3 className={styles.sectionTitle}>Recommendations</h3>
              <ul className={styles.recoList}>
                {recommendations.map((r, i) => {
                  const isObj = typeof r === 'object' && r !== null;
                  const text = isObj ? r.recommendation : r;
                  const artifact = isObj ? r.artifact : null;
                  return (
                    <li key={i} className={styles.recoItem}>
                      <span className={styles.recoNum}>{i + 1}</span>
                      <div className={styles.recoContent}>
                        <span>{text}</span>
                        {artifact && <ArtifactBlock artifact={artifact} />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
