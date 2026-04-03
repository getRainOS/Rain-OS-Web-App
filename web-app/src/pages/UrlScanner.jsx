import { useState } from 'react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import PillarScores from '../components/PillarScores.jsx';
import styles from './UrlScanner.module.css';

function ArtifactBlock({ artifact }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(artifact.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className={styles.artifact}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactFilename}>{artifact.filename}</span>
        <button className={styles.artifactCopy} onClick={handleCopy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className={styles.artifactCode}><code>{artifact.content}</code></pre>
    </div>
  );
}

export default function UrlScanner() {
  const { refreshUser } = useApp();
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

          {(result.recommendations ?? result.technical_recommendations)?.length > 0 && (
            <div className={`card ${styles.recoCard}`}>
              <h3 className={styles.sectionTitle}>Recommendations</h3>
              <ul className={styles.recoList}>
                {(result.recommendations ?? result.technical_recommendations).map((r, i) => {
                  const text = typeof r === 'string' ? r : r.text;
                  const artifact = typeof r === 'object' ? r.artifact : null;
                  return (
                    <li key={i} className={styles.recoItem}>
                      <div className={styles.recoItemTop}>
                        <span className={styles.recoNum}>{i + 1}</span>
                        <span>{text}</span>
                      </div>
                      {artifact && <ArtifactBlock artifact={artifact} />}
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
