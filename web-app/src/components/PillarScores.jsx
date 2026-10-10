import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import styles from './PillarScores.module.css';
import { PILLAR_COLORS } from '../lib/pillarColors.js';

// A Gemini-judged sub-score (0-100) at or above this counts as a "pass" in
// the breakdown below. The raw number is never shown — only pass/fail — so
// the underlying scoring formula isn't exposed; Gemini's number is a
// judgment, not a fact, and varies run to run, unlike the fixed-point values
// below. Used for every pillar except AI Readability, Product
// Discoverability, and Local Presence on fresh analyses, which ground their
// breakdowns in real algorithmic/schema signals instead — see
// READABILITY_METRIC_ITEMS and the technical_signals branches below.
const SUBITEM_PASS_THRESHOLD = 60;

// Repo Analysis has no Gemini-judged sub-scores — it scores pillars from
// plain boolean signals (RepoSignals). These map each pillar to the exact
// signals its own scoreXxx() function in repoAnalysisService.ts reads, so
// the breakdown shown here always matches what's actually scored. A signal
// can legitimately appear under more than one pillar when it's genuinely
// used in more than one scoring formula (e.g. hasSchemaMarkup).
const REPO_SIGNAL_GROUPS = {
  ai_readability: [
    { key: 'hasReadme', label: 'Has README' },
    { key: 'readmeHasHeadings', label: 'README Has Headings' },
    { label: 'Substantial README (200+ words)', pass: s => s.readmeWordCount > 200 },
    { key: 'hasLlmsTxt', label: 'llms.txt Present' },
    { key: 'hasSchemaMarkup', label: 'Schema Markup Present' },
    { key: 'templateHasCanonical', label: 'Canonical Tag In Template' },
  ],
  digital_authority: [
    { key: 'hasLicense', label: 'LICENSE Present' },
    { key: 'hasContributing', label: 'CONTRIBUTING Present' },
    { key: 'hasChangelog', label: 'CHANGELOG Present' },
    { key: 'hasOpenApiSpec', label: 'OpenAPI Spec Present' },
    { key: 'hasOpenGraph', label: 'Open Graph Tags Present' },
    { label: 'Substantial README (300+ words)', pass: s => s.hasReadme && s.readmeWordCount > 300 },
    { key: 'packageHasKeywords', label: 'package.json Has Keywords' },
    { key: 'templateHasCanonical', label: 'Canonical Tag In Template' },
  ],
  conversion_readiness: [
    { key: 'readmeHasCta', label: 'README Has Call-To-Action' },
    { key: 'hasInstallInstructions', label: 'Install Instructions Present' },
    { key: 'hasDemoSection', label: 'Demo/Screenshot Section Present' },
    { key: 'hasMetaDescription', label: 'Meta Description Present' },
    { key: 'indexHtmlHasTitle', label: 'index.html Has Title' },
    { key: 'hasSrcDocumentFile', label: 'Layout/_document Template Present' },
  ],
  product_discoverability: [
    { key: 'hasPackageJson', label: 'package.json Present' },
    { label: 'package.json Has Description', pass: s => !!s.packageDescription },
    { key: 'packageHasKeywords', label: 'package.json Has Keywords' },
    { key: 'hasSchemaMarkup', label: 'Schema Markup Present' },
    { key: 'hasOpenGraph', label: 'Open Graph Tags Present' },
  ],
  rag_readiness: [
    { key: 'readmeHasHeadings', label: 'README Has Headings' },
    { key: 'readmeHasMultipleHeadingLevels', label: 'README Has Multiple Heading Levels' },
    { label: 'Substantial README (300+ words)', pass: s => s.readmeWordCount > 300 },
    { label: 'In-Depth README (800+ words)', pass: s => s.readmeWordCount > 800 },
    { key: 'readmeHasFaqSection', label: 'README Has FAQ/Q&A Section' },
    { key: 'readmeHasMultipleExternalLinks', label: 'Multiple External Links In README' },
    { key: 'hasOpenApiSpec', label: 'OpenAPI Spec Present' },
  ],
  // Repo Analysis has no local_business signals — local_presence is never
  // shown for it (filtered out in visiblePillars), so no entry needed here.
};

