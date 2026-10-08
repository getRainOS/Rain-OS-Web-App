import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { scanUrlForTechnicalSignals, detectPlatform } from '../services/urlScanService';

// ─── Mock global fetch for the llms.txt and robots.txt probes ────────────────
// Each test can override `llmsTxtOk` / `llmsTxtBody` / `robotsTxtBody` to
// control the result. llmsTxtBody defaults to a realistic, non-thin body so
// existing "llms.txt exists" tests exercise the normal (not thin) path.
let llmsTxtOk = false;
let llmsTxtBody = '# Example Site\n\nThis file helps AI crawlers understand and navigate this site.';
let robotsTxtBody: string | null = null;
const fetchMock = vi.fn(async (input: any, _init?: any) => {
  const url = typeof input === 'string' ? input : input?.url || String(input);
  if (url.endsWith('/llms.txt')) {
    return llmsTxtOk
      ? new Response(llmsTxtBody, { status: 200 })
      : new Response(null, { status: 404 });
  }
  if (url.endsWith('/robots.txt')) {
    return robotsTxtBody === null
      ? new Response(null, { status: 404 })
      : new Response(robotsTxtBody, { status: 200 });
  }
  return new Response(null, { status: 404 });
});

beforeEach(() => {
  llmsTxtOk = false;
  llmsTxtBody = '# Example Site\n\nThis file helps AI crawlers understand and navigate this site.';
  robotsTxtBody = null;
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

  it('detects LocalBusiness schema and common subtypes', async () => {
    for (const type of ['LocalBusiness', 'Restaurant', 'ProfessionalService']) {
      const ld = `<script type="application/ld+json">${JSON.stringify({ '@type': type })}</script>`;
      const r = await scanUrlForTechnicalSignals(wrap('<p>hi</p>', ld), 'https://x.test/');
      expect(r.signals.hasLocalBusinessSchema, `for ${type}`).toBe(true);
    }
  });

  it('does not flag Product schema as LocalBusiness schema or vice versa', async () => {
    const productLd = `<script type="application/ld+json">${JSON.stringify({ '@type': 'Product' })}</script>`;
    const product = await scanUrlForTechnicalSignals(wrap('<p>hi</p>', productLd), 'https://x.test/');
    expect(product.signals.hasLocalBusinessSchema).toBe(false);

    const lbLd = `<script type="application/ld+json">${JSON.stringify({ '@type': 'LocalBusiness' })}</script>`;
    const lb = await scanUrlForTechnicalSignals(wrap('<p>hi</p>', lbLd), 'https://x.test/');
    expect(lb.signals.hasProductSchema).toBe(false);
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
  it('records hasLlmsTxt=true when /llms.txt responds 200 with real content, probing the host root', async () => {
    llmsTxtOk = true;
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/some/path');
    expect(r.signals.hasLlmsTxt).toBe(true);
    expect(r.signals.llmsTxtIsThin).toBe(false);
    // verify the probe URL is the host root, not the page URL
    const [calledUrl] = fetchMock.mock.calls[0];
    expect(String(calledUrl)).toBe('https://x.test/llms.txt');
  });

  it('records hasLlmsTxt=false when /llms.txt 404s', async () => {
    llmsTxtOk = false;
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.signals.hasLlmsTxt).toBe(false);
  });

  it('records hasLlmsTxt=true but llmsTxtIsThin=true when the file is just a bare placeholder', async () => {
    llmsTxtOk = true;
    llmsTxtBody = 'llms.txt';
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.signals.hasLlmsTxt).toBe(true);
    expect(r.signals.llmsTxtIsThin).toBe(true);
  });

  it('records hasLlmsTxt=false when the probe throws (network error)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('boom'));
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.signals.hasLlmsTxt).toBe(false);
  });
});

