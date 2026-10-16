import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { buildCompetitorMap } from '../lib/citationHistory.js';
import styles from './CitationMapCard.module.css';

const CitationWorldMap = lazy(() => import('./CitationWorldMap.jsx'));

// Dashboard version of the Citation Monitor's world map: where the websites
// Gemini cited are based, across your recent checks.
export default function CitationMapCard({ checks, ownDomain }) {
  const [resolved, setResolved] = useState(() => new Map());
  const map = useMemo(() => buildCompetitorMap(checks, ownDomain, resolved), [checks, ownDomain, resolved]);

  useEffect(() => {
    const missing = map.domains.filter(d => d.country === null && !resolved.has(d.domain)).map(d => d.domain);
    if (missing.length === 0) return undefined;
    let cancelled = false;
    api.resolveDomainCountries(missing)
      .then(({ data }) => {
        if (cancelled || !data?.domains) return;
        setResolved(prev => {
          const next = new Map(prev);
          for (const [domain, country] of Object.entries(data.domains)) next.set(domain, country);
          return next;
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map.domains]);

  const top = map.regions.slice(0, 3);

  return (
    <section className={styles.card} aria-labelledby="citation-map-heading">
      <div className={styles.head}>
        <div>
          <h2 id="citation-map-heading" className={styles.title}>Where AI's sources are based</h2>
          <p className={styles.sub}>
            {top.length > 0
              ? `Most cited sites are based in ${top.map(r => r.name).join(', ')}.`
              : 'Run a citation check to see where the websites Gemini cites are based.'}
          </p>
        </div>
        <Link to="/citation-monitor" className={styles.link}>Open Citation Monitor →</Link>
      </div>
      <div className={styles.mapWrap}>
        <Suspense fallback={<div className={styles.loading}><span className="spinner" /></div>}>
          <CitationWorldMap regions={map.regions} unknownCount={map.unknownCount} />
        </Suspense>
      </div>
      <p className={styles.note}>Inferred from each site's country domain (like .de or .jp) and a lookup. Many sites use .com, so this is a partial read.</p>
    </section>
  );
}
