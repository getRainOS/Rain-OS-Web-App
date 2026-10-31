import { WORDMARK, DOTS } from './logoPaths';

interface LogoProps {
  size?: number;
  className?: string;
  label?: string;
}

// The rain wordmark as an SVG. The word inherits the text color; the rain dots
// are always white. `size` is the height in pixels. The dots show on desktop;
// phones get the clean word (see the .rainDashes rule in index.css).
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
      <g className="rainDashes" fill="#ffffff">
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />
        ))}
      </g>
      <path d={WORDMARK.path} />
    </svg>
  );
}
