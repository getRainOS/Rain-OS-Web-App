import { useState } from 'react';
import { api } from '../api/client.js';
import styles from './QuickTools.module.css';

const TOOLS = [
  { action: 'suggest_titles',      label: 'Suggest Titles',       icon: '✎' },
  { action: 'generate_description', label: 'Meta Description',     icon: '◷' },
  { action: 'summarize_content',   label: 'Summarize',            icon: '≡' },
];

export default function QuickTools({ content, title }) {
  const [activeTool, setActiveTool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function run(action) {
    if (!content?.trim()) return;
    setActiveTool(action);
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const { data } = await api.quickTool({ action, content, title });
      setResult(data?.result ?? '');
    } catch (err) {
      setError(err.message || 'Tool failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setActiveTool(null);
    setResult(null);
    setError('');
  }

  return (
    <div className={`card ${styles.root}`}>
      <h3 className={styles.heading}>Quick Tools</h3>
      <p className={styles.sub}>AI-powered micro-actions on your content</p>

      <div className={styles.tools}>
        {TOOLS.map(t => (
          <button
            key={t.action}
            className={`${styles.toolBtn} ${activeTool === t.action ? styles.toolBtnActive : ''}`}
            onClick={() => {
              reset();
              run(t.action);
            }}
            disabled={loading || !content?.trim()}
          >
            <span className={styles.toolIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.loading}>
          <span className="spinner" />
          <span>Running {TOOLS.find(t => t.action === activeTool)?.label}…</span>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {result && !loading && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <span className={styles.resultLabel}>
              {TOOLS.find(t => t.action === activeTool)?.label} Result
            </span>
            <button onClick={reset} className={styles.clearBtn}>✕ Clear</button>
          </div>
          {Array.isArray(result) ? (
            <ol className={styles.resultList}>
              {result.map((item, i) => <li key={i}>{item}</li>)}
            </ol>
          ) : (
            <p className={styles.resultText}>{result}</p>
          )}
        </div>
      )}
    </div>
  );
}
