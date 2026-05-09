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

  const usageCount = user?.usage?.count ?? 0;
  const usageLimit = user?.usage?.limit ?? 5;
  const isAtLimit = !isDemo && user && usageCount >= usageLimit && user.subscriptionStatus !== 'active';

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!content.trim() && !url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const analysisModule = userLane === 'product_sellers' ? 'product_sellers' : userLane === 'developers' ? 'developers' : 'general';
      const { data } = await api.analyze({ title, content, url, module: analysisModule });
      setResult(data);
      refreshUser();
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
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
        <h1 className={styles.title}>Content Analyzer</h1>
        <p className={styles.sub}>Paste your content below to get a full AEO analysis across four pillars</p>
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
          </div>
        </form>
      ) : (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>Analysis Results</h2>
              {result.title && <p className={styles.resultsSub}>{result.title}</p>}
            </div>
            <button onClick={handleReset} className="btn btn-ghost">
              ← New Analysis
            </button>
          </div>

          <PillarScores result={result} />

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
        </div>
      )}
    </div>
  );
}
