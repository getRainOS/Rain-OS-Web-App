import { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../api/client.js';
import PillarScores from '../components/PillarScores.jsx';
import { PILLAR_COLORS } from '../lib/pillarColors.js';
import { CheckCircle2, AlertCircle, ExternalLink, Trash2, Search, X } from 'lucide-react';
import styles from './History.module.css';

const UNDO_DELAY_MS = 5000;

function normaliseTopicKey(topic) {
  return topic.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getAnalysisType(item) {
  if (item.repo) return 'repo';
  if (item.url) return 'url';
  return 'content';
}

const ANALYSIS_TYPE_FILTERS = [
  { id: 'all', label: 'All types' },
  { id: 'content', label: 'Content' },
  { id: 'url', label: 'URL' },
  { id: 'repo', label: 'Repo' },
];

const CITATION_STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'cited', label: 'Cited' },
  { id: 'not_cited', label: 'Not cited' },
];

export default function History() {
  const [tab, setTab] = useState('analyses');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const [confirmDeleteAnalysisId, setConfirmDeleteAnalysisId] = useState(null);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState(null);
  const [deleteAnalysisError, setDeleteAnalysisError] = useState('');
  const [analysesSearch, setAnalysesSearch] = useState('');
  const [analysesTypeFilter, setAnalysesTypeFilter] = useState('all');

  const [citations, setCitations] = useState([]);
  const [citationsLoading, setCitationsLoading] = useState(false);
  const [citationsError, setCitationsError] = useState('');
  const [citationsLoaded, setCitationsLoaded] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [citationsSearch, setCitationsSearch] = useState('');
  const [citationsStatusFilter, setCitationsStatusFilter] = useState('all');

  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [confirmClearTopic, setConfirmClearTopic] = useState(null);
  const [clearingTopic, setClearingTopic] = useState(null);

  const [undoToast, setUndoToast] = useState(null);
  const [undoCountdown, setUndoCountdown] = useState(0);
  const undoTimerRef = useRef(null);
  const undoIntervalRef = useRef(null);

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

  const filteredHistory = useMemo(() => {
    const q = analysesSearch.trim().toLowerCase();
    return history.filter(item => {
      if (analysesTypeFilter !== 'all' && getAnalysisType(item) !== analysesTypeFilter) return false;
      if (!q) return true;
      return (item.title || '').toLowerCase().includes(q)
        || (item.url || '').toLowerCase().includes(q)
        || (item.repo || '').toLowerCase().includes(q);
    });
  }, [history, analysesSearch, analysesTypeFilter]);

  const filteredCitations = useMemo(() => {
    const q = citationsSearch.trim().toLowerCase();
    return citations.filter(c => {
      if (citationsStatusFilter === 'cited' && !c.cited) return false;
      if (citationsStatusFilter === 'not_cited' && c.cited) return false;
      if (!q) return true;
      return (c.name || '').toLowerCase().includes(q)
        || (c.topic || '').toLowerCase().includes(q)
        || (c.url || '').toLowerCase().includes(q);
    });
  }, [citations, citationsSearch, citationsStatusFilter]);

  useEffect(() => {
    return () => {
      clearTimeout(undoTimerRef.current);
      clearInterval(undoIntervalRef.current);
    };
  }, []);

  function cancelUndoTimer() {
    clearTimeout(undoTimerRef.current);
    clearInterval(undoIntervalRef.current);
    undoTimerRef.current = null;
    undoIntervalRef.current = null;
  }

  function startUndoCountdown(toast, onExpire) {
    cancelUndoTimer();
    setUndoToast(toast);
    setUndoCountdown(Math.round(UNDO_DELAY_MS / 1000));

    undoIntervalRef.current = setInterval(() => {
      setUndoCountdown(prev => {
        if (prev <= 1) {
          clearInterval(undoIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    undoTimerRef.current = setTimeout(() => {
      clearInterval(undoIntervalRef.current);
      setUndoToast(null);
      setUndoCountdown(0);
      onExpire();
    }, UNDO_DELAY_MS);
  }

  function handleUndo() {
    cancelUndoTimer();
    setUndoToast(null);
    setUndoCountdown(0);
  }

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

  function handleClearAll() {
    const count = citations.length;
    setConfirmClearAll(false);

    startUndoCountdown(
      { type: 'all', label: `Clearing ${count} citation check${count !== 1 ? 's' : ''}…` },
      async () => {
        setClearingAll(true);
        setDeleteError('');
        try {
          await api.clearCitationHistory();
          setCitations([]);
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
    );
  }

  function handleClearTopic(topic) {
    const clearedKey = normaliseTopicKey(topic);
    const count = citations.filter(c => normaliseTopicKey(c.topic) === clearedKey).length;
    setConfirmClearTopic(null);

    startUndoCountdown(
      { type: 'topic', topic, label: `Clearing "${topic}" (${count} check${count !== 1 ? 's' : ''})…` },
      async () => {
        setClearingTopic(topic);
        setDeleteError('');
        try {
          await api.clearCitationHistory({ topic });
          setCitations(prev => prev.filter(c => normaliseTopicKey(c.topic) !== clearedKey));
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
    );
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
            <div className={styles.toolbar}>
              <div className={styles.searchWrap}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search by title, URL, or repo…"
                  value={analysesSearch}
                  onChange={e => setAnalysesSearch(e.target.value)}
                />
                {analysesSearch && (
                  <button type="button" className={styles.searchClear} onClick={() => setAnalysesSearch('')} aria-label="Clear search">
                    <X size={13} />
                  </button>
                )}
              </div>
              <div className={styles.filterGroup}>
                {ANALYSIS_TYPE_FILTERS.map(f => (
                  <button key={f.id} type="button"
                    className={`${styles.filterBtn} ${analysesTypeFilter === f.id ? styles.filterBtnActive : ''}`}
                    onClick={() => setAnalysesTypeFilter(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && history.length > 0 && filteredHistory.length === 0 && (
            <div className={styles.empty}>
              <p>No analyses match your search.</p>
              <p className={styles.emptySub}>
                <button type="button" className={styles.clearAllBtn} onClick={() => { setAnalysesSearch(''); setAnalysesTypeFilter('all'); }}>
                  Clear search &amp; filters
                </button>
              </p>
            </div>
          )}

          {!loading && filteredHistory.length > 0 && (
            <div className={styles.list}>
              {filteredHistory.map((item, i) => {
                const itemKey = item.id ?? i;
                const isOpen = expanded === itemKey;
                const score = item.overall_score ?? null;
                const scoreColor = score === null ? 'var(--text-dim)'
                  : score >= 75 ? 'var(--green)'
                  : score >= 50 ? 'var(--yellow)'
                  : 'var(--red)';
                const isConfirming = confirmDeleteAnalysisId === item.id;
                const isDeleting = deletingAnalysisId === item.id;
                return (
                  <div key={itemKey} className={styles.item}>
                    <div
                      className={styles.itemHeader}
                      onClick={() => !isConfirming && toggleExpand(itemKey)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !isConfirming) toggleExpand(itemKey); }}
                    >
                      <div className={styles.itemLeft}>
                        <div className={styles.itemTitle}>
                          {item.title || item.url || item.repo || `Analysis #${filteredHistory.length - i}`}
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
                            { key: 'ai_readability', color: PILLAR_COLORS.ai_readability },
                            { key: 'digital_authority', color: PILLAR_COLORS.digital_authority },
                            { key: 'conversion_readiness', color: PILLAR_COLORS.conversion_readiness },
                            { key: 'product_discoverability', color: PILLAR_COLORS.product_discoverability },
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
                        <PillarScores result={item} lane={item.lane} />
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

          {!citationsLoading && citations.length === 0 && !citationsError && !undoToast && (
            <div className={styles.empty}>
              <p>No citation checks yet.</p>
              <p className={styles.emptySub}>Run a check from Citation Monitor to start tracking citations over time.</p>
            </div>
          )}

          {deleteError && <p className={styles.error}>{deleteError}</p>}

          {!citationsLoading && citations.length > 0 && (
            <>
              <div className={styles.toolbar}>
                <div className={styles.searchWrap}>
                  <Search size={14} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by name, topic, or URL…"
                    value={citationsSearch}
                    onChange={e => setCitationsSearch(e.target.value)}
                  />
                  {citationsSearch && (
                    <button type="button" className={styles.searchClear} onClick={() => setCitationsSearch('')} aria-label="Clear search">
                      <X size={13} />
                    </button>
                  )}
                </div>
                <div className={styles.filterGroup}>
                  {CITATION_STATUS_FILTERS.map(f => (
                    <button key={f.id} type="button"
                      className={`${styles.filterBtn} ${citationsStatusFilter === f.id ? styles.filterBtnActive : ''}`}
                      onClick={() => setCitationsStatusFilter(f.id)}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

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

              {filteredCitations.length === 0 && (
                <div className={styles.empty}>
                  <p>No citation checks match your search.</p>
                  <p className={styles.emptySub}>
                    <button type="button" className={styles.clearAllBtn} onClick={() => { setCitationsSearch(''); setCitationsStatusFilter('all'); }}>
                      Clear search &amp; filters
                    </button>
                  </p>
                </div>
              )}

              <div className={styles.list}>
                {filteredCitations.map((c, i) => {
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
                              : <AlertCircle style={{ width: 13, height: 13, color: 'var(--red)', marginRight: 6, verticalAlign: '-2px' }} />}
                            {c.name || c.topic}
                          </div>
                          <div className={styles.itemMeta}>
                            {c.name && <span className={styles.itemDate}>{c.topic}</span>}
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
                              style={{ color: c.cited ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}
                            >
                              {c.cited ? 'CITED' : 'NOT CITED'}
                            </span>
                          </div>
                        </div>
                        <div className={styles.itemRight}>
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

      {undoToast && (
        <div className={styles.undoToast} role="status" aria-live="polite">
          <span className={styles.undoToastLabel}>{undoToast.label}</span>
          <button
            type="button"
            className={styles.undoBtn}
            onClick={handleUndo}
            aria-label="Undo clear"
          >
            Undo
          </button>
          <span className={styles.undoCountdown}>{undoCountdown}s</span>
        </div>
      )}
    </div>
  );
}
