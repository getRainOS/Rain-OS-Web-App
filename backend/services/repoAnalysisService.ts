// services/repoAnalysisService.ts
// Fetches key source files from a GitHub repo and scores them against
// the 4 AEO pillars: AI Readability, Digital Authority,
// Conversion Readiness, Product Discoverability.

export type DetectedFramework = 'Next.js' | 'Nuxt' | 'SvelteKit' | 'Remix' | 'Astro' | 'React (SPA)' | 'Vue (SPA)' | 'Angular' | 'Svelte' | 'Unknown';

export interface RepoSignals {
  hasReadme: boolean;
  readmeWordCount: number;
  readmeHasHeadings: boolean;
  readmeHasCta: boolean;
  hasLlmsTxt: boolean;
  hasRobotsTxt: boolean;
  robotsTxtAllowsAiCrawlers: boolean;
  hasPackageJson: boolean;
  packageName: string | null;
  packageDescription: string | null;
  packageHasKeywords: boolean;
  hasIndexHtml: boolean;
  indexHtmlHasMetaDescription: boolean;
  indexHtmlHasOpenGraph: boolean;
  indexHtmlHasSchemaMarkup: boolean;
  indexHtmlHasTitle: boolean;
  hasLicense: boolean;
  hasContributing: boolean;
  hasChangelog: boolean;
  hasOpenApiSpec: boolean;
  hasDemoSection: boolean;
  hasInstallInstructions: boolean;
  // Framework detection
  detectedFramework: DetectedFramework;
  hasSSR: boolean;
  jsRenderingRisk: 'low' | 'medium' | 'high';
  // Source file signals
  hasSrcAppFile: boolean;
  hasSrcLayoutFile: boolean;
  hasSrcDocumentFile: boolean;
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

const GH_API = 'https://api.github.com';

async function ghFetch(path: string, token: string): Promise<any> {
  const res = await fetch(`${GH_API}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchFileContent(owner: string, repo: string, path: string, token: string): Promise<string | null> {
  const data = await ghFetch(`/repos/${owner}/${repo}/contents/${path}`, token);
  if (!data || data.encoding !== 'base64' || !data.content) return null;
  return Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
}

async function fileExists(owner: string, repo: string, path: string, token: string): Promise<boolean> {
  const data = await ghFetch(`/repos/${owner}/${repo}/contents/${path}`, token);
  return data !== null && !Array.isArray(data);
}

function scoreAiReadability(signals: RepoSignals): number {
  let score = 40;
  if (signals.hasReadme) score += 12;
  if (signals.readmeHasHeadings) score += 10;
  if (signals.readmeWordCount > 200) score += 8;
  if (signals.readmeWordCount > 500) score += 5;
  if (signals.hasLlmsTxt) score += 15;
  if (signals.indexHtmlHasSchemaMarkup) score += 10;
  return Math.min(100, score);
}

function scoreDigitalAuthority(signals: RepoSignals): number {
  let score = 30;
  if (signals.hasLicense) score += 12;
  if (signals.hasContributing) score += 8;
  if (signals.hasChangelog) score += 8;
  if (signals.hasOpenApiSpec) score += 12;
  if (signals.indexHtmlHasOpenGraph) score += 10;
  if (signals.hasReadme && signals.readmeWordCount > 300) score += 10;
  if (signals.packageHasKeywords) score += 10;
  return Math.min(100, score);
}

function scoreConversionReadiness(signals: RepoSignals): number {
  let score = 35;
  if (signals.readmeHasCta) score += 15;
  if (signals.hasInstallInstructions) score += 15;
  if (signals.hasDemoSection) score += 15;
  if (signals.indexHtmlHasMetaDescription) score += 10;
  if (signals.indexHtmlHasTitle) score += 10;
  return Math.min(100, score);
}

function scoreProductDiscoverability(signals: RepoSignals): number {
  let score = 25;
  if (signals.hasPackageJson) score += 8;
  if (signals.packageDescription) score += 10;
  if (signals.packageHasKeywords) score += 10;
  if (signals.hasRobotsTxt) score += 8;
  if (signals.robotsTxtAllowsAiCrawlers) score += 10;
  if (signals.hasLlmsTxt) score += 15;
  if (signals.indexHtmlHasSchemaMarkup) score += 14;
  return Math.min(100, score);
}

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

  if (!signals.indexHtmlHasSchemaMarkup) {
    recs.push({
      issue: 'No JSON-LD schema markup in index.html',
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

  if (!signals.indexHtmlHasMetaDescription) {
    recs.push({
      issue: 'index.html missing meta description',
      recommendation: 'Add a meta description (150–160 chars) to your index.html.',
      severity: 'high',
      artifact: {
        type: 'html',
        filename: 'meta-description.html',
        content: `<meta name="description" content="A concise 150-160 character description of ${repo} that includes your primary keyword." />`,
      },
    });
  }

  if (!signals.indexHtmlHasOpenGraph) {
    recs.push({
      issue: 'Open Graph tags missing from index.html',
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

  return recs;
}

function detectFramework(pkg: any): { framework: DetectedFramework; hasSSR: boolean; jsRenderingRisk: 'low' | 'medium' | 'high' } {
  if (!pkg) return { framework: 'Unknown', hasSSR: false, jsRenderingRisk: 'medium' };

  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const scripts = pkg.scripts || {};
  const scriptText = Object.values(scripts).join(' ').toLowerCase();

  if (deps['next']) return { framework: 'Next.js', hasSSR: true, jsRenderingRisk: 'low' };
  if (deps['nuxt'] || deps['nuxt3']) return { framework: 'Nuxt', hasSSR: true, jsRenderingRisk: 'low' };
  if (deps['@sveltejs/kit']) return { framework: 'SvelteKit', hasSSR: true, jsRenderingRisk: 'low' };
  if (deps['@remix-run/react'] || deps['@remix-run/node']) return { framework: 'Remix', hasSSR: true, jsRenderingRisk: 'low' };
  if (deps['astro']) return { framework: 'Astro', hasSSR: true, jsRenderingRisk: 'low' };

  // SPA frameworks without SSR
  if (deps['react'] || deps['react-dom']) {
    // Check for SSR indicators
    const hasServerEntry = scriptText.includes('server') || scriptText.includes('ssr');
    return { framework: 'React (SPA)', hasSSR: hasServerEntry, jsRenderingRisk: hasServerEntry ? 'medium' : 'high' };
  }
  if (deps['vue']) {
    const hasServerEntry = scriptText.includes('server') || scriptText.includes('ssr');
    return { framework: 'Vue (SPA)', hasSSR: hasServerEntry, jsRenderingRisk: hasServerEntry ? 'medium' : 'high' };
  }
  if (deps['@angular/core']) return { framework: 'Angular', hasSSR: !!deps['@angular/ssr'], jsRenderingRisk: deps['@angular/ssr'] ? 'low' : 'high' };
  if (deps['svelte']) return { framework: 'Svelte', hasSSR: false, jsRenderingRisk: 'high' };

  return { framework: 'Unknown', hasSSR: false, jsRenderingRisk: 'medium' };
}

export async function analyzeRepo(owner: string, repo: string, token: string): Promise<RepoAnalysisResult> {
  const [repoData, readme, llmsTxt, robotsTxt, packageJson, indexHtml, licenseExists, contributingExists, changelogExists, openApiExists, srcAppExists, srcLayoutExists, srcDocumentExists] = await Promise.all([
    ghFetch(`/repos/${owner}/${repo}`, token),
    fetchFileContent(owner, repo, 'README.md', token).catch(() => null),
    fetchFileContent(owner, repo, 'llms.txt', token).catch(() => null),
    fetchFileContent(owner, repo, 'public/robots.txt', token).catch(() => null) ||
      fetchFileContent(owner, repo, 'robots.txt', token).catch(() => null),
    fetchFileContent(owner, repo, 'package.json', token).catch(() => null),
    fetchFileContent(owner, repo, 'index.html', token).catch(() =>
      fetchFileContent(owner, repo, 'public/index.html', token).catch(() => null)
    ),
    fileExists(owner, repo, 'LICENSE', token).catch(() => false) ||
      fileExists(owner, repo, 'LICENSE.md', token).catch(() => false),
    fileExists(owner, repo, 'CONTRIBUTING.md', token).catch(() => false),
    fileExists(owner, repo, 'CHANGELOG.md', token).catch(() =>
      fileExists(owner, repo, 'CHANGELOG', token).catch(() => false)
    ),
    fileExists(owner, repo, 'openapi.yaml', token).catch(() => false) ||
      fileExists(owner, repo, 'openapi.json', token).catch(() => false) ||
      fileExists(owner, repo, 'swagger.yaml', token).catch(() => false),
    // Source file probes for template / layout / document variants
    fileExists(owner, repo, 'src/App.tsx', token).catch(() => false) ||
      fileExists(owner, repo, 'src/App.jsx', token).catch(() => false) ||
      fileExists(owner, repo, 'src/app.tsx', token).catch(() => false),
    fileExists(owner, repo, 'src/components/Layout.tsx', token).catch(() => false) ||
      fileExists(owner, repo, 'src/layouts/default.vue', token).catch(() => false) ||
      fileExists(owner, repo, 'src/layouts/Layout.astro', token).catch(() => false) ||
      fileExists(owner, repo, 'app/layout.tsx', token).catch(() => false),
    fileExists(owner, repo, 'pages/_document.tsx', token).catch(() => false) ||
      fileExists(owner, repo, 'pages/_document.js', token).catch(() => false) ||
      fileExists(owner, repo, 'app/_document.tsx', token).catch(() => false),
  ]);

  // Parse signals
  let pkg: any = null;
  try { if (packageJson) pkg = JSON.parse(packageJson); } catch {}

  const readmeLower = (readme || '').toLowerCase();
  const indexLower = (indexHtml || '').toLowerCase();
  const { framework, hasSSR, jsRenderingRisk } = detectFramework(pkg);

  const signals: RepoSignals = {
    hasReadme: !!readme,
    readmeWordCount: readme ? readme.split(/\s+/).length : 0,
    readmeHasHeadings: (readme || '').includes('#'),
    readmeHasCta: /\[.*(get started|demo|try|install|launch|sign up|start|download).*\]/i.test(readme || ''),
    hasLlmsTxt: !!llmsTxt,
    hasRobotsTxt: !!robotsTxt,
    robotsTxtAllowsAiCrawlers: (robotsTxt || '').toLowerCase().includes('gptbot') || (robotsTxt || '').toLowerCase().includes('claudebot'),
    hasPackageJson: !!pkg,
    packageName: pkg?.name || null,
    packageDescription: pkg?.description || null,
    packageHasKeywords: Array.isArray(pkg?.keywords) && pkg.keywords.length > 0,
    hasIndexHtml: !!indexHtml,
    indexHtmlHasMetaDescription: indexLower.includes('name="description"'),
    indexHtmlHasOpenGraph: indexLower.includes('property="og:'),
    indexHtmlHasSchemaMarkup: indexLower.includes('application/ld+json'),
    indexHtmlHasTitle: indexLower.includes('<title'),
    hasLicense: !!licenseExists,
    hasContributing: !!contributingExists,
    hasChangelog: !!changelogExists,
    hasOpenApiSpec: !!openApiExists,
    hasDemoSection: /demo|screenshot|preview|live/i.test(readme || ''),
    hasInstallInstructions: /npm install|yarn add|pip install|cargo add|go get|brew install|apt install/i.test(readme || ''),
    detectedFramework: framework,
    hasSSR,
    jsRenderingRisk,
    hasSrcAppFile: !!srcAppExists,
    hasSrcLayoutFile: !!srcLayoutExists,
    hasSrcDocumentFile: !!srcDocumentExists,
  };

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
