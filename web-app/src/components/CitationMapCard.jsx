import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { buildCompetitorMap } from '../lib/citationHistory.js';
import { enginesOf } from '../lib/engines.js';
import styles from './CitationMapCard.module.css';

const CitationWorldMap = lazy(() => import('./CitationWorldMap.jsx'));

// Dashboard map of where the cited websites are based, for whichever KPI card
// is selected above it (Cited by AI or Mentioned by AI), using that card's
// checks. "See more" opens those checks.
export default function CitationMapCard({ source = 'cited', kpiLabel, checks = [], ownDomain }) {
  const tab = source;
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

  const top = map.regions.filter(r => r.name).slice(0, 3);
  const latest = checks[0];
  const engines = enginesOf(checks);
  const about = tab === 'cited'
    ? latest && `for “${latest.name || latest.topic}”`
    : latest && `for ${latest.brand}${latest.topic ? ` · “${latest.topic}”` : ''}`;
  const seeMore = !latest ? null : tab === 'cited'
    ? `/citation-monitor?view=past&topic=${encodeURIComponent(latest.topic || '')}`
    : `/brand-visibility?view=past&brand=${encodeURIComponent(latest.brand || '')}&topic=${encodeURIComponent(latest.topic || '')}`;

  return (
    <section className={styles.card} aria-labelledby="citation-map-heading">
      <div className={styles.head}>
        <div>
          <h2 id="citation-map-heading" className={styles.title}>Where AI's sources are based</h2>
          <p className={styles.sub}>
            {latest
              ? `${top.length ? `Sites ${engines} cited ${about} are mostly based in ${top.map(r => r.name).join(', ')}.` : `Sites ${engines} cited ${about}.`}`
              : tab === 'cited'
                ? 'Run a Citation Monitor check to see where the websites AI cites are based.'
                : 'Run a Brand Sentiment check to see where the websites AI cites are based.'}
          </p>
        </div>
        {kpiLabel && <span className={styles.showing}>Showing: {kpiLabel}</span>}
      </div>
      <div className={styles.mapWrap}>
        <Suspense fallback={<div className={styles.loading}><span className="spinner" /></div>}>
          <CitationWorldMap regions={map.regions} unknownCount={map.unknownCount} />
        </Suspense>
      </div>
      <div className={styles.foot}>
        <p className={styles.note}>Inferred from each site's country domain (like .de or .jp) and a lookup. Many sites use .com, so this is a partial read.</p>
        {seeMore && <Link to={seeMore} className={styles.link}>See more →</Link>}
      </div>
    </section>
  );
}
