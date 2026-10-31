import { WORDMARK, STREAKS, STREAK_WIDTH } from './logoPaths';

interface LogoProps {
  size?: number;
  className?: string;
  label?: string;
}

// The rain wordmark as an SVG. The word inherits the text color; the rain
// streaks are always white. `size` is the height in pixels. The streaks show on
// desktop; phones get the clean word (see the .rainDashes rule in index.css).
export default function Logo({ size = 24, className = '', label = 'rain' }: LogoProps) {
  return (
    <svg
      className={`rainLogo ${className}`}
      viewBox={WORDMARK.viewBox}
      role="img"
      aria-label={label}
      style={{ height: size, width: 'auto', display: 'block', margin: '0 auto', color: 'inherit' }}
      fill="currentColor"
    >
      <g className="rainDashes" stroke="#ffffff" strokeWidth={STREAK_WIDTH} strokeLinecap="round">
        {STREAKS.map((s, i) => (
          <line key={i} x1={s.x} y1={s.y1} x2={s.x} y2={s.y2} />
        ))}
      </g>
      <path d={WORDMARK.path} />
    </svg>
  );
}
