import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import PillarScores from '../components/PillarScores.jsx';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import styles from './History.module.css';

function citationScoreColor(score) {
  if (score >= 75) return 'var(--green)';
  if (score >= 50) return 'var(--cyan)';
  if (score >= 30) return 'var(--yellow)';
  return 'var(--red)';
}

export default function History() {
  const [tab, setTab] = useState('analyses');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const [citations, setCitations] = useState([]);
  const [citationsLoading, setCitationsLoading] = useState(false);
  const [citationsError, setCitationsError] = useState('');
  const [citationsLoaded, setCitationsLoaded] = useState(false);

  useEffect(() => {
    api.history()
      .then(({ data }) => setHistory(Array.isArray(data) ? data : data?.items ?? []))
      .catch(err => {
        setHistory([]);
        if (err.status === 401) {
          setError('Session expired. Please sign out and re-enter your API key.');
        } else if (err.status >= 500) {
          setError('History service temporarily unavailable.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== 'citations' || citationsLoaded) return;
    setCitationsLoading(true);
    setCitationsError('');
    api.citationHistory()
      .then(({ data }) => {
        const items = Array.isArray(data) ? data : data?.items ?? [];
        setCitations(items);
      })
      .catch(err => {
        setCitations([]);
        if (err.status === 401) {
          setCitationsError('Session expired. Please sign out and re-enter your API key.');
        } else if (err.status >= 500) {
          setCitationsError('Citation history service temporarily unavailable.');
        }
      })
      .finally(() => {
        setCitationsLoading(false);
        setCitationsLoaded(true);
      });
  }, [tab, citationsLoaded]);

  function toggleExpand(i) {
    setExpanded(prev => prev === i ? null : i);
  }

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Score History</h1>
        <p className={styles.sub}>All past content analyses and citation checks</p>
      </div>

      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'analyses'}
          className={`${styles.tab} ${tab === 'analyses' ? styles.tabActive : ''}`}
          onClick={() => setTab('analyses')}
        >
          Analyses
        </button>
        <button
          role="tab"
          aria-selected={tab === 'citations'}
          className={`${styles.tab} ${tab === 'citations' ? styles.tabActive : ''}`}
          onClick={() => setTab('citations')}
        >
          Citations
        </button>
      </div>

      {tab === 'analyses' && (
        <>
          {loading && (
            <div className={styles.center}><span className="spinner" /></div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          {!loading && history.length === 0 && (
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
        </>
      )}

      {tab === 'citations' && (
        <>
          {citationsLoading && (
            <div className={styles.center}><span className="spinner" /></div>
          )}

          {citationsError && <p className={styles.error}>{citationsError}</p>}

          {!citationsLoading && citations.length === 0 && !citationsError && (
            <div className={styles.empty}>
              <p>No citation checks yet.</p>
              <p className={styles.emptySub}>Run a check from Citation Monitor to start tracking citations over time.</p>
            </div>
          )}

          {!citationsLoading && citations.length > 0 && (
            <div className={styles.list}>
              {citations.map((c, i) => {
                const score = c.alignmentScore ?? null;
                const color = score === null ? 'var(--text-dim)' : citationScoreColor(score);
                return (
                  <div key={c.id ?? i} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemLeft}>
                        <div className={styles.itemTitle}>
                          {c.cited
                            ? <CheckCircle2 style={{ width: 13, height: 13, color: 'var(--green)', marginRight: 6, verticalAlign: '-2px' }} />
                            : <AlertCircle style={{ width: 13, height: 13, color: 'var(--text-dim)', marginRight: 6, verticalAlign: '-2px' }} />}
                          {c.topic}
                        </div>
                        <div className={styles.itemMeta}>
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.itemUrl}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {c.url} <ExternalLink style={{ width: 10, height: 10, verticalAlign: '-1px' }} />
                            </a>
                          )}
                          {c.checkedAt && (
                            <span className={styles.itemDate}>
                              {new Date(c.checkedAt).toLocaleDateString()}
                            </span>
                          )}
                          <span
                            className={styles.itemDate}
                            style={{ color: c.cited ? 'var(--green)' : 'var(--text-dim)', fontWeight: 600 }}
                          >
                            {c.cited ? 'CITED' : 'NOT CITED'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.itemRight}>
                        <div className={styles.overallScore} style={{ color }}>
                          {score !== null ? Math.round(score) : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
