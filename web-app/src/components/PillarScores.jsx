import styles from './PillarScores.module.css';

const PILLARS = [
  {
    key: 'ai_readability',
    camel: 'aiReadability',
    label: 'AI Readability',
    color: '#06b6d4',
    sub: 'Semantic clarity & AEO alignment',
    detailKey: 'ai_readability_detail',
  },
  {
    key: 'digital_authority',
    camel: 'digitalAuthority',
    label: 'Digital Authority',
    color: '#22c55e',
    sub: 'Credibility & citation readiness',
    detailKey: 'digital_authority_detail',
  },
  {
    key: 'conversion_readiness',
    camel: 'conversionReadiness',
    label: 'Conversion Readiness',
    color: '#a855f7',
    sub: 'Engagement & calls to action',
    detailKey: 'conversion_readiness_detail',
  },
  {
    key: 'product_discoverability',
    camel: 'productDiscoverability',
    label: 'Product Discoverability',
    color: '#f97316',
    sub: 'Search presence & brand visibility',
    detailKey: 'product_discoverability_detail',
  },
  {
    key: 'rag_readiness',
    camel: 'ragReadiness',
    label: 'RAG Readiness',
    color: '#ec4899',
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

export default function PillarScores({ result }) {
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

      <div className={styles.pillars}>
        {PILLARS.map(p => {
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
    </div>
  );
}
