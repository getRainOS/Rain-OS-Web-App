old = """  if (!user.githubId) {
    return res.status(400).json({ error: 'not_connected', message: 'GitHub account not connected.' });
  }

  const { repoFullName, artifacts } = req.body as {"""

new = """  if (!user.githubId) {
    return res.status(400).json({ error: 'not_connected', message: 'GitHub account not connected.' });
  }
  if (user.subscriptionStatus !== 'active') {
    return res.status(402).json({ error: 'payment_required', message: 'Active subscription required' } as ApiError);
  }
  if (user.usage.count >= user.usage.limit) {
    return res.status(429).json({ error: 'rate_limit_exceeded', message: 'Monthly limit reached. Upgrade to continue.' } as ApiError);
  }

  const { repoFullName, artifacts } = req.body as {"""

path = "api/github/preview-fixes.ts"
content = open(path).read()
count = content.count(old)
assert count == 1, f"Expected exactly 1 match, found {count}"
open(path, "w").write(content.replace(old, new))
print("Patched", path)
