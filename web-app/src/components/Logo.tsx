import { WORDMARK, DASHES, DASH_MIN_SIZE } from './logoPaths';

interface LogoProps {
  size?: number;
  className?: string;
  label?: string;
}

// The rain wordmark as an SVG that inherits the text color. `size` is the
// height in pixels. The falling dashes show on desktop; phones get the clean word
// (see the .rainDashes rule in index.css).
export default function Logo({ size = 24, className = '', label = 'rain' }: LogoProps) {
  const showDashes = size >= DASH_MIN_SIZE;
  return (
    <svg
      className={`rainLogo ${className}`}
      viewBox={WORDMARK.viewBox}
      role="img"
      aria-label={label}
      style={{ height: size, width: 'auto', display: 'block', margin: '0 auto', color: 'inherit' }}
      fill="currentColor"
    >
      {showDashes && (
        <g className="rainDashes">
          {DASHES.map((d, i) => (
            <rect key={i} x={d.x} y={d.y} width={60} height={d.h} rx={30} fill="currentColor" fillOpacity={d.o} />
          ))}
        </g>
      )}
      <path d={WORDMARK.path} />
    </svg>
  );
}
