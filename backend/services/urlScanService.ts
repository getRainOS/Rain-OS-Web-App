// services/urlScanService.ts — Cheerio HTML analysis. Zero API cost.
// Extracts technical signals from raw HTML for use in URL scan scoring.



import * as cheerio from 'cheerio';
export interface TechnicalSignals {
// Schema
hasSchemaMarkup: boolean;
schemaTypes: string[];
hasFaqSchema: boolean;
hasProductSchema: boolean;
hasArticleSchema: boolean;
// Semantic structure
hasSemanticHtml: boolean;
semanticTagsFound: string[];
hasProperHeadingHierarchy: boolean;
headingCount: number;
// Meta
hasMetaDescription: boolean;
metaDescriptionLength: number;
hasCanonicalTag: boolean;
hasOpenGraphTags: boolean;
titleLength: number;
// JS rendering
isJsRendered: boolean;
jsRenderingWarning: string | null;
// llms.txt
hasLlmsTxt: boolean;
// Images
totalImages: number;
imagesWithAltText: number;
missingAltTextRatio: number;
// Links
internalLinkCount: number;
externalLinkCount: number;
hasDescriptiveAnchors: boolean;
// Content
wordCount: number;
extractedText: string;
}
export interface ScanArtifact {
  type: 'json-ld' | 'llms-txt' | 'robots-txt' | 'html';
  filename: string;
  content: string;
}

export interface ScanRecommendation {
  text: string;
  artifact?: ScanArtifact;
}

export interface UrlScanResult {
signals: TechnicalSignals;
extractedText: string;
recommendations: ScanRecommendation[];
}
export async function scanUrlForTechnicalSignals(
html: string,
pageUrl: string
): Promise<UrlScanResult> {
const $ = cheerio.load(html);
const parsedUrl = new URL(pageUrl);
const signals = {} as TechnicalSignals;
// ─── Schema markup ──────────────────────────────────────────────────────────
const schemaTypes: string[] = [];



let hasFaqSchema = false;
let hasProductSchema = false;
let hasArticleSchema = false;
$('script[type="application/ld+json"]').each((_, el) => {
try {
const j = JSON.parse($(el).html() || '');
const raw = j['@type'];
const types: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
schemaTypes.push(...types);
if (types.includes('FAQPage')) hasFaqSchema = true;
if (types.includes('Product')) hasProductSchema = true;
if (['Article', 'BlogPosting', 'NewsArticle'].some((t) =>
types.includes(t))) hasArticleSchema = true;
} catch { /* malformed JSON-LD — skip */ }
});
signals.hasSchemaMarkup = schemaTypes.length > 0;
signals.schemaTypes = schemaTypes;
signals.hasFaqSchema = hasFaqSchema;
signals.hasProductSchema = hasProductSchema;
signals.hasArticleSchema = hasArticleSchema;
// ─── Semantic HTML ──────────────────────────────────────────────────────────
const semTags = ['article', 'section', 'main', 'nav', 'aside', 'header',
'footer'];
const found = semTags.filter((t) => $(t).length > 0);
signals.hasSemanticHtml = found.length >= 2;
signals.semanticTagsFound = found;
signals.hasProperHeadingHierarchy = $('h1').length === 1 && $('h2').length > 0;
signals.headingCount = $('h1,h2,h3,h4,h5,h6').length;
// ─── Meta tags ──────────────────────────────────────────────────────────────
const md = $('meta[name="description"]').attr('content') || '';
signals.hasMetaDescription = md.length > 0;
signals.metaDescriptionLength = md.length;
signals.hasCanonicalTag = $('link[rel="canonical"]').length > 0;
signals.hasOpenGraphTags = $('meta[property^="og:"]').length > 0;
signals.titleLength = ($('title').text() || '').length;
// ─── JS rendering detection ─────────────────────────────────────────────────
const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
const jsRendered = bodyText.length < 200 && $('script').length > 5;
signals.isJsRendered = jsRendered;
signals.jsRenderingWarning = jsRendered
? 'Page requires JavaScript. AI crawlers see an empty page.'
: null;
// ─── llms.txt check ─────────────────────────────────────────────────────────
let hasLlmsTxt = false;
try {
const r = await fetch(`${parsedUrl.protocol}//${parsedUrl.host}/llms.txt`, {
method: 'HEAD',
signal: AbortSignal.timeout(3000),
});



hasLlmsTxt = r.ok;
} catch { /* unreachable or timeout — not present */ }
signals.hasLlmsTxt = hasLlmsTxt;
// ─── Images ─────────────────────────────────────────────────────────────────
const allImgs = $('img');
const altImgs = $('img[alt]:not([alt=""])');
signals.totalImages = allImgs.length;
signals.imagesWithAltText = altImgs.length;
signals.missingAltTextRatio = allImgs.length > 0
? (allImgs.length - altImgs.length) / allImgs.length
: 0;
// ─── Links ──────────────────────────────────────────────────────────────────
let internalLinks = 0;
let externalLinks = 0;
let genericAnchors = 0;
const genericTerms = ['click here', 'read more', 'learn more', 'here', 'this link', 'more'];
$('a[href]').each((_, el) => {
const href = $(el).attr('href') || '';
const text = $(el).text().trim().toLowerCase();
if (href.startsWith('/') || href.includes(parsedUrl.host)) internalLinks++;
else if (href.startsWith('http')) externalLinks++;
if (genericTerms.includes(text)) genericAnchors++;
});
signals.internalLinkCount = internalLinks;
signals.externalLinkCount = externalLinks;
signals.hasDescriptiveAnchors = genericAnchors === 0;
// ─── Text extraction ─────────────────────────────────────────────────────────
// Remove non-content elements before extraction
$('nav,footer,script,style,noscript,iframe,[role="navigation"],[role="banner"]').remove();
$('.nav,.footer,.menu,.sidebar,.ad,.advertisement,.cookie-banner').remove();
// Prefer main content container if present
const contentEl = $('article,main,[role="main"],.content,.post,.entry,.article-body').first();
let extractedText = contentEl.length > 0
? contentEl.text().replace(/\s+/g, ' ').trim()
: $('body').text().replace(/\s+/g, ' ').trim();
// Cap at 8,000 words to stay within Gemini token budget
const wordsSplit = extractedText.split(/\s+/);
if (wordsSplit.length > 8000) {
extractedText = wordsSplit.slice(0, 8000).join(' ') + ' ... [truncated]';
}
signals.wordCount = Math.min(wordsSplit.length, 8000);
signals.extractedText = extractedText;



// ─── Recommendations with code artifacts ─────────────────────────────────────
const recs: ScanRecommendation[] = [];
const host = parsedUrl.host;
const origin = `${parsedUrl.protocol}//${host}`;

if (!signals.hasSchemaMarkup) {
  recs.push({
    text: 'Add JSON-LD structured data. Start with Article or WebPage schema so AI crawlers can identify your content type.',
    artifact: {
      type: 'json-ld',
      filename: 'schema.json',
      content: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': 'Page Title',
        'description': 'A concise description of this page.',
        'url': pageUrl,
        'publisher': {
          '@type': 'Organization',
          'name': 'Your Brand Name',
          'url': origin,
        },
      }, null, 2) + '\n\n/* Paste inside a <script type="application/ld+json"> tag in your <head> */',
    },
  });
}