// A continuous 0-100 score graded around a metric's own pass/fail threshold
// (T) — the same T these items used to gate on. Well inside the passing
// zone (0.6x T for a lower-is-better metric, 1.6x T for higher-is-better)
// scores 100; well past the threshold in the failing direction (1.6x / 0.4x
// respectively) scores 0; linear, clamped, in between. This replaces the
// binary check/X with a real fixed-point value without inventing a new
// formula — every anchor is the threshold already reviewed for that metric.
function gradedScore(value, threshold, higherIsBetter) {
  const good = higherIsBetter ? threshold * 1.6 : threshold * 0.6;
  const bad = higherIsBetter ? threshold * 0.4 : threshold * 1.6;
  const t = (value - bad) / (good - bad);
  return Math.round(Math.min(1, Math.max(0, t)) * 100);
}

// AI Readability's breakdown for Content Analyzer and URL Scanner is built
// from these — the same algorithmic metrics (computeReadabilityMetrics)
// Gemini itself is grounded on as hard scoring anchors, not from Gemini's
// own judged 0-100 numbers. That makes the breakdown deterministic: the
// same content always produces the same fixed-point values, independent of
// any LLM run-to-run variance. Thresholds mirror the anchors already stated
// in readability.ts's formatMetricsAsGroundingBlock.
const READABILITY_METRIC_ITEMS = [
  { label: 'Average Sentence Length', threshold: 25, higherIsBetter: false,
    raw: m => m.avgSentenceLength, format: v => `${v.toFixed(1)} words (target ≤25)` },
  { label: 'Long Sentence Ratio', threshold: 0.20, higherIsBetter: false,
    raw: m => m.longSentenceRatio, format: v => `${Math.round(v * 100)}% of sentences >30 words (target ≤20%)` },
  { label: 'Passive Voice', threshold: 0.30, higherIsBetter: false,
    raw: m => m.passiveVoiceRatio, format: v => `${Math.round(v * 100)}% passive (target ≤30%)` },
  { label: 'Ambiguous Pronouns', threshold: 0.03, higherIsBetter: false,
    raw: m => (m.wordCount === 0 ? 0 : m.coreferenceLeakCount / m.wordCount),
    format: v => `${(v * 100).toFixed(1)}% of words (target ≤3%)` },
  { label: 'Vague/Abstract Language', threshold: 0.05, higherIsBetter: false,
    raw: m => m.abstractionRatio, format: v => `${Math.round(v * 100)}% of words (target ≤5%)` },
  { label: 'Clause Nesting', threshold: 3, higherIsBetter: false,
    raw: m => m.nestedClauseDepth, format: v => `${v.toFixed(1)} commas/sentence (target ≤3)` },
  { label: 'Heading Density', threshold: 0.5, higherIsBetter: true,
    raw: m => m.headingDensity, format: v => `${v.toFixed(2)} per 100 words (target ≥0.5)` },
  { label: 'Answer-First Structure', threshold: 0.4, higherIsBetter: true,
    raw: m => m.answerFirstRatio, format: v => `${Math.round(v * 100)}% (target >40%)` },
];

// Product Discoverability / Local Presence breakdowns for URL Scanner are
// built from the actual fields found inside the detected Product/
// LocalBusiness JSON-LD block — not Gemini's judgment of how "discoverable"
// or "findable" the page reads. Same determinism rationale as
// READABILITY_METRIC_ITEMS above.
const PRODUCT_SCHEMA_FIELD_ITEMS = [
  { label: 'Price Specified', key: 'productSchemaHasPrice' },
  { label: 'Availability Specified', key: 'productSchemaHasAvailability' },
  { label: 'Brand Specified', key: 'productSchemaHasBrand' },
  { label: 'SKU / Product ID Specified', key: 'productSchemaHasSku' },
  { label: 'Product Image Specified', key: 'productSchemaHasImage' },
];

const LOCAL_BUSINESS_SCHEMA_FIELD_ITEMS = [
  { label: 'Address Specified', key: 'localBusinessSchemaHasAddress' },
  { label: 'Phone Number Specified', key: 'localBusinessSchemaHasPhone' },
  { label: 'Business Hours Specified', key: 'localBusinessSchemaHasHours' },
  { label: 'Geo Coordinates Specified', key: 'localBusinessSchemaHasGeo' },
];

