path = "services/repoAnalysisService.ts"
content = open(path).read()

old1 = """  overallScore: number;
  recommendations: RepoRecommendation[];
}"""
new1 = """  overallScore: number;
  recommendations: RepoRecommendation[];
  /** Ready-to-paste instructions for AI coding assistants (Bolt, Lovable, Cursor, v0, etc.)
   *  that don't have direct repo/git access — lets the vibe-coding platform apply the fixes itself. */
  vibeCodePrompt: string;
}"""
c1 = content.count(old1)
assert c1 == 1, f"anchor1: expected 1, found {c1}"
content = content.replace(old1, new1)

old2 = """// ─── Main export ───────────────────────────────────────────────────────────

export async function analyzeRepo(owner: string, repo: string, token: string): Promise<RepoAnalysisResult> {"""
new2 = """// ─── Vibe-coding prompt builder ────────────────────────────────────────────
// Turns the recommendations list into one copy-pasteable prompt a user can
// drop directly into an AI coding assistant's chat (Bolt, Lovable, Cursor, v0,
// Replit Agent, Windsurf, etc.) so the platform can apply the fixes itself —
// this matters most for repos that don't have a git-pushable target, and
// as a lower-friction alternative to the GitHub push-fixes PR flow.

function buildVibeCodePrompt(recs: RepoRecommendation[], owner: string, repo: string): string {
  if (recs.length === 0) {
    return `Nice — ${owner}/${repo} already passes Rain OS's AI-readability checks. No fixes needed right now.`;
  }

  const lines: string[] = [
    `I'm improving AI discoverability (AEO) for this project so AI assistants like ChatGPT, Perplexity, and Gemini can find, read, and recommend it. Please make the following changes:`,
    ``,
  ];

  recs.forEach((rec, i) => {
    lines.push(`${i + 1}. **${rec.issue}** (${rec.severity} priority)`);
    lines.push(`   ${rec.recommendation}`);
    if (rec.artifact) {
      const fname = rec.artifact.filename || rec.artifact.type;
      lines.push(`   Create or update \\`${fname}\\`:`);
      lines.push('   ```');
      lines.push('   ' + rec.artifact.content.split('\\n').join('\\n   '));
      lines.push('   ```');
    }
    lines.push('');
  });

  lines.push(`After making these changes, this project should score higher on AI Readability, Digital Authority, and Product Discoverability in Rain OS.`);

  return lines.join('\\n');
}

// ─── Main export ───────────────────────────────────────────────────────────

export async function analyzeRepo(owner: string, repo: string, token: string): Promise<RepoAnalysisResult> {"""
c2 = content.count(old2)
assert c2 == 1, f"anchor2: expected 1, found {c2}"
content = content.replace(old2, new2)

old3 = """  const recommendations = buildRecommendations(signals, owner, repo);

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
}"""
new3 = """  const recommendations = buildRecommendations(signals, owner, repo);
  const vibeCodePrompt = buildVibeCodePrompt(recommendations, owner, repo);

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
    vibeCodePrompt,
  };
}"""
c3 = content.count(old3)
assert c3 == 1, f"anchor3: expected 1, found {c3}"
content = content.replace(old3, new3)

open(path, "w").write(content)
print("Patched", path, "— 3 edits applied.")
