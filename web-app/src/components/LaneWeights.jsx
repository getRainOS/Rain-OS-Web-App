import styles from './LaneWeights.module.css';

// How each lane weights the six pillars — the real percentages the scorer
// uses (backend moduleRubric / analyzeContent). Same graphic as the home page.
export const LANE_WEIGHTS = [
  { id: 'general', name: 'Writers & Marketers', who: 'Articles, blogs, landing pages', w: [36, 27, 27, 0, 0, 10] },
  { id: 'product_sellers', name: 'Product Sellers', who: 'Shopify, Etsy, Amazon, DTC stores', w: [20, 15, 15, 50, 0, 10] },
  { id: 'developers', name: 'Developers', who: 'Docs, READMEs, API references', w: [32, 32, 26, 0, 0, 10] },
  { id: 'vibe_coders', name: 'Vibe Coders', who: 'Apps built with Bolt, Lovable, Cursor, v0', w: [32, 32, 26, 0, 0, 10] },
  { id: 'local_business', name: 'Local Businesses', who: 'Service businesses people find nearby', w: [20, 20, 20, 0, 30, 10] },
];
const SEG = ['#2B8FE3', '#5aa9ef', '#8ac2f4', '#c7b8ff', '#ffb86b', '#6b7280'];
const SHORT = ['Easy for AI to read', 'Trust', 'Clear next step', 'Product details', 'Local info', 'Easy to quote'];

export default function LaneWeights({ current }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.legend}>
        {SHORT.map((s, k) => (
          <span key={s}><span className={styles.swatch} style={{ background: SEG[k] }} />{s}</span>
        ))}
      </div>
      <div className={styles.table}>
        {LANE_WEIGHTS.map(l => (
          <div key={l.id} className={`${styles.row} ${l.id === current ? styles.current : ''}`}>
            <div className={styles.who}>
              <div className={styles.name}>{l.name}{l.id === current && <span className={styles.badge}>Your lane</span>}</div>
              <div className={styles.sub}>{l.who}</div>
            </div>
            <div className={styles.bar} aria-label={l.w.map((v, k) => (v ? `${SHORT[k]} ${v}%` : null)).filter(Boolean).join(', ')}>
              {l.w.map((v, k) => v > 0 && (
                <div key={k} style={{ width: `${v}%`, background: SEG[k] }}>{v}%</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