describe('scanUrlForTechnicalSignals — robots.txt / AI crawler access probe', () => {
  it('records hasRobotsTxt=false and all crawlers not_mentioned when robots.txt 404s', async () => {
    robotsTxtBody = null;
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.signals.hasRobotsTxt).toBe(false);
    expect(r.signals.aiCrawlerAccess.every((c) => c.access === 'not_mentioned')).toBe(true);
  });

  it('records hasRobotsTxt=true and fetches from the host root, not the page URL', async () => {
    robotsTxtBody = 'User-agent: *\nAllow: /';
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/some/path');
    expect(r.signals.hasRobotsTxt).toBe(true);
    const robotsCall = fetchMock.mock.calls.find(([u]) => String(u).endsWith('/robots.txt'));
    expect(robotsCall).toBeDefined();
    expect(String(robotsCall![0])).toBe('https://x.test/robots.txt');
  });

  it('parses explicit per-crawler blocks instead of a substring match', async () => {
    robotsTxtBody = 'User-agent: GPTBot\nDisallow: /';
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    const gptbot = r.signals.aiCrawlerAccess.find((c) => c.crawler === 'GPTBot');
    expect(gptbot?.access).toBe('blocked');
  });

  it('records hasRobotsTxt=false when the probe throws (network error)', async () => {
    // llms.txt is probed first, then robots.txt — queue a normal response for
    // the first call and a rejection for the second.
    fetchMock
      .mockImplementationOnce(async () => new Response(null, { status: 404 }))
      .mockImplementationOnce(async () => { throw new Error('boom'); });
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.signals.hasRobotsTxt).toBe(false);
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

  it('recommends Product schema (not Article) for product_sellers missing it', async () => {
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/', 'product_sellers');
    const productRec = r.recommendations.find((x) => x.issue === 'Missing Product schema markup');
    expect(productRec).toBeDefined();
    expect(productRec!.artifact?.content).toContain('"@type": "Product"');
    expect(productRec!.artifact?.content).toContain('"availability"');
    expect(r.recommendations.find((x) => x.issue === 'Missing schema markup')).toBeUndefined();
  });

  it('does not recommend Product schema for product_sellers when it is already present', async () => {
    const ld = `<script type="application/ld+json">${JSON.stringify({ '@type': 'Product' })}</script>`;
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>', ld), 'https://x.test/', 'product_sellers');
    expect(r.recommendations.find((x) => x.issue.includes('Product schema'))).toBeUndefined();
  });

  it('recommends LocalBusiness schema (not Article) for local_business missing it', async () => {
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/', 'local_business');
    const lbRec = r.recommendations.find((x) => x.issue === 'Missing LocalBusiness schema markup');
    expect(lbRec).toBeDefined();
    expect(lbRec!.artifact?.content).toContain('"@type": "LocalBusiness"');
    expect(lbRec!.artifact?.content).toContain('"telephone"');
    expect(r.recommendations.find((x) => x.issue === 'Missing schema markup')).toBeUndefined();
  });

  it('does not recommend LocalBusiness schema for local_business when it is already present', async () => {
    const ld = `<script type="application/ld+json">${JSON.stringify({ '@type': 'LocalBusiness' })}</script>`;
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>', ld), 'https://x.test/', 'local_business');
    expect(r.recommendations.find((x) => x.issue.includes('LocalBusiness schema'))).toBeUndefined();
  });

  it('still recommends generic Article schema for general and developers modules', async () => {
    for (const mod of ['general', 'developers'] as const) {
      const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/', mod);
      const rec = r.recommendations.find((x) => x.issue === 'Missing schema markup');
      expect(rec, `for ${mod}`).toBeDefined();
      expect(rec!.artifact?.content, `for ${mod}`).toContain('"@type": "Article"');
    }
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
    expect(r.recommendations.length).toBeGreaterThan(0);
  });
});

describe('detectPlatform', () => {
  it('detects Shopify from its CDN script references', () => {
    expect(detectPlatform(wrap('<p>x</p>', '<script src="https://cdn.shopify.com/s/files/1/theme.js"></script>'))).toBe('shopify');
  });

  it('detects Wix from its static asset host', () => {
    expect(detectPlatform(wrap('<p>x</p>', '<link rel="stylesheet" href="https://static.wixstatic.com/site.css" />'))).toBe('wix');
  });

  it('detects Squarespace from its CDN host', () => {
    expect(detectPlatform(wrap('<p>x</p>', '<script src="https://static1.squarespace.com/static/bundle.js"></script>'))).toBe('squarespace');
  });

  it('detects WordPress from its generator meta tag', () => {
    expect(detectPlatform(wrap('<p>x</p>', '<meta name="generator" content="WordPress 6.4" />'))).toBe('wordpress');
  });

  it('detects WordPress from wp-content asset paths even without the generator tag', () => {
    expect(detectPlatform(wrap('<p>x</p>', '<link rel="stylesheet" href="/wp-content/themes/mytheme/style.css" />'))).toBe('wordpress');
  });

  it('falls back to custom when nothing matches', () => {
    expect(detectPlatform(wrap('<p>A fully hand-built page.</p>'))).toBe('custom');
  });
});

