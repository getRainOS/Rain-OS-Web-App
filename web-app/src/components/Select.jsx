import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

// Accessible custom dropdown (listbox pattern) so menus match the app
// instead of the browser's default. Options: [{ value, label, hint? }].
export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  id,
  ariaLabel,
  className = '',
  menuAlign = 'left',
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const listId = useId();
  const selectedIndex = useMemo(() => options.findIndex(o => o.value === value), [options, value]);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  function openMenu() {
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function choose(i) {
    const o = options[i];
    if (!o) return;
    onChange(o.value);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openMenu(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(options.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
    else if (e.key === 'Tab') setOpen(false);
  }

  return (
    <div className={`${styles.root} ${className}`} ref={rootRef}>
      <button
        type="button"
        id={id}
        className={styles.trigger}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span className={selected ? styles.value : styles.placeholder}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={14} className={`${styles.chev} ${open ? styles.chevOpen : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul id={listId} role="listbox" className={`${styles.menu} ${menuAlign === 'right' ? styles.menuRight : ''}`}>
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={`${styles.option} ${i === active ? styles.optionActive : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={e => e.preventDefault()}
              onClick={() => choose(i)}
            >
              <span className={styles.optionLabel}>{o.label}</span>
              {o.hint && <span className={styles.optionHint}>{o.hint}</span>}
              {o.value === value && <Check size={14} className={styles.tick} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
