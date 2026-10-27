// The rain wordmark: "r", the brand cyan "ai", then "n". Used everywhere the
// brand appears in the app. `size` sets the font size.
export default function Logo({ size = 22, className = '' }) {
  return (
    <span className={`rainLogo ${className}`} style={{ '--logo-size': `${size}px` }} aria-label="rain">
      r<span className="rainLogoAccent">ai</span>n
    </span>
  );
}