describe('scanUrlForTechnicalSignals — two-part remediation guidance', () => {
  it('surfaces the detected platform on the result', async () => {
    const r = await scanUrlForTechnicalSignals(
      wrap('<p>x</p>', '<meta name="generator" content="WordPress 6.4" />'),
      'https://x.test/',
    );
    expect(r.detectedPlatform).toBe('wordpress');
  });

  it('defaults detectedPlatform to custom for a plain page', async () => {
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/');
    expect(r.detectedPlatform).toBe('custom');
  });

  it('gives product_sellers WordPress-specific non-technical guidance for missing Product schema', async () => {
    const html = wrap('<p>x</p>', '<meta name="generator" content="WordPress 6.4" />');
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/', 'product_sellers');
    const rec = r.recommendations.find((x) => x.issue === 'Missing Product schema markup');
    expect(rec?.nonTechnicalFix).toMatch(/WooCommerce|Yoast/);
    expect(rec?.technicalFix).toMatch(/developer|site's code/);
  });

  it('gives local_business Wix-specific non-technical guidance for missing LocalBusiness schema', async () => {
    const html = wrap('<p>x</p>', '<link rel="stylesheet" href="https://static.wixstatic.com/site.css" />');
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/', 'local_business');
    const rec = r.recommendations.find((x) => x.issue === 'Missing LocalBusiness schema markup');
    expect(rec?.nonTechnicalFix).toMatch(/Wix/);
  });

  it('falls back to generic non-technical guidance for an undetected (custom) platform', async () => {
    const r = await scanUrlForTechnicalSignals(wrap('<p>x</p>'), 'https://x.test/', 'product_sellers');
    const rec = r.recommendations.find((x) => x.issue === 'Missing Product schema markup');
    expect(rec?.nonTechnicalFix).toBeTruthy();
    expect(rec?.nonTechnicalFix).not.toMatch(/Shopify|Wix|Squarespace|WordPress/);
  });

  it('omits nonTechnicalFix for JS-rendering issues — there is no editor-level fix', async () => {
    const scripts = '<script>1</script>'.repeat(6);
    const r = await scanUrlForTechnicalSignals(wrap(`<div id="root"></div>${scripts}`), 'https://x.test/');
    const rec = r.recommendations.find((x) => x.issue.includes('JavaScript-rendered'));
    expect(rec?.nonTechnicalFix).toBeUndefined();
    expect(rec?.technicalFix).toMatch(/server-side rendering|SSR/);
  });

  it('gives alt-text recommendations a non-technical fix with no technical artifact needed', async () => {
    const body = `
      <img src="a.png" /><img src="b.png" />
      <img src="c.png" /><img src="d.png" alt="d" />
    `;
    const r = await scanUrlForTechnicalSignals(wrap(body), 'https://x.test/');
    const rec = r.recommendations.find((x) => x.issue === 'Images missing alt text');
    expect(rec?.nonTechnicalFix).toMatch(/Alt text/);
  });
});

describe('scanUrlForTechnicalSignals — Product/LocalBusiness schema field detection', () => {
  function ld(obj: unknown): string {
    return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
  }

  it('detects a fully-specified Product schema\'s individual fields', async () => {
    const html = wrap('<p>x</p>', ld({
      '@type': 'Product',
      image: 'https://x.test/p.jpg',
      sku: 'ABC-123',
      brand: { '@type': 'Brand', name: 'Acme' },
      offers: { '@type': 'Offer', price: '19.99', availability: 'https://schema.org/InStock' },
    }));
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/');
    expect(r.signals.productSchemaHasPrice).toBe(true);
    expect(r.signals.productSchemaHasAvailability).toBe(true);
    expect(r.signals.productSchemaHasBrand).toBe(true);
    expect(r.signals.productSchemaHasSku).toBe(true);
    expect(r.signals.productSchemaHasImage).toBe(true);
  });

  it('reports false for Product schema fields that are absent', async () => {
    const html = wrap('<p>x</p>', ld({ '@type': 'Product', name: 'Bare Product' }));
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/');
    expect(r.signals.hasProductSchema).toBe(true);
    expect(r.signals.productSchemaHasPrice).toBe(false);
    expect(r.signals.productSchemaHasAvailability).toBe(false);
    expect(r.signals.productSchemaHasBrand).toBe(false);
    expect(r.signals.productSchemaHasSku).toBe(false);
    expect(r.signals.productSchemaHasImage).toBe(false);
  });

  it('accepts mpn or gtin as a substitute for sku', async () => {
    const html = wrap('<p>x</p>', ld({ '@type': 'Product', gtin: '0012345678905' }));
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/');
    expect(r.signals.productSchemaHasSku).toBe(true);
  });

  it('detects a fully-specified LocalBusiness schema\'s individual fields', async () => {
    const html = wrap('<p>x</p>', ld({
      '@type': 'LocalBusiness',
      address: { '@type': 'PostalAddress', streetAddress: '1 Main St' },
      telephone: '+1-555-0100',
      openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: '09:00', closes: '17:00' }],
      geo: { '@type': 'GeoCoordinates', latitude: 1, longitude: 2 },
    }));
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/');
    expect(r.signals.localBusinessSchemaHasAddress).toBe(true);
    expect(r.signals.localBusinessSchemaHasPhone).toBe(true);
    expect(r.signals.localBusinessSchemaHasHours).toBe(true);
    expect(r.signals.localBusinessSchemaHasGeo).toBe(true);
  });

  it('reports false for LocalBusiness schema fields that are absent', async () => {
    const html = wrap('<p>x</p>', ld({ '@type': 'LocalBusiness', name: 'Bare Shop' }));
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/');
    expect(r.signals.hasLocalBusinessSchema).toBe(true);
    expect(r.signals.localBusinessSchemaHasAddress).toBe(false);
    expect(r.signals.localBusinessSchemaHasPhone).toBe(false);
    expect(r.signals.localBusinessSchemaHasHours).toBe(false);
    expect(r.signals.localBusinessSchemaHasGeo).toBe(false);
  });

  it('does not cross-contaminate Product fields onto a LocalBusiness-only page', async () => {
    const html = wrap('<p>x</p>', ld({ '@type': 'LocalBusiness', telephone: '+1-555-0100' }));
    const r = await scanUrlForTechnicalSignals(html, 'https://x.test/');
    expect(r.signals.productSchemaHasPrice).toBe(false);
    expect(r.signals.productSchemaHasBrand).toBe(false);
  });
});
