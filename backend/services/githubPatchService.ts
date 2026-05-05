// services/githubPatchService.ts
// Utilities for patching HTML templates and building GitHub PR content.

import { Buffer } from 'buffer';

/** Typed GitHub API error response body */
interface GitHubErrorBody {
  message?: string;
}

/** Artifact from a URL scan (mirrors urlScanService.UrlScanRecommendation.artifact) */
export interface ArtifactInput {
  type: 'json-ld' | 'llms-txt' | 'robots-txt' | 'html';
  content: string;
  filename?: string;
}

/**
 * Inject an HTML snippet into the <head> of an existing HTML file.
 * Handles both empty-head and populated-head cases.
 * Returns null if </head> is not found (i.e., not an HTML file).
 */
export function injectIntoHead(existingHtml: string, snippet: string): string | null {
  const closeHead = existingHtml.indexOf('</head>');
  if (closeHead === -1) return null;

  const indented = snippet
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n');

  return (
    existingHtml.slice(0, closeHead) +
    `\n${indented}\n` +
    existingHtml.slice(closeHead)
  );
}

/**
 * Common HTML template paths to probe for in a GitHub repo.
 * Ordered by likelihood.
 */
export const COMMON_TEMPLATE_PATHS = [
  'public/index.html',
  'index.html',
  'src/index.html',
  'templates/index.html',
  'views/index.html',
  'app/index.html',
  'app/templates/index.html',
  'web/index.html',
  'static/index.html',
  'src/main/resources/templates/index.html',
];

/**
 * Allowlisted paths the server may write to.
 * Prevents arbitrary path traversal regardless of client input.
 */
export const ALLOWED_REPO_PATHS: ReadonlySet<string> = new Set([
  'llms.txt',
  'robots.txt',
  ...COMMON_TEMPLATE_PATHS,
]);

/**
 * Attempt to fetch a file from a GitHub repo.
 * Returns { path, content, sha } if found.
 * Returns null if the file does not exist (404).
 * Throws for rate-limit (403/429), access, or server errors so callers
 * can surface them as inline UI errors rather than silently degrading.
 */
export async function fetchRepoFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
): Promise<{ path: string; content: string; sha: string } | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(8000),
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as GitHubErrorBody;
    const msg = body.message ?? `GitHub API error ${res.status}`;
    if (res.status === 403 || res.status === 429) {
      throw new Error(`GitHub rate limit or access error: ${msg}`);
    }
    throw new Error(`Failed to fetch ${path}: ${msg}`);
  }
  const data = (await res.json()) as { content?: string; sha?: string };
  if (!data.content || !data.sha) return null;
  const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
  return { path, content, sha: data.sha };
}

/**
 * Get the default branch name and its HEAD commit SHA.
 */
export async function getDefaultBranch(
  token: string,
  owner: string,
  repo: string,
): Promise<{ branch: string; sha: string }> {
  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: ghHeaders,
    signal: AbortSignal.timeout(8000),
  });
  if (!repoRes.ok) {
    const body = (await repoRes.json().catch(() => ({}))) as GitHubErrorBody;
    throw new Error(body.message ?? `Failed to fetch repo info (${repoRes.status})`);
  }
  const repoData = (await repoRes.json()) as { default_branch: string };
  const branch = repoData.default_branch;

  const refRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    { headers: ghHeaders, signal: AbortSignal.timeout(8000) },
  );
  if (!refRes.ok) throw new Error(`Failed to fetch branch ref (${refRes.status})`);
  const refData = (await refRes.json()) as { object: { sha: string } };
  return { branch, sha: refData.object.sha };
}

/**
 * Server-side: compute the final file changes for a given set of approved
 * artifacts. Derives all paths and content server-side — never from client
 * input — and validates every path against ALLOWED_REPO_PATHS.
 *
 * Same-file patches (e.g. multiple HTML snippets into the same template) are
 * merged here by injecting each snippet into the cumulative result.
 *
 * Returns:
 *   files        — file path + final content to commit
 *   manualItems  — snippets with no template detected (go in PR description)
 */
