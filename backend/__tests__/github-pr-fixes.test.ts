import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { User } from '../types';

// ─── Mock dbService so we never touch a real database ────────────────────────
const findUserByApiKey = vi.fn();
const getUserGithubToken = vi.fn();

vi.mock('../services/dbService', () => ({
  findUserByApiKey: (...args: unknown[]) => findUserByApiKey(...args),
  getUserGithubToken: (...args: unknown[]) => getUserGithubToken(...args),
}));

// ─── Mock global fetch for GitHub API calls ───────────────────────────────────
const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  findUserByApiKey.mockReset();
  getUserGithubToken.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── Shared fixtures ──────────────────────────────────────────────────────────
const baseUser: User = {
  id: 'user-1',
  email: 'user@example.com',
  apiKey: 'valid-key',
  githubId: 'gh-123',
  githubLogin: 'testuser',
  subscriptionStatus: 'active',
  usage: { count: 0, limit: 100 },
  createdAt: new Date(),
};

const userWithoutGithub: User = {
  ...baseUser,
  githubId: undefined,
  githubLogin: undefined,
};

const SIMPLE_HTML = `<!doctype html>
<html>
  <head>
    <title>My Site</title>
  </head>
  <body><p>Hello</p></body>
</html>`;

const HTML_NO_HEAD = `<!doctype html>
<html>
  <body><p>Hello</p></body>
</html>`;

// Helper to make a GitHub Contents API response (base64-encoded)
function makeContentsResponse(content: string, sha = 'abc123') {
  const encoded = Buffer.from(content).toString('base64');
  return { status: 200, ok: true, json: async () => ({ content: encoded, sha }) };
}

function make404() {
  return { status: 404, ok: false, json: async () => ({ message: 'Not Found' }) };
}

function makeOk(body: object) {
  return { status: 200, ok: true, json: async () => body };
}

