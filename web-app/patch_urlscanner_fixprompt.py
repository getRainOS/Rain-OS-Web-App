path = "src/pages/UrlScanner.jsx"
content = open(path).read()

old1 = "export default function UrlScanner() {"
new1 = """const PLATFORMS = [
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
    .map(r => `${r.artifact.filename || r.artifact.type}:\\n${r.artifact.content}`);

  const scoreNote = overallScore ? `Current rain OS AI Readability Score: ${overallScore}/100.` : '';

  const prompt = `You are the AI assistant inside ${platformName}. I have a site at ${url || 'this URL'} that I built with your platform.

I ran an AI Readability scan and found the following issues that prevent ChatGPT, Gemini, and Perplexity from discovering and citing my site. Higher-severity items matter most:

${issues.join('\\n') || '- No critical issues found — consider adding llms.txt and schema markup for better AI visibility'}
${scoreNote}

Please make only the specific changes listed below — don't refactor, restructure, or modify any other part of the project, and don't change existing functionality, styling, or content beyond what's needed for each fix.

Where you need to create new files, generate the content and tell me which files to create. Where existing files need edits, show me the exact changes to make.

${artifacts.length > 0 ? 'Here are file contents you can use:\\n\\n' + artifacts.join('\\n\\n') : ''}

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

export default function UrlScanner() {"""

c1 = content.count(old1)
assert c1 == 1, f"anchor1: expected 1, found {c1}"
content = content.replace(old1, new1)

old2 = """          <GithubPushPanel result={result} scannedUrl={scannedUrl} />"""
new2 = """          {recommendations.length > 0 && (
            <FixPromptGenerator
              recommendations={recommendations}
              url={scannedUrl}
              overallScore={result?.overallScore}
            />
          )}

          <GithubPushPanel result={result} scannedUrl={scannedUrl} />"""

c2 = content.count(old2)
assert c2 == 1, f"anchor2: expected 1, found {c2}"
content = content.replace(old2, new2)

open(path, "w").write(content)
print("Patched", path)
