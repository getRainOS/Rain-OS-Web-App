import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import PillarScores from '../components/PillarScores.jsx';
import QuickTools from '../components/QuickTools.jsx';
import ArtifactBlock from '../components/ArtifactBlock.jsx';
import TypewriterPlaceholder from '../components/TypewriterPlaceholder.jsx';
import styles from './ContentAnalyzer.module.css';

export default function ContentAnalyzer() {
  const { refreshUser, user, isDemo, userLane } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state || {};
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(prefill.pendingContent || '');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [textareaFocused, setTextareaFocused] = useState(false);

  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [rewriteResult, setRewriteResult] = useState(null);
  const [rewriteError, setRewriteError] = useState('');

  const usageCount = user?.usage?.count ?? 0;
  const usageLimit = user?.usage?.limit ?? 5;
  const isAtLimit = !isDemo && user && usageCount >= usageLimit && user.subscriptionStatus !== 'active';

  const analysisModule = userLane === 'product_sellers' ? 'product_sellers'
    : userLane === 'developers' ? 'developers'
    : userLane === 'local_business' ? 'local_business'
    : 'general';

  const pageLabel = userLane === 'developers'
    ? 'Documentation Optimizer'
    : userLane === 'product_sellers'
    ? 'Product Content Optimizer'
    : userLane === 'local_business'
    ? 'Local Business Optimizer'
    : 'Content Optimizer';

  const pageSub = userLane === 'developers'
    ? 'Paste your documentation to score and optimize it for AI discoverability across three pillars'
    : userLane === 'product_sellers'
    ? 'Paste your product content to analyze it for AI shopping and discovery signals'
    : userLane === 'local_business'
    ? 'Paste your website content or Google Business Profile description to score it for local AI visibility'
    : 'Paste your content to get a full AEO analysis and rewrite it for AI readability';

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!content.trim() && !url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setRewriteResult(null);
    try {
      const { data } = await api.analyze({ title, content, url, module: analysisModule });
      setResult(data);
      refreshUser();
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRewrite() {
    if (!content.trim()) return;
    setRewriteLoading(true);
    setRewriteError('');
    setRewriteResult(null);
    try {
      const { data } = await api.rewrite({ content, module: analysisModule });
      setRewriteResult(data);
      refreshUser();
    } catch (err) {
      setRewriteError(err.message || 'Rewrite failed. Please try again.');
    } finally {
      setRewriteLoading(false);
    }
  }

  function handleAcceptRewrite() {
    if (rewriteResult?.rewritten) {
      setContent(rewriteResult.rewritten);
      setRewriteResult(null);
      setResult(null);
    }
  }

  function handleReset() {
    setResult(null);
    setError('');
    setRewriteResult(null);
    setRewriteError('');
  }

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{pageLabel}</h1>
        <p className={styles.sub}>{pageSub}</p>
      </div>

      {isAtLimit && (
        <div className={styles.upgradeGate}>
          <span className={styles.upgradeGateIcon}>⚡</span>
          <p className={styles.upgradeGateText}>
            You've used all {usageLimit} free analyses.
          </p>
          <p className={styles.upgradeGateSub}>Upgrade your plan to continue analyzing content.</p>
          <button className="btn btn-primary" onClick={() => navigate('/upgrade')}>
            View Plans →
          </button>
        </div>
      )}

      {!result ? (
        <form onSubmit={handleAnalyze} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Title (optional)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="My article title…"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>URL (optional)</label>
              <input
                type="url"
                className={styles.input}
                placeholder="https://example.com/article"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Content</label>
            <div className={styles.textareaWrap}>
              <TypewriterPlaceholder
                value={content}
                isFocused={textareaFocused}
                padding="12px 14px"
                fontSize="14px"
                lineHeight="1.6"
              />
              <textarea
                className={styles.textarea}
                value={content}
                onChange={e => setContent(e.target.value)}
                onFocus={() => setTextareaFocused(true)}
                onBlur={() => setTextareaFocused(false)}
                rows={14}
              />
            </div>
            <span className={styles.wordCount}>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isAtLimit || (!content.trim() && !url.trim())}
            >
              {loading ? <><span className="spinner" /> Analyzing…</> : '✦ Analyze Content'}
            </button>
            <button
              type="button"
              className={styles.rewriteBtn}
              disabled={rewriteLoading || isAtLimit || !content.trim()}
              onClick={handleRewrite}
            >
              {rewriteLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Rewriting…</> : '✦ Rewrite for AI'}
            </button>
          </div>

          {rewriteError && <p className={styles.error}>{rewriteError}</p>}

          {rewriteResult && (
            <RewritePanel
              rewriteResult={rewriteResult}
              onAccept={handleAcceptRewrite}
              onDiscard={() => setRewriteResult(null)}
            />
          )}
        </form>
      ) : (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>Analysis Results</h2>
              {result.title && <p className={styles.resultsSub}>{result.title}</p>}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just scored ${result.overall_score ?? result.rain_score ?? '—'}/100 on rain OS for AI readability. How does your content rank?`)}
&url=${encodeURIComponent(window.location.origin + '/analyze')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share
              </a>
              <button
                className={styles.rewriteBtn}
                disabled={rewriteLoading || !content.trim()}
                onClick={handleRewrite}
              >
                {rewriteLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Rewriting…</> : '✦ Rewrite for AI'}
              </button>
              <button onClick={handleReset} className="btn btn-ghost">
                ← New Analysis
              </button>
            </div>
          </div>

          {rewriteError && <p className={styles.error}>{rewriteError}</p>}

          {rewriteResult && (
            <RewritePanel
              rewriteResult={rewriteResult}
              onAccept={handleAcceptRewrite}
              onDiscard={() => setRewriteResult(null)}
            />
          )}

          <PillarScores result={result} />

          {result.authorship && (
            <div className={`card ${styles.authorshipCard}`}>
              <h3 className={styles.sectionTitle}>Authorship &amp; E-E-A-T Signals</h3>
              <div className={styles.authorshipGrid}>
                {[
                  { label: 'Author Byline', ok: result.authorship.hasAuthorByline },
                  { label: 'Publish Date', ok: result.authorship.hasPublishDate },
                  { label: 'Organization', ok: result.authorship.hasOrganization },
                ].map(({ label, ok }) => (
                  <div
                    key={label}
                    className={styles.authorshipBadge}
                    style={{ borderColor: ok ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.25)', background: ok ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.05)' }}
                  >
                    <span className={styles.authorshipBadgeIcon} style={{ color: ok ? 'var(--green)' : 'var(--red)' }}>
                      {ok ? '✓' : '✗'}
                    </span>
                    <span style={{ color: ok ? 'var(--text)' : 'var(--text-muted)' }}>{label}</span>
                  </div>
                ))}
                <div className={styles.authorshipScore}>
                  <span>Authority Score</span>
                  <span className={styles.authorshipScoreValue}>{result.authorship.authorityScore}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>/100</span>
                </div>
              </div>
            </div>
          )}

          {result.summary && (
            <div className={`card ${styles.summaryCard}`}>
              <h3 className={styles.sectionTitle}>Summary</h3>
              <p className={styles.summaryText}>{result.summary}</p>
            </div>
          )}

          {result.recommendations?.length > 0 && (
            <div className={`card ${styles.recoCard}`}>
              <h3 className={styles.sectionTitle}>Recommendations</h3>
              <ul className={styles.recoList}>
                {result.recommendations.map((r, i) => {
                  const isObj = typeof r === 'object' && r !== null;
                  const text = isObj
                    ? (r.recommendation || r.description || r.issue || '')
                    : String(r);
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

          <QuickTools content={content} title={title} />

          <div style={{
            marginTop: 16,
            padding: '16px 20px',
            background: 'rgba(14,165,233,0.06)',
            border: '1px solid rgba(14,165,233,0.2)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                Optimization done? Now check if AI actually cites you.
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                Citation Monitor gives you a real-time snapshot of current AI citations — run it before and after optimizing to see where you stand.
              </p>
            </div>
            <button
              onClick={() => navigate('/citation-monitor')}
              style={{
                flexShrink: 0,
                background: 'rgba(14,165,233,0.15)',
                border: '1px solid rgba(14,165,233,0.35)',
                color: '#38bdf8',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Check citations now →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RewritePanel({ rewriteResult, onAccept, onDiscard }) {
  const [tab, setTab] = useState('rewritten');

  return (
    <div className={styles.rewritePanel}>
      <div className={styles.rewritePanelHeader}>
        <div className={styles.rewritePanelTitle}>
          <span className={styles.rewriteSparkle}>✦</span>
          AI-Optimized Rewrite
        </div>
        <div className={styles.rewriteTabs}>
          <button
            className={`${styles.rewriteTab} ${tab === 'rewritten' ? styles.rewriteTabActive : ''}`}
            onClick={() => setTab('rewritten')}
          >
            Rewritten
          </button>
          <button
            className={`${styles.rewriteTab} ${tab === 'changes' ? styles.rewriteTabActive : ''}`}
            onClick={() => setTab('changes')}
          >
            Changes ({rewriteResult.changes?.length ?? 0})
          </button>
        </div>
      </div>

      {tab === 'rewritten' && (
        <div className={styles.rewriteContent}>
          <pre className={styles.rewriteText}>{rewriteResult.rewritten}</pre>
        </div>
      )}

      {tab === 'changes' && (
        <div className={styles.rewriteChangesList}>
          {(rewriteResult.changes || []).map((change, i) => (
            <div key={i} className={styles.rewriteChange}>
              <span className={styles.rewriteChangeTick}>✓</span>
              <span>{change}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.rewriteActions}>
        <button className={styles.rewriteAcceptBtn} onClick={onAccept}>
          Use this version
        </button>
        <button className={styles.rewriteDiscardBtn} onClick={onDiscard}>
          Keep original
        </button>
      </div>
    </div>
  );
}
