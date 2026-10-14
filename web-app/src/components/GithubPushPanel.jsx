import { useState } from 'react';
import Select from './Select.jsx';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import styles from './GithubPushPanel.module.css';

// Shared "push fixes to GitHub" panel used by both URL Scanner (artifacts
// come from scanning a live page, repo must be picked) and Repo Analysis
// (artifacts come from a repo we already know, so the repo picker is
// skipped entirely via `knownRepo`).
export default function GithubPushPanel({ fixableArtifacts, scannedUrl, returnTo, knownRepo }) {
  const { user } = useApp();
  const LS_KEY = 'urlscanner_last_github_repo';
  const [step, setStep] = useState('idle'); // idle | loading-repos | pick-repo | loading-preview | review | pushing | success | error
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(() => knownRepo || localStorage.getItem(LS_KEY) || '');
  const [preview, setPreview] = useState(null); // { toCreate, toPatch, manual }
  const [checked, setChecked] = useState({}); // id → boolean
  const [prUrl, setPrUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');

  if (fixableArtifacts.length === 0) return null;

  // Not connected
  if (!user?.githubLogin) {
    async function handleConnect() {
      setConnecting(true);
      setConnectError('');
      try {
        const { data } = await api.github.connect(returnTo);
        if (data?.url) {
          window.location.href = data.url;
        } else {
          setConnectError('Could not start GitHub connection. Please try again.');
          setConnecting(false);
        }
      } catch (err) {
        setConnectError(err.message || 'Could not start GitHub connection. Please try again.');
        setConnecting(false);
      }
    }

    return (
      <div className={`card ${styles.ghPanel}`}>
        <div className={styles.ghPanelHeader}>
          <span className={styles.ghIcon}>⊕</span>
          <div>
            <h3 className={styles.ghPanelTitle}>Push fixes to GitHub</h3>
            <p className={styles.ghPanelSub}>Connect your GitHub account to open a PR with these fixes automatically.</p>
          </div>
        </div>
        {connectError && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8 }}>{connectError}</p>}
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="btn btn-primary"
          style={{ marginTop: 12, display: 'inline-flex', opacity: connecting ? 0.6 : 1 }}
        >
          {connecting ? 'Connecting…' : 'Connect GitHub →'}
        </button>
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

  async function runPreview(repoFullName) {
    setStep('loading-preview');
    setErrorMsg('');
    try {
      const { data } = await api.github.previewFixes({
        url: scannedUrl,
        repoFullName,
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

  async function handleOpen() {
    // Already know which repo we're fixing (Repo Analysis) — skip the picker.
    if (knownRepo) {
      await runPreview(knownRepo);
      return;
    }
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
    await runPreview(selectedRepo);
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
    setStep(knownRepo ? 'idle' : 'pick-repo');
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
            Automatically open a PR with {fixableArtifacts.length} fix{fixableArtifacts.length !== 1 ? 'es' : ''} applied to {knownRepo ? <strong>{knownRepo}</strong> : 'your repo'}.
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
            <Select
              id="gh-repo-select"
              className={styles.ghSelect}
              value={selectedRepo}
              onChange={setSelectedRepo}
              placeholder="Pick a repo"
              options={repos.map(r => ({ value: r.fullName, label: r.fullName }))}
            />
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
              {knownRepo ? '← Cancel' : '← Change repo'}
            </button>
            <button
              className="btn btn-primary"
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
