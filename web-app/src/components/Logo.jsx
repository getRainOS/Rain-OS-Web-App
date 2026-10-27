// The rain OS mark and wordmark, used everywhere the brand appears in the app.
// One mark: a rounded square with a rain drop, cyan on dark. `mark` shows the
// symbol alone (the collapsed sidebar); `size` scales the whole lockup.
export default function Logo({ mark = false, size = 22, className = '' }) {
  return (
    <span className={`rainLogo ${className}`} style={{ '--logo-size': `${size}px` }} aria-label="rain OS">
      <svg className="rainLogoMark" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#2B8FE3" />
        <path d="M16 7.5c3.2 4.1 5.5 7.2 5.5 10.1a5.5 5.5 0 0 1-11 0c0-2.9 2.3-6 5.5-10.1Z" fill="#fff" />
      </svg>
      {!mark && (
        <span className="rainLogoWord">
          rain<span className="rainLogoOs"> OS</span>
        </span>
      )}
    </span>
  );
}
