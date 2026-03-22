import { useState } from 'react';
import { api } from '../api/client.js';
import { useApp } from '../App.jsx';
import PillarScores from '../components/PillarScores.jsx';
import QuickTools from '../components/QuickTools.jsx';
import styles from './ContentAnalyzer.module.css';

export default function ContentAnalyzer() {
  const { refreshUser } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!content.trim() && !url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.analyze({ title, content, url });
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
            <textarea
              className={styles.textarea}
              placeholder="Paste your article, page copy, or any text content here…"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={14}
            />
            <span className={styles.wordCount}>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!content.trim() && !url.trim())}
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
                {result.recommendations.map((r, i) => (
                  <li key={i} className={styles.recoItem}>
                    <span className={styles.recoNum}>{i + 1}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <QuickTools content={content} title={title} />
        </div>
      )}
    </div>
  );
}
