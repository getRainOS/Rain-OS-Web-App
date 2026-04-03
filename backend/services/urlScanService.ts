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
export interface UrlScanRecommendation {
  issue: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
  artifact?: {
    type: 'json-ld' | 'llms-txt' | 'robots-txt' | 'html';
    content: string;
    filename?: string;
  };
}

export interface UrlScanResult {
signals: TechnicalSignals;
extractedText: string;
recommendations: UrlScanRecommendation[];
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
const recs: UrlScanRecommendation[] = [];
const host = `${parsedUrl.protocol}//${parsedUrl.host}`;

if (!signals.hasSchemaMarkup) {
  const jsonLdContent = signals.hasFaqSchema
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is your main question?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Your answer goes here.'
            }
          }
        ]
      }, null, 2)
    : JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': 'Your Article Title',
        'author': {
          '@type': 'Person',
          'name': 'Author Name'
        },
        'datePublished': new Date().toISOString().split('T')[0],
        'dateModified': new Date().toISOString().split('T')[0],
        'description': 'A short description of the article.',
        'url': pageUrl
      }, null, 2);

  recs.push({
    issue: 'Missing schema markup',
    recommendation: 'Add JSON-LD structured data. Start with Article or FAQPage schema.',
    severity: 'high',
    artifact: {
      type: 'json-ld',
      content: `<script type="application/ld+json">\n${jsonLdContent}\n</script>`,
      filename: 'schema.json',
    },
  });
}

if (!signals.hasSemanticHtml) {
  recs.push({
    issue: 'Missing semantic HTML',
    recommendation: 'Replace div wrappers with semantic HTML5: article, main, section.',
    severity: 'medium',
  });
}

if (!signals.hasProperHeadingHierarchy) {
  recs.push({
    issue: 'Improper heading hierarchy',
    recommendation: 'Use exactly one h1 per page, then logical h2/h3 subheadings.',
    severity: 'medium',
  });
}

if (!signals.hasMetaDescription) {
  recs.push({
    issue: 'Meta description absent',
    recommendation: 'Add a meta description (150-160 chars).',
    severity: 'high',
    artifact: {
      type: 'html',
      content: `<meta name="description" content="A concise 150-160 character description of this page that includes your primary keyword." />`,
      filename: 'meta-description.html',
    },
  });
}

if (!signals.hasCanonicalTag) {
  recs.push({
    issue: 'Missing canonical tag',
    recommendation: 'Add a canonical tag to establish the authoritative URL.',
    severity: 'low',
    artifact: {
      type: 'html',
      content: `<link rel="canonical" href="${pageUrl}" />`,
      filename: 'canonical.html',
    },
  });
}

if (signals.isJsRendered) {
  recs.push({
    issue: 'JavaScript-rendered content blocking AI crawlers',
    recommendation: 'CRITICAL: Page requires JavaScript. AI crawlers see an empty page. Implement SSR immediately.',
    severity: 'high',
    artifact: {
      type: 'robots-txt',
      content: `# Allow major AI crawlers (add to your existing robots.txt)\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: Amazonbot\nAllow: /`,
      filename: 'robots.txt',
    },
  });
}

if (!signals.hasLlmsTxt) {
  recs.push({
    issue: 'llms.txt absent',
    recommendation: 'Create /llms.txt at your domain root to guide AI crawlers.',
    severity: 'high',
    artifact: {
      type: 'llms-txt',
      content: `# ${parsedUrl.host}\n\n> This file helps AI language models understand and navigate this site.\n\n## About\n\nThis is a website at ${host}. Replace this description with a brief summary of what your site offers and who it serves.\n\n## Key Pages\n\n- [Home](${host}/): Main landing page\n- [About](${host}/about): About us\n- [Blog](${host}/blog): Articles and updates\n\n## Guidelines for AI\n\n- Content on this site may be cited with attribution.\n- Please link back to the original source when referencing content.\n- For questions or permissions, contact: hello@${parsedUrl.host}`,
      filename: 'llms.txt',
    },
  });
}

if (signals.missingAltTextRatio > 0.3) {
  recs.push({
    issue: 'Images missing alt text',
    recommendation: `${Math.round(signals.missingAltTextRatio * 100)}% of images have no alt text. Add descriptive alt attributes.`,
    severity: 'medium',
  });
}

if (!signals.hasDescriptiveAnchors) {
  recs.push({
    issue: 'Generic anchor text',
    recommendation: 'Replace generic anchor text ("click here", "read more") with descriptive text.',
    severity: 'low',
  });
}

if (!signals.hasOpenGraphTags) {
  recs.push({
    issue: 'Open Graph tags missing',
    recommendation: 'Add Open Graph meta tags (og:title, og:description, og:image).',
    severity: 'medium',
    artifact: {
      type: 'html',
      content: `<meta property="og:title" content="Your Page Title" />\n<meta property="og:description" content="A compelling description of this page (150-160 characters)." />\n<meta property="og:image" content="${host}/og-image.jpg" />\n<meta property="og:url" content="${pageUrl}" />\n<meta property="og:type" content="website" />`,
      filename: 'og-tags.html',
    },
  });
}

return { signals, extractedText, recommendations: recs };
}