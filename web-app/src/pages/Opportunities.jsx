import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, PenLine, RefreshCw, ScanSearch, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client.js';
import PageHeader from '../components/PageHeader.jsx';
import { buildOpportunities } from '../lib/opportunities.js';
import { improveLink } from '../lib/improveLink.js';
import styles from './Opportunities.module.css';

const PRIORITY_LABEL = { high: 'High impact', medium: 'Worth doing', low: 'Quick win' };
const listOf = data => (Array.isArray(data) ? data : data?.items ?? []);

export default function Opportunities() {
  const [checks, setChecks] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([api.citationHistory(), api.history()]).then(([c, h]) => {
      if (cancelled) return;
      if (c.status === 'fulfilled') setChecks(listOf(c.value.data));
      if (h.status === 'fulfilled') setScans(listOf(h.value.data).filter(i => i.type === 'url'));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const items = useMemo(() => buildOpportunities({ checks, scans }), [checks, scans]);
  const nothingYet = !loading && checks.length === 0 && scans.length === 0;

  const improveFor = item => improveLink({ question: item.question, url: item.url, mode: 'citation' });

  function recheckHref(item) {
    const p = new URLSearchParams({ q: item.question });
    if (item.url) p.set('url', item.url);
    return `/citation-monitor?${p}`;
  }

  return (
    <div className={`${styles.page} fade-in`}>
      <PageHeader
        title="To-Do List"
        subtitle="What to do next to show up in AI answers, built from your checks and scans. Most important first."
        about={[
          { heading: 'Where these come from', body: 'Questions where Gemini didn’t cite you or ranked you low, forums and review sites it keeps citing for your questions, and pages that scored under 60 in URL Scanner.' },
          { heading: 'Keeping it current', body: 'The list updates as you run checks and scans. Re-check a question after you make a change to see whether it worked.' },
        ]}
      />

      {loading ? (
        <div className={styles.loading}><span className="spinner" /></div>
      ) : nothingYet ? (
        <div className={`card ${styles.empty}`}>
          <h3>Nothing to work on yet</h3>
          <p>Check a few questions your customers ask AI, or scan your website. Opportunities appear here as soon as there is something to fix.</p>
          <div className={styles.emptyActions}>
            <Link to="/prompt-research" className={styles.primary}>Find questions to check <ArrowRight size={14} /></Link>
            <Link to="/url-scanner" className={styles.secondary}>Scan my website</Link>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className={`card ${styles.empty}`}>
          <CheckCircle2 size={20} className={styles.okIcon} aria-hidden="true" />
          <h3>You’re in good shape</h3>
          <p>Gemini cites you near the top for every question you’ve checked, and your scanned pages score 60 or higher. Check more questions to find new gaps.</p>
          <div className={styles.emptyActions}>
            <Link to="/prompt-research" className={styles.primary}>Find more questions <ArrowRight size={14} /></Link>
          </div>
        </div>
      ) : (
        <>
          <p className={styles.count}>{items.length} thing{items.length !== 1 ? 's' : ''} to do</p>
          <ul className={styles.list}>
            {items.map(item => (
              <li key={item.id} className={`card ${styles.item}`}>
                <div className={styles.itemTop}>
                  <span className={styles.priority} data-priority={item.priority}>{PRIORITY_LABEL[item.priority]}</span>
                  {item.question && <span className={styles.question}>“{item.question}”</span>}
                  {item.kind === 'scan' && <span className={styles.question}>{item.url}</span>}
                </div>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.detail}>{item.detail}</p>
                <div className={styles.actions}>
                  {(item.kind === 'uncited' || item.kind === 'lowrank') && (
                    <>
                      <Link to={improveFor(item).to} state={improveFor(item).state} className={styles.primary}>
                        <PenLine size={14} /> {item.kind === 'uncited' ? 'Show me how to get cited' : 'Show me how to move up'}
                      </Link>
                      <Link to={recheckHref(item)} className={styles.secondary}><RefreshCw size={13} /> Re-check</Link>
                    </>
                  )}
                  {item.kind === 'site' && (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.secondary}>
                      See what Gemini cited <ExternalLink size={13} />
                    </a>
                  )}
                  {item.kind === 'scan' && (
                    <Link to={`/url-scanner?url=${encodeURIComponent(item.url)}`} className={styles.primary}>
                      <ScanSearch size={14} /> See the fixes
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