if (!signals.hasLlmsTxt) {
  recs.push({
    text: `Create /llms.txt at your domain root to guide AI crawlers on how to index your site.`,
    artifact: {
      type: 'llms-txt',
      filename: 'llms.txt',
      content: `# ${host}

> This file tells AI crawlers how to read and index this site.

## About
[Brief description of what this site is and who it serves.]

## Content
- [Link to key page or section]
- [Link to key page or section]

## Contact
[Optional: email or contact page URL]

## Usage
AI systems may read and summarise this site's public content for informational purposes.
`,
    },
  });
}

if (signals.isJsRendered) {
  recs.push({
    text: 'CRITICAL: Page requires JavaScript to render. AI crawlers see an empty page. Add this to allow crawlers while you implement SSR.',
    artifact: {
      type: 'robots-txt',
      filename: 'robots.txt addition',
      content: `# Allow major AI crawlers (add to your existing robots.txt)
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /`,
    },
  });
}

if (!signals.hasOpenGraphTags) {
  recs.push({
    text: 'Add Open Graph meta tags so your pages render correctly when shared and are recognized by AI tools.',
    artifact: {
      type: 'html',
      filename: 'og-tags.html',
      content: `<!-- Paste these into your <head> -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="A concise description of this page (150–160 chars)." />
<meta property="og:image" content="${origin}/og-image.png" />
<meta property="og:url" content="${pageUrl}" />`,
    },
  });
}

if (!signals.hasMetaDescription) {
  recs.push({
    text: 'Add a meta description (150–160 chars). AI tools use this to understand the page purpose.',
    artifact: {
      type: 'html',
      filename: 'meta-description.html',
      content: `<!-- Paste into your <head> -->
<meta name="description" content="A clear, concise description of what this page offers. Keep it under 160 characters." />`,
    },
  });
}

if (!signals.hasSemanticHtml) {
  recs.push({ text: 'Replace generic div wrappers with semantic HTML5 elements: <article>, <main>, <section>, <nav>, <aside>. AI crawlers use these to identify content structure.' });
}

if (!signals.hasProperHeadingHierarchy) {
  recs.push({ text: 'Use exactly one <h1> per page, followed by logical <h2> and <h3> subheadings. This is how AI models parse document structure.' });
}

if (!signals.hasCanonicalTag) {
  recs.push({
    text: 'Add a canonical tag to tell search engines and AI crawlers which URL is authoritative.',
    artifact: {
      type: 'html',
      filename: 'canonical.html',
      content: `<!-- Paste into your <head> -->
<link rel="canonical" href="${pageUrl}" />`,
    },
  });
}

if (signals.missingAltTextRatio > 0.3) {
  recs.push({ text: `${Math.round(signals.missingAltTextRatio * 100)}% of images are missing alt text. Add descriptive alt attributes — AI models use these to understand image context.` });
}

if (!signals.hasDescriptiveAnchors) {
  recs.push({ text: 'Replace generic anchor text ("click here", "read more") with descriptive link text. AI models use anchor text to understand what the linked page is about.' });
}

return { signals, extractedText, recommendations: recs };
}