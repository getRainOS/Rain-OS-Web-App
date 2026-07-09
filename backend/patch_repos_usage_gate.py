path = "api/github/repos.ts"
content = open(path).read()

old1 = "import { findUserByApiKey, getUserGithubToken, disconnectGithub } from '../../services/dbService';"
new1 = "import { findUserByApiKey, getUserGithubToken, disconnectGithub, incrementUserUsage } from '../../services/dbService';"
c1 = content.count(old1)
assert c1 == 1, f"anchor1: expected 1, found {c1}"
content = content.replace(old1, new1)

old2 = """  const token = await getUserGithubToken(user.id);
  if (!token) {
    return res.status(400).json({ error: 'not_connected', message: 'GitHub token not found. Reconnect GitHub in Settings.' });
  }

  try {
    const result = await analyzeRepo(owner, repo, token);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    console.error('Repo analysis error:', message);
    if (message.includes('404') || message.includes('Not Found')) {
      return res.status(404).json({ error: 'not_found', message: 'Repository not found or not accessible with your GitHub permissions.' });
    }
    return res.status(500).json({ error: 'analysis_failed', message: 'Repo analysis failed. Please try again.' });
  }
}"""
new2 = """  const token = await getUserGithubToken(user.id);
  if (!token) {
    return res.status(400).json({ error: 'not_connected', message: 'GitHub token not found. Reconnect GitHub in Settings.' });
  }

  // Free tier gets 5 scans total (usage.limit defaults to 5 at signup — see
  // createUser in dbService.ts); Pro/Business get their higher plan limits.
  if (user.usage.count >= user.usage.limit) {
    return res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'You have used all of your free repo scans. Upgrade to keep scanning.',
    } as ApiError);
  }

  try {
    const result = await analyzeRepo(owner, repo, token);
    await incrementUserUsage(user.id);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    console.error('Repo analysis error:', message);
    if (message.includes('404') || message.includes('Not Found')) {
      return res.status(404).json({ error: 'not_found', message: 'Repository not found or not accessible with your GitHub permissions.' });
    }
    return res.status(500).json({ error: 'analysis_failed', message: 'Repo analysis failed. Please try again.' });
  }
}"""
c2 = content.count(old2)
assert c2 == 1, f"anchor2: expected 1, found {c2}"
content = content.replace(old2, new2)

open(path, "w").write(content)
print("Patched", path, "— 2 edits applied.")
