import { WORDMARK } from './logoPaths';

interface LogoProps {
  size?: number;
  className?: string;
  label?: string;
}

// The rain wordmark as an SVG that inherits the text color. `size` is the
// height in pixels; the width follows the artwork's proportions.
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
      <path d={WORDMARK.path} />
    </svg>
  );
}
