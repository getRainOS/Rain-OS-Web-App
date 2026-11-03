import { PILLAR_CHART_COLORS } from '@/lib/pillarColors.js';

// A trend chart for the platform section: one line per pillar over eight weeks,
// in the same colours the app's trend lines use. Example data, labelled as such.
const WEEKS = 8;
const SERIES: { key: keyof typeof PILLAR_CHART_COLORS; label: string; start: number; end: number }[] = [
  { key: 'ai_readability', label: 'AI Readability', start: 48, end: 74 },
  { key: 'digital_authority', label: 'Digital Authority', start: 55, end: 70 },
  { key: 'conversion_readiness', label: 'Conversion Readiness', start: 40, end: 61 },
  { key: 'product_discoverability', label: 'Product Discoverability', start: 52, end: 66 },
  { key: 'rag_readiness', label: 'RAG Readiness', start: 36, end: 58 },
  { key: 'local_presence', label: 'Local Presence', start: 60, end: 79 },
];

const W = 560;
const H = 180;
const PAD = 12;

// A gentle, deterministic wiggle so each line rises with small weekly changes.
function valueAt(start: number, end: number, week: number, seed: number) {
  const t = week / (WEEKS - 1);
  const wiggle = Math.sin(week * 1.7 + seed) * 2.5;
  return start + (end - start) * t + wiggle * (week === 0 || week === WEEKS - 1 ? 0 : 1);
}

export default function TrendCard() {
  const x = (w: number) => PAD + (w / (WEEKS - 1)) * (W - PAD * 2);
  const y = (v: number) => PAD + (1 - v / 100) * (H - PAD * 2);

  return (
    <div className="mt-4 rounded-md border border-white/[0.07] bg-black p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-neutral-500" style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}>
          LAST 8 WEEKS
        </span>
        <span className="text-[11px] text-neutral-500" style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}>EXAMPLE DATA</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label="Trend lines for six areas over eight weeks">
        {[0, 50, 100].map(v => (
          <line key={v} x1={PAD} x2={W - PAD} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.06)" />
        ))}
        {SERIES.map((s, i) => {
          const pts = Array.from({ length: WEEKS }, (_, w) => `${x(w)},${y(valueAt(s.start, s.end, w, i))}`).join(' ');
          return <polyline key={s.key} points={pts} fill="none" stroke={PILLAR_CHART_COLORS[s.key]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />;
        })}
      </svg>
      <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-[12px] text-neutral-400">
        {SERIES.map(s => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: PILLAR_CHART_COLORS[s.key] }} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
