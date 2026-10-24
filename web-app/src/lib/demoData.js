// Live demo: answers every API call in the browser with a sample business, so
// visitors can use the real app without an account. Nothing is sent to the
// server. Bright Smile Dental (Austin, TX) is fictional.

import { PRICE_IDS } from './plans.js';

const SITE = 'https://brightsmiledental.com';
const DOMAIN = 'brightsmiledental.com';
const BRAND = 'Bright Smile Dental';
const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString();
const wait = ms => new Promise(r => setTimeout(r, ms));

const user = {
  id: 'demo', email: 'demo@getrainos.com', name: 'Demo', subscriptionStatus: 'active', stripePriceId: PRICE_IDS.BUSINESS,
  usage: { count: 41, limit: 500 }, citationAlerts: true, locationState: 'TX', createdAt: daysAgo(60),
  apiKey: 'demo', isAdmin: false, isDemo: true,
};

const src = (domain, title, path = '') => ({ title, url: `https://${domain}${path}`, uri: `https://${domain}${path}`, domain, snippet: '' });

function analysis({ id, title, url = null, overall, ar, da, cr, lp, rr, at, summary }) {
  return {
    id, title, url, repo: null, overall_score: overall, rain_score: overall, overallScore: overall,
    ai_readability: ar, digital_authority: da, conversion_readiness: cr, product_discoverability: null,
    rag_readiness: rr, local_presence: lp, summary, analyzed_at: at, lane: 'local_business', series_id: 1,
    pillarScores: { aiReadability: ar, digitalAuthority: da, conversionReadiness: cr, productDiscoverability: 0, localPresence: lp, ragReadiness: rr },
    subScores: [
      { category: 'answerFirstFormatting', label: 'Answer-First Formatting', score: ar - 9 },
      { category: 'structuralClarity', label: 'Structural Clarity', score: ar + 4 },
      { category: 'citationSignals', label: 'Citation Signals', score: da - 12 },
      { category: 'semanticPrecision', label: 'Semantic Precision', score: ar + 2 },
    ],
    recommendations: [
      { id: 'm:avgSentenceLength', source: 'measured', metric: 'avgSentenceLength', pillar: 'ai_readability', text: 'Shorten your sentences: they average 27 words; aim for 20 or fewer. Split any sentence that joins two ideas with "and", "which" or a comma.' },
      { id: 'j:serviceAreaClarity', source: 'judged', sub: 'serviceAreaClarity', pillar: 'local_presence', text: 'Name Austin and the neighbourhoods you serve in your main heading and first paragraph.' },
      { id: 'j:answerFirstFormatting', source: 'judged', sub: 'answerFirstFormatting', pillar: 'ai_readability', text: 'Open each service section with a one-sentence answer: what it is, who it is for, what it costs.' },
      { id: 'j:citationSignals', source: 'judged', sub: 'citationSignals', pillar: 'digital_authority', text: 'Add dentist credentials and years in practice near the top, with a link to the ADA profile.' },
    ],
    // Sample breakdown under each pillar, in the same shape the scorer returns.
    content_type: 'landing_page',
    ai_readability_detail: { structuralClarity: ar + 4, answerFirstFormatting: ar - 9, semanticPrecision: ar + 2, contextSufficiency: ar - 3, audienceClarity: ar + 6 },
    digital_authority_detail: { citationSignals: da - 12, entityClarity: da + 8, topicalAuthority: da + 1, socialProofMarkup: da - 6, proofSpecificity: da - 10 },
    conversion_readiness_detail: { callToActionClarity: cr + 3, trustSignals: cr - 4, valueProposition: cr + 5, frictionReduction: cr - 2, aboveTheFoldClarity: cr + 1, objectionHandling: cr - 14 },
    rag_readiness_detail: { informationDensity: rr + 4, semanticMapping: rr - 2, hierarchicalFormatting: rr + 9, explicitQaStructures: rr - 15, authoritySignals: rr - 5 },
    local_presence_detail: { napConsistency: lp + 10, localSchemaMarkup: lp + 6, serviceAreaClarity: lp - 8, reviewSignalStrength: lp - 3, localCitationSignals: lp - 11 },
    authorship: { hasAuthorByline: false, hasPublishDate: true, hasOrganization: true, authorityScore: da },
    measured_checks: [
      { key: 'avgSentenceLength', label: 'Average sentence length', pillar: 'ai_readability', value: 27, display: '27.0 words', target: '18.0 words or less', pass: false },
      { key: 'passiveVoiceRatio', label: 'Passive voice', pillar: 'ai_readability', value: 0.12, display: '12%', target: '20% or less', pass: true },
      { key: 'headingDensity', label: 'Headings', pillar: 'ai_readability', value: 1.1, display: '1.10 per 100 words', target: '0.5–4.00 per 100 words', pass: true },
    ],
    content: null,
  };
}

