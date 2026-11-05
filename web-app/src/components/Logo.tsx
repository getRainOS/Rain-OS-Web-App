interface LogoProps {
  size?: number;
  className?: string;
  label?: string;
  markOnly?: boolean; // the circle alone, for a collapsed sidebar
}

// The rain mark: a white circle with three uneven rain lines in black, drawn
// beside the word. `size` is the height in pixels of both parts. The word is
// real text in Inter, not an outline, so the browser snaps its strokes to the
// screen and it stays as sharp as the rest of the page. It inherits the text color.
export default function Logo({ size = 24, className = '', label = 'rain', markOnly = false }: LogoProps) {
  if (markOnly) {
    return (
      <svg role="img" aria-label={label} viewBox="0 0 100 100" className={className} style={{ height: size, width: size, display: 'block', margin: '0 auto' }}>
        <circle cx="50" cy="50" r="50" fill="#ffffff" />
        <g stroke="#000" strokeWidth="11" strokeLinecap="round">
          <line x1="31" y1="25" x2="31" y2="52" />
          <line x1="50" y1="36" x2="50" y2="78" />
          <line x1="69" y1="14" x2="69" y2="42" />
        </g>
      </svg>
    );
  }
  return (
    <span
      role="img"
      aria-label={label}
      className={`rainLogo inline-flex items-center ${className}`}
      style={{ gap: size * 0.3, lineHeight: 1, color: 'inherit' }}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" style={{ height: size, width: size, display: 'block', flexShrink: 0 }}>
        <circle cx="50" cy="50" r="50" fill="#ffffff" />
        <g stroke="#000" strokeWidth="11" strokeLinecap="round">
          <line x1="31" y1="25" x2="31" y2="52" />
          <line x1="50" y1="36" x2="50" y2="78" />
          <line x1="69" y1="14" x2="69" y2="42" />
        </g>
      </svg>
      <span
        aria-hidden="true"
        style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontWeight: 600, fontSize: size * 1.05, lineHeight: 1, letterSpacing: '-0.045em' }}
      >
        r<span style={{ letterSpacing: '-0.2em' }}>a</span>in
      </span>
    </span>
  );
}
