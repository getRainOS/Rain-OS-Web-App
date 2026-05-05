import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import PillarScores from '../components/PillarScores.jsx';
import ArtifactBlock from '../components/ArtifactBlock.jsx';
import styles from './UrlScanner.module.css';

// ─── GitHub push panel ───────────────────────────────────────────────────────

function GithubPushPanel({ result, scannedUrl }) {
  const { user, isDemo } = useApp();
  const LS_KEY = 'urlscanner_last_github_repo';
  const [step, setStep] = useState('idle'); // idle | loading-repos | pick-repo | loading-preview | review | pushing | success | error
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(() => localStorage.getItem(LS_KEY) || '');
  const [preview, setPreview] = useState(null); // { toCreate, toPatch, manual }
  const [checked, setChecked] = useState({}); // id → boolean
  const [prUrl, setPrUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fixableArtifacts = (result?.technical_recommendations || [])
    .filter((r) => r?.artifact)
    .map((r) => r.artifact);

  if (fixableArtifacts.length === 0) return null;

  // Not connected
  if (!user?.githubLogin) {
    return (
      <div className={`card ${styles.ghPanel}`}>
        <div className={styles.ghPanelHeader}>
          <span className={styles.ghIcon}>⊕</span>
          <div>
            <h3 className={styles.ghPanelTitle}>Push fixes to GitHub</h3>
            <p className={styles.ghPanelSub}>Connect your GitHub account to open a PR with these fixes automatically.</p>
          </div>
        </div>
        <Link to="/settings" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-flex' }}>
          Connect GitHub in Settings →
        </Link>
      </div>
    );
  }

  function toggleCheck(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function initChecked(previewData) {
    const state = {};
    [...previewData.toCreate, ...previewData.toPatch, ...previewData.manual].forEach((item) => {
      state[item.id] = true;
    });
    setChecked(state);
  }

  async function handleOpen() {
    setStep('loading-repos');
    setErrorMsg('');
    try {
      const { data } = await api.github.repos();
      if (!data.connected) {
        setErrorMsg('GitHub is not connected. Please reconnect in Settings.');
        setStep('error');
        return;
      }
      const repoList = data.repos || [];
      setRepos(repoList);
      const saved = localStorage.getItem(LS_KEY);
      if (saved && !repoList.some((r) => r.fullName === saved)) {
        setSelectedRepo('');
        localStorage.removeItem(LS_KEY);
      }
      setStep('pick-repo');
    } catch (err) {
      setErrorMsg(err.message || 'Could not load repos.');
      setStep('error');
    }
  }

  async function handlePreview() {
    if (!selectedRepo) return;
    localStorage.setItem(LS_KEY, selectedRepo);
    setStep('loading-preview');
    setErrorMsg('');
    try {
      const { data } = await api.github.previewFixes({
        url: scannedUrl,
        repoFullName: selectedRepo,
        artifacts: fixableArtifacts,
      });
      setPreview(data);
      initChecked(data);
      setStep('review');
    } catch (err) {
      setErrorMsg(err.message || 'Could not generate preview.');
      setStep('error');
    }
  }

  async function handlePush() {
    const allItems = [...(preview.toCreate || []), ...(preview.toPatch || []), ...(preview.manual || [])];
    const approvedIds = allItems.filter((item) => checked[item.id]).map((item) => item.id);
    if (approvedIds.length === 0) {
      setErrorMsg('Select at least one fix to include.');
      return;
    }
    setStep('pushing');
    setErrorMsg('');
    try {
      const { data } = await api.github.pushFixes({
        repoFullName: selectedRepo,
        approvedIds,
        artifacts: fixableArtifacts,
        scannedUrl,
      });
      setPrUrl(data.prUrl);
      setStep('success');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to open PR.');
      setStep('error');
    }
  }

  function handleReset() {
    setStep('pick-repo');
    setPreview(null);
    setChecked({});
    setErrorMsg('');
    setPrUrl('');
  }

  const allItems = preview
    ? [...(preview.toCreate || []), ...(preview.toPatch || []), ...(preview.manual || [])]
    : [];
  const numSelected = allItems.filter((item) => checked[item.id]).length;

  return (
    <div className={`card ${styles.ghPanel}`}>
      <div className={styles.ghPanelHeader}>
        <span className={styles.ghIcon}>⊕</span>
        <div>
          <h3 className={styles.ghPanelTitle}>Push fixes to GitHub</h3>
          <p className={styles.ghPanelSub}>
            Automatically open a PR with {fixableArtifacts.length} fix{fixableArtifacts.length !== 1 ? 'es' : ''} applied to your repo.
          </p>
        </div>
      </div>

      {errorMsg && (
        <p className={styles.ghError}>{errorMsg}</p>
      )}

      {/* Step: idle */}
      {step === 'idle' && (
        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={handleOpen}>
          Push fixes to GitHub
        </button>
      )}

      {/* Step: loading-repos */}
      {step === 'loading-repos' && (
        <p className={styles.ghLoading}><span className="spinner" /> Loading your repos…</p>
      )}

      {/* Step: pick-repo */}
      {step === 'pick-repo' && (
        <div className={styles.ghPickRepo}>
          <label className={styles.ghLabel} htmlFor="gh-repo-select">Select repository</label>
          <div className={styles.ghRepoRow}>
            <select
              id="gh-repo-select"
              className={styles.ghSelect}
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
            >
              <option value="">— pick a repo —</option>
              {repos.map((r) => (
                <option key={r.id} value={r.fullName}>{r.fullName}</option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              disabled={!selectedRepo}
              onClick={handlePreview}
            >
              Preview changes
            </button>
          </div>
        </div>
      )}

      {/* Step: loading-preview */}
      {step === 'loading-preview' && (
        <p className={styles.ghLoading}><span className="spinner" /> Detecting template files…</p>
      )}

      {/* Step: review */}
      {step === 'review' && preview && (
        <div className={styles.ghReview}>
          <p className={styles.ghReviewIntro}>
            Review every change before anything is written to <strong>{selectedRepo}</strong>.
            Uncheck any fix you don't want included.
          </p>

          {preview.toCreate?.length > 0 && (
            <div className={styles.ghSection}>
              <h4 className={styles.ghSectionTitle}>Files to create</h4>
              {preview.toCreate.map((item) => (
                <PreviewFixItem
                  key={item.id}
                  item={item}
                  checked={!!checked[item.id]}
                  onToggle={() => toggleCheck(item.id)}
                />
              ))}
            </div>
          )}

          {preview.toPatch?.length > 0 && (
            <div className={styles.ghSection}>
              <h4 className={styles.ghSectionTitle}>Files to patch</h4>
              {preview.toPatch.map((item) => (
                <PreviewFixItem
                  key={item.id}
                  item={item}
                  checked={!!checked[item.id]}
                  onToggle={() => toggleCheck(item.id)}
                />
              ))}
            </div>
          )}

          {preview.manual?.length > 0 && (
            <div className={styles.ghSection}>
              <h4 className={styles.ghSectionTitle}>Manual steps</h4>
              <p className={styles.ghManualNote}>
                No HTML template was detected for these items. They'll appear as copy-paste instructions in the PR description.
              </p>
              {preview.manual.map((item) => (
                <PreviewFixItem
                  key={item.id}
                  item={item}
                  checked={!!checked[item.id]}
                  onToggle={() => toggleCheck(item.id)}
                />
              ))}
            </div>
          )}

          <div className={styles.ghConfirmRow}>
            <button className="btn btn-ghost" onClick={handleReset}>
              ← Change repo
            </button>
            <button
              className={`btn btn-primary ${styles.ghOpenPrBtn}`}
              disabled={numSelected === 0}
              onClick={handlePush}
            >
              Open Pull Request ({numSelected} fix{numSelected !== 1 ? 'es' : ''}) ↗
            </button>
          </div>
          <p className={styles.ghWarning}>
            ⚠ This will write to your repository and open a PR on <strong>{selectedRepo}</strong>.
          </p>
        </div>
      )}

      {/* Step: pushing */}
      {step === 'pushing' && (
        <p className={styles.ghLoading}><span className="spinner" /> Opening pull request…</p>
      )}

      {/* Step: success */}
      {step === 'success' && (
        <div className={styles.ghSuccess}>
          <span className={styles.ghSuccessIcon}>✓</span>
          <div>
            <p className={styles.ghSuccessText}>Pull request opened successfully!</p>
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ghPrLink}
            >
              View PR on GitHub ↗
            </a>
          </div>
        </div>
      )}

      {/* Step: error (with retry) */}
      {step === 'error' && (
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={handleReset}>
          ← Try again
        </button>
      )}
    </div>
  );
}

function PreviewFixItem({ item, checked, onToggle }) {
  const [expanded, setExpanded] = useState(false);

  const showContent = item.type === 'create'
    ? item.content
    : item.type === 'patch'
      ? item.snippet
      : item.snippet;

  return (
    <div className={`${styles.ghFixItem} ${checked ? '' : styles.ghFixItemUnchecked}`}>
      <div className={styles.ghFixHeader}>
        <label className={styles.ghFixLabel}>
          <input
            type="checkbox"
            className={styles.ghCheckbox}
            checked={checked}
            onChange={onToggle}
          />
          <span className={styles.ghFixPath}>
            {item.path ? <code>{item.path}</code> : <span>{item.filename || item.artifactType}</span>}
          </span>
        </label>
        {showContent && (
          <button
            type="button"
            className={styles.ghExpandBtn}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Hide' : 'Show'} content
          </button>
        )}
      </div>
      <p className={styles.ghFixDesc}>{item.description}</p>
      {expanded && showContent && (
        <pre className={styles.ghFixCode}><code>{showContent}</code></pre>
      )}
      {expanded && item.type === 'patch' && item.originalContent && (
        <details className={styles.ghDiffDetails}>
          <summary className={styles.ghDiffSummary}>Show full diff context</summary>
          <div className={styles.ghDiffWrap}>
            <div className={styles.ghDiffCol}>
              <p className={styles.ghDiffLabel}>Before</p>
              <pre className={styles.ghFixCode}><code>{item.originalContent}</code></pre>
            </div>
            <div className={styles.ghDiffCol}>
              <p className={styles.ghDiffLabel}>After</p>
              <pre className={styles.ghFixCode}><code>{item.patchedContent}</code></pre>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function UrlScanner() {
  const { refreshUser } = useApp();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [scannedUrl, setScannedUrl] = useState('');

  async function handleScan(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.scanUrl(url.trim());
      setResult(data);
      setScannedUrl(url.trim());
      refreshUser();
    } catch (err) {
      setError(err.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError('');
    setScannedUrl('');
  }

  const techRecs = result?.technical_recommendations;
  const geminiRecs = result?.recommendations;
  const recommendations = (Array.isArray(techRecs) && techRecs.length > 0)
    ? techRecs
    : (Array.isArray(geminiRecs) && geminiRecs.length > 0)
      ? geminiRecs
      : [];

  return (
    <div className={`${styles.root} fade-in`}>
      <div className={styles.header}>
        <h1 className={styles.title}>URL Scanner</h1>
        <p className={styles.sub}>Scan any URL to analyze its AI readability and AEO performance</p>
      </div>

      <form onSubmit={handleScan} className={styles.form}>
        <div className={styles.inputRow}>
          <input
            type="url"
            className={styles.urlInput}
            placeholder="https://example.com/page"
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !url.trim()}
          >
            {loading ? <><span className="spinner" /> Scanning…</> : '◎ Scan URL'}
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </form>

      {result && (
        <div className={`${styles.results} fade-in`}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>Scan Results</h2>
              <p className={styles.resultsUrl}>{result.url || url}</p>
            </div>
            <button onClick={handleReset} className="btn btn-ghost">
              ← New Scan
            </button>
          </div>

          {(result.technical_signals?.isJsRendered || result.signals?.isJsRendered) && (
            <div className={styles.jsWarningBanner}>
              <div className={styles.jsWarningIcon}>⚠</div>
              <div className={styles.jsWarningBody}>
                <strong className={styles.jsWarningTitle}>JavaScript-rendered site detected</strong>
                <p className={styles.jsWarningText}>
                  AI crawlers (ChatGPT, Perplexity, Claude) see an empty page — they don't execute JavaScript.
                  The scores below reflect what they actually see, not your full app.
                </p>
                <button
                  className={styles.jsWarningCta}
                  onClick={() => navigate('/repo-analysis')}
                >
                  Analyze source code instead →
                </button>
              </div>
            </div>
          )}

          <PillarScores result={result} />

          {(result.signals ?? result.technical_signals)?.length > 0 && (
            <div className={`card ${styles.signalsCard}`}>
              <h3 className={styles.sectionTitle}>Technical Signals</h3>
              <div className={styles.signalGrid}>
                {(result.signals ?? result.technical_signals).map((s, i) => (
                  <div key={i} className={styles.signal}>
                    <span
                      className={styles.signalDot}
                      style={{
                        background: s.pass ? 'var(--green)' : 'var(--red)',
                        boxShadow: `0 0 6px ${s.pass ? 'var(--green)' : 'var(--red)'}`,
                      }}
                    />
                    <div>
                      <div className={styles.signalName}>{s.label || s.name}</div>
                      {s.detail && <div className={styles.signalDetail}>{s.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className={`card ${styles.recoCard}`}>
              <h3 className={styles.sectionTitle}>Recommendations</h3>
              <ul className={styles.recoList}>
                {recommendations.map((r, i) => {
                  const isObj = typeof r === 'object' && r !== null;
                  const text = isObj ? r.recommendation : r;
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

          <GithubPushPanel result={result} scannedUrl={scannedUrl} />
        </div>
      )}
    </div>
  );
}
