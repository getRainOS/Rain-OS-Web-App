import { isSharedPlatform } from '../lib/sharedPlatforms.js';
import { siteFromUrl } from '../lib/fullCheck.js';
import styles from './SiteNote.module.css';

// Tells people up front what a missing or shared-platform website costs them.
export default function SiteNote({ url, blankText }) {
  const trimmed = (url || '').trim();
  if (!trimmed) return blankText ? <p className={styles.note}>{blankText}</p> : null;
  const domain = siteFromUrl(trimmed);
  if (isSharedPlatform(domain)) {
    return (
      <p className={`${styles.note} ${styles.warn}`}>
        This is a page on {domain}, which many businesses share, so we can’t tell whether a cited page is yours. Use your own website if you have one. You’ll still see the sources.
      </p>
    );
  }
  return null;
}
