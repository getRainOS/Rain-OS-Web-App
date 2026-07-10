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

const PLATFORMS = [
  { value: 'bolt', label: 'Bolt' },
  { value: 'lovable', label: 'Lovable' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'v0', label: 'v0 by Vercel' },
  { value: 'replit', label: 'Replit' },
  { value: 'windsurf', label: 'Windsurf' },
  { value: 'base44', label: 'Base44' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'framer', label: 'Framer' },
  { value: 'webflow', label: 'Webflow' },
  { value: 'generic', label: 'Other / Generic' },
];

function buildFixPrompt(platform, recommendations, url, overallScore) {
  const platformName = PLATFORMS.find(p => p.value === platform)?.label || platform;

  const issues = (recommendations || []).map(r => {
    const isObj = typeof r === 'object' && r !== null;
    return isObj
      ? `- [${r.severity || 'medium'}] ${r.issue || r.recommendation} — ${r.recommendation}`
      : `- ${r}`;
  });
  const artifacts = (recommendations || [])
    .filter(r => typeof r === 'object' && r !== null && r.artifact)
    .map(r => `${r.artifact.filename || r.artifact.type}:\n${r.artifact.content}`);

  const scoreNote = overallScore ? `Current rain OS AI Readability Score: ${overallScore}/100.` : '';

  const prompt = `You are the AI assistant inside ${platformName}. I have a site at ${url || 'this URL'} that I built with your platform.

I ran an AI Readability scan and found the following issues that prevent ChatGPT, Gemini, and Perplexity from discovering and citing my site. Higher-severity items matter most:

${issues.join('\n') || '- No critical issues found — consider adding llms.txt and schema markup for better AI visibility'}
${scoreNote}

Please make only the specific changes listed below — don't refactor, restructure, or modify any other part of the project, and don't change existing functionality, styling, or content beyond what's needed for each fix.

Where you need to create new files, generate the content and tell me which files to create. Where existing files need edits, show me the exact changes to make.

${artifacts.length > 0 ? 'Here are file contents you can use:\n\n' + artifacts.join('\n\n') : ''}

Respond with:
1. A summary of what you're changing and why
2. File-by-file instructions (create / edit / replace)
3. Any code snippets I should paste directly`;

  return prompt;
}

function FixPromptGenerator({ recommendations, url, overallScore }) {
  const [platform, setPlatform] = useState('');
  const [copied, setCopied] = useState(false);

  const prompt = platform ? buildFixPrompt(platform, recommendations, url, overallScore) : '';

  function handleCopy() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`card ${styles.recoCard}`}>
      <h3 className={styles.sectionTitle}>
        <span style={{ marginRight: 8 }}>✨</span> Fix with AI
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>
        Pick your vibe platform and get a prompt you can paste straight into its AI assistant. It will fix the exact issues we found — no manual editing required.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select
          value={platform}
          onChange={e => { setPlatform(e.target.value); setCopied(false); }}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--bg-elevated, #111)',
            color: 'inherit',
          }}
        >
          <option value="">Select your platform...</option>
          {PLATFORMS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          disabled={!prompt}
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy prompt'}
        </button>
      </div>

      {platform && (
        <pre style={{
          marginTop: '12px',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          maxHeight: '320px',
          overflowY: 'auto',
        }}>{prompt}</pre>
      )}
    </div>
  );
}

export default function UrlScanner() {
  const { refreshUser, userLane } = useApp();
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
      const analysisModule = userLane === 'product_sellers' ? 'product_sellers' : userLane === 'developers' ? 'developers' : userLane === 'local_business' ? 'local_business' : 'general';
      const { data } = await api.scanUrl(url.trim(), { module: analysisModule });
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

      {userLane === 'vibe_coders' ? (
        <div style={{
          marginBottom: '18px',
          fontSize: '13px',
          color: 'var(--text-dim)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
        }}>
          <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>
            Don't have a URL yet? Your app is probably already running somewhere — here's where to find the link:
          </div>
          <ul style={{ marginTop: '6px', paddingLeft: '18px', lineHeight: 1.7 }}>
            <li><strong>Bolt.new:</strong> look for a small arrow icon at the top of your preview (right side of the screen). Click it to open your app in its own browser tab, then copy the address from that tab.</li>
            <li><strong>Lovable:</strong> your preview is already running in the panel on the right. Look at the top of that panel — there's an address bar. Copy the link shown there.</li>
            <li><strong>v0 by Vercel:</strong> click the "···" (three dots) near the top of your preview, then choose "Open in new tab." Copy the address from the new tab.</li>
            <li><strong>Replit:</strong> while your app is running, a "Webview" tab opens automatically — copy the address shown at the top of it.</li>
            <li><strong>Framer / Webflow:</strong> click "Preview" or "Share" near the top-right of your project. It'll give you a link you can copy directly.</li>
          </ul>
          <div style={{ marginTop: '10px' }}>
            Once you've got the link, paste it into the box below and click <strong>Scan URL</strong>.
          </div>
        </div>
      ) : (
        <details style={{
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--text-dim)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
        }}>
          <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 500 }}>
            Don't have a URL yet? Find your preview link →
          </summary>
          <div style={{ marginTop: '10px', lineHeight: 1.6 }}>
            Most page builders already have a live preview URL, even before you deploy:
            <ul style={{ marginTop: '6px', paddingLeft: '18px' }}>
              <li><strong>Bolt / StackBlitz:</strong> right-click the preview pane → "Open in new tab", or use the Share button.</li>
              <li><strong>Lovable:</strong> copy the preview URL from the address bar, or click Publish for a permanent link.</li>
              <li><strong>v0:</strong> open the preview's "..." menu → "Open in new tab" for a live Vercel URL.</li>
              <li><strong>Replit:</strong> your app is live at yourrepl.username.repl.co (or .replit.dev) while the dev server is running.</li>
              <li><strong>Framer / Webflow:</strong> use the Staging or Preview link from your project's Share settings.</li>
            </ul>
          </div>
        </details>
      )}

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
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I scanned ${result.url || url} on rain OS and scored ${result.overall_score ?? result.rain_score ?? '—'}/100 for AI readability.`)}
&url=${encodeURIComponent(window.location.origin + '/url-scanner')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share
            </a>
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

          {recommendations.length > 0 && (
            <FixPromptGenerator
              recommendations={recommendations}
              url={scannedUrl}
              overallScore={result?.overallScore}
            />
          )}

          <GithubPushPanel result={result} scannedUrl={scannedUrl} />

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
                Scan done? Now check if AI actually cites this URL.
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                Citation Monitor gives you a real-time snapshot — run it before and after making fixes to track whether AI citations improve.
              </p>
            </div>
            <Link
              to="/citation-monitor"
              style={{
                flexShrink: 0,
                background: 'rgba(14,165,233,0.15)',
                border: '1px solid rgba(14,165,233,0.35)',
                color: '#38bdf8',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                display: 'inline-block',
              }}
            >
              Check citations now →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