function makeCreated(body: object) {
  return { status: 201, ok: true, json: async () => body };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. injectIntoHead — unit tests
// ─────────────────────────────────────────────────────────────────────────────
describe('injectIntoHead — pure utility', () => {
  // Import directly from the service (no mocking needed)
  let injectIntoHead: (html: string, snippet: string) => string | null;

  beforeAll(async () => {
    ({ injectIntoHead } = await import('../services/githubPatchService'));
  });

  it('returns null when there is no </head> tag', () => {
    const result = injectIntoHead(HTML_NO_HEAD, '<meta name="x" content="y" />');
    expect(result).toBeNull();
  });

  it('injects snippet just before </head> in a populated head', () => {
    const snippet = '<meta name="robots" content="index,follow" />';
    const result = injectIntoHead(SIMPLE_HTML, snippet);
    expect(result).not.toBeNull();
    // Snippet appears before </head>
    const closeHeadIdx = result!.indexOf('</head>');
    const snippetIdx = result!.indexOf('robots');
    expect(snippetIdx).toBeLessThan(closeHeadIdx);
    // Original content is preserved
    expect(result).toContain('<title>My Site</title>');
    expect(result).toContain('<body><p>Hello</p></body>');
  });

  it('injects snippet before </head> in a minimal empty head', () => {
    const minimal = '<html><head></head><body></body></html>';
    const snippet = '<link rel="canonical" href="https://x.test/" />';
    const result = injectIntoHead(minimal, snippet);
    expect(result).not.toBeNull();
    expect(result).toContain(snippet);
    const closeHeadIdx = result!.indexOf('</head>');
    const snippetIdx = result!.indexOf('canonical');
    expect(snippetIdx).toBeLessThan(closeHeadIdx);
  });

  it('indents every line of a multi-line snippet', () => {
    const snippet = '<script>\nconsole.log(1);\n</script>';
    const result = injectIntoHead(SIMPLE_HTML, snippet);
    expect(result).not.toBeNull();
    // Each line of the snippet should be indented with two spaces
    expect(result).toContain('  <script>');
    expect(result).toContain('  console.log(1);');
    expect(result).toContain('  </script>');
  });

  it('handles </head> that appears only once — does not duplicate it', () => {
    const result = injectIntoHead(SIMPLE_HTML, '<meta name="foo" content="bar" />');
    expect(result!.split('</head>').length - 1).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /api/github/preview-fixes
// ─────────────────────────────────────────────────────────────────────────────
let previewApp: express.Express;

beforeAll(async () => {
  const handler = (await import('../api/github/preview-fixes')).default;
  previewApp = express();
  previewApp.use(express.json());
  previewApp.post('/api/github/preview-fixes', handler);
});

describe('POST /api/github/preview-fixes — auth & connection errors', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .send({ repoFullName: 'owner/repo', artifacts: [{ type: 'llms-txt', content: 'hello' }] });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
    expect(findUserByApiKey).not.toHaveBeenCalled();
  });

  it('returns 401 when the API key is not recognized', async () => {
    findUserByApiKey.mockResolvedValueOnce(null);
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer bad-key')
      .send({ repoFullName: 'owner/repo', artifacts: [{ type: 'llms-txt', content: 'hello' }] });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  it('returns 400 when the user has no GitHub account connected', async () => {
    findUserByApiKey.mockResolvedValueOnce(userWithoutGithub);
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({ repoFullName: 'owner/repo', artifacts: [{ type: 'llms-txt', content: 'hello' }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('not_connected');
  });

  it('returns 400 when repoFullName is missing', async () => {
    findUserByApiKey.mockResolvedValueOnce(baseUser);
    getUserGithubToken.mockResolvedValueOnce('gh-token');
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({ artifacts: [{ type: 'llms-txt', content: 'hello' }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
  });

  it('returns 400 when artifacts array is empty', async () => {
    findUserByApiKey.mockResolvedValueOnce(baseUser);
    getUserGithubToken.mockResolvedValueOnce('gh-token');
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({ repoFullName: 'owner/repo', artifacts: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
  });

  it('returns 400 when repoFullName is not in owner/repo format', async () => {
    findUserByApiKey.mockResolvedValueOnce(baseUser);
    getUserGithubToken.mockResolvedValueOnce('gh-token');
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({ repoFullName: 'badformat', artifacts: [{ type: 'llms-txt', content: 'x' }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
  });

  it('returns 400 when the GitHub token is not found', async () => {
    findUserByApiKey.mockResolvedValueOnce(baseUser);
    getUserGithubToken.mockResolvedValueOnce(null);
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({ repoFullName: 'owner/repo', artifacts: [{ type: 'llms-txt', content: 'x' }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('not_connected');
  });
});

describe('POST /api/github/preview-fixes — artifact classification', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
    getUserGithubToken.mockResolvedValue('gh-token');
  });

  it('classifies llms-txt artifact as "create" without hitting GitHub', async () => {
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        artifacts: [{ type: 'llms-txt', content: '# LLMs.txt content' }],
      });
    expect(res.status).toBe(200);
    expect(res.body.toCreate).toHaveLength(1);
    expect(res.body.toPatch).toHaveLength(0);
    expect(res.body.manual).toHaveLength(0);
    const item = res.body.toCreate[0];
    expect(item.type).toBe('create');
    expect(item.artifactType).toBe('llms-txt');
    expect(item.path).toBe('llms.txt');
    expect(item.content).toBe('# LLMs.txt content');
  });

  it('classifies robots-txt as "patch" when robots.txt already exists in the repo', async () => {
    fetchMock.mockResolvedValueOnce(makeContentsResponse('User-agent: *\nAllow: /\n'));

    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        artifacts: [{ type: 'robots-txt', content: 'User-agent: GPTBot\nDisallow:' }],
      });
    expect(res.status).toBe(200);
    expect(res.body.toPatch).toHaveLength(1);
    expect(res.body.toCreate).toHaveLength(0);
    const item = res.body.toPatch[0];
    expect(item.type).toBe('patch');
    expect(item.path).toBe('robots.txt');
    expect(item.originalContent).toContain('User-agent: *');
    expect(item.patchedContent).toContain('GPTBot');
  });

  it('classifies robots-txt as "create" when robots.txt does not exist in the repo', async () => {
    fetchMock.mockResolvedValueOnce(make404());

    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        artifacts: [{ type: 'robots-txt', content: 'User-agent: GPTBot\nDisallow:' }],
      });
    expect(res.status).toBe(200);
    expect(res.body.toCreate).toHaveLength(1);
    expect(res.body.toPatch).toHaveLength(0);
    const item = res.body.toCreate[0];
    expect(item.type).toBe('create');
    expect(item.path).toBe('robots.txt');
  });

  it('classifies json-ld as "patch" when an HTML template is found in the repo', async () => {
    // First call probes public/index.html → found
    fetchMock.mockResolvedValueOnce(makeContentsResponse(SIMPLE_HTML));

    const jsonLd = '<script type="application/ld+json">{"@type":"WebSite"}</script>';
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        artifacts: [{ type: 'json-ld', content: jsonLd }],
      });
    expect(res.status).toBe(200);
    expect(res.body.toPatch).toHaveLength(1);
    expect(res.body.manual).toHaveLength(0);
    const item = res.body.toPatch[0];
    expect(item.type).toBe('patch');
    expect(item.artifactType).toBe('json-ld');
    expect(item.originalContent).toContain('<title>My Site</title>');
    expect(item.patchedContent).toContain('@type');
  });

  it('classifies json-ld as "manual" when no HTML template is found anywhere in the repo', async () => {
    // All COMMON_TEMPLATE_PATHS return 404
    fetchMock.mockResolvedValue(make404());

    const jsonLd = '<script type="application/ld+json">{"@type":"WebSite"}</script>';
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        artifacts: [{ type: 'json-ld', content: jsonLd }],
      });
    expect(res.status).toBe(200);
    expect(res.body.manual).toHaveLength(1);
    expect(res.body.toPatch).toHaveLength(0);
    const item = res.body.manual[0];
    expect(item.type).toBe('manual');
    expect(item.description).toMatch(/no HTML template detected/i);
    expect(item.snippet).toBe(jsonLd);
  });

  it('classifies html artifact as "manual" when template has no </head> tag', async () => {
    // Template found but has no </head>
    fetchMock.mockResolvedValueOnce(makeContentsResponse(HTML_NO_HEAD));

    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        artifacts: [{ type: 'html', content: '<meta name="foo" content="bar" />' }],
      });
    expect(res.status).toBe(200);
    expect(res.body.manual).toHaveLength(1);
    expect(res.body.manual[0].type).toBe('manual');
    expect(res.body.manual[0].description).toMatch(/<head> not found/i);
  });

  it('produces separate patch items that both target the same template path (same-file merging happens at push time)', async () => {
    fetchMock.mockResolvedValue(makeContentsResponse(SIMPLE_HTML));

    const jsonLd = '<script type="application/ld+json">{"@type":"WebSite"}</script>';
    const htmlSnippet = '<meta name="theme-color" content="#fff" />';
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        artifacts: [
          { type: 'json-ld', content: jsonLd },
          { type: 'html', content: htmlSnippet },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.toPatch).toHaveLength(2);
    // Both patch items resolve to the same template path —
    // push-fixes will merge them into a single file commit.
    const paths = res.body.toPatch.map((item: { path: string }) => item.path);
    expect(paths[0]).toBe(paths[1]);
    // Each item shows an independent diff against the unmodified original
    expect(res.body.toPatch[0].originalContent).toBe(res.body.toPatch[1].originalContent);
    expect(res.body.toPatch[0].patchedContent).not.toBe(res.body.toPatch[1].patchedContent);
  });

  it('probes the template only once for multiple html/json-ld artifacts (caching)', async () => {
    // Only one fetch call should be made for template discovery
    fetchMock.mockResolvedValue(makeContentsResponse(SIMPLE_HTML));

    const jsonLd = '<script type="application/ld+json">{"@type":"WebSite"}</script>';
    const htmlSnippet = '<meta name="theme-color" content="#fff" />';
    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        artifacts: [
          { type: 'json-ld', content: jsonLd },
          { type: 'html', content: htmlSnippet },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.toPatch).toHaveLength(2);
    // fetchMock should have been called exactly once (template discovery, cached after)
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('assigns stable sequential ids to artifacts', async () => {
    fetchMock.mockResolvedValue(make404());

    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        artifacts: [
          { type: 'llms-txt', content: 'a' },
          { type: 'llms-txt', content: 'b' },
          { type: 'llms-txt', content: 'c' },
        ],
      });
    expect(res.status).toBe(200);
    const ids = res.body.toCreate.map((i: { id: string }) => i.id);
    expect(ids).toEqual(['0', '1', '2']);
  });
});

describe('POST /api/github/preview-fixes — GitHub API error handling', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
    getUserGithubToken.mockResolvedValue('gh-token');
  });

  it('returns 429 when GitHub returns a rate-limit error', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 403,
      ok: false,
      json: async () => ({ message: 'API rate limit exceeded' }),
    });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(previewApp)
      .post('/api/github/preview-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        artifacts: [{ type: 'robots-txt', content: 'User-agent: *' }],
      });
    expect(res.status).toBe(429);
    expect(res.body.error).toBe('rate_limit');

    consoleErrorSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/github/push-fixes
