import { useEffect, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import styles from './CitationWorldMap.module.css';

// Low-population landmasses that just add visual noise to a citation map —
// filtered by numeric ISO code rather than name, since the topojson's own
// `name` property is inconsistent (e.g. "Fr. S. Antarctic Lands").
const HIDDEN_IDS = new Set(['010']); // Antarctica

export default function CitationWorldMap({ regions, unknownCount }) {
  const [geoData, setGeoData] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [tooltip, setTooltip] = useState(null); // { x, y, name, flag, domainCount, queryCount } | null
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    import('world-atlas/countries-50m.json').then((mod) => {
      if (!cancelled) setGeoData(mod.default ?? mod);
    });
    return () => { cancelled = true; };
  }, []);

  if (!geoData) {
    return (
      <div className={styles.mapLoading}>
        <span className="spinner" />
      </div>
    );
  }

  const byIso = new Map(regions.filter(r => r.iso).map(r => [r.iso, r]));
  const maxQueryCount = regions.reduce((m, r) => Math.max(m, r.queryCount), 1);

  function handleMove(e, geo, region) {
    if (!region) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    setHoveredId(geo.id);
    setTooltip({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top,
      ...region,
    });
  }

  function handleLeave() {
    setHoveredId(null);
    setTooltip(null);
  }

  return (
    <div className={styles.mapOuter} ref={containerRef}>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 148 }}
        width={800}
        height={380}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <Geographies geography={geoData}>
          {({ geographies }) =>
            geographies
              .filter(geo => !HIDDEN_IDS.has(geo.id))
              .map(geo => {
                const region = byIso.get(geo.id);
                const isHovered = hoveredId === geo.id;
                const opacity = region ? Math.max(0.35, region.queryCount / maxQueryCount) : 0;
                const fill = isHovered
                  ? (region ? 'var(--cyan)' : 'rgba(255,255,255,0.08)')
                  : (region ? `rgba(139,134,196,${opacity})` : 'rgba(255,255,255,0.05)');
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={0.5}
                    onMouseEnter={(e) => handleMove(e, geo, region)}
                    onMouseMove={(e) => handleMove(e, geo, region)}
                    onMouseLeave={handleLeave}
                    style={{ outline: 'none', cursor: region ? 'pointer' : 'default', transition: 'fill 0.1s' }}
                  />
                );
              })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className={styles.mapTooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <span className={styles.mapTooltipFlag}>{tooltip.flag}</span>
          <div>
            <div className={styles.mapTooltipName}>{tooltip.name}</div>
            <div className={styles.mapTooltipStat}>
              {tooltip.domainCount} domain{tooltip.domainCount !== 1 ? 's' : ''} · {tooltip.queryCount} citation{tooltip.queryCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {unknownCount > 0 && (
        <p className={styles.mapCaption}>
          + {unknownCount} citation{unknownCount !== 1 ? 's' : ''} from domains with no geographic signal, not shown on the map
        </p>
      )}
    </div>
  );
}
