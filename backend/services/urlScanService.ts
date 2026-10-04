// services/urlScanService.ts — Cheerio HTML analysis. Zero API cost.
import * as cheerio from 'cheerio';
import { checkAllCrawlers, type CrawlerStatus } from './robotsCheck';

export type DetectedPlatform = 'wordpress' | 'shopify' | 'wix' | 'squarespace' | 'custom';

/**
 * Detect the site builder/CMS from fingerprints already present in the HTML
 * we fetched to scan the page — no extra request. Lets remediation guidance
 * point to the right editor instead of making the user self-identify their
 * platform from a dropdown. 'custom' covers everything else: hand-built
 * sites, less common platforms, or a platform whose fingerprint changed.
 */
export function detectPlatform(html: string): DetectedPlatform {
  if (/cdn\.shopify\.com|Shopify\.theme|shopify-section/i.test(html)) return 'shopify';
  if (/static\.wixstatic\.com|wix-dynamic-|_wixCIDX|wix\.com\/website/i.test(html)) return 'wix';
  if (/static1\.squarespace\.com|squarespace-cdn\.com|squarespace\.com\/universal/i.test(html)) return 'squarespace';
  if (/<meta[^>]+name=["']generator["'][^>]+content=["']WordPress/i.test(html) || /wp-content\/|wp-includes\//i.test(html)) return 'wordpress';
  return 'custom';
}

export interface TechnicalSignals {
  // Schema
  hasSchemaMarkup: boolean;
  schemaTypes: string[];
  hasFaqSchema: boolean;
  hasProductSchema: boolean;
  hasLocalBusinessSchema: boolean;
  hasArticleSchema: boolean;
  hasHowToSchema: boolean;
  // Fields within a detected Product/LocalBusiness schema block — only
  // meaningful when the corresponding hasXSchema flag above is true.
  productSchemaHasPrice: boolean;
  productSchemaHasAvailability: boolean;
  productSchemaHasBrand: boolean;
  productSchemaHasSku: boolean;
  productSchemaHasImage: boolean;
  localBusinessSchemaHasAddress: boolean;
  localBusinessSchemaHasPhone: boolean;
  localBusinessSchemaHasHours: boolean;
  localBusinessSchemaHasGeo: boolean;
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
  // robots.txt / AI crawler access — shown in PillarScores' AI Readability
  // subcategory breakdown, not the flat Technical Signals list below.
  hasRobotsTxt: boolean;
  aiCrawlerAccess: CrawlerStatus[];
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
  // What they can do themselves, through their own site editor, no code —
  // platform-aware when detectPlatform() recognized the site. Omitted when
  // there's genuinely no editor-level equivalent (e.g. server-side
  // rendering) and a developer is the only path.
  nonTechnicalFix?: string;
  // The code-level fix (pairs with `artifact` when present) plus a plain
  // note on who it's for: do it yourself if you manage your site's code, or
  // hand it to whoever does.
  technicalFix?: string;
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
  detectedPlatform: DetectedPlatform;
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

// ─── Two-part remediation copy ──────────────────────────────────────────────
// Every fix has a non-technical path (something doable in the site's own
// editor, no code) and/or a technical path (the actual markup, for whoever
// manages the site's code). Platform-aware when detectPlatform() recognized
// the site; falls back to generic-but-still-useful guidance for 'custom'.
function metaFieldGuide(platform: DetectedPlatform, fieldName: string): string {
  switch (platform) {
    case 'wordpress':
      return `If you use Yoast SEO, Rank Math, or a similar plugin, look for the "${fieldName}" field in the SEO box below your page/post editor — no code needed.`;
    case 'shopify':
      return `Open the page or product, scroll to "Search engine listing preview," and fill in the ${fieldName.toLowerCase()} field there.`;
    case 'wix':
      return `Open the page's SEO settings (the SEO icon in the editor panel) and fill in the ${fieldName.toLowerCase()} field.`;
    case 'squarespace':
      return `Go to Page Settings → SEO and fill in the ${fieldName} field.`;
    default:
      return `Look for an "SEO" or "Search engine preview" section in your page editor — most modern site builders have a ${fieldName.toLowerCase()} field there.`;
  }
}

function socialFieldGuide(platform: DetectedPlatform): string {
  switch (platform) {
    case 'wordpress':
      return 'If you use Yoast SEO or Rank Math, check the "Social" tab in the SEO box — it sets the share title, description, and image for you.';
    case 'shopify':
      return 'The "Search engine listing preview" section also controls what shows when your page is shared on social media.';
    case 'wix':
    case 'squarespace':
      return "Check your page's SEO or Social Share settings for a title, description, and image you can set without code.";
    default:
      return 'Look for a "Social share" or "Social preview" section in your page/SEO settings — most site builders let you set this without code.';
  }
}

function productSchemaGuide(platform: DetectedPlatform): string {
  switch (platform) {
    case 'shopify':
      return 'Shopify generates basic Product schema automatically on product pages — if it\'s still missing, check your theme supports it, or install a free structured data app (e.g. "JSON-LD for SEO") from the Shopify App Store to add price, availability, and brand without touching code.';
    case 'wordpress':
      return "If you use WooCommerce, Product schema is usually generated automatically — check WooCommerce's or your SEO plugin's settings. With Yoast SEO, there are Product fields in the SEO box.";
    case 'wix':
      return 'Add an SEO/structured-data app from the Wix App Market to fill in Product schema fields like price and availability without code.';
    case 'squarespace':
      return "Squarespace doesn't expose Product schema fields directly in the editor — this one will most likely need the code fix below, or a developer.";
    default:
      return 'Check whether your e-commerce platform has a built-in "structured data" or "rich snippets" setting — many have one without needing code.';
  }
}

function localBusinessSchemaGuide(platform: DetectedPlatform): string {
  switch (platform) {
    case 'wordpress':
      return "If you use Yoast SEO or a similar plugin, fill in your Local SEO settings (business name, address, phone, hours) — it generates this schema for you.";
    case 'wix':
      return "Fill in your business info under Wix's Business Info settings — Wix's local SEO tools generate structured data from it.";
    case 'squarespace':
      return "Add your business info under Squarespace's Business Information settings. For complete LocalBusiness schema you'll likely still need the code fix below.";
    case 'shopify':
      return 'Shopify is built around product sales rather than local-business listings — check if your theme has a business info or contact section, otherwise use the code fix below.';
    default:
      return 'Check whether your site builder has a "business info" or "local SEO" section — several generate this automatically once filled in.';
  }
}

function articleSchemaGuide(platform: DetectedPlatform): string {
  switch (platform) {
    case 'wordpress':
      return "If you use Yoast SEO or Rank Math, Article schema is usually generated automatically from your post — double-check it's enabled in the plugin's settings.";
    case 'wix':
    case 'squarespace':
      return 'These platforms often add basic Article/blog schema automatically for blog posts — if it\'s still missing, this one will need the code fix below.';
    default:
      return 'Check whether your blogging platform or CMS has a setting for article/blog structured data before using the code fix below.';
  }
}

/** Standard "who applies this" framing for a code-level fix. */
function technicalNote(whatToAdd: string): string {
  return `Add ${whatToAdd} to the page's <head>. If you manage your site's code yourself, add it directly; if not, send this to your developer, agency, or site host's support.`;
}

export async function scanUrlForTechnicalSignals(
  html: string,
  pageUrl: string,
  module: 'general' | 'product_sellers' | 'developers' | 'local_business' = 'general',
): Promise<UrlScanResult> {
  const $ = cheerio.load(html);
  const parsedUrl = new URL(pageUrl);
  const signals = {} as TechnicalSignals;
  const platform = detectPlatform(html);

  // ─── Schema markup ──────────────────────────────────────────────────────────
  // Common schema.org LocalBusiness subtypes — not an exhaustive list of the
  // full LocalBusiness hierarchy, but covers what local service businesses
  // actually declare in practice.
  const LOCAL_BUSINESS_TYPES = [
    'LocalBusiness', 'Store', 'Restaurant', 'FoodEstablishment',
    'ProfessionalService', 'HomeAndConstructionBusiness', 'MedicalBusiness',
    'LegalService', 'AutomotiveBusiness', 'FinancialService',
    'EntertainmentBusiness', 'SportsActivityLocation', 'HealthAndBeautyBusiness',
  ];
  const schemaTypes: string[] = [];
  let hasFaqSchema = false;
  let hasProductSchema = false;
  let hasLocalBusinessSchema = false;
  let hasArticleSchema = false;
  let hasHowToSchema = false;
  // Once we know Product/LocalBusiness schema is present, check which of its
  // own fields are actually filled in — presence of the block alone doesn't
  // tell a seller whether price/availability are missing, or a business
  // whether their address/phone made it into the markup.
  let productSchemaHasPrice = false;
  let productSchemaHasAvailability = false;
  let productSchemaHasBrand = false;
  let productSchemaHasSku = false;
  let productSchemaHasImage = false;
  let localBusinessSchemaHasAddress = false;
  let localBusinessSchemaHasPhone = false;
  let localBusinessSchemaHasHours = false;
  let localBusinessSchemaHasGeo = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const j = JSON.parse($(el).html() || '');
      const raw = j['@type'];
      const types: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
      schemaTypes.push(...types);
      if (types.includes('FAQPage')) hasFaqSchema = true;
      if (types.includes('Product')) {
        hasProductSchema = true;
        const offers = Array.isArray(j.offers) ? j.offers[0] : j.offers;
        if (offers?.price != null || offers?.priceSpecification) productSchemaHasPrice = true;
        if (offers?.availability) productSchemaHasAvailability = true;
        if (j.brand) productSchemaHasBrand = true;
        if (j.sku || j.mpn || j.gtin) productSchemaHasSku = true;
        if (j.image) productSchemaHasImage = true;
      }
      if (types.some(t => LOCAL_BUSINESS_TYPES.includes(t))) {
        hasLocalBusinessSchema = true;
        if (j.address) localBusinessSchemaHasAddress = true;
        if (j.telephone) localBusinessSchemaHasPhone = true;
        if (j.openingHours || j.openingHoursSpecification) localBusinessSchemaHasHours = true;
        if (j.geo) localBusinessSchemaHasGeo = true;
      }
      if (['Article', 'BlogPosting', 'NewsArticle'].some(t => types.includes(t))) hasArticleSchema = true;
      if (types.includes('HowTo')) hasHowToSchema = true;
    } catch { /* malformed JSON-LD — skip */ }
  });
  signals.hasSchemaMarkup = schemaTypes.length > 0;
  signals.schemaTypes = schemaTypes;
  signals.hasFaqSchema = hasFaqSchema;
  signals.hasProductSchema = hasProductSchema;
  signals.hasLocalBusinessSchema = hasLocalBusinessSchema;
  signals.hasArticleSchema = hasArticleSchema;
  signals.hasHowToSchema = hasHowToSchema;
  signals.productSchemaHasPrice = productSchemaHasPrice;
  signals.productSchemaHasAvailability = productSchemaHasAvailability;
  signals.productSchemaHasBrand = productSchemaHasBrand;
  signals.productSchemaHasSku = productSchemaHasSku;
  signals.productSchemaHasImage = productSchemaHasImage;
  signals.localBusinessSchemaHasAddress = localBusinessSchemaHasAddress;
  signals.localBusinessSchemaHasPhone = localBusinessSchemaHasPhone;
  signals.localBusinessSchemaHasHours = localBusinessSchemaHasHours;
  signals.localBusinessSchemaHasGeo = localBusinessSchemaHasGeo;

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

  // ─── robots.txt check (AI crawler access) ───────────────────────────────────
  let robotsTxtBody: string | null = null;
  try {
    const r = await fetch(`${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`, {
      signal: AbortSignal.timeout(5000),
    });
    if (r.ok) robotsTxtBody = await r.text();
  } catch { /* unreachable or timeout — treat as no robots.txt */ }
  signals.hasRobotsTxt = robotsTxtBody !== null;
  signals.aiCrawlerAccess = checkAllCrawlers(robotsTxtBody);

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

  // Schema recommendations are lane-specific: a product seller needs Product
  // schema (price/availability/brand) for AI shopping surfaces, a local
  // business needs LocalBusiness schema (address/phone/hours) for "near me"
  // queries — recommending generic Article schema to either gives them the
  // wrong fix. General/developers keep the original Article-schema default.
  if (module === 'product_sellers' && !signals.hasProductSchema) {
    const jsonLdContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'Your Product Name',
      'image': `${host}/product-image.jpg`,
      'description': 'A short description of the product.',
      'sku': 'YOUR-SKU',
      'brand': { '@type': 'Brand', 'name': 'Your Brand' },
      'offers': {
        '@type': 'Offer',
        'url': pageUrl,
        'priceCurrency': 'USD',
        'price': '29.99',
        'availability': 'https://schema.org/InStock',
      },
    }, null, 2);
    recs.push({
      issue: 'Missing Product schema markup',
      recommendation: 'Add Product schema with price, availability, and brand. This is what lets AI shopping assistants (ChatGPT, Perplexity, Google AI Overviews) and AI-powered product search surface your listing with real details instead of treating it as generic content.',
      severity: 'high',
      artifact: {
        type: 'json-ld',
        content: `<script type="application/ld+json">\n${jsonLdContent}\n</script>`,
        filename: 'product-schema.json',
      },
      nonTechnicalFix: productSchemaGuide(platform),
      technicalFix: technicalNote('this Product schema block'),
    });
  } else if (module === 'local_business' && !signals.hasLocalBusinessSchema) {
    const jsonLdContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'Your Business Name',
      'image': `${host}/business-photo.jpg`,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '123 Main St',
        'addressLocality': 'Your City',
        'addressRegion': 'ST',
        'postalCode': '00000',
        'addressCountry': 'US',
      },
      'telephone': '+1-000-000-0000',
      'url': pageUrl,
      'openingHoursSpecification': [{
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens': '09:00',
        'closes': '17:00',
      }],
    }, null, 2);
    recs.push({
      issue: 'Missing LocalBusiness schema markup',
      recommendation: "Add LocalBusiness schema with your name, address, phone, and hours. This is the most direct way to tell AI assistants you're a real, findable local business when customers ask who's nearby.",
      severity: 'high',
      artifact: {
        type: 'json-ld',
        content: `<script type="application/ld+json">\n${jsonLdContent}\n</script>`,
        filename: 'local-business-schema.json',
      },
      nonTechnicalFix: localBusinessSchemaGuide(platform),
      technicalFix: technicalNote('this LocalBusiness schema block'),
    });
  } else if (!signals.hasSchemaMarkup) {
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
      nonTechnicalFix: articleSchemaGuide(platform),
      technicalFix: technicalNote('this Article schema block'),
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
      nonTechnicalFix: 'In your editor, use the "Heading 1," "Heading 2," etc. styles when formatting text, rather than just making text bold or large — most block/visual editors (Wix, Squarespace, WordPress, Shopify) apply the correct underlying heading tag for you.',
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
      nonTechnicalFix: metaFieldGuide(platform, 'Meta description'),
      technicalFix: technicalNote('this meta description tag'),
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
      nonTechnicalFix: "Most site builders (Shopify, Wix, Squarespace, WordPress) set this automatically — you likely don't need to do anything here unless your pages use a custom template.",
      technicalFix: technicalNote('this canonical tag'),
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
      // No non-technical path — this is an architecture-level issue, not an
      // editor-level one.
      technicalFix: 'This needs server-side rendering (SSR) or pre-rendering enabled — not a quick copy-paste fix. Talk to your developer. In the meantime, this robots.txt update at least confirms AI crawlers are allowed in once your content is actually visible to them.',
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
      nonTechnicalFix: "If your platform or host gives you file upload or FTP access to your site's root, you can add this yourself as a plain text file.",
      technicalFix: `Create this as a file named llms.txt at your domain root (${host}/llms.txt). If that's not something you manage yourself, send it to your developer or host support to upload.`,
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
      nonTechnicalFix: socialFieldGuide(platform),
      technicalFix: technicalNote('these Open Graph tags'),
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
      nonTechnicalFix: "Modern site builders (Wix, Squarespace, Shopify, WordPress themes) set this automatically — if it's missing, your site is likely using older or custom code and this will need the fix below from a developer.",
      technicalFix: technicalNote('this viewport tag'),
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
      nonTechnicalFix: socialFieldGuide(platform),
      technicalFix: technicalNote('these Twitter/X card tags'),
    });
  }

  if (!signals.isIndexable) {
    recs.push({
      issue: 'Page is set to noindex',
      recommendation: 'Remove the noindex robots meta tag to allow AI crawlers to index this page.',
      severity: 'high',
      nonTechnicalFix: 'Check your page\'s SEO or visibility settings for a "Hide this page from search engines" or "Allow indexing" toggle — this is a simple switch in Wix, Squarespace, Shopify, and WordPress (via Yoast or Rank Math).',
      technicalFix: "If there's no such toggle on your platform, this requires removing the noindex directive from the page's meta robots tag directly — ask your developer if that's not you.",
    });
  }

  if (signals.missingAltTextRatio > 0.3) {
    recs.push({
      issue: 'Images missing alt text',
      recommendation: `${Math.round(signals.missingAltTextRatio * 100)}% of images have no alt text. Add descriptive alt attributes.`,
      severity: 'medium',
      nonTechnicalFix: 'Click each image in your editor and look for an "Alt text" or "Image description" field — every major platform (Wix, Squarespace, Shopify, WordPress) has this built in, no code needed.',
    });
  }

  if (!signals.hasDescriptiveAnchors) {
    recs.push({
      issue: 'Generic anchor text',
      recommendation: 'Replace generic anchor text ("click here", "read more") with descriptive text.',
      severity: 'low',
      nonTechnicalFix: 'When adding links in your editor, change the clickable text itself (not just the URL) to describe what it links to — e.g. "Read our pricing guide" instead of "click here."',
    });
  }

  const displaySignals = formatSignalsForDisplay(signals);

  return { signals, displaySignals, extractedText, recommendations: recs, detectedPlatform: platform };
}
