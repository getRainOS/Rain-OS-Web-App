// services/repoAnalysisService.ts
// Fetches key source files from a GitHub repo and scores them against
// the 4 AEO pillars: AI Readability, Digital Authority,
// Conversion Readiness, Product Discoverability.

export type DetectedFramework =
  | 'Next.js' | 'Nuxt' | 'SvelteKit' | 'Remix' | 'Astro'
  | 'React (SPA)' | 'Vue (SPA)' | 'Angular' | 'Svelte' | 'Unknown';

export interface RepoSignals {
  // README
  hasReadme: boolean;
  readmeWordCount: number;
  readmeHasHeadings: boolean;
  readmeHasCta: boolean;
  hasDemoSection: boolean;
  hasInstallInstructions: boolean;
  // AI crawlability
  hasLlmsTxt: boolean;
  hasRobotsTxt: boolean;
  robotsTxtAllowsAiCrawlers: boolean;
  // Package
  hasPackageJson: boolean;
  packageName: string | null;
  packageDescription: string | null;
  packageHasKeywords: boolean;
  // index.html signals
  hasIndexHtml: boolean;
  indexHtmlHasTitle: boolean;
  indexHtmlHasMetaDescription: boolean;
  indexHtmlHasOpenGraph: boolean;
  indexHtmlHasSchemaMarkup: boolean;
  // Template / layout file signals (App.tsx, layout.tsx, _document.tsx, etc.)
  hasSrcAppFile: boolean;
  hasSrcLayoutFile: boolean;
  hasSrcDocumentFile: boolean;
  templateHasMetaDescription: boolean;
  templateHasOpenGraph: boolean;
  templateHasSchemaMarkup: boolean;
  templateHasCanonical: boolean;
  // Computed composites (index.html OR template)
  hasMetaDescription: boolean;
  hasOpenGraph: boolean;
  hasSchemaMarkup: boolean;
  // Authority
  hasLicense: boolean;
  hasContributing: boolean;
  hasChangelog: boolean;
  hasOpenApiSpec: boolean;
  // Framework detection
  detectedFramework: DetectedFramework;
  hasSSR: boolean;
  jsRenderingRisk: 'low' | 'medium' | 'high';
}

export interface RepoRecommendation {
  issue: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
  artifact?: {
    type: 'json-ld' | 'llms-txt' | 'robots-txt' | 'html' | 'markdown';
    content: string;
    filename?: string;
  };
}

export interface RepoAnalysisResult {
  repoUrl: string;
  owner: string;
  repo: string;
  defaultBranch: string;
  description: string | null;
  stars: number;
  signals: RepoSignals;
  pillarScores: {
    aiReadability: number;
    digitalAuthority: number;
    conversionReadiness: number;
    productDiscoverability: number;
  };
  overallScore: number;
  recommendations: RepoRecommendation[];
}

// ─── Types for third-party payloads ───────────────────────────────────────

