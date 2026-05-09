// services/urlScanService.ts — Cheerio HTML analysis. Zero API cost.
import * as cheerio from 'cheerio';

export interface TechnicalSignals {
  // Schema
  hasSchemaMarkup: boolean;
  schemaTypes: string[];
  hasFaqSchema: boolean;
  hasProductSchema: boolean;
  hasArticleSchema: boolean;
  hasHowToSchema: boolean;
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
  hasTwitterCards: boolean;
  hasViewportMeta: boolean;
  titleLength: number;
  // Robots / indexability
  isIndexable: boolean;
  hasHreflang: boolean;
  // JS rendering
  isJsRendered: boolean;
  jsRenderingWarning: string | null;
  // llms.txt
  hasLlmsTxt: boolean;
  // Discovery
  hasFavicon: boolean;
  hasRssFeed: boolean;
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
  isWordCountSufficient: boolean;
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

export interface DisplaySignal {
  label: string;
  pass: boolean;
  detail: string;
}

export interface UrlScanResult {
  signals: TechnicalSignals;
  displaySignals: DisplaySignal[];
  extractedText: string;
  recommendations: UrlScanRecommendation[];
}

/** Convert camelCase key to "Title Case" label */
function camelToLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

/** Build the user-facing signal array from the flat TechnicalSignals object. */
export function formatSignalsForDisplay(s: TechnicalSignals): DisplaySignal[] {
  return [
    {
      label: 'JavaScript Rendering',
      pass: !s.isJsRendered,
      detail: s.isJsRendered
        ? 'Page requires JavaScript — AI crawlers see little or no content.'
        : 'Page content is available without JavaScript.',
    },
    {
      label: 'Meta Description',
      pass: s.hasMetaDescription,
      detail: s.hasMetaDescription
        ? `Present (${s.metaDescriptionLength} chars)${s.metaDescriptionLength > 160 ? ' — slightly long, trim to 160 chars.' : '.'}`
        : 'Missing — add a 150-160 character meta description.',
    },
    {
      label: 'Schema Markup',
      pass: s.hasSchemaMarkup,
      detail: s.hasSchemaMarkup
        ? `Detected: ${s.schemaTypes.join(', ')}`
        : 'No structured data found — add JSON-LD (Article, FAQPage, etc.).',
    },
    {
      label: 'llms.txt',
      pass: s.hasLlmsTxt,
      detail: s.hasLlmsTxt
        ? 'llms.txt found — AI crawlers have a site map to follow.'
        : 'No llms.txt — AI crawlers must guess what to read.',
    },
    {
      label: 'Heading Hierarchy',
      pass: s.hasProperHeadingHierarchy,
      detail: s.hasProperHeadingHierarchy
        ? `${s.headingCount} headings with proper H1 → H2 structure.`
        : 'Heading structure needs work — use exactly one H1 and logical H2/H3 subheadings.',
    },
    {
      label: 'Semantic HTML',
      pass: s.hasSemanticHtml,
      detail: s.hasSemanticHtml
        ? `Using: ${s.semanticTagsFound.join(', ')}.`
        : 'No semantic HTML5 elements detected (article, main, section, etc.).',
    },
    {
      label: 'Canonical Tag',
      pass: s.hasCanonicalTag,
      detail: s.hasCanonicalTag
        ? 'Canonical tag present — duplicate content handled correctly.'
        : 'Missing canonical tag — add one to prevent duplicate content signals.',
    },
    {
      label: 'Open Graph Tags',
      pass: s.hasOpenGraphTags,
      detail: s.hasOpenGraphTags
        ? 'og:title, og:description, and og:image found.'
        : 'Missing Open Graph tags — add og:title, og:description, og:image.',
    },
    {
      label: 'Twitter / X Cards',
      pass: s.hasTwitterCards,
      detail: s.hasTwitterCards
        ? 'Twitter card meta tags present.'
        : 'No twitter:card meta tag — add one for better social sharing.',
    },
    {
      label: 'Mobile Viewport',
      pass: s.hasViewportMeta,
      detail: s.hasViewportMeta
        ? 'Viewport meta tag present — mobile-friendly.'
        : 'Missing viewport meta — add <meta name="viewport" content="width=device-width, initial-scale=1">.',
    },
    {
      label: 'Indexability',
      pass: s.isIndexable,
      detail: s.isIndexable
        ? 'Page is not set to noindex — AI crawlers can index it.'
        : 'robots meta is set to noindex — AI crawlers are blocked from this page.',
    },
    {
      label: 'Hreflang',
      pass: s.hasHreflang,
      detail: s.hasHreflang
        ? 'Hreflang tags detected — international targeting configured.'
        : 'No hreflang — add if you target multiple languages or regions.',
    },
    {
      label: 'FAQ Schema',
      pass: s.hasFaqSchema,
      detail: s.hasFaqSchema
        ? 'FAQPage schema found — eligible for AI answer-box extraction.'
        : 'No FAQPage schema — add one if your page has Q&A content.',
    },
    {
      label: 'Image Alt Text',
      pass: s.missingAltTextRatio <= 0.2,
      detail: s.totalImages === 0
        ? 'No images detected on this page.'
        : `${s.imagesWithAltText} / ${s.totalImages} images have alt text (${Math.round((1 - s.missingAltTextRatio) * 100)}%).`,
    },
    {
      label: 'Word Count',
      pass: s.isWordCountSufficient,
      detail: s.wordCount > 0
        ? `${s.wordCount.toLocaleString()} words detected — ${s.isWordCountSufficient ? 'sufficient for AI analysis.' : 'consider adding more content (min 300 words recommended).'}`
        : 'Could not extract readable word count.',
    },
    {
      label: 'Internal Links',
      pass: s.internalLinkCount > 0,
      detail: s.internalLinkCount > 0
        ? `${s.internalLinkCount} internal, ${s.externalLinkCount} external links.`
        : 'No internal links found — add links to related pages.',
    },
    {
      label: 'Descriptive Anchors',
      pass: s.hasDescriptiveAnchors,
      detail: s.hasDescriptiveAnchors
        ? 'No generic anchor text ("click here", "read more") found.'
        : 'Generic anchor text detected — replace with descriptive link text.',
    },
    {
      label: 'Favicon',
      pass: s.hasFavicon,
      detail: s.hasFavicon
        ? 'Favicon found.'
        : 'No favicon detected — add one for brand recognition.',
    },
    {
      label: 'RSS / Atom Feed',
      pass: s.hasRssFeed,
      detail: s.hasRssFeed
        ? 'RSS or Atom feed link found — content is discoverable by feed readers.'
        : 'No RSS/Atom feed — consider adding one if publishing regular content.',
    },
  ];
}

export async function scanUrlForTechnicalSignals(
  html: string,
  pageUrl: string,
): Promise<UrlScanResult> {
  const $ = cheerio.load(html);
  const parsedUrl = new URL(pageUrl);
  const signals = {} as TechnicalSignals;

  // ─── Schema markup ──────────────────────────────────────────────────────────
  const schemaTypes: string[] = [];
  let hasFaqSchema = false;
  let hasProductSchema = false;
  let hasArticleSchema = false;
  let hasHowToSchema = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const j = JSON.parse($(el).html() || '');
      const raw = j['@type'];
      const types: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
      schemaTypes.push(...types);
      if (types.includes('FAQPage')) hasFaqSchema = true;
      if (types.includes('Product')) hasProductSchema = true;
      if (['Article', 'BlogPosting', 'NewsArticle'].some(t => types.includes(t))) hasArticleSchema = true;
      if (types.includes('HowTo')) hasHowToSchema = true;
    } catch { /* malformed JSON-LD — skip */ }
  });
  signals.hasSchemaMarkup = schemaTypes.length > 0;
  signals.schemaTypes = schemaTypes;
  signals.hasFaqSchema = hasFaqSchema;
  signals.hasProductSchema = hasProductSchema;
  signals.hasArticleSchema = hasArticleSchema;
  signals.hasHowToSchema = hasHowToSchema;

  // ─── Semantic HTML ──────────────────────────────────────────────────────────
  const semTags = ['article', 'section', 'main', 'nav', 'aside', 'header', 'footer'];
  const found = semTags.filter(t => $(t).length > 0);
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
  signals.hasTwitterCards = $('meta[name^="twitter:"]').length > 0;
  signals.hasViewportMeta = $('meta[name="viewport"]').length > 0;
  signals.titleLength = ($('title').text() || '').length;

  // ─── Robots / indexability ─────────────────────────────────────────────────
  const robotsMeta = $('meta[name="robots"]').attr('content') || '';
  signals.isIndexable = !robotsMeta.toLowerCase().includes('noindex');

  // ─── Hreflang ───────────────────────────────────────────────────────────────
  signals.hasHreflang = $('link[rel="alternate"][hreflang]').length > 0;

  // ─── Favicon ────────────────────────────────────────────────────────────────
  signals.hasFavicon =
    $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').length > 0;

  // ─── RSS / Atom feed ────────────────────────────────────────────────────────
  signals.hasRssFeed =
    $('link[rel="alternate"][type="application/rss+xml"], link[rel="alternate"][type="application/atom+xml"]')
      .length > 0;

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
  } catch { /* unreachable or timeout */ }
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
  $('nav,footer,script,style,noscript,iframe,[role="navigation"],[role="banner"]').remove();
  $('.nav,.footer,.menu,.sidebar,.ad,.advertisement,.cookie-banner').remove();
  const contentEl = $('article,main,[role="main"],.content,.post,.entry,.article-body').first();
  let extractedText = contentEl.length > 0
    ? contentEl.text().replace(/\s+/g, ' ').trim()
    : $('body').text().replace(/\s+/g, ' ').trim();
  const wordsSplit = extractedText.split(/\s+/);
  if (wordsSplit.length > 8000) {
    extractedText = wordsSplit.slice(0, 8000).join(' ') + ' ... [truncated]';
  }
  signals.wordCount = Math.min(wordsSplit.length, 8000);
  signals.isWordCountSufficient = signals.wordCount >= 300;
  signals.extractedText = extractedText;

  // ─── Recommendations with code artifacts ─────────────────────────────────────
  const recs: UrlScanRecommendation[] = [];
  const host = `${parsedUrl.protocol}//${parsedUrl.host}`;

  if (!signals.hasSchemaMarkup) {
    const jsonLdContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': 'Your Article Title',
      'author': { '@type': 'Person', 'name': 'Author Name' },
      'datePublished': new Date().toISOString().split('T')[0],
      'dateModified': new Date().toISOString().split('T')[0],
      'description': 'A short description of the article.',
      'url': pageUrl,
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
      recommendation: 'Replace generic div wrappers with semantic HTML5 elements: article, main, section.',
      severity: 'medium',
    });
  }

  if (!signals.hasProperHeadingHierarchy) {
    recs.push({
      issue: 'Improper heading hierarchy',
      recommendation: 'Use exactly one H1 per page, then logical H2/H3 subheadings.',
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
        content: `<meta name="description" content="A concise 150-160 character description of this page." />`,
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
        content: `# Allow major AI crawlers\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: Amazonbot\nAllow: /`,
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
        content: `# ${parsedUrl.host}\n\n> This file helps AI language models understand and navigate this site.\n\n## About\n\nThis is a website at ${host}. Replace with a brief summary of what your site offers.\n\n## Key Pages\n\n- [Home](${host}/): Main landing page\n- [About](${host}/about): About us\n- [Blog](${host}/blog): Articles and updates\n\n## Guidelines for AI\n\n- Content on this site may be cited with attribution.\n- For questions or permissions, contact: hello@${parsedUrl.host}`,
        filename: 'llms.txt',
      },
    });
  }

  if (!signals.hasOpenGraphTags) {
    recs.push({
      issue: 'Open Graph tags missing',
      recommendation: 'Add Open Graph meta tags (og:title, og:description, og:image).',
      severity: 'medium',
      artifact: {
        type: 'html',
        content: `<meta property="og:title" content="Your Page Title" />\n<meta property="og:description" content="A compelling description (150-160 characters)." />\n<meta property="og:image" content="${host}/og-image.jpg" />\n<meta property="og:url" content="${pageUrl}" />\n<meta property="og:type" content="website" />`,
        filename: 'og-tags.html',
      },
    });
  }

  if (!signals.hasViewportMeta) {
    recs.push({
      issue: 'Missing mobile viewport meta tag',
      recommendation: 'Add a viewport meta tag to ensure mobile-friendly rendering.',
      severity: 'medium',
      artifact: {
        type: 'html',
        content: `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
        filename: 'viewport.html',
      },
    });
  }

  if (!signals.hasTwitterCards) {
    recs.push({
      issue: 'Twitter / X card tags missing',
      recommendation: 'Add twitter:card meta tags for better sharing previews on X.',
      severity: 'low',
      artifact: {
        type: 'html',
        content: `<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="Your Page Title" />\n<meta name="twitter:description" content="Your page description." />\n<meta name="twitter:image" content="${host}/og-image.jpg" />`,
        filename: 'twitter-cards.html',
      },
    });
  }

  if (!signals.isIndexable) {
    recs.push({
      issue: 'Page is set to noindex',
      recommendation: 'Remove the noindex robots meta tag to allow AI crawlers to index this page.',
      severity: 'high',
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

  const displaySignals = formatSignalsForDisplay(signals);

  return { signals, displaySignals, extractedText, recommendations: recs };
}