const PILLARS = [
  {
    key: 'ai_readability',
    camel: 'aiReadability',
    label: 'AI Readability',
    color: PILLAR_COLORS.ai_readability,
    sub: 'Semantic clarity & AEO alignment',
    detailKey: 'ai_readability_detail',
  },
  {
    key: 'digital_authority',
    camel: 'digitalAuthority',
    label: 'Digital Authority',
    color: PILLAR_COLORS.digital_authority,
    sub: 'Credibility & citation readiness',
    detailKey: 'digital_authority_detail',
  },
  {
    key: 'conversion_readiness',
    camel: 'conversionReadiness',
    label: 'Conversion Readiness',
    color: PILLAR_COLORS.conversion_readiness,
    sub: 'Engagement & calls to action',
    detailKey: 'conversion_readiness_detail',
  },
  {
    key: 'product_discoverability',
    camel: 'productDiscoverability',
    label: 'Product Discoverability',
    color: PILLAR_COLORS.product_discoverability,
    sub: 'Search presence & brand visibility',
    detailKey: 'product_discoverability_detail',
  },
  {
    key: 'rag_readiness',
    camel: 'ragReadiness',
    label: 'RAG Readiness',
    color: PILLAR_COLORS.rag_readiness,
    sub: 'RAG retrieval & synthesis quality',
    detailKey: 'rag_readiness_detail',
  },
  {
    key: 'local_presence',
    camel: 'localPresence',
    label: 'Local Presence',
    color: PILLAR_COLORS.local_presence,
    sub: 'Local trust & findability signals',
    detailKey: 'local_presence_detail',
  },
];

function scoreLabel(s) {
  if (s >= 75) return 'Good';
  if (s >= 50) return 'Fair';
  return 'Needs Work';
}

/** "answerFirstFormatting" → "Answer First Formatting"; "explicitQaStructures" → "Explicit QA Structures" */
function camelToLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim()
    .replace(/\bQa\b/g, 'QA');
}

/**
 * robots.txt Present + one item per AI crawler (GPTBot, ClaudeBot,
 * Google-Extended, PerplexityBot) — a binary network check, so its "real
 * fixed-point value" is 0 or 100, not a graded score. Only meaningful under
 * AI Readability, and only when the tool actually has a domain to check —
 * Content Analyzer has no URL at all, so both args are undefined there and
 * this returns nothing. `numeric` picks the item shape: the deterministic
 * readability_metrics path renders numeric chips alongside its other
 * fixed-point items, while Repo Analysis's REPO_SIGNAL_GROUPS path (the
 * only other caller) still renders plain pass/fail chips.
 */
function buildCrawlerItems(hasRobotsTxt, aiCrawlerAccess, numeric = false) {
  const items = [];
  const item = (label, ok) => numeric ? { label, value: ok ? 100 : 0 } : { label, pass: ok };
  if (hasRobotsTxt !== undefined) {
    items.push(item('robots.txt Present', !!hasRobotsTxt));
  }
  if (Array.isArray(aiCrawlerAccess)) {
    for (const c of aiCrawlerAccess) {
      items.push(item(`${c.crawler} Access`, c.access !== 'blocked'));
    }
  }
  return items;
}

/**
 * Build this pillar's pass/fail breakdown. Repo Analysis has no Gemini
 * detail object — it has `result.signals`, so it's resolved from
 * REPO_SIGNAL_GROUPS directly. For Content Analyzer and URL Scanner, AI
 * Readability is resolved from `result.readability_metrics` — deterministic
 * algorithmic metrics — when present, and Product Discoverability / Local
 * Presence are resolved from `result.technical_signals`'s detected schema
 * fields when URL Scanner ran. Every other pillar (and these on older saved
 * analyses, or on Content Analyzer where there's no URL to check) falls back
 * to thresholding Gemini's judged detail object (e.g.
 * result.ai_readability_detail) into pass/fail instead of showing a raw
 * number. AI Readability additionally gets crawler-access items appended,
 * sourced from wherever each tool keeps them.
 */
