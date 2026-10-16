import { useEffect, useState } from 'react';
import Select from './Select.jsx';
import { loadRecent } from '../lib/recentSites.js';
import styles from './RecentPicker.module.css';

// "Use a site you've already worked with": a dropdown of your past websites
// (mode "site") or exact pages (mode "page"), shown next to a website field.
const LABELS = {
  site: 'Or pick a site you used before',
  page: 'Or pick a page you scanned before',
  brand: 'Or pick a brand you used before',
  question: 'Or pick a question you checked before',
};

export default function RecentPicker({ mode = 'site', onPick, label }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    loadRecent().then(r => {
      if (cancelled) return;
      const list = mode === 'page' ? r.pages : mode === 'brand' ? r.brands : mode === 'question' ? r.questions : r.sites;
      const clean = v => (mode === 'brand' || mode === 'question' ? v : v.replace(/^https?:\/\/(www\.)?/, ''));
      setOptions(list.map(v => ({ value: v, label: clean(v).length > 70 ? `${clean(v).slice(0, 67)}…` : clean(v) })));
    });
    return () => { cancelled = true; };
  }, [mode]);

  if (options.length < 1) return null;
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label || LABELS[mode]}</span>
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
