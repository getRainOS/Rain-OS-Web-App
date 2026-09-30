import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './PillarScores.module.css';
import { PILLAR_COLORS } from '../lib/pillarColors.js';

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
];

function scoreLabel(s) {
  if (s >= 75) return 'Good';
  if (s >= 50) return 'Fair';
  return 'Needs Work';
}

/** "answerFirstFormatting" → "Answer First Formatting" */
function camelToLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
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
  const visiblePillars = PILLARS.filter(
    p => p.key !== 'product_discoverability' || lane === 'product_sellers'
  );

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

          // Prefer the structured detail object (live API), fall back to legacy subscores
          const detail =
            result?.[p.detailKey] || result?.[`${p.key}_subscores`] || null;

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

              {detail && Object.keys(detail).length > 0 && (
                <div className={styles.subscores}>
                  {Object.entries(detail).map(([k, v]) => (
                    <div key={k} className={styles.subscore}>
                      <span className={styles.subscoreLabel}>{camelToLabel(k)}</span>
                      <span className={styles.subscoreValue} style={{ color: p.color }}>
                        {Math.round(Number(v))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lane === 'product_sellers' && (
        <WhatDoesThisMean tagline="AI's read on how shoppable your page looks — specific to product sellers.">
          This pillar checks something the other four don't: whether an AI could confidently describe, compare, and recommend your product from your page alone — things like clear pricing, specs, and availability. It's graded the same way as your other pillar scores, an AI's structured read rather than a technical measurement, but scored specifically for how AI tools use product pages when answering shopping questions.
        </WhatDoesThisMean>
      )}
    </div>
  );
}