function buildSubItems(pillarKey, detailKey, result) {
  let items;

  // Repo Analysis's result.signals is the RepoSignals boolean map; URL
  // Scanner also has a result.signals, but it's an unrelated array of
  // display rows — guard on object-ness, not just truthiness, to tell them
  // apart. Content Analyzer has neither.
  if (result?.signals && !Array.isArray(result.signals)) {
    const group = REPO_SIGNAL_GROUPS[pillarKey] || [];
    items = group.map(item => ({
      label: item.label,
      pass: item.pass ? !!item.pass(result.signals) : !!result.signals[item.key],
    }));
    if (pillarKey === 'ai_readability') {
      items = items.concat(buildCrawlerItems(result.signals.hasRobotsTxt, result.signals.aiCrawlerAccess));
    }
    return items;
  }

  // AI Readability: prefer the deterministic algorithmic breakdown when the
  // backend returned it. Older saved analyses (from before readability_metrics
  // shipped) won't have it — those fall through to the Gemini-judged
  // threshold below, same as before.
  if (pillarKey === 'ai_readability' && result?.readability_metrics) {
    const m = result.readability_metrics;
    items = READABILITY_METRIC_ITEMS.map(item => {
      const raw = item.raw(m);
      return { label: item.label, value: gradedScore(raw, item.threshold, item.higherIsBetter), caption: item.format(raw) };
    });
    return items.concat(
      buildCrawlerItems(result?.technical_signals?.hasRobotsTxt, result?.technical_signals?.aiCrawlerAccess, true)
    );
  }

  // Product Discoverability / Local Presence: ground the breakdown in the
  // schema fields URL Scanner actually found, when it ran (technical_signals
  // only exists for URL Scanner — Content Analyzer has no URL to check and
  // falls through to the Gemini-judged threshold below, same as before).
  // Each field is a real present/absent fact, not a graded judgment, so its
  // fixed-point value is 0 or 100 — honest about what's actually known,
  // same as before when it was a checkmark, just numeric now.
  if (pillarKey === 'product_discoverability' && result?.technical_signals) {
    const sig = result.technical_signals;
    if (!sig.hasProductSchema) return [{ label: 'Product Schema Present', value: 0 }];
    return [
      { label: 'Product Schema Present', value: 100 },
      ...PRODUCT_SCHEMA_FIELD_ITEMS.map(item => ({ label: item.label, value: sig[item.key] ? 100 : 0 })),
    ];
  }
  if (pillarKey === 'local_presence' && result?.technical_signals) {
    const sig = result.technical_signals;
    if (!sig.hasLocalBusinessSchema) return [{ label: 'LocalBusiness Schema Present', value: 0 }];
    return [
      { label: 'LocalBusiness Schema Present', value: 100 },
      ...LOCAL_BUSINESS_SCHEMA_FIELD_ITEMS.map(item => ({ label: item.label, value: sig[item.key] ? 100 : 0 })),
    ];
  }

  const detail = result?.[detailKey];
  items = detail
    ? Object.entries(detail).map(([k, v]) => ({
        label: camelToLabel(k),
        pass: Number(v) >= SUBITEM_PASS_THRESHOLD,
      }))
    : [];
  if (pillarKey === 'ai_readability') {
    items = items.concat(
      buildCrawlerItems(result?.technical_signals?.hasRobotsTxt, result?.technical_signals?.aiCrawlerAccess)
    );
  }
  return items;
}

