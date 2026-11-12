import styles from './LaneWeights.module.css';

// How each lane weights the pillars: four core pillars, plus the lane's own pillar for sellers and local businesses — the real percentages the scorer
// uses (backend moduleRubric / analyzeContent). Same graphic as the home page.
export const LANE_WEIGHTS = [
  { id: 'general', name: 'Writers & Marketers', who: 'Articles, blogs, landing pages', w: [25, 25, 25, 0, 0, 25] },
  { id: 'product_sellers', name: 'Online Sellers', who: 'Shopify, Etsy, Amazon, DTC stores', w: [20, 20, 20, 20, 0, 20] },
  { id: 'developers', name: 'Developers', who: 'Docs, READMEs, API references', w: [25, 25, 25, 0, 0, 25] },
  { id: 'vibe_coders', name: 'Vibe Coders', who: 'Apps built with Bolt, Lovable, Cursor, v0', w: [25, 25, 25, 0, 0, 25] },
  { id: 'local_business', name: 'Local Businesses', who: 'Service businesses people find nearby', w: [20, 20, 20, 0, 20, 20] },
];
// One colour per pillar, the same as the trend lines.
const SEG = ['#ffffff', '#3B82F6', '#F97316', '#14B8A6', '#A78BFA', '#EF4444'];
const SHORT = ['AI Readability', 'Digital Authority', 'Conversion Readiness', 'Product Discoverability', 'Local Presence', 'Easy to Quote'];

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
