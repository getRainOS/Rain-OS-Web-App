// api/github/repos.ts
// GitHub repo listing, repo analysis, and disconnect endpoints.
// All routes require a valid Rain OS API key (Authorization: Bearer).

import express from 'express';
import { findUserByApiKey, getUserGithubToken, disconnectGithub } from '../../services/dbService';
import { analyzeRepo } from '../../services/repoAnalysisService';
import type { ApiError } from '../../types';

// Minimal shape of a GitHub /user/repos entry we care about
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  private: boolean;
  language: string | null;
  updated_at: string;
}

function getApiKey(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] || null;
}

async function authenticate(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
    return null;
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
    return null;
  }
  return user;
}

// GET /api/github/repos — list the authenticated user's GitHub repos
export async function listReposHandler(req: express.Request, res: express.Response) {
  const user = await authenticate(req, res);
  if (!user) return;

  if (!user.githubId) {
    return res.status(200).json({ connected: false, repos: [] });
  }

  const token = await getUserGithubToken(user.id);
  if (!token) {
    return res.status(200).json({ connected: false, repos: [] });
  }

  try {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50&type=owner', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      // Token expired or revoked — clear stale linkage so UI doesn't show phantom connection
      if (response.status === 401) {
        await disconnectGithub(user.id).catch(() => undefined);
      }
      return res.status(200).json({ connected: false, repos: [], reason: 'github_token_invalid' });
    }

    const repos = await response.json() as GitHubRepo[];
    const simplified = repos.map(r => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      url: r.html_url,
      homepage: r.homepage || null,
      stars: r.stargazers_count,
      private: r.private,
      language: r.language,
      updatedAt: r.updated_at,
    }));

    return res.status(200).json({
      connected: true,
      githubLogin: user.githubLogin,
      repos: simplified,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upstream error';
    console.error('GitHub repo list error:', message);
    return res.status(502).json({ error: 'upstream_error', message: 'Failed to fetch GitHub repos' });
  }
}

// POST /api/github/analyze — analyze a specific repo by URL
export async function analyzeRepoHandler(req: express.Request, res: express.Response) {
  const user = await authenticate(req, res);
  if (!user) return;

  if (!user.githubId) {
    return res.status(400).json({ error: 'not_connected', message: 'GitHub account not connected. Connect in Settings.' });
  }

  const { repoUrl } = req.body as { repoUrl?: string };
  if (!repoUrl) {
    return res.status(400).json({ error: 'bad_request', message: 'repoUrl is required' });
  }

  // Parse owner/repo from URL like https://github.com/owner/repo
  let owner: string;
  let repo: string;
  try {
    const parsed = new URL(repoUrl);
    const parts = parsed.pathname.replace(/^\//, '').replace(/\/$/, '').split('/');
    if (parts.length < 2) throw new Error('Not a valid repo URL');
    owner = parts[0];
    repo = parts[1].replace(/\.git$/, '');
  } catch {
    return res.status(400).json({ error: 'bad_request', message: 'Invalid GitHub repo URL. Use format: https://github.com/owner/repo' });
  }

  const token = await getUserGithubToken(user.id);
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
}

// DELETE /api/github/disconnect — unlink GitHub from the user's account
export async function disconnectGithubHandler(req: express.Request, res: express.Response) {
  const user = await authenticate(req, res);
  if (!user) return;

  try {
    await disconnectGithub(user.id);
    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to disconnect';
    console.error('GitHub disconnect error:', message);
    return res.status(500).json({ error: 'internal_server_error', message: 'Failed to disconnect GitHub' });
  }
}
