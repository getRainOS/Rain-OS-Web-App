import { Plus } from 'lucide-react';
import Select from './Select.jsx';
import styles from './MonitorTabs.module.css';

export function ViewTabs({ items, value, onChange, label }) {
  return (
    <div className={styles.viewTabs} role="tablist" aria-label={label}>
      {items.map(it => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={value === it.id}
          className={`${styles.viewTab} ${value === it.id ? styles.viewTabActive : ''}`}
          onClick={() => onChange(it.id)}
        >
          {it.label}
          {typeof it.count === 'number' && it.count > 0 && <span className={styles.viewTabCount}>{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function SubTabs({ items, value, onChange, label }) {
  return (
    <div className={styles.subTabs} role="tablist" aria-label={label}>
      {items.map(it => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={value === it.id}
          className={`${styles.subTab} ${value === it.id ? styles.subTabActive : ''}`}
          onClick={() => onChange(it.id)}
        >
          {it.label}
          {typeof it.count === 'number' && it.count > 0 && <span className={styles.subTabCount}>{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function NewCheckButton({ onClick }) {
  return (
    <button type="button" className={styles.newCheckBtn} onClick={onClick}>
      <Plus size={14} aria-hidden="true" /> New check
    </button>
  );
}

export function QuestionPicker({ id, label = 'Question', options, value, onChange }) {
  return (
    <div className={styles.filterBar}>
      <label htmlFor={id} className={styles.filterLabel}>{label}</label>
      <Select
        id={id}
        className={styles.filterSelect}
        value={value ?? ''}
        onChange={onChange}
        options={options.map(o => ({ value: o.key, label: o.label }))}
      />
    </div>
  );
}

export function CheckChips({ items }) {
  return (
    <div className={styles.chips}>
      {items.map((c, i) => (
        <div key={i} className={styles.chip}>
          <span className={styles.chipDate}>{c.date}</span>
          <span className={styles[`chip_${c.tone || 'muted'}`]}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export function TabEmpty({ children, icon: Icon, title }) {
  return (
    <div className={styles.tabEmpty}>
      {Icon && <span className={styles.tabEmptyIcon}><Icon size={18} aria-hidden="true" /></span>}
      {title && <div className={styles.tabEmptyTitle}>{title}</div>}
      <div>{children}</div>
    </div>
  );
}

export function shortDate(str) {
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
