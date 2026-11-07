import styles from './ScoreDonut.module.css';

// The same bands the pillar list uses (see scoreLabel in PillarScores.jsx).
function bandLabel(s) {
  if (s == null) return null;
  if (s >= 75) return 'Good';
  if (s >= 50) return 'Fair';
  return 'Needs Work';
}

// A half-circle gauge: a thin arc on a faint track, the score under the arc's
// centre, the band (Good / Fair / Needs Work) beneath it, then the label and the change.
export default function ScoreDonut({ score, label, color = '#ffffff', size = 96, stroke = 6, delta = null }) {
  const pct = Math.max(0, Math.min(100, Number(score) || 0));
  const w = size;
  const h = Math.round(size * 0.6);
  const r = (w - stroke * 2) / 2;
  const cx = w / 2;
  const cy = h - stroke / 2 - 1;
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const length = Math.PI * r;
  const band = bandLabel(score == null ? null : pct);
  return (
    <figure className={styles.donut} title={`${label}: ${Math.round(pct)}/100${band ? ` (${band})` : ''}`}>
      <div className={styles.ring} style={{ width: w, height: h }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} shapeRendering="geometricPrecision" aria-hidden="true">
          <path d={arcPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} strokeLinecap="round" />
          <path
            d={arcPath} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * length} ${length}`}
            className={styles.arc}
          />
        </svg>
        <span className={styles.value}>{score == null ? '—' : Math.round(pct)}</span>
      </div>
      {band && <span className={styles.band}>{band}</span>}
      <figcaption className={styles.label}>{label}</figcaption>
      {delta !== null && delta !== undefined && (
        <span className={`${styles.delta} ${delta > 0 ? styles.up : delta < 0 ? styles.down : ''}`}>
          {delta > 0 ? `+${delta}` : delta === 0 ? 'no change' : delta} {delta !== 0 ? 'pts' : ''}
        </span>
      )}
    </figure>
  );
}
