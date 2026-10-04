import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import styles from './PillarScores.module.css';
import { PILLAR_COLORS } from '../lib/pillarColors.js';

// A Gemini-judged sub-score (0-100) at or above this counts as a "pass" in
// the breakdown below. The raw number is never shown — only pass/fail — so
// the underlying scoring formula isn't exposed.
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
 * Google-Extended, PerplexityBot), pass/fail only. Only meaningful under AI
 * Readability, and only when the tool actually has a domain to check —
 * Content Analyzer has no URL at all, so both args are undefined there and
 * this returns nothing.
 */
function buildCrawlerItems(hasRobotsTxt, aiCrawlerAccess) {
  const items = [];
  if (hasRobotsTxt !== undefined) {
    items.push({ label: 'robots.txt Present', pass: !!hasRobotsTxt });
  }
  if (Array.isArray(aiCrawlerAccess)) {
    for (const c of aiCrawlerAccess) {
      items.push({ label: `${c.crawler} Access`, pass: c.access !== 'blocked' });
    }
  }
  return items;
}

/**
 * Build this pillar's pass/fail breakdown. Repo Analysis has no Gemini
 * detail object — it has `result.signals`, so it's resolved from
 * REPO_SIGNAL_GROUPS directly. Content Analyzer and URL Scanner have a
 * Gemini-judged detail object (e.g. result.ai_readability_detail), which is
 * thresholded into pass/fail instead of shown as a raw number. AI
 * Readability additionally gets crawler-access items appended, sourced from
 * wherever each tool keeps them.
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
          {items.map((item, i) => (
            <div key={i} className={styles.subItem}>
              {item.pass ? (
                <Check size={14} className={styles.subItemPass} />
              ) : (
                <X size={14} className={styles.subItemFail} />
              )}
              <span className={styles.subItemLabel}>{item.label}</span>
            </div>
          ))}
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

      <WhatDoesThisMean tagline="AI's structured read of your content — not a raw measurement.">
        Gemini reads your content and scores it against a fixed set of criteria for this pillar, the same way each time. It's not counting anything concrete, like word count or load speed — it's a graded read of how well your content works for an AI trying to understand and use it. Because the criteria stay fixed, the score is meaningful to compare across your own pages, or the same page over time, even though it's a judgment rather than a fact.
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
          This pillar checks something the other four don't: whether an AI could confidently describe, compare, and recommend your product from your page alone — things like clear pricing, specs, and availability. It's graded the same way as your other pillar scores, an AI's structured read rather than a technical measurement, but scored specifically for how AI tools use product pages when answering shopping questions.
        </WhatDoesThisMean>
      )}

      {lane === 'local_business' && (
        <WhatDoesThisMean tagline="AI's read on how findable and trustworthy your business looks locally — specific to local service businesses.">
          This pillar checks something the other four don't: whether an AI could confidently state your business's name, address, phone, service area, and reputation from your page alone. It's graded the same way as your other pillar scores, an AI's structured read rather than a technical measurement, but scored specifically for how AI tools decide which local business to recommend.
        </WhatDoesThisMean>
      )}
    </div>
  );
}
