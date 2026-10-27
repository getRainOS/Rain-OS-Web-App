import { WORDMARK } from './logoPaths.js';

// The rain wordmark as an SVG that inherits the text color. `size` is the
// height in pixels; the width follows the artwork's proportions.
export default function Logo({ size = 24, className = '', label = 'rain' }) {
  return (
    <svg
      className={`rainLogo ${className}`}
      viewBox={WORDMARK.viewBox}
      role="img"
      aria-label={label}
      style={{ height: size, width: 'auto', display: 'block', margin: '0 auto', color: 'inherit' }}
      fill="currentColor"
    >
      <g transform={`translate(0 ${WORDMARK.ty}) scale(1 -1)`}>
        {WORDMARK.paths.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}
