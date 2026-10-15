import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, FileText, Globe, GitBranch } from 'lucide-react';
import { urlScannerLabel } from '../lib/laneLabels.js';
import styles from './NewAnalysisMenu.module.css';

// The three ways to start an analysis. Each lane leads with the one that fits
// it best (same order as the sidebar) and marks it "Recommended".
const FIRST_BY_LANE = {
  general: 'analyze',
  product_sellers: 'urlScanner',
  local_business: 'urlScanner',
  developers: 'repo',
  vibe_coders: 'repo',
};

function toolsFor(lane) {
  const all = {
    analyze: { key: 'analyze', to: '/analyze', label: 'Content Optimizer', Icon: FileText, desc: 'Paste writing and get an AI readability score.' },
    urlScanner: { key: 'urlScanner', to: '/url-scanner', label: urlScannerLabel(lane), Icon: Globe, desc: 'Scan a web page for what AI can and can\'t read.' },
    repo: { key: 'repo', to: '/repo-analysis', label: 'Repo Analysis', Icon: GitBranch, desc: 'Score a GitHub repo\'s docs and code.' },
  };
  const first = FIRST_BY_LANE[lane] || 'analyze';
  return [all[first], ...Object.values(all).filter(t => t.key !== first)];
}

export default function NewAnalysisMenu({ lane, firstTime = false }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const tools = toolsFor(lane);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={`${styles.btn} ${firstTime ? styles.glow : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus size={15} aria-hidden="true" />
        {firstTime ? 'Run your first analysis' : 'New Analysis'}
        <ChevronDown size={14} aria-hidden="true" className={open ? styles.flip : ''} />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {tools.map((t, i) => (
            <button key={t.key} type="button" role="menuitem" className={styles.item} onClick={() => navigate(t.to)}>
              <t.Icon size={16} aria-hidden="true" className={styles.itemIcon} />
              <span className={styles.itemText}>
                <span className={styles.itemLabel}>
                  {t.label}
                  {i === 0 && <span className={styles.rec}>Recommended to start here</span>}
                </span>
                <span className={styles.itemDesc}>{t.desc}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