const history = [
  analysis({ id: 9003, title: 'Bright Smile Dental — Invisalign in Austin', url: `${SITE}/invisalign`, overall: 74, ar: 77, da: 70, cr: 72, lp: 78, rr: 66, at: daysAgo(2), summary: 'Clear, answer-first service page with strong local signals. Authority is the gap.' }),
  analysis({ id: 9002, title: 'Bright Smile Dental — Invisalign in Austin', url: `${SITE}/invisalign`, overall: 66, ar: 68, da: 63, cr: 66, lp: 70, rr: 60, at: daysAgo(9), summary: 'Better headings; still buries prices and the service area.' }),
  analysis({ id: 9001, title: 'Bright Smile Dental — Invisalign in Austin', url: `${SITE}/invisalign`, overall: 58, ar: 55, da: 61, cr: 60, lp: 57, rr: 52, at: daysAgo(21), summary: 'Long paragraphs and no mention of Austin until the footer.' }),
  analysis({ id: 9004, title: 'Bright Smile Dental — Home', url: SITE, overall: 69, ar: 71, da: 66, cr: 70, lp: 73, rr: 61, at: daysAgo(5), summary: 'Good contact details and schema; homepage copy is generic.' }),
  analysis({ id: 9005, title: 'Blog: How much does Invisalign cost in Austin?', overall: 71, ar: 79, da: 64, cr: 65, lp: 72, rr: 70, at: daysAgo(12), summary: 'Answers the question directly with real price ranges.' }),
];
history.forEach((h, i) => { h.series_id = h.url === `${SITE}/invisalign` ? 1 : 10 + i; });

const RIVALS = [src('yelp.com', 'Top 10 Best Invisalign Dentists in Austin'), src('austinsmiles.com', 'Invisalign — Austin Smiles'), src('zocdoc.com', 'Invisalign dentists in Austin, TX'), src('reddit.com', 'r/Austin: best dentist for Invisalign?')];
const citation = (id, topic, engine, cited, rank, at) => {
  const sources = RIVALS.slice(0, 4);
  if (cited) sources.splice(rank - 1, 0, src(DOMAIN, 'Invisalign in Austin | Bright Smile Dental', '/invisalign'));
  return {
    id, name: topic, topic, url: SITE, cited, sources, engine, checkedAt: at, checked_at: at, source: 'manual',
    summary: cited ? `Your site is source ${rank} of ${sources.length} for this question.` : `Your site was not among the ${sources.length} sources cited.`,
    alignmentScore: 0, recommendations: [], locationCountry: 'US', locationState: 'TX',
  };
};
const T1 = 'best dentist in Austin for Invisalign';
const T2 = 'emergency dentist in Austin open on Saturday';
const T3 = 'family dentist in Austin that takes new patients';
const citations = [
  citation(8101, T1, 'gemini', true, 2, daysAgo(2)), citation(8102, T1, 'chatgpt', true, 3, daysAgo(2)), citation(8103, T1, 'ai_overviews', false, 0, daysAgo(2)),
  citation(8104, T1, 'gemini', true, 3, daysAgo(9)), citation(8105, T1, 'gemini', false, 0, daysAgo(16)), citation(8106, T1, 'gemini', false, 0, daysAgo(23)),
  citation(8107, T2, 'gemini', false, 0, daysAgo(4)), citation(8108, T2, 'chatgpt', true, 1, daysAgo(4)),
  citation(8109, T3, 'gemini', true, 1, daysAgo(6)), citation(8110, T3, 'perplexity', true, 2, daysAgo(6)),
];