export async function computeApprovedFileChanges(
  token: string,
  owner: string,
  repo: string,
  artifacts: ArtifactInput[],
): Promise<{
  files: Array<{ path: string; content: string }>;
  manualItems: Array<{ description: string; snippet: string }>;
}> {
  // path → accumulated content
  const fileMap = new Map<string, string>();
  const manualItems: Array<{ description: string; snippet: string }> = [];

  // Cache template discovery — probe once, reuse for all html/json-ld artifacts
  let cachedTemplate: { path: string; content: string } | null | undefined = undefined;

  async function getTemplate(): Promise<{ path: string; content: string } | null> {
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

  for (const artifact of artifacts) {
    if (artifact.type === 'llms-txt') {
      const path = 'llms.txt';
      if (!ALLOWED_REPO_PATHS.has(path)) continue;
      fileMap.set(path, artifact.content);

    } else if (artifact.type === 'robots-txt') {
      const path = 'robots.txt';
      if (!ALLOWED_REPO_PATHS.has(path)) continue;
      if (fileMap.has(path)) {
        // Already scheduled — append the additional rules
        fileMap.set(path, fileMap.get(path)!.trimEnd() + '\n\n' + artifact.content);
      } else {
        const existing = await fetchRepoFile(token, owner, repo, path);
        if (existing) {
          fileMap.set(path, existing.content.trimEnd() + '\n\n' + artifact.content);
        } else {
          fileMap.set(path, artifact.content);
        }
      }

    } else if (artifact.type === 'json-ld' || artifact.type === 'html') {
      const template = await getTemplate();
      if (template) {
        const path = template.path;
        if (!ALLOWED_REPO_PATHS.has(path)) {
          // Path not in allowlist — push to manual
          manualItems.push({
            description: `Inject ${artifact.type} into page (template path not allowed)`,
            snippet: artifact.content,
          });
          continue;
        }
        // Inject into current accumulated content (or original if first)
        const base = fileMap.get(path) ?? template.content;
        const patched = injectIntoHead(base, artifact.content);
        if (patched) {
          fileMap.set(path, patched);
        } else {
          manualItems.push({
            description: `Could not inject ${artifact.type} into ${path} (<head> not found)`,
            snippet: artifact.content,
          });
        }
      } else {
        manualItems.push({
          description: `Add ${artifact.type} to your page <head> (no HTML template detected)`,
          snippet: artifact.content,
        });
      }
    }
  }

  const files = Array.from(fileMap.entries()).map(([path, content]) => ({ path, content }));
  return { files, manualItems };
}

/**
 * Create a branch, commit a set of file changes, and open a PR.
 * Returns the PR URL.
 */
export async function createBranchAndPR(opts: {
  token: string;
  owner: string;
  repo: string;
  baseSha: string;
  baseBranch: string;
  branchName: string;
  files: Array<{ path: string; content: string }>;
  prTitle: string;
  prBody: string;
}): Promise<string> {
  const { token, owner, repo, baseSha, baseBranch, branchName, files, prTitle, prBody } = opts;

  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  // 0. Resolve commit SHA → tree SHA.
  //    The GitHub Trees API requires a tree SHA for base_tree, NOT a commit SHA.
  const commitObjRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits/${baseSha}`,
    { headers: ghHeaders, signal: AbortSignal.timeout(8000) },
  );
  if (!commitObjRes.ok) {
    const body = (await commitObjRes.json().catch(() => ({}))) as GitHubErrorBody;
    throw new Error(`Failed to resolve base commit: ${body.message ?? commitObjRes.status}`);
  }
  const commitObj = (await commitObjRes.json()) as { tree: { sha: string } };
  const baseTreeSha = commitObj.tree.sha;

  // 1. Create blobs for each file
  const treeItems = await Promise.all(
    files.map(async (file) => {
      const blobRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
        {
          method: 'POST',
          headers: ghHeaders,
          body: JSON.stringify({ content: file.content, encoding: 'utf-8' }),
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!blobRes.ok) {
        const body = (await blobRes.json().catch(() => ({}))) as GitHubErrorBody;
        throw new Error(`Failed to create blob for ${file.path}: ${body.message ?? blobRes.status}`);
      }
      const blob = (await blobRes.json()) as { sha: string };
      return { path: file.path, mode: '100644' as const, type: 'blob' as const, sha: blob.sha };
    }),
  );

  // 2. Create a new tree (base_tree must be the tree SHA, not the commit SHA)
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees`,
    {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!treeRes.ok) {
    const body = (await treeRes.json().catch(() => ({}))) as GitHubErrorBody;
    throw new Error(`Failed to create git tree: ${body.message ?? treeRes.status}`);
  }
  const tree = (await treeRes.json()) as { sha: string };

  // 3. Create the commit
  const commitRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits`,
    {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({
        message: prTitle,
        tree: tree.sha,
        parents: [baseSha],
      }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!commitRes.ok) {
    const body = (await commitRes.json().catch(() => ({}))) as GitHubErrorBody;
    throw new Error(`Failed to create commit: ${body.message ?? commitRes.status}`);
  }
  const commit = (await commitRes.json()) as { sha: string };

  // 4. Create the branch ref
  const refRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs`,
    {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: commit.sha }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!refRes.ok) {
    const body = (await refRes.json().catch(() => ({}))) as GitHubErrorBody;
    throw new Error(`Failed to create branch ref: ${body.message ?? refRes.status}`);
  }

  // 5. Open the PR
  const prRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({
        title: prTitle,
        body: prBody,
        head: branchName,
        base: baseBranch,
      }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!prRes.ok) {
    const body = (await prRes.json().catch(() => ({}))) as GitHubErrorBody;
    throw new Error(`Failed to open PR: ${body.message ?? prRes.status}`);
  }
  const pr = (await prRes.json()) as { html_url: string };
  return pr.html_url;
}
