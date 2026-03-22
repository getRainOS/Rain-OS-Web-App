import styles from './PillarScores.module.css';

const PILLARS = [
  { key: 'ai_readability',        label: 'AI Readability',        color: '#06b6d4', sub: 'Semantic clarity & AEO alignment' },
  { key: 'digital_authority',     label: 'Digital Authority',     color: '#22c55e', sub: 'Credibility & citation readiness' },
  { key: 'conversion_readiness',  label: 'Conversion Readiness',  color: '#a855f7', sub: 'Engagement & calls to action' },
  { key: 'product_discoverability', label: 'Product Discoverability', color: '#f97316', sub: 'Search presence & brand visibility' },
];

function scoreLabel(s) {
  if (s >= 75) return 'Good';
  if (s >= 50) return 'Fair';
  return 'Needs Work';
}

function resolveScore(result, key) {
  const sources = [result, result?.pillars, result?.scores, result?.pillar_scores];
  for (const src of sources) {
    if (src && src[key] !== undefined && src[key] !== null) return src[key];
  }
  return null;
}

export default function PillarScores({ result }) {
  const overall = result?.overall_score ?? result?.score ?? result?.overall ?? null;

  return (
    <div className={styles.root}>
      {overall !== null && (
        <div className={styles.overallRow}>
          <span className={styles.overallLabel}>Overall AEO Score</span>
          <span className={styles.overallValue} style={{
            color: overall >= 75 ? 'var(--green)' : overall >= 50 ? 'var(--yellow)' : 'var(--red)',
          }}>
            {Math.round(overall)}
          </span>
          <span className={styles.overallMax}>/100</span>
        </div>
      )}

      <div className={styles.pillars}>
        {PILLARS.map(p => {
          const score = resolveScore(result, p.key);
          const pct = score !== null ? Math.min(Math.round(score), 100) : null;
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
                      <span className={styles.pillarScore} style={{ color: p.color }}>{pct}</span>
                      <span className={styles.pillarMax}>/100</span>
                      <span className={styles.pillarTag} style={{ color: p.color, borderColor: p.color }}>
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

              {result?.[`${p.key}_subscores`] && (
                <div className={styles.subscores}>
                  {Object.entries(result[`${p.key}_subscores`]).map(([k, v]) => (
                    <div key={k} className={styles.subscore}>
                      <span className={styles.subscoreLabel}>{k.replace(/_/g, ' ')}</span>
                      <span className={styles.subscoreValue} style={{ color: p.color }}>{Math.round(v)}</span>
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
