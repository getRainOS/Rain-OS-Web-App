import styles from './ScoreDonut.module.css';

// A crisp score ring: thin arc on a faint track, the score in the centre as a
// tabular number, label and optional change underneath.
export default function ScoreDonut({ score, label, color = '#ffffff', size = 72, stroke = 5, delta = null }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <figure className={styles.donut} title={`${label}: ${Math.round(pct)}/100`}>
      <div className={styles.ring} style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="geometricPrecision" aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className={styles.arc}
          />
        </svg>
        <span className={styles.value}>{score == null ? '—' : Math.round(pct)}</span>
      </div>
      <figcaption className={styles.label}>{label}</figcaption>
      {delta !== null && delta !== undefined && (
        <span className={`${styles.delta} ${delta > 0 ? styles.up : delta < 0 ? styles.down : ''}`}>
          {delta > 0 ? `+${delta}` : delta === 0 ? 'no change' : delta} {delta !== 0 ? 'pts' : ''}
        </span>
      )}
    </figure>
  );
}
