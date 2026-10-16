import { useEffect, useState } from 'react';
import Select from './Select.jsx';
import { loadRecent } from '../lib/recentSites.js';
import styles from './RecentPicker.module.css';

// "Use a site you've already worked with": a dropdown of your past websites
// (mode "site") or exact pages (mode "page"), shown next to a website field.
export default function RecentPicker({ mode = 'site', onPick, label }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    loadRecent().then(r => {
      if (cancelled) return;
      const list = mode === 'page' ? r.pages : r.sites;
      setOptions(list.map(v => ({ value: v, label: v.replace(/^https?:\/\/(www\.)?/, '') })));
    });
    return () => { cancelled = true; };
  }, [mode]);

  if (options.length < 1) return null;
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label || (mode === 'page' ? 'Or pick a page you scanned before' : 'Or pick a site you used before')}</span>
      <Select
        className={styles.select}
        ariaLabel="Choose from your history"
        placeholder="Choose from history"
        options={options}
        value=""
        onChange={onPick}
      />
    </div>
  );
}
