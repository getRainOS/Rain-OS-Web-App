import { PILLAR_CHART_COLORS } from '../lib/pillarColors.js';

// Vertical columns, one per pillar, each in its pillar's colour, with the score
// above and the pillar name below. Shared by the app's results and the site.
export default function PillarColumns({ rows, height = 220 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, gap: 14, alignItems: 'end', height }}>
      {rows.map(r => {
        const color = r.color || PILLAR_CHART_COLORS[r.key] || '#ffffff';
        const pct = Math.max(0, Math.min(100, Number(r.value) || 0));
        return (
          <div key={r.key} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', textAlign: 'center', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{r.display ?? Math.round(pct)}</div>
            <div style={{ height: `${pct}%`, background: color, borderRadius: '6px 6px 0 0', minHeight: 4 }} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8, lineHeight: 1.25 }}>{r.label}</div>
          </div>
        );
      })}
    </div>
  );
}
