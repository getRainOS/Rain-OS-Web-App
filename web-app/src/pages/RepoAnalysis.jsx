import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import PillarScores from '../components/PillarScores.jsx';
import ArtifactBlock from '../components/ArtifactBlock.jsx';
import styles from './RepoAnalysis.module.css';

const JS_RISK_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const JS_RISK_LABELS = {
  low: 'Low JS-Rendering Risk — site is SSR/SSG; AI crawlers can read your content',
  medium: 'Medium JS-Rendering Risk — some server-side rendering detected; spot-check with URL Scanner',
  high: 'High JS-Rendering Risk — SPA detected with no SSR. AI crawlers may miss your content',
};

function formatUpdatedAt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function RepoAnalysis() {
  const { user, isDemo } = useApp();
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const [connected, setConnected] = useState(false);
  const [reposLoading, setReposLoading] = useState(true);
  const [repoUrl, setRepoUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [connectSuccess, setConnectSuccess] = useState('');

  useEffect(() => {
    if (isDemo) { setReposLoading(false); return; }
    api.github.repos()
      .then(({ data }) => {
        setConnected(data.connected);
        setRepos(data.repos || []);
      })
      .catch(() => setConnected(false))
      .finally(() => setReposLoading(false));
  }, [isDemo]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('github=connected')) return;
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const login = params.get('login');
    setConnectSuccess(login ? `GitHub connected as @${login}` : 'GitHub connected successfully');
    // Clean the URL without reloading
    window.history.replaceState(null, '', window.location.pathname + window.location.search + '#/repo-analysis');
    const t = setTimeout(() => setConnectSuccess(''), 6000);
    return () => clearTimeout(t);
  }, []);

  async function handleAnalyze(e) {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setAnalyzing(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.github.analyze(repoUrl.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSelectRepo(repo) {
    setRepoUrl(repo.url);
    setResult(null);
    setError('');
  }

  function handleReset() {
    setResult(null);
    setError('');
  }

  if (reposLoading) {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <h1 className={styles.title}>Repo Analysis</h1>
        </div>
        <div className={styles.loadingState}>
          <span className="spinner" />
        </div>
      </div>
    );
  }

  const jsRisk = result?.signals?.jsRenderingRisk;
  const framework = result?.signals?.detectedFramework;

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Repo Analysis</h1>
        <p className={styles.sub}>
          Analyze your GitHub repository's source code for AI readability and AEO performance
        </p>
      </div>

      {connectSuccess && (
        <div className={styles.connectSuccessBanner}>
          <span>✓</span> {connectSuccess}
        </div>
      )}

      {!connected && !isDemo && (
        <div className={styles.connectCard}>
          <div className={styles.connectIcon}>⊕</div>
          <h2 className={styles.connectTitle}>Connect GitHub to analyze repos</h2>
          <p className={styles.connectDesc}>
            Link your GitHub account to fetch source files (package.json, index.html, llms.txt, robots.txt) and
            score them against all 4 AEO pillars. This is the only way to analyze JavaScript-rendered apps.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/settings')}
          >
            Connect GitHub in Settings →
          </button>
        </div>
      )}

      {(connected || isDemo) && (
        <>
          {repos.length > 0 && !result && (
            <div className={`card ${styles.repoListCard}`}>
              <h3 className={styles.sectionTitle}>Your Repositories</h3>
              <p className={styles.repoListHint}>Select a repository to auto-fill the URL below</p>
              <div className={styles.repoList}>
                {repos.map(repo => (
                  <button
                    key={repo.id}
                    className={`${styles.repoItem} ${repoUrl === repo.url ? styles.repoItemActive : ''}`}
                    onClick={() => handleSelectRepo(repo)}
                  >
                    <div className={styles.repoItemLeft}>
                      <span className={styles.repoName}>{repo.name}</span>
                      {repo.private && <span className={styles.privateBadge}>Private</span>}
                      {repo.language && <span className={styles.langBadge}>{repo.language}</span>}
                    </div>
                    <div className={styles.repoMeta}>
                      {repo.description && <span className={styles.repoDesc}>{repo.description}</span>}
                      <div className={styles.repoMetaRow}>
                        <span className={styles.repoStars}>★ {repo.stars}</span>
                        {repo.updatedAt && (
                          <span className={styles.repoUpdated}>Updated {formatUpdatedAt(repo.updatedAt)}</span>
                        )}
                        {repo.homepage && (
                          <a
                            href={repo.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.repoHomepage}
                            onClick={e => e.stopPropagation()}
                          >
                            ↗ Site
                          </a>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleAnalyze} className={styles.form}>
            <div className={styles.inputRow}>
              <input
                type="url"
                className={styles.urlInput}
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={analyzing || !repoUrl.trim()}
              >
                {analyzing ? <><span className="spinner" /> Analyzing…</> : '⊕ Analyze Repo'}
              </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </>
      )}

      {result && (
        <div className={`${styles.results} fade-in`}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>Analysis Results</h2>
              <a
                href={result.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.resultsUrl}
              >
                {result.owner}/{result.repo}
              </a>
              {result.description && (
                <p className={styles.repoDescription}>{result.description}</p>
              )}
            </div>
            <button onClick={handleReset} className="btn btn-ghost">
              ← New Analysis
            </button>
          </div>

          {/* Framework Detection + JS-Rendering Risk Banner */}
          <div className={styles.frameworkRow}>
            {framework && framework !== 'Unknown' && (
              <div className={styles.frameworkBadge}>
                <span className={styles.frameworkLabel}>Framework</span>
                <span className={styles.frameworkValue}>{framework}</span>
                {result.signals.hasSSR && <span className={styles.ssrTag}>SSR</span>}
              </div>
            )}
            {jsRisk && (
              <div
                className={styles.jsRiskBanner}
                style={{ borderColor: JS_RISK_COLORS[jsRisk], background: `${JS_RISK_COLORS[jsRisk]}18` }}
              >
                <span
                  className={styles.jsRiskDot}
                  style={{ background: JS_RISK_COLORS[jsRisk] }}
                />
                <span className={styles.jsRiskText} style={{ color: JS_RISK_COLORS[jsRisk] }}>
                  {jsRisk.charAt(0).toUpperCase() + jsRisk.slice(1)} JS-Rendering Risk
                </span>
                <span className={styles.jsRiskDesc}>{JS_RISK_LABELS[jsRisk]}</span>
              </div>
            )}
          </div>

          <PillarScores result={{ pillarScores: result.pillarScores, overallScore: result.overallScore }} />

          <div className={`card ${styles.signalsCard}`}>
            <h3 className={styles.sectionTitle}>Source Code Signals</h3>
            <div className={styles.signalGrid}>
              {[
                { label: 'README.md', pass: result.signals.hasReadme },
                { label: 'README has headings', pass: result.signals.readmeHasHeadings },
                { label: 'README has CTA', pass: result.signals.readmeHasCta },
                { label: 'Install instructions', pass: result.signals.hasInstallInstructions },
                { label: 'Demo / screenshots', pass: result.signals.hasDemoSection },
                { label: 'llms.txt', pass: result.signals.hasLlmsTxt },
                { label: 'robots.txt', pass: result.signals.hasRobotsTxt },
                { label: 'AI crawlers allowed', pass: result.signals.robotsTxtAllowsAiCrawlers },
                { label: 'index.html title', pass: result.signals.indexHtmlHasTitle },
                { label: 'Meta description (any)', pass: result.signals.hasMetaDescription },
                { label: 'Open Graph tags (any)', pass: result.signals.hasOpenGraph },
                { label: 'JSON-LD schema (any)', pass: result.signals.hasSchemaMarkup },
                { label: 'Canonical URL in template', pass: result.signals.templateHasCanonical },
                { label: 'LICENSE file', pass: result.signals.hasLicense },
                { label: 'package.json description', pass: !!result.signals.packageDescription },
                { label: 'package.json keywords', pass: result.signals.packageHasKeywords },
                { label: 'OpenAPI spec', pass: result.signals.hasOpenApiSpec },
                { label: 'App entry file (src/App)', pass: result.signals.hasSrcAppFile },
                { label: 'Layout / _document template', pass: result.signals.hasSrcLayoutFile || result.signals.hasSrcDocumentFile },
              ].map((s, i) => (
                <div key={i} className={styles.signal}>
                  <span
                    className={styles.signalDot}
                    style={{
                      background: s.pass ? 'var(--green)' : 'var(--red)',
                      boxShadow: `0 0 6px ${s.pass ? 'var(--green)' : 'var(--red)'}`,
                    }}
                  />
                  <span className={styles.signalName}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {result.recommendations?.length > 0 && (
            <div className={`card ${styles.recoCard}`}>
              <h3 className={styles.sectionTitle}>Recommendations</h3>
              <ul className={styles.recoList}>
                {result.recommendations.map((r, i) => (
                  <li key={i} className={styles.recoItem}>
                    <span className={styles.recoNum}>{i + 1}</span>
                    <div className={styles.recoContent}>
                      <div className={styles.recoHeader}>
                        <span className={`${styles.recoSeverity} ${styles[`sev_${r.severity}`]}`}>
                          {r.severity}
                        </span>
                        <strong className={styles.recoIssue}>{r.issue}</strong>
                      </div>
                      <p className={styles.recoText}>{r.recommendation}</p>
                      {r.artifact && <ArtifactBlock artifact={r.artifact} />}
                    </div>
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
