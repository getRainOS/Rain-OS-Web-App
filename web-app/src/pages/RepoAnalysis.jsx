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

function buildFixPrompt(platform, result, repoUrl) {
  const { owner, repo, description, signals, recommendations, overallScore, pillarScores } = result || {};
  const detectedFramework = signals?.detectedFramework;
  const platformName = PLATFORMS.find(p => p.value === platform)?.label || platform;

  const issues = [];
  const artifacts = [];

  // Map failing signals to actionable instructions
  if (!signals?.hasReadme) issues.push('- Add a README.md with project description, install steps, and usage examples');
  if (!signals?.readmeHasHeadings) issues.push('- Structure README with H1 title, H2 sections (Features, Installation, Usage, API)');
  if (!signals?.readmeHasCta) issues.push('- Add a CTA at the end of README (link to demo, docs, or contact)');
  if (!signals?.hasInstallInstructions) issues.push('- Include explicit install instructions (e.g., `npm install`, `git clone`)');
  if (!signals?.hasLlmsTxt) {
    issues.push('- Create llms.txt at repo root (AI crawler instructions, 50-150 words, include key page URLs)');
    artifacts.push('llms.txt content: \n# llms.txt for ' + (repo || 'Project') + '\n\n' + (description || 'A web application') + '\n\nKey pages:\n- / (homepage)\n- /about\n- /docs\n');
  }
  if (!signals?.hasRobotsTxt) issues.push('- Add robots.txt allowing GPTBot, ChatGPT-User, and Googlebot');
  else if (!signals?.robotsTxtAllowsAiCrawlers) issues.push('- Update robots.txt to allow GPTBot, ChatGPT-User, and other AI crawlers');
  if (!signals?.indexHtmlHasTitle) issues.push('- Add a descriptive <title> tag in index.html (50-60 chars)');
  if (!signals?.hasMetaDescription) issues.push('- Add <meta name="description"> in index.html (150-160 chars)');
  if (!signals?.hasOpenGraph) issues.push('- Add Open Graph tags (og:title, og:description, og:image) for social/AI sharing');
  if (!signals?.hasSchemaMarkup) issues.push('- Add JSON-LD schema (Organization, WebSite, or Article type) in index.html');
  if (!signals?.templateHasCanonical) issues.push('- Add <link rel="canonical"> in index.html to prevent duplicate content issues');
  if (!signals?.hasLicense) issues.push('- Add a LICENSE file (MIT recommended for open source)');
  if (!signals?.packageHasKeywords) issues.push('- Add keywords to package.json for npm discoverability');
  if (!signals?.hasOpenApiSpec) issues.push('- Add an OpenAPI spec if the project has an API');

  // Framework-specific notes
  let frameworkNote = '';
  if (detectedFramework) {
    frameworkNote = `\nDetected framework: ${detectedFramework}. `;
    if (['React', 'Vite', 'Vue', 'Svelte'].includes(detectedFramework)) {
      frameworkNote += 'Since this is a client-side SPA, consider adding prerendering (e.g., Vite-plugin-ssr, Astro, or Next.js SSR) so AI crawlers see content without running JavaScript.';
    } else if (['Next.js', 'Astro', 'Nuxt', 'SvelteKit'].includes(detectedFramework)) {
      frameworkNote += 'Good — this framework supports server-side rendering, which helps AI crawlers read your content.';
    }
  }

  const scoreNote = overallScore ? `Current rain OS AI Readability Score: ${overallScore}/100.` : '';

  const prompt = `You are the AI assistant inside ${platformName}. I have a project at ${repoUrl || 'this repo'} that I built with your platform.

I ran an AI Readability scan and found several issues that prevent ChatGPT, Gemini, and Perplexity from discovering and citing my site. Here's what needs fixing:

${issues.join('\n') || '- No critical issues found — consider adding llms.txt and schema markup for better AI visibility'}
${frameworkNote}
${scoreNote}

Please apply these fixes directly to my project. Where you need to create new files (llms.txt, robots.txt, LICENSE), generate the content and tell me which files to create. Where existing files need edits (index.html, package.json, README), show me the exact changes to make.

${artifacts.length > 0 ? 'Here are file contents you can use:\n\n' + artifacts.join('\n\n') : ''}

Respond with:
1. A summary of what you're changing and why
2. File-by-file instructions (create / edit / replace)
3. Any code snippets I should paste directly`;

  return prompt;
}

function FixPromptGenerator({ result, repoUrl }) {
  const [platform, setPlatform] = useState('');
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  const prompt = platform ? buildFixPrompt(platform, result, repoUrl) : '';

  function handleCopy() {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`card ${styles.fixPromptCard}`}>
      <h3 className={styles.sectionTitle}>
        <span style={{ marginRight: 8 }}>✨</span> Fix with AI
      </h3>
      <p className={styles.fixPromptDesc}>
        Pick your vibe platform and get a prompt you can paste straight into its AI assistant. It will fix the exact issues we found — no manual editing required.
      </p>

      <div className={styles.platformRow}>
        <select
          className={styles.platformSelect}
          value={platform}
          onChange={e => { setPlatform(e.target.value); setCopied(false); }}
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
        <div className={styles.promptPreview}>
          <pre className={styles.promptCode}>{prompt}</pre>
        </div>
      )}
    </div>
  );
}

export default function RepoAnalysis() {
  const { user, isDemo, userLane } = useApp();
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
    window.history.replaceState(null, '', window.location.pathname + window.location.search + '/repo-analysis');
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
      const analysisModule = userLane === 'product_sellers' ? 'product_sellers' : userLane === 'developers' ? 'developers' : 'general';
      const { data } = await api.github.analyze(repoUrl.trim(), { module: analysisModule });
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

          {/* ─── Fix Prompt Generator ─── */}
          <FixPromptGenerator result={result} repoUrl={repoUrl} />
        </div>
      )}
    </div>
  );
}