// ─────────────────────────────────────────────────────────────────────────────
let pushApp: express.Express;

beforeAll(async () => {
  const handler = (await import('../api/github/push-fixes')).default;
  pushApp = express();
  pushApp.use(express.json());
  pushApp.post('/api/github/push-fixes', handler);
});

describe('POST /api/github/push-fixes — auth & validation errors', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .send({ repoFullName: 'owner/repo', approvedIds: ['0'], artifacts: [{ type: 'llms-txt', content: 'x' }] });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  it('returns 401 when the API key is not recognized', async () => {
    findUserByApiKey.mockResolvedValueOnce(null);
    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer bad-key')
      .send({ repoFullName: 'owner/repo', approvedIds: ['0'], artifacts: [{ type: 'llms-txt', content: 'x' }] });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  it('returns 400 when the user has no GitHub account connected', async () => {
    findUserByApiKey.mockResolvedValueOnce(userWithoutGithub);
    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({ repoFullName: 'owner/repo', approvedIds: ['0'], artifacts: [{ type: 'llms-txt', content: 'x' }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('not_connected');
  });

  it('returns 400 when approvedIds is missing', async () => {
    findUserByApiKey.mockResolvedValueOnce(baseUser);
    getUserGithubToken.mockResolvedValueOnce('gh-token');
    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({ repoFullName: 'owner/repo', artifacts: [{ type: 'llms-txt', content: 'x' }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
  });

  it('returns 400 when approvedIds is an empty array', async () => {
    findUserByApiKey.mockResolvedValueOnce(baseUser);
    getUserGithubToken.mockResolvedValueOnce('gh-token');
    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({ repoFullName: 'owner/repo', approvedIds: [], artifacts: [{ type: 'llms-txt', content: 'x' }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
  });

  it('returns 400 when artifacts array is missing', async () => {
    findUserByApiKey.mockResolvedValueOnce(baseUser);
    getUserGithubToken.mockResolvedValueOnce('gh-token');
    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({ repoFullName: 'owner/repo', approvedIds: ['0'] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
  });
});

describe('POST /api/github/push-fixes — no valid artifacts to commit', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
    getUserGithubToken.mockResolvedValue('gh-token');
  });

  it('returns 400 when no artifact indices match the provided approvedIds', async () => {
    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        approvedIds: ['99'],
        artifacts: [{ type: 'llms-txt', content: 'x' }],
        scannedUrl: 'https://example.com',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('bad_request');
    expect(res.body.message).toMatch(/no valid artifacts/i);
  });

  it('returns 400 when all approved artifacts are manual-only (no template found)', async () => {
    // All template path probes return 404 → manualItems only, no files
    fetchMock.mockResolvedValue(make404());

    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        approvedIds: ['0'],
        artifacts: [{ type: 'json-ld', content: '<script type="application/ld+json">{"@type":"WebSite"}</script>' }],
        scannedUrl: 'https://example.com',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('no_file_changes');
    expect(res.body.message).toMatch(/manual steps/i);
  });
});

describe('POST /api/github/push-fixes — successful PR creation', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
    getUserGithubToken.mockResolvedValue('gh-token');
  });

  it('creates a branch and PR for an llms-txt artifact and returns the PR URL', async () => {
    // computeApprovedFileChanges for llms-txt: no fetch needed
    // getDefaultBranch: two calls (repo info + ref)
    fetchMock
      .mockResolvedValueOnce(makeOk({ default_branch: 'main' }))
      .mockResolvedValueOnce(makeOk({ object: { sha: 'base-sha-001' } }))
      // createBranchAndPR: resolve commit object
      .mockResolvedValueOnce(makeOk({ tree: { sha: 'tree-sha-001' } }))
      // create blob
      .mockResolvedValueOnce(makeCreated({ sha: 'blob-sha-001' }))
      // create tree
      .mockResolvedValueOnce(makeCreated({ sha: 'new-tree-sha' }))
      // create commit
      .mockResolvedValueOnce(makeCreated({ sha: 'new-commit-sha' }))
      // create ref (branch)
      .mockResolvedValueOnce(makeCreated({ ref: 'refs/heads/aiseo-fixes/123' }))
      // create PR
      .mockResolvedValueOnce(makeCreated({ html_url: 'https://github.com/owner/repo/pull/42' }));

    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        approvedIds: ['0'],
        artifacts: [{ type: 'llms-txt', content: '# My site\n> AI guide' }],
        scannedUrl: 'https://example.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.prUrl).toBe('https://github.com/owner/repo/pull/42');
  });

  it('merges multiple html/json-ld patches on the same template file into one file commit', async () => {
    // computeApprovedFileChanges: one template probe (cached), no robots.txt fetch
    fetchMock
      // template probe → found
      .mockResolvedValueOnce(makeContentsResponse(SIMPLE_HTML))
      // getDefaultBranch: repo info
      .mockResolvedValueOnce(makeOk({ default_branch: 'main' }))
      // getDefaultBranch: ref
      .mockResolvedValueOnce(makeOk({ object: { sha: 'base-sha-002' } }))
      // createBranchAndPR: resolve commit
      .mockResolvedValueOnce(makeOk({ tree: { sha: 'tree-sha-002' } }))
      // create blob (only ONE blob for the merged file)
      .mockResolvedValueOnce(makeCreated({ sha: 'blob-sha-002' }))
      // create tree
      .mockResolvedValueOnce(makeCreated({ sha: 'new-tree-sha-2' }))
      // create commit
      .mockResolvedValueOnce(makeCreated({ sha: 'new-commit-sha-2' }))
      // create ref
      .mockResolvedValueOnce(makeCreated({ ref: 'refs/heads/aiseo-fixes/456' }))
      // create PR
      .mockResolvedValueOnce(makeCreated({ html_url: 'https://github.com/owner/repo/pull/43' }));

    const jsonLd = '<script type="application/ld+json">{"@type":"WebSite"}</script>';
    const htmlSnippet = '<meta name="theme-color" content="#fff" />';

    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        approvedIds: ['0', '1'],
        artifacts: [
          { type: 'json-ld', content: jsonLd },
          { type: 'html', content: htmlSnippet },
        ],
        scannedUrl: 'https://example.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.prUrl).toBe('https://github.com/owner/repo/pull/43');

    // Verify only ONE blob was created (both snippets merged into the same file)
    const blobCalls = fetchMock.mock.calls.filter(([url]: [string]) =>
      typeof url === 'string' && url.includes('/git/blobs')
    );
    expect(blobCalls).toHaveLength(1);

    // The blob content should contain both snippets
    const blobBody = JSON.parse(blobCalls[0][1].body);
    expect(blobBody.content).toContain('@type');
    expect(blobBody.content).toContain('theme-color');
  });

  it('only commits artifacts whose IDs appear in approvedIds — ignores others', async () => {
    // artifacts[0] = llms-txt (approved), artifacts[1] = llms-txt (not approved)
    fetchMock
      .mockResolvedValueOnce(makeOk({ default_branch: 'main' }))
      .mockResolvedValueOnce(makeOk({ object: { sha: 'base-sha-003' } }))
      .mockResolvedValueOnce(makeOk({ tree: { sha: 'tree-sha-003' } }))
      .mockResolvedValueOnce(makeCreated({ sha: 'blob-sha-003' }))
      .mockResolvedValueOnce(makeCreated({ sha: 'new-tree-sha-3' }))
      .mockResolvedValueOnce(makeCreated({ sha: 'new-commit-sha-3' }))
      .mockResolvedValueOnce(makeCreated({ ref: 'refs/heads/aiseo-fixes/789' }))
      .mockResolvedValueOnce(makeCreated({ html_url: 'https://github.com/owner/repo/pull/44' }));

    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        approvedIds: ['0'],
        artifacts: [
          { type: 'llms-txt', content: 'approved content' },
          { type: 'llms-txt', content: 'not approved content' },
        ],
        scannedUrl: 'https://example.com',
      });

    expect(res.status).toBe(200);
    // Only one blob should have been created
    const blobCalls = fetchMock.mock.calls.filter(([url]: [string]) =>
      typeof url === 'string' && url.includes('/git/blobs')
    );
    expect(blobCalls).toHaveLength(1);
    const blobBody = JSON.parse(blobCalls[0][1].body);
    expect(blobBody.content).toBe('approved content');
    expect(blobBody.content).not.toContain('not approved content');
  });
});

describe('POST /api/github/push-fixes — GitHub API error handling', () => {
  beforeEach(() => {
    findUserByApiKey.mockResolvedValue(baseUser);
    getUserGithubToken.mockResolvedValue('gh-token');
  });

  it('returns 429 when GitHub returns a rate-limit error during PR creation', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fetchMock
      // getDefaultBranch: repo info → rate limit
      .mockResolvedValueOnce({
        status: 403,
        ok: false,
        json: async () => ({ message: 'API rate limit exceeded' }),
      });

    const res = await request(pushApp)
      .post('/api/github/push-fixes')
      .set('Authorization', 'Bearer valid-key')
      .send({
        repoFullName: 'owner/repo',
        approvedIds: ['0'],
        artifacts: [{ type: 'llms-txt', content: 'x' }],
        scannedUrl: 'https://example.com',
      });

    expect(res.status).toBe(429);
    expect(res.body.error).toBe('rate_limit');

    consoleErrorSpy.mockRestore();
  });
});