const tracked = [
  { id: 701, name: T1, topic: T1, url: SITE, lastCited: true, pausedReason: null, createdAt: daysAgo(30), locationCountry: 'US', locationState: 'TX',
    history: [false, false, true, true].map((c, i) => ({ cited: c, checkedAt: daysAgo(23 - i * 7) })),
    engineLatest: [{ engine: 'chatgpt', cited: true, checkedAt: daysAgo(2) }, { engine: 'ai_overviews', cited: false, checkedAt: daysAgo(2) }, { engine: 'perplexity', cited: true, checkedAt: daysAgo(2) }] },
  { id: 702, name: T2, topic: T2, url: SITE, lastCited: false, pausedReason: null, createdAt: daysAgo(20), locationCountry: 'US', locationState: 'TX',
    history: [false, false, false].map((c, i) => ({ cited: c, checkedAt: daysAgo(18 - i * 7) })),
    engineLatest: [{ engine: 'chatgpt', cited: true, checkedAt: daysAgo(4) }] },
];

const brandVis = [
  { id: 6101, name: 'Invisalign sentiment', brand: BRAND, topic: T1, url: SITE, mention_status: 'mentioned', mentionStatus: 'mentioned', sentiment: 'positive',
    sentiment_explanation: 'Described as modern and transparent on pricing.', answer_excerpt: `${BRAND} is often recommended for Invisalign in Austin, with clear pricing and evening appointments.`,
    sources: RIVALS.slice(0, 3), competitors: ['austinsmiles.com', 'yelp.com'], recommendations: [], summary: `Gemini mentioned ${BRAND} in its answer for this topic.`, engine: 'gemini', checked_at: daysAgo(3), checkedAt: daysAgo(3) },
  { id: 6102, name: 'Emergency sentiment', brand: BRAND, topic: T2, url: SITE, mention_status: 'not_mentioned', mentionStatus: 'not_mentioned', sentiment: 'not_applicable',
    sentiment_explanation: null, answer_excerpt: 'For Saturday emergencies, Austin Smiles and Capital City Dental offer same-day appointments.',
    sources: RIVALS.slice(1, 4), competitors: ['austinsmiles.com', 'zocdoc.com'], recommendations: [], summary: `ChatGPT did not mention ${BRAND} — it favored austinsmiles.com instead when answering this topic.`, engine: 'chatgpt', checked_at: daysAgo(5), checkedAt: daysAgo(5) },
];

const sov = [{
  id: 5101, name: 'Invisalign share of voice', brand: BRAND, topic: 'Invisalign dentists in Austin', url: SITE, overallSov: 0, citedCount: 2, engine: 'gemini', checkedAt: daysAgo(3),
  modelResults: [
    { modelLabel: 'Informational question', modelKey: 'gemini', promptStyle: '"What are the best…?"', mentioned: true, answerExcerpt: `Popular choices include Austin Smiles, ${BRAND} and Capital City Dental.`, sources: RIVALS.slice(0, 3) },
    { modelLabel: 'Conversational request', modelKey: 'chatgpt_style', promptStyle: '"What do you recommend?"', mentioned: false, answerExcerpt: 'I would start with Austin Smiles, which has many Invisalign reviews.', sources: RIVALS.slice(1, 3) },
    { modelLabel: 'Research comparison', modelKey: 'perplexity_style', promptStyle: '"Compare the top…"', mentioned: true, answerExcerpt: `Austin Smiles leads on reviews; ${BRAND} stands out for transparent pricing.`, sources: [src(DOMAIN, 'Invisalign pricing', '/invisalign'), RIVALS[0]] },
  ],
  topCompetitors: ['yelp.com', 'austinsmiles.com', 'zocdoc.com'], recommendations: ['Get listed on the sites AI cited most: Yelp and Zocdoc.'],
  summary: `${BRAND} was mentioned in 2 of 3 query phrasings for "Invisalign dentists in Austin".`,
  brandShares: [
    { brand: 'Austin Smiles', isYou: false, mentions: 3, answers: 3, sharePercent: 43 },
    { brand: BRAND, isYou: true, mentions: 2, answers: 2, sharePercent: 29 },
    { brand: 'Capital City Dental', isYou: false, mentions: 2, answers: 2, sharePercent: 28 },
  ],
  sharePercent: 29,
}];

