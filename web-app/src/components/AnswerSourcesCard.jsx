import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../api/client.js';
import { checkBelongs } from '../lib/subjects.js';
import { buildSourceTypes } from '../lib/sourceTypes.js';
import styles from './AnswerSourcesCard.module.css';

const pct = n => `${Math.round(n * 100)}%`;

// "Where AI gets its answers": for the chosen brand, the kinds of sites AI
// used as sources across all its checked questions and engines, top 3 only,
// each with one thing to do. Built from saved checks; no new AI calls.
export default function AnswerSourcesCard({ subject, cardClass, titleClass, subClass }) {
  const [checks, setChecks] = useState(null);

  useEffect(() => {
    api.citationHistory({ limit: 100, engine: 'all' })
      .then(({ data }) => setChecks(Array.isArray(data) ? data : data?.items ?? []))
      .catch(() => setChecks([]));
  }, []);

  const summary = useMemo(() => {
    if (!checks || !subject) return null;
    const mine = checks.filter(c => checkBelongs(c, subject) && Array.isArray(c.sources) && c.sources.length);
    const own = subject.website || null;
    const counts = new Map();
    let ownCount = 0;
    for (const c of mine) {
      const seen = new Set();
      for (const s of c.sources) {
        const d = String(s.domain || '').toLowerCase().replace(/^www\./, '');
        if (!d || seen.has(d)) continue;
        seen.add(d);
        if (own && (d === own || d.endsWith(`.${own}`))) { ownCount += 1; continue; }
        const e = counts.get(d) || { domain: d, queryCount: 0, avgRank: 0, sampleUrl: s.url || null };
        e.queryCount += 1;
        counts.set(d, e);
      }
    }
    return { answers: mine.length, ...buildSourceTypes([...counts.values()], ownCount ? { queryCount: ownCount } : null) };
  }, [checks, subject]);

  if (!summary || !summary.answers || !summary.types.length) return null;
  const top = summary.types.slice(0, 3);

  return (
    <div className={cardClass} style={{ marginBottom: 12 }}>
      <div className={styles.head}>
        <div>
          <h2 className={titleClass}>Where AI gets its answers</h2>
          <p className={subClass}>
            The kinds of sites AI used across {summary.answers} answer{summary.answers === 1 ? '' : 's'} about {subject.name}
            {summary.ownCitations > 0 ? <> · your site: <strong className={styles.strong}>{pct(summary.ownShare)}</strong></> : null}
          </p>
        </div>
        <Link to={`/citation-monitor?subject=${encodeURIComponent(subject.key)}`} className={styles.more}>
          See all <ArrowRight size={14} />
        </Link>
      </div>
      <ul className={styles.list}>
        {top.map(t => (
          <li key={t.id} className={styles.item}>
            <div className={styles.row}>
              <span className={styles.label}>{t.label}</span>
              <span className={styles.bar}><span style={{ width: pct(t.share) }} /></span>
              <span className={styles.share}>{pct(t.share)}</span>
            </div>
            <p className={styles.sites}>{t.domains.slice(0, 2).map(d => d.domain).join(', ')}{t.domains.length > 2 ? ` +${t.domains.length - 2} more` : ''}</p>
            <p className={styles.action}>{t.action}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
