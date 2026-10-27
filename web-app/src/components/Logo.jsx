// The rain logo: a series of three falling drops in the brand cyan, then the
// lowercase wordmark. `mark` shows the drops alone (the collapsed sidebar);
// `size` scales the whole lockup.
const DROP = 'M0 -10 C0 -10 -6.5 -2.6 -6.5 1.6 A6.5 6.5 0 0 0 6.5 1.6 C6.5 -2.6 0 -10 0 -10 Z';
const DROPS = [
  { x: 9, s: 1, o: 1 },
  { x: 25, s: 0.72, o: 0.6 },
  { x: 38, s: 0.48, o: 0.32 },
];

export default function Logo({ mark = false, size = 22, className = '' }) {
  return (
    <span className={`rainLogo ${className}`} style={{ '--logo-size': `${size}px` }} aria-label="rain">
      <svg className="rainLogoMark" viewBox="0 0 48 24" aria-hidden="true">
        {DROPS.map((d, i) => (
          <path key={i} d={DROP} fill="#2B8FE3" opacity={d.o} transform={`translate(${d.x} 14) scale(${d.s})`} />
        ))}
      </svg>
      {!mark && <span className="rainLogoWord">rain</span>}
    </span>
  );
}