const ENGINES = [
  { id: 'gemini', label: 'Gemini with Google Search', location: 'none', locked: false },
  { id: 'chatgpt', label: 'ChatGPT', location: 'state', locked: false },
  { id: 'ai_overviews', label: 'Google AI Overviews', location: 'state', locked: false },
  { id: 'ai_mode', label: 'Google AI Mode', location: 'state', locked: false },
  { id: 'perplexity', label: 'Perplexity', location: 'none', locked: false },
  { id: 'claude', label: 'Claude', location: 'none', locked: false },
];

// Results for things a visitor runs. Same sample business, whatever they type.
function runCitation(body, engine = 'gemini') {
  const cited = engine !== 'ai_overviews';
  const rank = engine === 'chatgpt' ? 1 : 2;
  const c = citation(Date.now(), body?.topic || T1, engine, cited, rank, new Date().toISOString());
  const u = body?.url ? (/^https?:/.test(body.url) ? body.url : `https://${body.url}`) : SITE;
  const d = u.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  const sources = c.sources.map(s => (s.domain === DOMAIN ? src(d, s.title, '/') : s));
  const idx = sources.findIndex(s => s.domain === d);
  return { ...c, url: u, sources, citedSourceIndex: idx >= 0 ? idx : null, competitorDomains: sources.filter(s => s.domain !== d).map(s => s.domain),
    answerExcerpt: 'For Invisalign in Austin, people most often mention clinics with clear pricing, evening hours and strong reviews.', checkId: c.id, name: body?.name || c.topic };
}

const jobs = new Map();

// Product fact sheets, kept in memory for the visit.
const FACT_KEYS = ['brand', 'sku', 'price', 'materials', 'dimensions', 'bestFor', 'comparedTo', 'shipping', 'returns', 'warranty', 'rating', 'reviewCount'];
const FACT_LABELS = { brand: 'Brand', sku: 'SKU or barcode (GTIN)', price: 'Price', materials: 'Materials or specs', dimensions: 'Dimensions or weight', bestFor: 'Best for', comparedTo: 'Compared to alternatives', shipping: 'Shipping', returns: 'Returns', warranty: 'Warranty', rating: 'Rating', reviewCount: 'Review count' };
const sheetView = (id, facts) => {
  const missing = FACT_KEYS.filter(k => !String(facts[k] || '').trim());
  return { id, facts, updatedAt: new Date().toISOString(), completeness: { filled: FACT_KEYS.length - missing.length, total: FACT_KEYS.length, missing: missing.map(k => FACT_LABELS[k]) },
    schema: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: facts.name, ...(facts.brand ? { brand: { '@type': 'Brand', name: facts.brand } } : {}),
      ...(facts.price ? { offers: { '@type': 'Offer', price: Number(facts.price), priceCurrency: facts.currency || 'USD' } } : {}) }, null, 2) };
};
const sheets = [sheetView(1, {
  name: 'Clear Aligner Starter Kit', brand: BRAND, url: `${SITE}/shop/aligner-kit`, sku: 'BSD-KIT-01', gtin: '', mpn: '', price: '249', currency: 'USD', salePrice: '',
  variants: [], materials: 'BPA-free medical-grade plastic', dimensions: '', weight: '', specs: 'Includes impression kit, case and cleaning crystals',
  bestFor: 'Adults with mild crowding', notFor: '', comparedTo: '', shipping: 'Free 2-day shipping in the US', returns: '30-day returns if unopened',
  warranty: '', rating: '4.7', reviewCount: '38', reviewQuotes: ['Fit perfectly and the impression kit was easy.'], image: '',
})];

const ok = data => ({ data, usage: null });
const demoError = (msg = 'This is a demo with sample data. Sign up free to run this on your own site.') => {
  const e = new Error(msg); e.status = 403; e.code = 'demo'; throw e;
};

