import { WORDMARK } from './logoPaths';

interface LogoProps {
  size?: number;
  className?: string;
  label?: string;
}

// The rain mark: a white circle with three uneven rain lines in black, drawn
// beside the word. `size` is the height in pixels of both parts. The word
// inherits the text color.
export default function Logo({ size = 24, className = '', label = 'rain' }: LogoProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`rainLogo inline-flex items-center ${className}`}
      style={{ gap: size * 0.3, height: size, color: 'inherit' }}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" style={{ height: size, width: size, display: 'block', flexShrink: 0 }}>
        <circle cx="50" cy="50" r="50" fill="#ffffff" />
        <g stroke="#000" strokeWidth="6" strokeLinecap="round">
          <line x1="34" y1="26" x2="34" y2="50" />
          <line x1="50" y1="38" x2="50" y2="80" />
          <line x1="66" y1="16" x2="66" y2="40" />
        </g>
      </svg>
      <svg viewBox={WORDMARK.viewBox} aria-hidden="true" style={{ height: size, width: 'auto', display: 'block' }} fill="currentColor">
        <path d={WORDMARK.path} />
      </svg>
    </span>
  );
}
