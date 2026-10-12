import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, subtitle, actions, about }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {(actions || about) && (
          <div className={styles.actions}>
            {about && (
              <button
                type="button"
                className={styles.aboutBtn}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(o => !o)}
              >
                How this works
                <ChevronDown size={14} className={open ? styles.chevOpen : styles.chev} />
              </button>
            )}
            {actions}
          </div>
        )}
      </div>
      {about && open && (
        <div id={panelId} className={styles.aboutPanel}>
          {about.map(item => (
            <div key={item.heading} className={styles.aboutItem}>
              <h2 className={styles.aboutHeading}>{item.heading}</h2>
              <p className={styles.aboutBody}>{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
