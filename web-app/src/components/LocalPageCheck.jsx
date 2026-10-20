import { CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import styles from './LocalPageCheck.module.css';

// URL Scanner: does this page clearly serve the target city? Every row is
// read from the page itself. The steps underneath are guidance, not checks:
// we can't see Google Business Profile, Bing Places or reviews yet.
export default function LocalPageCheck({ check }) {
  if (!check) return null;
  const failing = check.items.filter(i => !i.pass);
  const passing = check.items.filter(i => i.pass);
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.head}>
        <MapPin size={16} aria-hidden="true" />
        <div>
          <h3 className={styles.title}>Found in {check.city}?</h3>
          <p className={styles.sub}>
            <strong>{check.passed} of {check.total}</strong> local checks pass. These read this page and its schema markup only,
            not Google or directories.
          </p>
        </div>
      </div>
      <ul className={styles.list}>
        {[...failing, ...passing].map(i => (
          <li key={i.id} className={styles.row}>
            {i.pass
              ? <CheckCircle2 size={15} className={styles.ok} aria-label="Pass" />
              : <AlertCircle size={15} className={styles.bad} aria-label="Needs work" />}
            <div>
              <div className={styles.label}>{i.label}</div>
              <div className={styles.detail}>{i.detail}</div>
              {i.fix && <div className={styles.fix}>{i.fix}</div>}
            </div>
          </li>
        ))}
      </ul>
      <LocalSteps city={check.city} />
    </div>
  );
}

export function LocalSteps({ city }) {
  const place = city || 'your city';
  return (
    <div className={styles.steps}>
      <div className={styles.stepsTitle}>Steps to take outside your website</div>
      <p className={styles.stepsNote}>We don't check these yet; they're what helps most beyond the page itself.</p>
      <ol className={styles.stepList}>
        <li>
          <strong>Google Business Profile.</strong> Claim it at business.google.com, pick the most specific primary
          category, add {place} (and nearby areas) as service areas, your hours, photos, and the same name, address and
          phone as your website. Google's AI answers lean on it.
        </li>
        <li>
          <strong>Bing Places.</strong> Claim it at bingplaces.com; you can import your Google profile in a few clicks.
          ChatGPT's web search is widely reported to use Bing, and many businesses skip this.
        </li>
        <li>
          <strong>Reviews that mention {place}.</strong> When you ask for a review, ask customers to mention what you did
          and where, e.g. "our wedding cake in {place}". Reply to reviews and use the place name naturally in replies.
        </li>
      </ol>
    </div>
  );
}