interface PackageJson {
  name?: string;
  description?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

interface GitHubContentsItem {
  encoding: string;
  content: string;
}

// ─── GitHub API helpers ────────────────────────────────────────────────────

const GH_API = 'https://api.github.com';

async function ghFetch<T>(path: string, token: string): Promise<T | null> {
  const res = await fetch(`${GH_API}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

interface RepoMetadata {
  default_branch: string;
  description: string | null;
  stargazers_count: number;
}

async function fetchFileContent(owner: string, repo: string, path: string, token: string): Promise<string | null> {
  const data = await ghFetch<GitHubContentsItem>(`/repos/${owner}/${repo}/contents/${path}`, token);
  if (!data || data.encoding !== 'base64' || !data.content) return null;
  return Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
}

/**
 * Try each path in order; return the first non-null content found.
 * Fixes the `promiseA || promiseB` anti-pattern: a Promise is always truthy,
 * so right-hand fallbacks in `||` chains are never executed.
 */
async function fetchFirstContent(
  owner: string, repo: string, paths: string[], token: string
): Promise<string | null> {
  for (const path of paths) {
    try {
      const content = await fetchFileContent(owner, repo, path, token);
      if (content !== null) return content;
    } catch {}
  }
  return null;
}

/**
 * Return true if any of the given paths exists in the repo.
 */
async function anyExists(
  owner: string, repo: string, paths: string[], token: string
): Promise<boolean> {
  for (const path of paths) {
    try {
      const data = await ghFetch<GitHubContentsItem | GitHubContentsItem[]>(`/repos/${owner}/${repo}/contents/${path}`, token);
      if (data !== null && !Array.isArray(data)) return true;
    } catch {}
  }
  return false;
}

// ─── Framework detection ───────────────────────────────────────────────────

function detectFramework(pkg: PackageJson | null): { framework: DetectedFramework; hasSSR: boolean; jsRenderingRisk: 'low' | 'medium' | 'high' } {
  if (!pkg) return { framework: 'Unknown', hasSSR: false, jsRenderingRisk: 'medium' };

  const deps: Record<string, string> = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  const scriptText = Object.values(pkg.scripts ?? {}).join(' ').toLowerCase();

  // SSR / hybrid frameworks — low JS-rendering risk
  if (deps['next']) return { framework: 'Next.js', hasSSR: true, jsRenderingRisk: 'low' };
  if (deps['nuxt'] || deps['nuxt3']) return { framework: 'Nuxt', hasSSR: true, jsRenderingRisk: 'low' };
  if (deps['@sveltejs/kit']) return { framework: 'SvelteKit', hasSSR: true, jsRenderingRisk: 'low' };
  if (deps['@remix-run/react'] || deps['@remix-run/node']) return { framework: 'Remix', hasSSR: true, jsRenderingRisk: 'low' };
  if (deps['astro']) return { framework: 'Astro', hasSSR: true, jsRenderingRisk: 'low' };

  // SPA frameworks without SSR — high JS-rendering risk unless scripts hint at SSR
  if (deps['react'] || deps['react-dom']) {
    const hasServerEntry = scriptText.includes('server') || scriptText.includes('ssr');
    return { framework: 'React (SPA)', hasSSR: hasServerEntry, jsRenderingRisk: hasServerEntry ? 'medium' : 'high' };
  }
  if (deps['vue']) {
    const hasServerEntry = scriptText.includes('server') || scriptText.includes('ssr');
    return { framework: 'Vue (SPA)', hasSSR: hasServerEntry, jsRenderingRisk: hasServerEntry ? 'medium' : 'high' };
  }
  if (deps['@angular/core']) {
    return { framework: 'Angular', hasSSR: !!deps['@angular/ssr'], jsRenderingRisk: deps['@angular/ssr'] ? 'low' : 'high' };
  }
  if (deps['svelte']) return { framework: 'Svelte', hasSSR: false, jsRenderingRisk: 'high' };

  return { framework: 'Unknown', hasSSR: false, jsRenderingRisk: 'medium' };
}

// ─── Template content analysis ─────────────────────────────────────────────

/** Parse JSX/TSX/HTML template content for common HTML meta patterns. */
function parseTemplateSignals(content: string): {
  hasMetaDescription: boolean;
  hasOpenGraph: boolean;
  hasSchemaMarkup: boolean;
  hasCanonical: boolean;
} {
  const lower = content.toLowerCase();
  return {
    // meta name="description" or <Meta name="description" (Next.js Head)
    hasMetaDescription:
      lower.includes('name="description"') ||
      lower.includes("name='description'") ||
      lower.includes('name={`description`}') ||
      /name=\{['"` ]?description/.test(lower),
    // og: property
    hasOpenGraph:
      lower.includes('property="og:') ||
      lower.includes("property='og:") ||
      lower.includes('property={`og:'),
    // JSON-LD / application/ld+json
    hasSchemaMarkup:
      lower.includes('application/ld+json') ||
      lower.includes('jsonld') ||
      lower.includes('json-ld'),
    // canonical link
    hasCanonical:
      lower.includes('rel="canonical"') ||
      lower.includes("rel='canonical'") ||
      /rel=\{['"` ]?canonical/.test(lower),
  };
}

// ─── Scoring functions ─────────────────────────────────────────────────────

function scoreAiReadability(signals: RepoSignals): number {
  let score = 40;
  if (signals.hasReadme) score += 10;
  if (signals.readmeHasHeadings) score += 8;
  if (signals.readmeWordCount > 200) score += 6;
  if (signals.readmeWordCount > 500) score += 4;
  if (signals.hasLlmsTxt) score += 15;
  if (signals.hasSchemaMarkup) score += 12;
  if (signals.templateHasCanonical) score += 5;
  return Math.min(100, score);
}

function scoreDigitalAuthority(signals: RepoSignals): number {
  let score = 30;
  if (signals.hasLicense) score += 12;
  if (signals.hasContributing) score += 8;
  if (signals.hasChangelog) score += 8;
  if (signals.hasOpenApiSpec) score += 10;
  if (signals.hasOpenGraph) score += 10;
  if (signals.hasReadme && signals.readmeWordCount > 300) score += 8;
  if (signals.packageHasKeywords) score += 8;
  if (signals.templateHasCanonical) score += 6;
  return Math.min(100, score);
}

function scoreConversionReadiness(signals: RepoSignals): number {
  let score = 35;
  if (signals.readmeHasCta) score += 14;
  if (signals.hasInstallInstructions) score += 14;
  if (signals.hasDemoSection) score += 12;
  if (signals.hasMetaDescription) score += 12;
  if (signals.indexHtmlHasTitle) score += 8;
  if (signals.hasSrcDocumentFile) score += 5;
  return Math.min(100, score);
}

function scoreProductDiscoverability(signals: RepoSignals): number {
  let score = 25;
  if (signals.hasPackageJson) score += 7;
  if (signals.packageDescription) score += 10;
  if (signals.packageHasKeywords) score += 10;
  if (signals.hasRobotsTxt) score += 7;
  if (signals.robotsTxtAllowsAiCrawlers) score += 10;
  if (signals.hasLlmsTxt) score += 14;
  if (signals.hasSchemaMarkup) score += 12;
  if (signals.hasOpenGraph) score += 5;
  return Math.min(100, score);
}

// ─── Recommendations ───────────────────────────────────────────────────────

function buildRecommendations(signals: RepoSignals, owner: string, repo: string): RepoRecommendation[] {
  const recs: RepoRecommendation[] = [];

  if (!signals.hasLlmsTxt) {
    recs.push({
      issue: 'llms.txt absent',
      recommendation: 'Add /llms.txt to your repo root (deploy to your site root) to guide AI crawlers.',
      severity: 'high',
      artifact: {
        type: 'llms-txt',
        filename: 'llms.txt',
        content: `# ${repo}\n\n> This file helps AI language models understand this project.\n\n## About\n\n${repo} is an open-source project by ${owner}. Replace this with a brief description of what the project does and who it is for.\n\n## Key Resources\n\n- [GitHub Repository](https://github.com/${owner}/${repo}): Source code\n- [README](https://github.com/${owner}/${repo}#readme): Documentation\n\n## Guidelines for AI\n\n- Content may be referenced with attribution.\n- Link back to the original source when citing.\n- For questions, open a GitHub issue.`,
      },
    });
  }

  if (!signals.hasRobotsTxt || !signals.robotsTxtAllowsAiCrawlers) {
    recs.push({
      issue: !signals.hasRobotsTxt ? 'robots.txt absent' : 'robots.txt does not explicitly allow AI crawlers',
      recommendation: 'Add explicit Allow rules for major AI crawlers (GPTBot, ClaudeBot, PerplexityBot).',
      severity: 'high',
      artifact: {
        type: 'robots-txt',
        filename: 'robots.txt',
        content: `# Allow major AI crawlers\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: Amazonbot\nAllow: /\n\nUser-agent: *\nAllow: /`,
      },
    });
  }

  if (!signals.hasSchemaMarkup) {
    recs.push({
      issue: 'No JSON-LD schema markup found in index.html or layout files',
      recommendation: 'Add structured data so AI engines can understand your product identity.',
      severity: 'high',
      artifact: {
        type: 'json-ld',
        filename: 'schema.json',
        content: `<script type="application/ld+json">\n${JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': repo,
          'author': { '@type': 'Organization', 'name': owner },
          'url': `https://github.com/${owner}/${repo}`,
          'applicationCategory': 'WebApplication',
          'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        }, null, 2)}\n</script>`,
      },
    });
  }

  if (!signals.hasMetaDescription) {
    recs.push({
      issue: 'Meta description missing from index.html and layout templates',
      recommendation: 'Add a meta description (150–160 chars) to your HTML entry point or Next.js/Nuxt layout.',
      severity: 'high',
      artifact: {
        type: 'html',
        filename: 'meta-description.html',
        content: `<meta name="description" content="A concise 150-160 character description of ${repo} that includes your primary keyword." />`,
      },
    });
  }

  if (!signals.hasOpenGraph) {
    recs.push({
      issue: 'Open Graph tags missing from index.html and layout templates',
      recommendation: 'Add og:title, og:description, og:image so AI engines see rich metadata.',
      severity: 'medium',
      artifact: {
        type: 'html',
        filename: 'og-tags.html',
        content: `<meta property="og:title" content="${repo}" />\n<meta property="og:description" content="A short description of what ${repo} does." />\n<meta property="og:image" content="https://your-domain.com/og-image.png" />\n<meta property="og:url" content="https://your-domain.com/" />\n<meta property="og:type" content="website" />`,
      },
    });
  }

  if (!signals.readmeHasCta) {
    recs.push({
      issue: 'README lacks a clear call to action',
      recommendation: 'Add a prominent CTA (e.g. a "Get Started" button link or install badge) near the top of your README.',
      severity: 'medium',
    });
  }

  if (!signals.hasInstallInstructions) {
    recs.push({
      issue: 'No installation instructions detected in README',
      recommendation: 'Add a Quick Start or Installation section with copy-paste commands.',
      severity: 'medium',
      artifact: {
        type: 'markdown',
        filename: 'install-section.md',
        content: `## Installation\n\n\`\`\`bash\nnpm install ${repo}\n\`\`\`\n\n## Quick Start\n\n\`\`\`bash\nnpx ${repo} --help\n\`\`\``,
      },
    });
  }

  if (!signals.hasDemoSection) {
    recs.push({
      issue: 'No demo or screenshot section in README',
      recommendation: 'Add a demo GIF, screenshot, or live demo link to improve conversion readiness.',
      severity: 'low',
    });
  }

  if (!signals.hasLicense) {
    recs.push({
      issue: 'No LICENSE file',
      recommendation: 'Add a LICENSE file (MIT, Apache 2.0, etc.) to signal trustworthiness to AI engines.',
      severity: 'medium',
    });
  }

  if (!signals.packageDescription) {
    recs.push({
      issue: 'package.json missing description field',
      recommendation: 'Add a clear, keyword-rich description to package.json. This is indexed by npm and AI crawlers.',
      severity: 'medium',
    });
  }

  if (!signals.templateHasCanonical && signals.hasSSR) {
    recs.push({
      issue: 'No canonical URL tag found in layout templates',
      recommendation: 'Add a canonical link to prevent duplicate content penalties and help AI crawlers identify the authoritative URL.',
      severity: 'low',
      artifact: {
        type: 'html',
        filename: 'canonical.html',
        content: `<link rel="canonical" href="https://your-domain.com/" />`,
      },
    });
  }

  return recs;
}

// ─── Main export ───────────────────────────────────────────────────────────

export async function analyzeRepo(owner: string, repo: string, token: string): Promise<RepoAnalysisResult> {
  // ── Fetch all source files in parallel using sequential fallbacks ─────────
  const [
    repoData,
    readme,
    llmsTxt,
    robotsTxt,
    packageJsonRaw,
    indexHtml,
    licenseExists,
    contributingExists,
    changelogExists,
    openApiExists,
    appFileContent,
    layoutFileContent,
    documentFileContent,
  ] = await Promise.all([
    ghFetch<RepoMetadata>(`/repos/${owner}/${repo}`, token),

    // README — try .md then no extension
    fetchFirstContent(owner, repo, ['README.md', 'readme.md', 'Readme.md', 'README'], token),

    // llms.txt — root only
    fetchFileContent(owner, repo, 'llms.txt', token).catch(() => null),

    // robots.txt — public/ first, then root
    fetchFirstContent(owner, repo, ['public/robots.txt', 'robots.txt', 'static/robots.txt'], token),

    // package.json
    fetchFileContent(owner, repo, 'package.json', token).catch(() => null),

    // index.html — root then public/
    fetchFirstContent(owner, repo, ['index.html', 'public/index.html', 'src/index.html'], token),

    // LICENSE — try multiple common filenames
    anyExists(owner, repo, ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'LICENCE'], token),

    // CONTRIBUTING
    anyExists(owner, repo, ['CONTRIBUTING.md', 'CONTRIBUTING', '.github/CONTRIBUTING.md'], token),

    // CHANGELOG
    anyExists(owner, repo, ['CHANGELOG.md', 'CHANGELOG', 'CHANGES.md', 'HISTORY.md'], token),

    // OpenAPI spec
    anyExists(owner, repo, ['openapi.yaml', 'openapi.json', 'swagger.yaml', 'swagger.json', 'api/openapi.yaml'], token),

    // App entry file — fetch content for template analysis
    fetchFirstContent(owner, repo, [
      'src/App.tsx', 'src/App.jsx', 'src/app.tsx', 'src/app.jsx',
      'app/page.tsx', 'app/page.jsx',  // Next.js App Router root page
    ], token),

    // Layout / _document — fetch content for template analysis
    fetchFirstContent(owner, repo, [
      'app/layout.tsx', 'app/layout.jsx',         // Next.js App Router layout
      'pages/_document.tsx', 'pages/_document.js', // Next.js Pages Router _document
      'src/layouts/default.vue',                   // Nuxt
      'src/layouts/Layout.astro',                  // Astro
      'src/components/Layout.tsx', 'src/components/Layout.jsx',
      'src/Layout.tsx', 'src/Layout.jsx',
    ], token),

    // pages/_document specifically (Next.js)
    fetchFirstContent(owner, repo, ['pages/_document.tsx', 'pages/_document.js', 'pages/_document.jsx'], token),
  ]);

  // ── Parse package.json ────────────────────────────────────────────────────
  let pkg: PackageJson | null = null;
  try { if (packageJsonRaw) pkg = JSON.parse(packageJsonRaw) as PackageJson; } catch {}

  // ── Parse template signals from fetched content ───────────────────────────
  const appSignals = appFileContent ? parseTemplateSignals(appFileContent) : null;
  const layoutSignals = layoutFileContent ? parseTemplateSignals(layoutFileContent) : null;
  const docSignals = documentFileContent ? parseTemplateSignals(documentFileContent) : null;

  const templateHasMetaDescription = !!(appSignals?.hasMetaDescription || layoutSignals?.hasMetaDescription || docSignals?.hasMetaDescription);
  const templateHasOpenGraph = !!(appSignals?.hasOpenGraph || layoutSignals?.hasOpenGraph || docSignals?.hasOpenGraph);
  const templateHasSchemaMarkup = !!(appSignals?.hasSchemaMarkup || layoutSignals?.hasSchemaMarkup || docSignals?.hasSchemaMarkup);
  const templateHasCanonical = !!(appSignals?.hasCanonical || layoutSignals?.hasCanonical || docSignals?.hasCanonical);

  // ── Parse index.html signals ──────────────────────────────────────────────
  const indexLower = (indexHtml || '').toLowerCase();
  const indexHtmlHasMetaDescription = indexLower.includes('name="description"');
  const indexHtmlHasOpenGraph = indexLower.includes('property="og:');
  const indexHtmlHasSchemaMarkup = indexLower.includes('application/ld+json');
  const indexHtmlHasTitle = indexLower.includes('<title');

  // ── Framework detection ───────────────────────────────────────────────────
  const { framework, hasSSR, jsRenderingRisk } = detectFramework(pkg);

  // ── Build signals object ──────────────────────────────────────────────────
  const signals: RepoSignals = {
    hasReadme: !!readme,
    readmeWordCount: readme ? readme.split(/\s+/).length : 0,
    readmeHasHeadings: (readme || '').includes('#'),
    readmeHasCta: /\[.*(get started|demo|try|install|launch|sign up|start|download).*\]/i.test(readme || ''),
    hasDemoSection: /demo|screenshot|preview|live/i.test(readme || ''),
    hasInstallInstructions: /npm install|yarn add|pip install|cargo add|go get|brew install|apt install/i.test(readme || ''),
    hasLlmsTxt: !!llmsTxt,
    hasRobotsTxt: !!robotsTxt,
    robotsTxtAllowsAiCrawlers:
      (robotsTxt || '').toLowerCase().includes('gptbot') ||
      (robotsTxt || '').toLowerCase().includes('claudebot'),
    hasPackageJson: !!pkg,
    packageName: pkg?.name || null,
    packageDescription: pkg?.description || null,
    packageHasKeywords: Array.isArray(pkg?.keywords) && pkg.keywords.length > 0,
    hasIndexHtml: !!indexHtml,
    indexHtmlHasTitle,
    indexHtmlHasMetaDescription,
    indexHtmlHasOpenGraph,
    indexHtmlHasSchemaMarkup,
    hasSrcAppFile: !!appFileContent,
    hasSrcLayoutFile: !!layoutFileContent,
    hasSrcDocumentFile: !!documentFileContent,
    templateHasMetaDescription,
    templateHasOpenGraph,
    templateHasSchemaMarkup,
    templateHasCanonical,
    // Composites — true if found in EITHER index.html OR template files
    hasMetaDescription: indexHtmlHasMetaDescription || templateHasMetaDescription,
    hasOpenGraph: indexHtmlHasOpenGraph || templateHasOpenGraph,
    hasSchemaMarkup: indexHtmlHasSchemaMarkup || templateHasSchemaMarkup,
    hasLicense: licenseExists,
    hasContributing: contributingExists,
    hasChangelog: changelogExists,
    hasOpenApiSpec: openApiExists,
    detectedFramework: framework,
    hasSSR,
    jsRenderingRisk,
  };

  // ── Score pillars ─────────────────────────────────────────────────────────
  const pillarScores = {
    aiReadability: scoreAiReadability(signals),
    digitalAuthority: scoreDigitalAuthority(signals),
    conversionReadiness: scoreConversionReadiness(signals),
    productDiscoverability: scoreProductDiscoverability(signals),
  };

  const overallScore = Math.round(
    (pillarScores.aiReadability * 0.3) +
    (pillarScores.digitalAuthority * 0.25) +
    (pillarScores.conversionReadiness * 0.25) +
    (pillarScores.productDiscoverability * 0.2)
  );

  const recommendations = buildRecommendations(signals, owner, repo);

  return {
    repoUrl: `https://github.com/${owner}/${repo}`,
    owner,
    repo,
    defaultBranch: repoData?.default_branch || 'main',
    description: repoData?.description || null,
    stars: repoData?.stargazers_count || 0,
    signals,
    pillarScores,
    overallScore,
    recommendations,
  };
}