/* ── Collapsed-by-default pass/fail scoring breakdown ────────────────────── */
function SubItemsList({ items }) {
  const [collapsed, setCollapsed] = useState(true);
  if (!items || items.length === 0) return null;

  return (
    <div className={styles.subItemsWrap}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Show scoring breakdown' : 'Hide scoring breakdown'}
        className={styles.subItemsToggle}
      >
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        <span>Scoring breakdown</span>
      </button>
      {!collapsed && (
        <div className={styles.subItemsList}>
          {items.map((item, i) =>
            item.value !== undefined ? (
              <div key={i} className={`${styles.subItem} ${styles.subItemNumeric}`}>
                <div className={styles.subItemNumericHeader}>
                  <span className={styles.subItemLabel}>{item.label}</span>
                  <span
                    className={styles.subItemValue}
                    style={{ color: item.value >= 75 ? 'var(--green)' : item.value >= 50 ? 'var(--yellow)' : 'var(--red)' }}
                  >
                    {item.value}
                  </span>
                </div>
                {item.caption && <span className={styles.subItemCaption}>{item.caption}</span>}
              </div>
            ) : (
              <div key={i} className={styles.subItem}>
                {item.pass ? (
                  <Check size={14} className={styles.subItemPass} />
                ) : (
                  <X size={14} className={styles.subItemFail} />
                )}
                <span className={styles.subItemLabel}>{item.label}</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Resolve a pillar score from any of the response shapes:
 *   - snake_case top-level (result.ai_readability)           — demo / history
 *   - camelCase pillarScores object (result.pillarScores.aiReadability) — live API
 *   - nested pillars/scores/pillar_scores object
 */
function resolveScore(result, key, camel) {
  const sources = [result, result?.pillars, result?.scores, result?.pillar_scores];
  for (const src of sources) {
    if (src && src[key] !== undefined && src[key] !== null) return src[key];
  }
  if (result?.pillarScores && result.pillarScores[camel] !== undefined) {
    return result.pillarScores[camel];
  }
  return null;
}

const PRODUCT_DISCOVERABILITY_NOTE =
  "Product Discoverability applies specifically to product and e-commerce listings — it's part of scoring for the Product Seller lane only.";

const LOCAL_PRESENCE_NOTE =
  "Local Presence applies specifically to businesses serving a local customer base — it's part of scoring for the Local Service Business lane only.";

/* ── Collapsible "What does this mean?" ──────────────────────────────────── */
function WhatDoesThisMean({ tagline, children }) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div>
      <p className={styles.tagline}>{tagline}</p>
      <div className={styles.disclaimer} style={{ padding: collapsed ? '8px 16px' : '12px 16px' }}>
        <div className={styles.disclaimerHeader}>
          <strong className={styles.disclaimerTitle}>What does this mean?</strong>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand explanation' : 'Collapse explanation'}
            className={styles.disclaimerToggle}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
        {!collapsed && <p className={styles.disclaimerText}>{children}</p>}
      </div>
    </div>
  );
}

export default function PillarScores({ result, lane }) {
  const visiblePillars = PILLARS.filter(p => {
    if (p.key === 'product_discoverability') return lane === 'product_sellers';
    if (p.key === 'local_presence') return lane === 'local_business';
    return true;
  });

  const overall =
    result?.overall_score ??
    result?.overallScore ??
    result?.score ??
    result?.overall ??
    null;

  return (
    <div className={styles.root}>
      {overall !== null && (
        <div className={styles.overallRow}>
          <span className={styles.overallLabel}>Overall AEO Score</span>
          <span
            className={styles.overallValue}
            style={{
              color:
                overall >= 75
                  ? 'var(--green)'
                  : overall >= 50
                  ? 'var(--yellow)'
                  : 'var(--red)',
            }}
          >
            {Math.round(overall)}
          </span>
          <span className={styles.overallMax}>/100</span>
        </div>
      )}

      <WhatDoesThisMean tagline="AI's structured read of your content.">
        Gemini grades your content against this pillar's fixed rubric — a consistent AI judgment of how well an AI could use it, not a literal count like word count or load speed, so scores stay comparable across your pages and over time.
      </WhatDoesThisMean>

      <div className={styles.pillars}>
        {visiblePillars.map(p => {
          const score = resolveScore(result, p.key, p.camel);
          const pct = score !== null ? Math.min(Math.round(score), 100) : null;

          return (
            <div key={p.key} className={styles.pillar}>
              <div className={styles.pillarHeader}>
                <div className={styles.pillarDot} style={{ background: p.color }} />
                <div>
                  <div className={styles.pillarLabel}>{p.label}</div>
                  <div className={styles.pillarSub}>{p.sub}</div>
                  {p.key === 'product_discoverability' && (
                    <div className={styles.pillarNote}>{PRODUCT_DISCOVERABILITY_NOTE}</div>
                  )}
                  {p.key === 'local_presence' && (
                    <div className={styles.pillarNote}>{LOCAL_PRESENCE_NOTE}</div>
                  )}
                </div>
                <div className={styles.pillarRight}>
                  {pct !== null ? (
                    <>
                      <span className={styles.pillarScore} style={{ color: p.color }}>
                        {pct}
                      </span>
                      <span className={styles.pillarMax}>/100</span>
                      <span
                        className={styles.pillarTag}
                        style={{ color: p.color, borderColor: p.color }}
                      >
                        {scoreLabel(pct)}
                      </span>
                    </>
                  ) : (
                    <span className={styles.pillarNa}>N/A</span>
                  )}
                </div>
              </div>

              <div className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{
                    width: pct !== null ? `${pct}%` : '0%',
                    background: p.color,
                  }}
                />
              </div>

              <SubItemsList items={buildSubItems(p.key, p.detailKey, result)} />
            </div>
          );
        })}
      </div>

      {lane === 'product_sellers' && (
        <WhatDoesThisMean tagline="AI's read on how shoppable your page looks — specific to product sellers.">
          This pillar grades whether an AI could confidently describe, compare, and recommend your product from your page alone — clear pricing, specs, and availability — the same AI-judgment method as your other pillars, but scored for shopping questions specifically.
        </WhatDoesThisMean>
      )}

      {lane === 'local_business' && (
        <WhatDoesThisMean tagline="AI's read on how findable and trustworthy your business looks locally — specific to local service businesses.">
          This pillar grades whether an AI could confidently state your business's name, address, phone, service area, and reputation from your page alone — the same AI-judgment method as your other pillars, but scored for how AI tools decide which local business to recommend.
        </WhatDoesThisMean>
      )}
    </div>
  );
}
