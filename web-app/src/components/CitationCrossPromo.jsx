import { Link } from 'react-router-dom';
import styles from './CitationCrossPromo.module.css';

export default function CitationCrossPromo({ title, sub }) {
  return (
    <div className={styles.banner}>
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.sub}>{sub}</p>
      </div>
      <Link to="/citation-monitor" className={styles.cta}>
        Check citations now →
      </Link>
    </div>
  );
}
