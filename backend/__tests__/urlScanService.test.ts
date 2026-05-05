import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { scanUrlForTechnicalSignals } from '../services/urlScanService';

// ─── Mock global fetch for the llms.txt HEAD probe ───────────────────────────
// Each test can override `llmsTxtOk` to control whether /llms.txt is "found".
let llmsTxtOk = false;
const fetchMock = vi.fn(async (input: any, _init?: any) => {
  const url = typeof input === 'string' ? input : input?.url || String(input);
  if (url.endsWith('/llms.txt')) {
    return new Response(null, { status: llmsTxtOk ? 200 : 404 });
  }
  return new Response(null, { status: 404 });
});

beforeEach(() => {
  llmsTxtOk = false;
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const wrap = (body: string, head = '') => `
<!doctype html>
<html>
  <head>
    <title>Test page title</title>
    ${head}
  </head>
  <body>${body}</body>
</html>`;

describe('scanUrlForTechnicalSignals — schema markup', () => {
  it('detects no schema when no JSON-LD scripts present', async () => {
    const r = await scanUrlForTechnicalSignals(wrap('<p>hello</p>'), 'https://x.test/');
    expect(r.signals.hasSchemaMarkup).toBe(false);
    expect(r.signals.schemaTypes).toEqual([]);
    expect(r.signals.hasFaqSchema).toBe(false);
    expect(r.signals.hasArticleSchema).toBe(false);
    expect(r.signals.hasProductSchema).toBe(false);
  });

  it('detects FAQPage schema', async () => {
    const ld = `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
    })}</script>`;
    const r = await scanUrlForTechnicalSignals(wrap('<p>hi</p>', ld), 'https://x.test/');
    expect(r.signals.hasSchemaMarkup).toBe(true);
    expect(r.signals.hasFaqSchema).toBe(true);
    expect(r.signals.schemaTypes).toContain('FAQPage');
  });

  it('detects Article / BlogPosting / NewsArticle as article schema', async () => {
    for (const type of ['Article', 'BlogPosting', 'NewsArticle']) {
      const ld = `<script type="application/ld+json">${JSON.stringify({
        '@type': type,
      })}</script>`;
      const r = await scanUrlForTechnicalSignals(wrap('<p>hi</p>', ld), 'https://x.test/');
      expect(r.signals.hasArticleSchema, `for ${type}`).toBe(true);
    }
  });

  it('detects Product schema', async () => {
    const ld = `<script type="application/ld+json">${JSON.stringify({ '@type': 'Product' })}</script>`;
    const r = await scanUrlForTechnicalSignals(wrap('<p>hi</p>', ld), 'https://x.test/');
    expect(r.signals.hasProductSchema).toBe(true);
  });

  it('handles array @type values', async () => {
    const ld = `<script type="application/ld+json">${JSON.stringify({
      '@type': ['Article', 'FAQPage'],
    })}</script>`;
    const r = await scanUrlForTechnicalSignals(wrap('<p>hi</p>', ld), 'https://x.test/');
    expect(r.signals.hasArticleSchema).toBe(true);
    expect(r.signals.hasFaqSchema).toBe(true);
  });

  it('skips malformed JSON-LD without throwing', async () => {
    const ld = `<script type="application/ld+json">{not valid json}</script>`;
    const r = await scanUrlForTechnicalSignals(wrap('<p>hi</p>', ld), 'https://x.test/');
    expect(r.signals.hasSchemaMarkup).toBe(false);
    expect(r.signals.schemaTypes).toEqual([]);
  });
});

describe('scanUrlForTechnicalSignals — semantic HTML & headings', () => {
  it('flags semantic HTML when 2+ semantic tags present', async () => {
    const html = wrap('<header>h</header><main><article>a</article></main>');
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/');
    expect(r.signals.hasSemanticHtml).toBe(true);
    expect(r.signals.semanticTagsFound).toEqual(
      expect.arrayContaining(['article', 'main', 'header'])
    );
  });

  it('does not flag semantic HTML when fewer than 2 semantic tags present', async () => {
    const html = wrap('<header>h</header><div>just a div</div>');
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/');
    expect(r.signals.hasSemanticHtml).toBe(false);
  });

  it('counts headings and detects proper hierarchy (one h1 + at least one h2)', async () => {
    const html = wrap('<h1>One</h1><h2>Two</h2><h3>Three</h3>');
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/');
    expect(r.signals.headingCount).toBe(3);
    expect(r.signals.hasProperHeadingHierarchy).toBe(true);
  });

  it('rejects hierarchy when there are zero or multiple h1 tags', async () => {
    const noH1 = await scanUrlForTechnicalSignals(wrap('<h2>Two</h2>'), 'https://x.test/');
    expect(noH1.signals.hasProperHeadingHierarchy).toBe(false);

    const twoH1 = await scanUrlForTechnicalSignals(
      wrap('<h1>A</h1><h1>B</h1><h2>C</h2>'),
      'https://x.test/'
    );
    expect(twoH1.signals.hasProperHeadingHierarchy).toBe(false);
  });

  it('rejects hierarchy when h1 exists but no h2', async () => {
    const r = await scanUrlForTechnicalSignals(wrap('<h1>Only</h1>'), 'https://x.test/');
    expect(r.signals.hasProperHeadingHierarchy).toBe(false);
  });
});

describe('scanUrlForTechnicalSignals — meta tags & title', () => {
  it('reports meta description length and OG/canonical presence', async () => {
    const head = `
      <meta name="description" content="a useful description for SEO indexing." />
      <link rel="canonical" href="https://x.test/" />
      <meta property="og:title" content="Title" />
      <meta property="og:description" content="Desc" />
    `;
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>', head), 'https://x.test/');
    expect(r.signals.hasMetaDescription).toBe(true);
    expect(r.signals.metaDescriptionLength).toBe(
      'a useful description for SEO indexing.'.length
    );
    expect(r.signals.hasCanonicalTag).toBe(true);
    expect(r.signals.hasOpenGraphTags).toBe(true);
    expect(r.signals.titleLength).toBe('Test page title'.length);
  });

  it('reports false for absent meta tags', async () => {
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.signals.hasMetaDescription).toBe(false);
    expect(r.signals.metaDescriptionLength).toBe(0);
    expect(r.signals.hasCanonicalTag).toBe(false);
    expect(r.signals.hasOpenGraphTags).toBe(false);
  });
});

describe('scanUrlForTechnicalSignals — JS rendering detection', () => {
  it('flags pages with tiny body text and many script tags as JS-rendered', async () => {
    const scripts = '<script>1</script>'.repeat(6);
    const html = wrap(`<div id="root"></div>${scripts}`);
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/');
    expect(r.signals.isJsRendered).toBe(true);
    expect(r.signals.jsRenderingWarning).toMatch(/AI crawlers/i);
  });

  it('does not flag content-rich pages as JS-rendered', async () => {
    const longText = 'word '.repeat(200); // > 200 chars body text
    const r = await scanUrlForTechnicalSignals(wrap(`<p>${longText}</p>`), 'https://x.test/');
    expect(r.signals.isJsRendered).toBe(false);
    expect(r.signals.jsRenderingWarning).toBeNull();
  });
});

describe('scanUrlForTechnicalSignals — llms.txt probe', () => {
  it('records hasLlmsTxt=true when /llms.txt responds 200, and uses a HEAD request to the host root', async () => {
    llmsTxtOk = true;
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/some/path');
    expect(r.signals.hasLlmsTxt).toBe(true);
    // verify the probe URL is the host root, not the page URL
    const [calledUrl, calledInit] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toBe('https://x.test/llms.txt');
    // verify it's a HEAD request — we don't need the body, only existence
    expect((calledInit as RequestInit | undefined)?.method).toBe('HEAD');
  });

  it('records hasLlmsTxt=false when /llms.txt 404s', async () => {
    llmsTxtOk = false;
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.signals.hasLlmsTxt).toBe(false);
  });

  it('records hasLlmsTxt=false when the probe throws (network error)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('boom'));
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.signals.hasLlmsTxt).toBe(false);
  });
});

