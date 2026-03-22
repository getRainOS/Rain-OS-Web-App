import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import PillarScores from '../components/PillarScores.jsx';
import styles from './History.module.css';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.history()
      .then(({ data }) => setHistory(Array.isArray(data) ? data : data?.items ?? []))
      .catch(err => setError(err.message || 'Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(i) {
    setExpanded(prev => prev === i ? null : i);
  }

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Score History</h1>
        <p className={styles.sub}>All past content analyses and their AEO scores</p>
      </div>

      {loading && (
        <div className={styles.center}><span className="spinner" /></div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && history.length === 0 && (
        <div className={styles.empty}>
          <p>No analyses yet.</p>
          <p className={styles.emptySub}>Run a content analysis to see your history here.</p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className={styles.list}>
          {history.map((item, i) => {
            const isOpen = expanded === i;
            const score = item.overall_score ?? null;
            const scoreColor = score === null ? 'var(--text-dim)'
              : score >= 75 ? 'var(--green)'
              : score >= 50 ? 'var(--yellow)'
              : 'var(--red)';
            return (
              <div key={i} className={styles.item}>
                <div className={styles.itemHeader} onClick={() => toggleExpand(i)} role="button" tabIndex={0}>
                  <div className={styles.itemLeft}>
                    <div className={styles.itemTitle}>
                      {item.title || item.url || `Analysis #${history.length - i}`}
                    </div>
                    <div className={styles.itemMeta}>
                      {item.url && <span className={styles.itemUrl}>{item.url}</span>}
                      {item.analyzed_at && (
                        <span className={styles.itemDate}>
                          {new Date(item.analyzed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <div className={styles.itemPillars}>
                      {[
                        { key: 'ai_readability', color: 'var(--cyan)' },
                        { key: 'digital_authority', color: 'var(--green)' },
                        { key: 'conversion_readiness', color: 'var(--purple)' },
                        { key: 'product_discoverability', color: 'var(--orange)' },
                      ].map(p => (
                        <span key={p.key} className={styles.miniScore} style={{ color: p.color }}>
                          {item[p.key] !== undefined ? Math.round(item[p.key]) : '—'}
                        </span>
                      ))}
                    </div>
                    <div className={styles.overallScore} style={{ color: scoreColor }}>
                      {score !== null ? Math.round(score) : '—'}
                    </div>
                    <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isOpen && (
                  <div className={styles.itemBody}>
                    <PillarScores result={item} />
                    {item.summary && (
                      <div className={styles.summary}>
                        <h4 className={styles.summaryLabel}>Summary</h4>
                        <p className={styles.summaryText}>{item.summary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
