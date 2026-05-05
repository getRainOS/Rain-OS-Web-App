import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import PillarScores from '../components/PillarScores.jsx';
import { CheckCircle2, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';
import styles from './History.module.css';

function normaliseTopicKey(topic) {
  return topic.trim().toLowerCase().replace(/\s+/g, ' ');
}

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

  const [confirmDeleteAnalysisId, setConfirmDeleteAnalysisId] = useState(null);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState(null);
  const [deleteAnalysisError, setDeleteAnalysisError] = useState('');

  const [citations, setCitations] = useState([]);
  const [citationsLoading, setCitationsLoading] = useState(false);
  const [citationsError, setCitationsError] = useState('');
  const [citationsLoaded, setCitationsLoaded] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [confirmClearTopic, setConfirmClearTopic] = useState(null);
  const [clearingTopic, setClearingTopic] = useState(null);

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

  async function handleDeleteAnalysis(id) {
    setDeletingAnalysisId(id);
    setDeleteAnalysisError('');
    try {
      await api.deleteAnalysis(id);
      setHistory(prev => prev.filter(a => a.id !== id));
      setConfirmDeleteAnalysisId(null);
      setExpanded(null);
    } catch (err) {
      if (err.status === 404) {
        setHistory(prev => prev.filter(a => a.id !== id));
        setConfirmDeleteAnalysisId(null);
      } else if (err.status === 401) {
        setDeleteAnalysisError('Session expired. Please sign out and re-enter your API key.');
      } else {
        setDeleteAnalysisError(err.message || 'Failed to delete analysis.');
      }
    } finally {
      setDeletingAnalysisId(null);
    }
  }

  async function handleDeleteCitation(id) {
    setDeletingId(id);
    setDeleteError('');
    try {
      await api.deleteCitationCheck(id);
      setCitations(prev => prev.filter(c => c.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      if (err.status === 404) {
        setCitations(prev => prev.filter(c => c.id !== id));
        setConfirmDeleteId(null);
      } else if (err.status === 401) {
        setDeleteError('Session expired. Please sign out and re-enter your API key.');
      } else {
        setDeleteError(err.message || 'Failed to delete citation check.');
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleClearAll() {
    setClearingAll(true);
    setDeleteError('');
    try {
      await api.clearCitationHistory();
      setCitations([]);
      setConfirmClearAll(false);
    } catch (err) {
      if (err.status === 401) {
        setDeleteError('Session expired. Please sign out and re-enter your API key.');
      } else {
        setDeleteError(err.message || 'Failed to clear citation history.');
      }
    } finally {
      setClearingAll(false);
    }
  }

  async function handleClearTopic(topic) {
    setClearingTopic(topic);
    setDeleteError('');
    try {
      await api.clearCitationHistory({ topic });
      const clearedKey = normaliseTopicKey(topic);
      setCitations(prev => prev.filter(c => normaliseTopicKey(c.topic) !== clearedKey));
      setConfirmClearTopic(null);
    } catch (err) {
      if (err.status === 401) {
        setDeleteError('Session expired. Please sign out and re-enter your API key.');
      } else {
        setDeleteError(err.message || 'Failed to clear topic history.');
      }
    } finally {
      setClearingTopic(null);
    }
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

          {deleteAnalysisError && <p className={styles.error}>{deleteAnalysisError}</p>}

          {!loading && history.length === 0 && !error && (
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
                const isConfirming = confirmDeleteAnalysisId === item.id;
                const isDeleting = deletingAnalysisId === item.id;
                return (
                  <div key={item.id ?? i} className={styles.item}>
                    <div
                      className={styles.itemHeader}
                      onClick={() => !isConfirming && toggleExpand(i)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !isConfirming) toggleExpand(i); }}
                    >
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
                              {item[p.key] !== undefined && item[p.key] !== null ? Math.round(item[p.key]) : '—'}
                            </span>
                          ))}
                        </div>
                        <div className={styles.overallScore} style={{ color: scoreColor }}>
                          {score !== null ? Math.round(score) : '—'}
                        </div>
                        {isConfirming ? (
                          <div className={styles.deleteConfirm} onClick={e => e.stopPropagation()}>
                            <span className={styles.deleteConfirmText}>Delete?</span>
                            <button
                              type="button"
                              className={`${styles.deleteAction} ${styles.deleteActionConfirm}`}
                              onClick={() => handleDeleteAnalysis(item.id)}
                              disabled={isDeleting}
                              aria-label="Confirm delete"
                            >
                              {isDeleting ? '…' : 'Yes'}
                            </button>
                            <button
                              type="button"
                              className={styles.deleteAction}
                              onClick={() => { setConfirmDeleteAnalysisId(null); setDeleteAnalysisError(''); }}
                              disabled={isDeleting}
                              aria-label="Cancel delete"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={e => { e.stopPropagation(); setConfirmDeleteAnalysisId(item.id); setDeleteAnalysisError(''); }}
                            disabled={item.id == null}
                            aria-label="Delete analysis"
                            title="Delete"
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        )}
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

          {deleteError && <p className={styles.error}>{deleteError}</p>}

          {!citationsLoading && citations.length > 0 && (
            <>
              <div className={styles.bulkBar}>
                {confirmClearAll ? (
                  <div className={styles.deleteConfirm}>
                    <span className={styles.deleteConfirmText}>Clear all {citations.length} citation checks?</span>
                    <button
                      type="button"
                      className={`${styles.deleteAction} ${styles.deleteActionConfirm}`}
                      onClick={handleClearAll}
                      disabled={clearingAll}
                      aria-label="Confirm clear all"
                    >
                      {clearingAll ? '…' : 'Yes, clear all'}
                    </button>
                    <button
                      type="button"
                      className={styles.deleteAction}
                      onClick={() => { setConfirmClearAll(false); setDeleteError(''); }}
                      disabled={clearingAll}
                      aria-label="Cancel clear all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.clearAllBtn}
                    onClick={() => { setConfirmClearAll(true); setDeleteError(''); setConfirmClearTopic(null); setConfirmDeleteId(null); }}
                    aria-label="Clear all citation history"
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                    Clear all
                  </button>
                )}
              </div>

              <div className={styles.list}>
                {citations.map((c, i) => {
                  const score = c.alignmentScore ?? null;
                  const color = score === null ? 'var(--text-dim)' : citationScoreColor(score);
                  const isConfirming = confirmDeleteId === c.id;
                  const isDeleting = deletingId === c.id;
                  const isConfirmingTopic = confirmClearTopic === c.topic;
                  const isClearingTopic = clearingTopic === c.topic;
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

                          {isConfirmingTopic ? (
                            <div className={styles.deleteConfirm}>
                              <span className={styles.deleteConfirmText}>Clear all &quot;{c.topic}&quot;?</span>
                              <button
                                type="button"
                                className={`${styles.deleteAction} ${styles.deleteActionConfirm}`}
                                onClick={() => handleClearTopic(c.topic)}
                                disabled={isClearingTopic}
                                aria-label="Confirm clear topic"
                              >
                                {isClearingTopic ? '…' : 'Yes'}
                              </button>
                              <button
                                type="button"
                                className={styles.deleteAction}
                                onClick={() => { setConfirmClearTopic(null); setDeleteError(''); }}
                                disabled={isClearingTopic}
                                aria-label="Cancel clear topic"
                              >
                                No
                              </button>
                            </div>
                          ) : isConfirming ? (
                            <div className={styles.deleteConfirm}>
                              <span className={styles.deleteConfirmText}>Delete?</span>
                              <button
                                type="button"
                                className={`${styles.deleteAction} ${styles.deleteActionConfirm}`}
                                onClick={() => handleDeleteCitation(c.id)}
                                disabled={isDeleting}
                                aria-label="Confirm delete"
                              >
                                {isDeleting ? '…' : 'Yes'}
                              </button>
                              <button
                                type="button"
                                className={styles.deleteAction}
                                onClick={() => { setConfirmDeleteId(null); setDeleteError(''); }}
                                disabled={isDeleting}
                                aria-label="Cancel delete"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className={styles.itemActions}>
                              <button
                                type="button"
                                className={styles.clearTopicBtn}
                                onClick={() => { setConfirmClearTopic(c.topic); setDeleteError(''); setConfirmDeleteId(null); setConfirmClearAll(false); }}
                                aria-label={`Clear all checks for topic: ${c.topic}`}
                                title="Clear this topic"
                              >
                                Clear topic
                              </button>
                              <button
                                type="button"
                                className={styles.deleteBtn}
                                onClick={() => { setConfirmDeleteId(c.id); setDeleteError(''); }}
                                disabled={c.id == null}
                                aria-label="Delete citation check"
                                title="Delete"
                              >
                                <Trash2 style={{ width: 14, height: 14 }} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