describe('scanUrlForTechnicalSignals — images & alt text', () => {
  it('counts images and computes the missing-alt ratio', async () => {
    const body = `
      <img src="a.png" alt="a cat" />
      <img src="b.png" alt="" />
      <img src="c.png" />
      <img src="d.png" alt="dog" />
    `;
    const r = await scanUrlForTechnicalSignals(wrap(body), 'https://x.test/');
    expect(r.signals.totalImages).toBe(4);
    expect(r.signals.imagesWithAltText).toBe(2);
    expect(r.signals.missingAltTextRatio).toBeCloseTo(0.5, 5);
  });

  it('returns missingAltTextRatio=0 when there are no images', async () => {
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.signals.totalImages).toBe(0);
    expect(r.signals.missingAltTextRatio).toBe(0);
  });
});

describe('scanUrlForTechnicalSignals — links & anchor text', () => {
  it('classifies internal vs external links and detects generic anchors', async () => {
    const body = `
      <a href="/about">About us</a>
      <a href="https://x.test/contact">Contact</a>
      <a href="https://other.test/page">click here</a>
      <a href="https://other.test/page2">Detailed external resource</a>
    `;
    const r = await scanUrlForTechnicalSignals(wrap(body), 'https://x.test/');
    expect(r.signals.internalLinkCount).toBe(2);
    expect(r.signals.externalLinkCount).toBe(2);
    expect(r.signals.hasDescriptiveAnchors).toBe(false);
  });

  it('flags hasDescriptiveAnchors=true when no generic terms appear', async () => {
    const body = `
      <a href="/about">Our company history</a>
      <a href="https://other.test/p">Detailed industry report</a>
    `;
    const r = await scanUrlForTechnicalSignals(wrap(body), 'https://x.test/');
    expect(r.signals.hasDescriptiveAnchors).toBe(true);
  });
});

