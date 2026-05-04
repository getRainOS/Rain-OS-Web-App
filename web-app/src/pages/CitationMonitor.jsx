import { useState } from 'react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import { Radar, Search, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './CitationMonitor.module.css';

const EXAMPLE_TOPICS = [
  'best AI content optimizer for bloggers',
  'how to improve AEO for a SaaS landing page',
  'what is answer engine optimization',
];

function getFavicon(domain) {
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function scoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#0EA5E9';
  if (score >= 30) return '#f59e0b';
  return '#ef4444';
}

export default function CitationMonitor() {
  const { isDemo } = useApp();
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleCheck(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.citationCheck({ topic: topic.trim(), url: url.trim() || undefined });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Citation check failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleExample(t) {
    setTopic(t);
    setResult(null);
    setError('');
  }

  function handleReset() {
    setResult(null);
    setError('');
  }

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Radar className={styles.titleIcon} />
          <h1 className={styles.title}>Citation Monitor</h1>
          <span className={styles.newBadge}>NEW</span>
        </div>
        <p className={styles.sub}>
          When someone asks an AI engine about your topic, does your content get cited?
          We run the query through Gemini with live Google Search grounding and show you the real sources AI is citing — and how to get yours among them.
        </p>
      </div>

      {!result && (
        <form onSubmit={handleCheck} className={`card ${styles.formCard}`}>
          <label className={styles.label} htmlFor="cm-topic">
            Topic or question
            <span className={styles.labelHint}>What you want AI to recommend you for</span>
          </label>
          <input
            id="cm-topic"
            type="text"
            className={styles.input}
            placeholder="e.g. best AI content optimizer for bloggers"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            maxLength={500}
            required
          />

          <label className={styles.label} htmlFor="cm-url">
            Your website URL
            <span className={styles.labelHint}>Optional — we'll check if your domain appears in cited sources</span>
          </label>
          <input
            id="cm-url"
            type="text"
            className={styles.input}
            placeholder="https://yoursite.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />

          <div className={styles.examples}>
            <span className={styles.examplesLabel}>Try:</span>
            {EXAMPLE_TOPICS.map(t => (
              <button
                key={t}
                type="button"
                className={styles.exampleChip}
                onClick={() => handleExample(t)}
                disabled={loading}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading || !topic.trim()}
          >
            {loading
              ? <><span className="spinner" /> Checking citations…</>
              : <><Search style={{ width: 14, height: 14 }} /> Check Citations</>}
          </button>

          {error && <p className={styles.error}>{error}</p>}

          {isDemo && (
            <p className={styles.demoNote}>
              Demo mode — results are illustrative. Sign in to run real grounded citation checks.
            </p>
          )}
        </form>
      )}

      {result && (
        <div className={`${styles.results} fade-in`}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>"{result.topic}"</h2>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resultsUrl}
                >
                  {result.url} <ExternalLink style={{ width: 11, height: 11 }} />
                </a>
              )}
            </div>
            <button onClick={handleReset} className="btn btn-ghost">
              ← New Check
            </button>
          </div>

          {/* Citation status banner */}
          <div
            className={styles.statusBanner}
            style={{
              background: result.cited ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
              borderColor: result.cited ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)',
            }}
          >
            {result.cited ? (
              <>
                <CheckCircle2 className={styles.statusIcon} style={{ color: '#22c55e' }} />
                <div>
                  <div className={styles.statusTitle} style={{ color: '#22c55e' }}>
                    Your domain is being cited
                  </div>
                  <div className={styles.statusDesc}>
                    AI cited your site as source #{(result.citedSourceIndex ?? 0) + 1} for this query.
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className={styles.statusIcon} style={{ color: '#ef4444' }} />
                <div>
                  <div className={styles.statusTitle} style={{ color: '#ef4444' }}>
                    {result.url ? 'Your domain is not cited' : 'No domain provided'}
                  </div>
                  <div className={styles.statusDesc}>
                    {result.url
                      ? `AI is currently citing ${result.sources.length} other source${result.sources.length === 1 ? '' : 's'} for this query — see the gap analysis below.`
                      : 'Add your URL above to check whether your domain appears in the cited sources.'}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Alignment score */}
          <div className={`card ${styles.scoreCard}`}>
            <div className={styles.scoreHeader}>
              <div>
                <h3 className={styles.scoreLabel}>Citation Alignment Score</h3>
                <p className={styles.scoreSub}>How well-positioned you are to be cited for this query</p>
              </div>
              <div className={styles.scoreValue} style={{ color: scoreColor(result.alignmentScore) }}>
                {result.alignmentScore}
                <span className={styles.scoreOutOf}>/100</span>
              </div>
            </div>
            <div className={styles.scoreTrack}>
              <div
                className={styles.scoreFill}
                style={{
                  width: `${result.alignmentScore}%`,
                  background: scoreColor(result.alignmentScore),
                }}
              />
            </div>
            {result.summary && <p className={styles.scoreSummary}>{result.summary}</p>}
          </div>

          {/* Sources cited */}
          {result.sources.length > 0 && (
            <div className={`card ${styles.sourcesCard}`}>
              <h3 className={styles.sectionTitle}>
                Sources AI Cited
                <span className={styles.sectionCount}>{result.sources.length}</span>
              </h3>
              <p className={styles.sectionSub}>
                These are the actual sources Gemini retrieved via Google Search to answer your query.
              </p>
              <div className={styles.sourcesList}>
                {result.sources.map((s, i) => {
                  const isUserSource = i === result.citedSourceIndex;
                  return (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.sourceItem} ${isUserSource ? styles.sourceItemSelf : ''}`}
                    >
                      <div className={styles.sourceRank}>{i + 1}</div>
                      <img
                        className={styles.sourceFavicon}
                        src={getFavicon(s.domain)}
                        alt=""
                        loading="lazy"
                        onError={e => { e.target.style.visibility = 'hidden'; }}
                      />
                      <div className={styles.sourceContent}>
                        <div className={styles.sourceTitleRow}>
                          <span className={styles.sourceTitle}>{s.title}</span>
                          {isUserSource && <span className={styles.youBadge}>YOU</span>}
                        </div>
                        <div className={styles.sourceDomain}>{s.domain}</div>
                        {s.snippet && <p className={styles.sourceSnippet}>"{s.snippet}"</p>}
                      </div>
                      <ExternalLink className={styles.sourceExternal} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI answer excerpt */}
          {result.answerExcerpt && (
            <div className={`card ${styles.answerCard}`}>
              <h3 className={styles.sectionTitle}>What AI Actually Said</h3>
              <p className={styles.sectionSub}>The grounded answer Gemini gave for your query.</p>
              <blockquote className={styles.answerQuote}>{result.answerExcerpt}</blockquote>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className={`card ${styles.recoCard}`}>
              <h3 className={styles.sectionTitle}>Recommendations</h3>
              <p className={styles.sectionSub}>
                Specific actions to {result.cited ? 'protect and extend' : 'earn'} your citation position.
              </p>
              <ul className={styles.recoList}>
                {result.recommendations.map((r, i) => (
                  <li key={i} className={styles.recoItem}>
                    <span className={styles.recoNum}>{i + 1}</span>
                    <span className={styles.recoText}>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
