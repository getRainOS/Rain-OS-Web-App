export const DEMO_KEY = '__demo__';

export const DEMO_USER = {
  email: 'demo@getrainos.com',
  subscriptionStatus: 'active',
  stripePriceId: 'price_1SeCKM3NMjs4uYdgcBRhgIhD',
  usage: { count: 42, limit: 500 },
};

export const DEMO_HISTORY = [
  {
    id: 'd1', title: 'What Is Answer Engine Optimization?',
    overall_score: 87, ai_readability: 91, digital_authority: 84,
    conversion_readiness: 88, product_discoverability: 82,
    analyzed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'd2', title: 'How AI Search Engines Rank Content',
    overall_score: 79, ai_readability: 83, digital_authority: 76,
    conversion_readiness: 74, product_discoverability: 81,
    analyzed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'd3', url: 'https://example.com/blog/seo-guide',
    overall_score: 72, ai_readability: 68, digital_authority: 79,
    conversion_readiness: 71, product_discoverability: 69,
    analyzed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'd4', title: 'Building E-E-A-T for AI Discovery',
    overall_score: 91, ai_readability: 94, digital_authority: 90,
    conversion_readiness: 89, product_discoverability: 92,
    analyzed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'd5', title: 'Conversion Rate Optimization in 2025',
    overall_score: 65, ai_readability: 61, digital_authority: 70,
    conversion_readiness: 63, product_discoverability: 66,
    analyzed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'd6', url: 'https://example.com/products/analytics',
    overall_score: 83, ai_readability: 86, digital_authority: 81,
    conversion_readiness: 85, product_discoverability: 80,
    analyzed_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'd7', title: 'Structured Data Best Practices',
    overall_score: 76, ai_readability: 80, digital_authority: 73,
    conversion_readiness: 72, product_discoverability: 78,
    analyzed_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'd8', title: 'Local SEO for AI Search',
    overall_score: 69, ai_readability: 71, digital_authority: 67,
    conversion_readiness: 65, product_discoverability: 73,
    analyzed_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'd9', title: 'Voice Search Optimization Guide',
    overall_score: 88, ai_readability: 92, digital_authority: 85,
    conversion_readiness: 87, product_discoverability: 86,
    analyzed_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: 'd10', title: 'Content Freshness & AI Ranking Signals',
    overall_score: 74, ai_readability: 77, digital_authority: 72,
    conversion_readiness: 70, product_discoverability: 76,
    analyzed_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

export const DEMO_ANALYSIS = {
  overall_score: 84,
  ai_readability: 88,
  digital_authority: 82,
  conversion_readiness: 81,
  product_discoverability: 85,
  pillars: {
    ai_readability: {
      score: 88,
      label: 'AI Readability',
      subscores: { clarity: 91, structure: 87, conciseness: 85 },
      recommendations: [
        'Use clearer H2 headings that directly answer user questions.',
        'Break paragraphs longer than 3 sentences into shorter chunks.',
        'Add a concise summary at the top of the article for AI extraction.',
      ],
    },
    digital_authority: {
      score: 82,
      label: 'Digital Authority',
      subscores: { expertise: 84, trustworthiness: 80, citations: 82 },
      recommendations: [
        'Include author bio with credentials to strengthen E-E-A-T signals.',
        'Add references or citations to authoritative external sources.',
        'Publish more consistently to build topical authority.',
      ],
    },
    conversion_readiness: {
      score: 81,
      label: 'Conversion Readiness',
      subscores: { cta_clarity: 78, value_proposition: 85, urgency: 79 },
      recommendations: [
        'Add a clear call-to-action within the first two paragraphs.',
        'Strengthen the value proposition — explain what the reader gains.',
        'Use benefit-driven language rather than feature descriptions.',
      ],
    },
    product_discoverability: {
      score: 85,
      label: 'Product Discoverability',
      subscores: { keywords: 87, schema: 82, metadata: 86 },
      recommendations: [
        'Add FAQ schema markup to increase snippet eligibility.',
        'Include more long-tail variations of your primary keyword.',
        'Ensure meta description accurately reflects the content intent.',
      ],
    },
  },
};

export const DEMO_CITATION = {
  topic: 'best AI content optimizer for bloggers',
  url: 'https://getrainos.com',
  cited: false,
  citedSourceIndex: null,
  alignmentScore: 58,
  sources: [
    {
      title: 'Top 10 AI Writing Tools for Bloggers in 2026 — SearchEngineJournal',
      url: 'https://www.searchenginejournal.com/ai-writing-tools-bloggers/',
      domain: 'searchenginejournal.com',
      snippet: 'Roundup of leading AI content tools, ranking generative editors, SEO optimizers, and AEO platforms for blog publishers.',
    },
    {
      title: 'Surfer SEO vs Frase vs Clearscope: Content Optimizer Comparison',
      url: 'https://www.semrush.com/blog/content-optimizer-comparison/',
      domain: 'semrush.com',
      snippet: 'Side-by-side comparison of the major AI-driven content optimization platforms used by bloggers in 2026.',
    },
    {
      title: 'How AI Search Engines Pick Which Sources to Cite — HubSpot',
      url: 'https://blog.hubspot.com/marketing/ai-search-citation',
      domain: 'blog.hubspot.com',
      snippet: 'A look at the structural and authority signals that determine whether AI assistants cite a blog post in their answers.',
    },
    {
      title: 'AEO 101: Optimizing Content for Answer Engines — Ahrefs',
      url: 'https://ahrefs.com/blog/answer-engine-optimization/',
      domain: 'ahrefs.com',
      snippet: 'Practical guide to making blog content discoverable and quotable by ChatGPT, Perplexity, and Google AI Overviews.',
    },
  ],
  competitorDomains: ['searchenginejournal.com', 'semrush.com', 'blog.hubspot.com', 'ahrefs.com'],
  recommendations: [
    'Add comparative review content that names specific competitor tools — AI engines favour sources that explicitly compare options.',
    'Implement Article + FAQPage structured data on your tool overview page so AI parsers can extract direct answers about pricing, features, and use cases.',
    'Publish a dated "2026 update" post — three of the four cited sources have publish dates in the last 6 months, suggesting freshness is a strong ranking signal here.',
    'Earn editorial mentions from at least one of the cited domains (HubSpot, Ahrefs, SEJ) — AI engines disproportionately cite the same authority hubs.',
  ],
  summary: 'Your domain is not yet cited for this query. The field is dominated by four established marketing-authority blogs that publish frequently updated comparison content.',
  answerExcerpt: 'For bloggers in 2026, the leading AI content optimizers fall into three categories: keyword-driven tools like Surfer SEO and Clearscope; comprehensive AEO platforms; and lightweight generative editors. Among AEO-focused tools, platforms emphasising answer-engine readiness and citation signals are gaining ground over pure-SEO incumbents...',
};

export const DEMO_CITATION_HISTORY = [
  {
    id: 4,
    topic: 'best AI content optimizer for bloggers',
    url: 'https://getrainos.com',
    cited: false,
    alignmentScore: 58,
    sources: [],
    recommendations: [],
    summary: 'Your domain is not yet cited for this query.',
    checkedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 3,
    topic: 'best AI content optimizer for bloggers',
    url: 'https://getrainos.com',
    cited: false,
    alignmentScore: 52,
    sources: [],
    recommendations: [],
    summary: 'Your domain is not cited yet — competitive field.',
    checkedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 2,
    topic: 'best AI content optimizer for bloggers',
    url: 'https://getrainos.com',
    cited: false,
    alignmentScore: 47,
    sources: [],
    recommendations: [],
    summary: 'Not cited; alignment improving slowly.',
    checkedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 1,
    topic: 'best AI content optimizer for bloggers',
    url: 'https://getrainos.com',
    cited: false,
    alignmentScore: 41,
    sources: [],
    recommendations: [],
    summary: 'Initial baseline — not cited.',
    checkedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export const DEMO_SCAN = {
  url: 'https://example.com',
  overall_score: 78,
  ai_readability: 75,
  digital_authority: 80,
  conversion_readiness: 76,
  product_discoverability: 81,
  signals: [
    { label: 'HTTPS Enabled', status: 'pass', detail: 'Site is served over HTTPS' },
    { label: 'Canonical Tag', status: 'pass', detail: 'Canonical tag present and correct' },
    { label: 'Structured Data', status: 'warn', detail: 'Schema markup detected but incomplete — missing Article type' },
    { label: 'Page Speed', status: 'pass', detail: 'LCP under 2.5s — good performance score' },
    { label: 'Meta Description', status: 'warn', detail: 'Meta description is 185 characters — slightly long' },
    { label: 'Open Graph Tags', status: 'pass', detail: 'OG title, description, and image present' },
    { label: 'Robots.txt', status: 'pass', detail: 'robots.txt found and accessible' },
    { label: 'Sitemap', status: 'fail', detail: 'No sitemap.xml found — submit one in Google Search Console' },
  ],
  recommendations: [
    'Add Article or BlogPosting structured data to qualify for rich results.',
    'Shorten meta description to under 160 characters for full display.',
    'Create and submit an XML sitemap to improve AI crawler discovery.',
  ],
};