describe('scanUrlForTechnicalSignals — text extraction', () => {
  it('prefers <article> over <body> when present', async () => {
    const body = `
      <nav>NAV NAV NAV</nav>
      <article>The actual article content lives here.</article>
      <footer>FOOTER FOOTER</footer>
    `;
    const r = await scanUrlForTechnicalSignals(wrap(body), 'https://x.test/');
    expect(r.extractedText).toContain('actual article content');
    expect(r.extractedText).not.toContain('NAV NAV');
    expect(r.extractedText).not.toContain('FOOTER FOOTER');
  });

  it('strips script/style and nav-like wrappers from body fallback', async () => {
    const body = `
      <div class="sidebar">SIDEBAR JUNK</div>
      <script>var stripped = true;</script>
      <style>.x{}</style>
      <p>Real body paragraph content.</p>
    `;
    const r = await scanUrlForTechnicalSignals(wrap(body), 'https://x.test/');
    expect(r.extractedText).toContain('Real body paragraph');
    expect(r.extractedText).not.toContain('SIDEBAR JUNK');
    expect(r.extractedText).not.toContain('stripped');
  });

  it('caps word count at 8000 and appends a truncation marker', async () => {
    const longBody = `<article>${'word '.repeat(9000)}</article>`;
    const r = await scanUrlForTechnicalSignals(wrap(longBody), 'https://x.test/');
    expect(r.signals.wordCount).toBe(8000);
    expect(r.extractedText.endsWith('[truncated]')).toBe(true);
  });
});

describe('scanUrlForTechnicalSignals — recommendations', () => {
  it('emits a high-severity schema rec with a JSON-LD artifact when schema is missing', async () => {
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    const rec = r.recommendations.find((x) => x.issue === 'Missing schema markup');
    expect(rec).toBeDefined();
    expect(rec!.severity).toBe('high');
    expect(rec!.artifact?.type).toBe('json-ld');
    expect(rec!.artifact?.content).toContain('application/ld+json');
  });

  it('emits an llms.txt rec with an llms-txt artifact when the file is absent', async () => {
    llmsTxtOk = false;
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    const rec = r.recommendations.find((x) => x.issue === 'llms.txt absent');
    expect(rec).toBeDefined();
    expect(rec!.artifact?.type).toBe('llms-txt');
    expect(rec!.artifact?.content).toContain('# x.test');
  });

  it('does not emit the llms.txt rec when /llms.txt exists', async () => {
    llmsTxtOk = true;
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.recommendations.find((x) => x.issue === 'llms.txt absent')).toBeUndefined();
  });

  it('emits the JS-rendered critical rec with a robots-txt artifact', async () => {
    const scripts = '<script>1</script>'.repeat(6);
    const r = await scanUrlForTechnicalSignals(
      wrap(`<div id="root"></div>${scripts}`),
      'https://x.test/'
    );
    const rec = r.recommendations.find((x) =>
      x.issue.includes('JavaScript-rendered')
    );
    expect(rec).toBeDefined();
    expect(rec!.severity).toBe('high');
    expect(rec!.artifact?.type).toBe('robots-txt');
    expect(rec!.artifact?.content).toContain('GPTBot');
  });

  it('emits an alt-text rec only when missing-alt ratio exceeds 30%', async () => {
    // 1/4 missing → 25% → no rec
    const lowBody = `
      <img src="a.png" alt="a" /><img src="b.png" alt="b" />
      <img src="c.png" alt="c" /><img src="d.png" />
    `;
    const low = await scanUrlForTechnicalSignals(wrap(lowBody), 'https://x.test/');
    expect(low.recommendations.find((x) => x.issue === 'Images missing alt text')).toBeUndefined();

    // 3/4 missing → 75% → rec emitted
    const highBody = `
      <img src="a.png" alt="a" /><img src="b.png" />
      <img src="c.png" /><img src="d.png" />
    `;
    const high = await scanUrlForTechnicalSignals(wrap(highBody), 'https://x.test/');
    const rec = high.recommendations.find((x) => x.issue === 'Images missing alt text');
    expect(rec).toBeDefined();
    expect(rec!.recommendation).toMatch(/75%/);
  });

  it('skips most recs when all signals are healthy', async () => {
    llmsTxtOk = true;
    const head = `
      <meta name="description" content="A great descriptive meta description for SEO." />
      <link rel="canonical" href="https://x.test/" />
      <meta property="og:title" content="t" />
      <script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
      })}</script>
    `;
    const body = `
      <header>H</header>
      <main><article>
        <h1>One</h1>
        <h2>Two</h2>
        <p>${'word '.repeat(60)}</p>
        <a href="/about">Our detailed company background</a>
      </article></main>
      <footer>F</footer>
    `;
    const r = await scanUrlForTechnicalSignals(wrap(body, head), 'https://x.test/');
    expect(r.recommendations).toEqual([]);
  });
});
