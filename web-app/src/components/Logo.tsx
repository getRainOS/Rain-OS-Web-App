import { WORDMARK, DASHES, DASH_MIN_SIZE } from './logoPaths';

interface LogoProps {
  size?: number;
  className?: string;
  label?: string;
}

// The rain wordmark as an SVG that inherits the text color. `size` is the
// height in pixels. Falling dashes show only at larger sizes, where they read
// as rain; below DASH_MIN_SIZE the clean word is shown alone.
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
      {showDashes && DASHES.map((d, i) => (
        <rect key={i} x={d.x} y={d.y} width={26} height={d.h} rx={13} fillOpacity={d.o} />
      ))}
      <path d={WORDMARK.path} />
    </svg>
  );
}
