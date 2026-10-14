import { Link } from 'react-router-dom';
import { ArrowRight, Target } from 'lucide-react';
import styles from './ImproveCta.module.css';

// The "what now?" step under a check result.
export default function ImproveCta({ link, title, body, label = 'Improve my chances' }) {
  return (
    <div className={styles.bar}>
      <span className={styles.icon}><Target size={16} aria-hidden="true" /></span>
      <div className={styles.text}>
        <div className={styles.title}>{title}</div>
        {body && <div className={styles.body}>{body}</div>}
      </div>
      <Link to={link.to} state={link.state} className={styles.btn}>
        {label} <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
