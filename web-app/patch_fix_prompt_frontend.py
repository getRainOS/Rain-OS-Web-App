path = "src/pages/RepoAnalysis.jsx"
content = open(path).read()

old = """function buildFixPrompt(platform, result, repoUrl) {
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
    artifacts.push('llms.txt content: \\n# llms.txt for ' + (repo || 'Project') + '\\n\\n' + (description || 'A web application') + '\\n\\nKey pages:\\n- / (homepage)\\n- /about\\n- /docs\\n');
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
    frameworkNote = `\\nDetected framework: ${detectedFramework}. `;
    if (['React', 'Vite', 'Vue', 'Svelte'].includes(detectedFramework)) {
      frameworkNote += 'Since this is a client-side SPA, consider adding prerendering (e.g., Vite-plugin-ssr, Astro, or Next.js SSR) so AI crawlers see content without running JavaScript.';
    } else if (['Next.js', 'Astro', 'Nuxt', 'SvelteKit'].includes(detectedFramework)) {
      frameworkNote += 'Good — this framework supports server-side rendering, which helps AI crawlers read your content.';
    }
  }

  const scoreNote = overallScore ? `Current rain OS AI Readability Score: ${overallScore}/100.` : '';

  const prompt = `You are the AI assistant inside ${platformName}. I have a project at ${repoUrl || 'this repo'} that I built with your platform.

I ran an AI Readability scan and found several issues that prevent ChatGPT, Gemini, and Perplexity from discovering and citing my site. Here's what needs fixing:

${issues.join('\\n') || '- No critical issues found — consider adding llms.txt and schema markup for better AI visibility'}
${frameworkNote}
${scoreNote}

Please apply these fixes directly to my project. Where you need to create new files (llms.txt, robots.txt, LICENSE), generate the content and tell me which files to create. Where existing files need edits (index.html, package.json, README), show me the exact changes to make.

${artifacts.length > 0 ? 'Here are file contents you can use:\\n\\n' + artifacts.join('\\n\\n') : ''}

Respond with:
1. A summary of what you're changing and why
2. File-by-file instructions (create / edit / replace)
3. Any code snippets I should paste directly`;

  return prompt;
}"""

new = """function buildFixPrompt(platform, result, repoUrl) {
  const { signals, recommendations = [], overallScore } = result || {};
  const detectedFramework = signals?.detectedFramework;
  const platformName = PLATFORMS.find(p => p.value === platform)?.label || platform;

  // Source issues + artifacts from the backend's recommendation engine
  // (services/repoAnalysisService.ts) instead of re-deriving them from raw
  // signals here — keeps severity and generated file content in sync with
  // the server, rather than two implementations drifting apart.
  const issues = recommendations.map(r => `- [${r.severity}] ${r.issue} — ${r.recommendation}`);
  const artifacts = recommendations
    .filter(r => r.artifact)
    .map(r => `${r.artifact.filename || r.artifact.type}:\\n${r.artifact.content}`);

  // Framework-specific notes — matched against the real DetectedFramework
  // enum values from repoAnalysisService.ts (previously checked 'React' /
  // 'Vite' / 'Vue', which never matched the actual 'React (SPA)' / 'Vue (SPA)'
  // values the backend returns, so this advice never fired for SPA users).
  let frameworkNote = '';
  if (detectedFramework) {
    frameworkNote = `\\nDetected framework: ${detectedFramework}. `;
    if (['React (SPA)', 'Vue (SPA)', 'Angular', 'Svelte'].includes(detectedFramework)) {
      frameworkNote += 'Since this is a client-side SPA, consider adding prerendering (e.g., Vite-plugin-ssr, Astro, or Next.js SSR) so AI crawlers see content without running JavaScript.';
    } else if (['Next.js', 'Astro', 'Nuxt', 'SvelteKit', 'Remix'].includes(detectedFramework)) {
      frameworkNote += 'Good — this framework supports server-side rendering, which helps AI crawlers read your content.';
    }
  }

  const scoreNote = overallScore ? `Current rain OS AI Readability Score: ${overallScore}/100.` : '';

  const prompt = `You are the AI assistant inside ${platformName}. I have a project at ${repoUrl || 'this repo'} that I built with your platform.

I ran an AI Readability scan and found the following issues that prevent ChatGPT, Gemini, and Perplexity from discovering and citing my site. Higher-severity items matter most:

${issues.join('\\n') || '- No critical issues found — consider adding llms.txt and schema markup for better AI visibility'}
${frameworkNote}
${scoreNote}

Please apply these fixes directly to my project. Where you need to create new files, generate the content and tell me which files to create. Where existing files need edits, show me the exact changes to make.

${artifacts.length > 0 ? 'Here are file contents you can use:\\n\\n' + artifacts.join('\\n\\n') : ''}

Respond with:
1. A summary of what you're changing and why
2. File-by-file instructions (create / edit / replace)
3. Any code snippets I should paste directly`;

  return prompt;
}"""

count = content.count(old)
assert count == 1, f"Expected exactly 1 match, found {count}"
content = content.replace(old, new)
open(path, "w").write(content)
print("Patched", path)
