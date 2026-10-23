import styles from './MetricBars.module.css';

// The app's standard for numbers on a scale: muted label, a thin blue bar on
// a faint track, and a crisp tabular number. Optional "before" shows "a → b".
// rows: [{ key, label, value (0-100 for the bar), display?, before?, tone?, hint? }]
export default function MetricBars({ rows, labelWidth = 170, valueWidth = 70 }) {
  return (
    <ul className={styles.list} style={{ '--label-w': `${labelWidth}px`, '--value-w': `${valueWidth}px` }}>
      {rows.map(r => {
        const pct = Math.max(0, Math.min(100, Number(r.value) || 0));
        return (
          <li key={r.key || r.label} className={styles.row}>
            <span className={styles.label}>{r.label}</span>
            <span className={styles.track} aria-hidden="true">
              <span className={`${styles.fill} ${r.tone ? styles[r.tone] : ''}`} style={{ width: `${pct}%` }} />
            </span>
            <span className={styles.value}>
              {r.before !== undefined && r.before !== null ? `${r.before} → ` : ''}{r.display ?? Math.round(pct)}
            </span>
            {r.hint && <span className={styles.hint}>{r.hint}</span>}
          </li>
        );
      })}
    </ul>
  );
}
