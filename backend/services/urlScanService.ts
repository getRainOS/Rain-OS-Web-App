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
export interface UrlScanResult {
signals: TechnicalSignals;
extractedText: string;
recommendations: string[];
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



// ─── Recommendations ─────────────────────────────────────────────────────────
const recs: string[] = [];
if (!signals.hasSchemaMarkup)
recs.push('Add JSON-LD structured data. Start with Article or FAQPage schema.');
if (!signals.hasSemanticHtml)
recs.push('Replace div wrappers with semantic HTML5: article, main, section.');
if (!signals.hasProperHeadingHierarchy)
recs.push('Use exactly one h1 per page, then logical h2/h3 subheadings.');
if (!signals.hasMetaDescription)
recs.push('Add a meta description (150-160 chars).');
if (!signals.hasCanonicalTag)
recs.push('Add a canonical tag to establish the authoritative URL.');
if (signals.isJsRendered)
recs.push('CRITICAL: Page requires JavaScript. AI crawlers see an empty page. Implement SSR immediately.');
if (!signals.hasLlmsTxt)
recs.push('Create /llms.txt at your domain root to guide AI crawlers.');
if (signals.missingAltTextRatio > 0.3)
recs.push(`${Math.round(signals.missingAltTextRatio * 100)}% of images have no
alt text. Add descriptive alt attributes.`);
if (!signals.hasDescriptiveAnchors)
recs.push('Replace generic anchor text ("click here", "read more") with descriptive text.');
if (!signals.hasOpenGraphTags)
recs.push('Add Open Graph meta tags (og:title, og:description, og:image).');
return { signals, extractedText, recommendations: recs };
}