export async function demoRequest(method, path, body) {
  const [p, qs] = path.split('?');
  const q = new URLSearchParams(qs || '');
  await wait(method === 'GET' ? 120 : 0);

  if (method === 'GET') {
    if (p === '/api/users/me') return ok(user);
    if (p === '/api/history') return ok({ success: true, data: history, items: history, totalCount: history.length });
    const h = p.match(/^\/api\/history\/(\d+)$/);
    if (h) { const it = history.find(x => x.id === Number(h[1])) || history[0]; return ok({ success: true, data: it }); }
    if (p === '/api/citation-checks') {
      const engine = q.get('engine') || 'gemini';
      const topic = q.get('topic');
      let items = engine === 'all' ? citations : citations.filter(c => c.engine === engine);
      if (topic) items = items.filter(c => c.topic.toLowerCase() === topic.toLowerCase());
      return ok({ success: true, data: items, items });
    }
    if (p === '/api/engines') return ok({ success: true, engines: ENGINES, features: { localListings: 'on' } });
    const poll = p.match(/^\/api\/citation-check\/engine\/(.+)$/);
    if (poll) { const j = jobs.get(poll[1]); return ok(j && Date.now() >= j.readyAt ? { success: true, status: 'done', result: j.result } : { success: true, status: 'running' }); }
    if (p === '/api/tracked-queries') return ok({ success: true, items: tracked, cap: 30, alertsEnabled: true });
    if (p === '/api/brand-visibility') return ok({ success: true, data: brandVis });
    if (p === '/api/sov') return ok({ success: true, data: sov });
    if (p === '/api/brand-links') return ok({ success: true, links: [{ brand: BRAND, site: DOMAIN }] });
    if (p === '/api/lane-stats') return ok({ success: true, lanes: { local_business: { analyses: 5, checks: 14, lastUsed: daysAgo(2) } } });
    if (p === '/api/usage') return ok({ success: true, usage: user.usage });
    if (p === '/api/products') return ok({ success: true, items: sheets });
    if (p === '/api/fixes/summary') return ok({ success: true, totalFixes: 8, pieces: [{ id: 9003, title: history[0].title, fixes: 4, score: 74 }, { id: 9004, title: history[3].title, fixes: 4, score: 69 }] });
    return ok({ success: true, data: [], items: [] });
  }

  if (method === 'POST') {
    if (p === '/api/products') {
      const facts = { ...(body?.facts || {}) };
      const id = body?.id || Date.now();
      const item = sheetView(id, facts);
      const at = sheets.findIndex(x => x.id === id);
      if (at >= 0) sheets[at] = item; else sheets.unshift(item);
      return ok({ success: true, item });
    }
    if (p === '/api/maps-grid') {
      await wait(2500);
      const P = [[null, 14, 9, 12, null], [11, 6, 3, 5, 13], [8, 2, 1, 2, 7], [12, 4, 2, 3, 9], [null, 10, 6, 11, null]];
      const points = P.flatMap((r, row) => r.map((position, col) => ({ row, col, lat: 30.27 + (2 - row) * 0.0145, lng: -97.74 + (col - 2) * 0.0167, position })));
      const found = points.filter(x => x.position !== null);
      return ok({ success: true, data: {
        query: body?.service || 'invisalign dentist', center: { lat: 30.27, lng: -97.74 }, size: 5, spacingKm: 1.6, points, checkedAt: new Date().toISOString(),
        summary: { top3: found.filter(x => x.position <= 3).length, top10: found.filter(x => x.position <= 10).length, found: found.length, total: 25,
          averagePosition: +(found.reduce((a, x) => a + x.position, 0) / found.length).toFixed(1) },
      } });
    }
    if (p === '/api/citation-checks/regions') {
      // Demo: every sample source is a US site, except the UK and Canadian guides.
      const US = { name: 'United States', flag: '🇺🇸', iso: '840' };
      const GB = { name: 'United Kingdom', flag: '🇬🇧', iso: '826' };
      const domains = Object.fromEntries((body?.domains || []).map(d => [d, /\.co\.uk$/.test(d) ? GB : US]));
      return ok({ success: true, domains });
    }
    if (p === '/api/fixes/check') {
      // Demo: the sentence-length fix counts as done once sentences average 20 words or fewer.
      const text = String(body?.content || '');
      const sentences = text.split(/(?<=[.!?])\s+/).filter(x => x.trim().length > 10);
      const avg = sentences.length ? text.split(/\s+/).filter(Boolean).length / sentences.length : 0;
      return ok({ success: true, status: (body?.fixes || []).map(f => ({ id: f.id, done: f.source === 'measured' ? avg <= 20 : null })) });
    }
    if (p === '/api/analyze') {
      await wait(2200);
      const a = analysis({ id: 9100, title: body?.title || 'Your content', overall: 63, ar: 61, da: 60, cr: 64, lp: 66, rr: 58, at: new Date().toISOString(), summary: 'Readable, but the key answers are buried and the location is barely mentioned.' });
      return ok({ ...a, analysisId: a.id });
    }
    if (p === '/api/rewrite') {
      await wait(2500);
      const text = String(body?.content || '');
      return ok({ success: true, truncated: false,
        rewritten: `# ${BRAND}: Invisalign in Austin\n\nInvisalign at ${BRAND} costs $3,500–$5,500 and usually takes 12–18 months. We treat adults and teens across Austin, including Mueller, Hyde Park and South Congress.\n\n${text.slice(0, 1200)}`,
        changes: ['Answer-first opening with price and timeline', 'Named Austin neighbourhoods served', 'Split long paragraphs into short, single-idea sections'],
        improved: true, passes: 2,
        before: { overall: 63, pillars: [{ key: 'aiReadability', label: 'AI Readability', score: 61 }, { key: 'digitalAuthority', label: 'Digital Authority', score: 60 }, { key: 'conversionReadiness', label: 'Conversion Readiness', score: 64 }, { key: 'localPresence', label: 'Local Presence', score: 66 }, { key: 'ragReadiness', label: 'RAG Readiness', score: 58 }] },
        after: { overall: 89, pillars: [{ key: 'aiReadability', label: 'AI Readability', score: 95 }, { key: 'digitalAuthority', label: 'Digital Authority', score: 78 }, { key: 'conversionReadiness', label: 'Conversion Readiness', score: 90 }, { key: 'localPresence', label: 'Local Presence', score: 88 }, { key: 'ragReadiness', label: 'RAG Readiness', score: 92 }] },
        needsYou: [
          { item: 'Dentist credentials and years in practice', why: 'Digital Authority: AI trusts named, qualified experts', where: 'Under the main heading' },
          { item: 'Two or three real patient reviews that mention Austin', why: 'Local Presence and Authority: social proof AI can quote', where: 'After the pricing section' },
          { item: 'Online booking link', why: 'Conversion Readiness: a direct next step', where: 'Top of the page and after each service' },
        ],
        faq: [
          { q: 'How much does Invisalign cost in Austin?', a: 'At Bright Smile Dental, Invisalign costs $3,500–$5,500, depending on the case.' },
          { q: 'How long does Invisalign take?', a: 'Most treatments take 12–18 months.' },
          { q: 'Do you treat teens?', a: 'Yes, Bright Smile Dental treats adults and teens across Austin.' },
        ],
        schema: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: 'How much does Invisalign cost in Austin?', acceptedAnswer: { '@type': 'Answer', text: 'At Bright Smile Dental, Invisalign costs $3,500–$5,500, depending on the case.' } }] }, null, 2),
        signals: [
          { label: 'Average sentence length', before: '26.1 words', after: '16.4 words', better: true },
          { label: 'Sentences over 30 words', before: '22%', after: '4%', better: true },
          { label: 'Passive voice', before: '18%', after: '6%', better: true },
          { label: 'Answer-first sentences', before: '24%', after: '51%', better: true },
          { label: 'Headings per 100 words', before: '0.0', after: '1.1', better: true },
        ] });
    }
    if (p === '/api/citation-check') { await wait(2500); const r = runCitation(body); return ok({ success: true, data: r, history: citations.filter(c => c.topic === T1 && c.engine === 'gemini'), ...r }); }
    if (p === '/api/citation-check/engine') {
      const id = `demo-${body?.engine}-${Date.now()}`;
      jobs.set(id, { readyAt: Date.now() + 4000, result: { ...runCitation(body, body?.engine), engine: body?.engine, answerShown: true } });
      return ok({ success: true, status: 'running', jobId: id });
    }
    if (p === '/api/sov') { await wait(2500); return ok({ success: true, data: { ...sov[0], brand: body?.brand || BRAND, topic: body?.topic || sov[0].topic, engine: body?.engine || 'gemini', name: body?.name } }); }
    if (p === '/api/brand-visibility') { await wait(2000); const r = { ...brandVis[0], brand: body?.brand || BRAND, topic: body?.topic || T1, engine: body?.engine || 'gemini', name: body?.name, cited: true, citedSourceIndex: 1 }; return ok({ success: true, data: r, ...r }); }
    if (p === '/api/url-scan') {
      await wait(2500);
      const a = analysis({ id: 9200, title: body?.url, url: body?.url, overall: 69, ar: 71, da: 66, cr: 70, lp: 73, rr: 61, at: new Date().toISOString(), summary: 'Strong contact details and schema; the page rarely names the city.' });
      const r = { ...a, technical_signals: { hasSchemaMarkup: true, hasLocalBusinessSchema: true }, signals: [], technical_recommendations: [], detected_platform: 'wordpress', url_scanned: body?.url,
        local_page_check: body?.targetCity ? { city: body.targetCity, passed: 9, total: 12, nap: { name: BRAND, phone: '5125550142', street: '1200 Barton Springs Rd', city: body.targetCity, state: body.targetState || 'TX' },
          items: [
            { id: 'city_title', label: `${body.targetCity} in the page title`, pass: true, detail: `Title: "Invisalign in ${body.targetCity} | ${BRAND}"` },
            { id: 'city_h1', label: `${body.targetCity} in the main heading`, pass: false, detail: 'Main heading: "Straighter teeth, made simple"', fix: `Make the main heading name the service and ${body.targetCity}.` },
            { id: 'service_area', label: 'States the area you serve', pass: true, detail: `The page says it serves ${body.targetCity}.` },
            { id: 'schema_geo', label: 'Schema has map coordinates (geo)', pass: false, detail: 'No geo coordinates in the schema.', fix: 'Add "geo" with your latitude and longitude to your LocalBusiness schema.' },
            { id: 'nap_phone', label: 'Same phone number everywhere on the page', pass: false, detail: '2 different phone numbers on the page.', fix: 'Use one phone number, written the same way in the page, footer, contact section and schema.' },
          ] } : null };
      return ok({ success: true, data: r, ...r });
    }
    if (p === '/api/local-listing') {
      await wait(3000);
      return ok({ success: true, data: {
        found: true,
        profile: { name: BRAND, category: 'Cosmetic dentist', claimed: true, rating: 4.8, reviewCount: 64, phone: '(512) 555-0199', address: '1200 Barton Springs Rd, Austin, TX 78704', website: SITE, photos: 22 },
        matches: { name: true, phone: false, address: true, website: true },
        reviews: { checked: 50, mentionCity: 7, examples: ['Best Invisalign experience in Austin, start to finish.'] },
        maps: { query: `${body?.service || 'invisalign dentist'} ${body?.city || 'Austin'}`, position: 4, top: [
          { position: 1, name: 'Austin Smiles', rating: 4.9, reviewCount: 412, domain: 'austinsmiles.com', isYou: false },
          { position: 2, name: 'Capital City Dental', rating: 4.7, reviewCount: 233, domain: 'capitalcitydental.com', isYou: false },
          { position: 3, name: 'Lakeline Family Dentistry', rating: 4.8, reviewCount: 180, domain: '', isYou: false },
          { position: 4, name: BRAND, rating: 4.8, reviewCount: 64, domain: DOMAIN, isYou: true },
        ] },
        steps: [
          "Your Google phone ((512) 555-0199) doesn't match your website. Use one number everywhere.",
          'Only 7 of your last 50 reviews mention Austin. When you ask for reviews, ask customers to say what you did and where.',
          `You're #4 on Google Maps. The top 3 get most of the attention, from people and AI.`,
        ] } });
    }
  }

  return demoError();
}
