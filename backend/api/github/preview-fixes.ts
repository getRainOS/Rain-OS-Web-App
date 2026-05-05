// api/github/preview-fixes.ts
// POST /api/github/preview-fixes
// Accepts { url, repoFullName, artifacts } and returns a structured preview
// of every change that would be applied — without writing anything to the repo.
//
// Each artifact gets its own PreviewItem (no merging), so the client can
// checkbox individual fixes. Same-file patches are merged server-side at
// push time (see push-fixes.ts / computeApprovedFileChanges).

import express from 'express';
import { findUserByApiKey, getUserGithubToken } from '../../services/dbService';
import {
  injectIntoHead,
  COMMON_TEMPLATE_PATHS,
  fetchRepoFile,
  ArtifactInput,
} from '../../services/githubPatchService';
import type { ApiError } from '../../types';

export interface PreviewItem {
  /** Stable artifact index as string — used by push endpoint to select approved items */
  id: string;
  type: 'create' | 'patch' | 'manual';
  artifactType: string;
  description: string;
  /** Path in the repo (create / patch items) */
  path?: string;
  filename?: string;
  /** Full file content for create items */
  content?: string;
  /** Original file content before patch (for diff display) */
  originalContent?: string;
  /** File content after applying this snippet (for diff display) */
  patchedContent?: string;
  /** The HTML/text snippet being injected (patch / manual items) */
  snippet?: string;
}

function getApiKey(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  return (Array.isArray(h) ? h[0] : h)?.split(' ')[1] ?? null;
}

function parseOwnerRepo(fullName: string): { owner: string; repo: string } | null {
  const parts = fullName.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { owner: parts[0], repo: parts[1] };
}

export default async function handler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }
  if (!user.githubId) {
    return res.status(400).json({ error: 'not_connected', message: 'GitHub account not connected.' });
  }

  const { repoFullName, artifacts } = req.body as {
    repoFullName?: string;
    artifacts?: ArtifactInput[];
  };

  if (!repoFullName) {
    return res.status(400).json({ error: 'bad_request', message: 'repoFullName is required' });
  }
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    return res.status(400).json({ error: 'bad_request', message: 'artifacts array is required' });
  }

  const parsed = parseOwnerRepo(repoFullName);
  if (!parsed) {
    return res.status(400).json({ error: 'bad_request', message: 'Invalid repoFullName — use "owner/repo" format' });
  }

  const rawToken = await getUserGithubToken(user.id);
  if (!rawToken) {
    return res.status(400).json({ error: 'not_connected', message: 'GitHub token not found. Reconnect GitHub in Settings.' });
  }
  const token: string = rawToken;
  const { owner, repo } = parsed;

  try {
    const toCreate: PreviewItem[] = [];
    const toPatch: PreviewItem[] = [];
    const manual: PreviewItem[] = [];

    // Cache template discovery — probe once per preview call
    let cachedTemplate: { path: string; content: string } | null | undefined = undefined;

    async function findHtmlTemplate(): Promise<{ path: string; content: string } | null> {
      if (cachedTemplate !== undefined) return cachedTemplate;
      for (const templatePath of COMMON_TEMPLATE_PATHS) {
        const file = await fetchRepoFile(token, owner, repo, templatePath);
        if (file) {
          cachedTemplate = { path: file.path, content: file.content };
          return cachedTemplate;
        }
      }
      cachedTemplate = null;
      return null;
    }

    for (let i = 0; i < artifacts.length; i++) {
      const artifact = artifacts[i];
      // Stable ID is the artifact's array index — used by push endpoint to
      // select approved items without trusting client-provided paths/content.
      const id = String(i);
      const filename = artifact.filename ?? artifact.type;

      if (artifact.type === 'llms-txt') {
        toCreate.push({
          id,
          type: 'create',
          artifactType: artifact.type,
          description: 'Create llms.txt to guide AI crawlers',
          path: 'llms.txt',
          filename: 'llms.txt',
          content: artifact.content,
        });
        continue;
      }

      if (artifact.type === 'robots-txt') {
        const existing = await fetchRepoFile(token, owner, repo, 'robots.txt');
        if (existing) {
          const patchedContent = existing.content.trimEnd() + '\n\n' + artifact.content;
          toPatch.push({
            id,
            type: 'patch',
            artifactType: artifact.type,
            description: 'Update robots.txt to allow AI crawlers',
            path: 'robots.txt',
            filename: 'robots.txt',
            originalContent: existing.content,
            patchedContent,
            snippet: artifact.content,
          });
        } else {
          toCreate.push({
            id,
            type: 'create',
            artifactType: artifact.type,
            description: 'Create robots.txt with AI crawler rules',
            path: 'robots.txt',
            filename: 'robots.txt',
            content: artifact.content,
          });
        }
        continue;
      }

      // json-ld and html artifacts — inject into HTML template <head>.
      // Each artifact is a separate PreviewItem so users can deselect individually.
      // Merging happens server-side at push time via computeApprovedFileChanges.
      if (artifact.type === 'json-ld' || artifact.type === 'html') {
        const template = await findHtmlTemplate();
        if (template) {
          // Show how this snippet alone changes the original template
          const patched = injectIntoHead(template.content, artifact.content);
          if (patched) {
            toPatch.push({
              id,
              type: 'patch',
              artifactType: artifact.type,
              description: artifact.type === 'json-ld'
                ? `Inject JSON-LD schema markup into <head> of ${template.path}`
                : `Inject ${filename} tags into <head> of ${template.path}`,
              path: template.path,
              filename: template.path,
              originalContent: template.content,
              patchedContent: patched,
              snippet: artifact.content,
            });
          } else {
            manual.push({
              id,
              type: 'manual',
              artifactType: artifact.type,
              description: artifact.type === 'json-ld'
                ? 'Add JSON-LD schema markup to your page <head> (<head> not found in template)'
                : `Add ${filename} tags to your page <head> (<head> not found in template)`,
              snippet: artifact.content,
              filename,
            });
          }
        } else {
          manual.push({
            id,
            type: 'manual',
            artifactType: artifact.type,
            description: artifact.type === 'json-ld'
              ? 'Add JSON-LD schema markup to your page <head> (no HTML template detected)'
              : `Add ${filename} tags to your page <head> (no HTML template detected)`,
            snippet: artifact.content,
            filename,
          });
        }
        continue;
      }
    }

    return res.status(200).json({ toCreate, toPatch, manual });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Preview failed';
    console.error('GitHub preview-fixes error:', message);
    if (message.includes('rate limit') || message.includes('403')) {
      return res.status(429).json({ error: 'rate_limit', message: 'GitHub API rate limit reached. Try again later.' });
    }
    if (message.includes('Not Found') || message.includes('404')) {
      return res.status(404).json({ error: 'not_found', message: 'Repository not found or not accessible with your GitHub permissions.' });
    }
    return res.status(500).json({ error: 'internal_server_error', message });
  }
}
