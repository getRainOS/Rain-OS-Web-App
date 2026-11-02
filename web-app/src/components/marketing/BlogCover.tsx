// A flat, geometric cover for a blog post: a cream ground with bold blocks of
// colour, black frames and simple circles, in the same style as the site's
// illustrations. Each post gets one of four layouts, picked from its slug, so
// covers vary but share one look. No text, no photos.

const PALETTE = {
  ground: '#F4EFE4',
  ink: '#161616',
  red: '#D8432A',
  orange: '#F59A1B',
  blue: '#1F4FBF',
  paper: '#FBF8F1',
};

function layoutIndex(slug: string): number {
  let sum = 0;
  for (let i = 0; i < slug.length; i++) sum = (sum * 31 + slug.charCodeAt(i)) >>> 0;
  return sum % 4;
}

const FRAME = { stroke: PALETTE.ink, strokeWidth: 10 };

function Layout({ index }: { index: number }) {
  const p = PALETTE;
  if (index === 0) {
    // A framed half-disc in red and black, with a blue circle on the right.
    return (
      <>
        <rect x="40" y="40" width="190" height="280" fill={p.paper} {...FRAME} />
        <path d="M135 80 A 90 90 0 0 1 135 260 Z" fill={p.red} />
        <path d="M135 80 A 90 90 0 0 0 135 260 Z" fill={p.ink} />
        <rect x="250" y="40" width="190" height="280" fill={p.blue} {...FRAME} />
        <circle cx="345" cy="180" r="70" fill={p.paper} />
      </>
    );
  }
  if (index === 1) {
    // An orange panel with a red sun and a black lamp shape hanging above.
    return (
      <>
        <rect x="50" y="60" width="380" height="240" fill={p.orange} {...FRAME} />
        <circle cx="200" cy="200" r="60" fill={p.red} />
        <rect x="270" y="120" width="70" height="120" fill={p.ink} />
        <path d="M240 50 L380 50 L360 110 L260 110 Z" fill={p.ink} />
      </>
    );
  }
  if (index === 2) {
    // Two blocks: a blue disc on paper, and a stacked red and orange bar.
    return (
      <>
        <rect x="60" y="50" width="200" height="260" fill={p.paper} {...FRAME} />
        <circle cx="160" cy="180" r="80" fill={p.blue} />
        <rect x="290" y="50" width="130" height="120" fill={p.red} />
        <rect x="290" y="190" width="130" height="120" fill={p.orange} />
        <rect x="290" y="190" width="130" height="120" fill="none" {...FRAME} />
      </>
    );
  }
  // A large red half-disc rising from the base, with a black block and a sun.
  return (
    <>
      <rect x="0" y="260" width="480" height="100" fill={p.ink} />
      <path d="M100 260 A 140 140 0 0 1 380 260 Z" fill={p.red} />
      <rect x="290" y="70" width="110" height="110" fill={p.blue} />
      <circle cx="120" cy="120" r="34" fill={p.orange} />
    </>
  );
}

export default function BlogCover({ slug, className = '' }: { slug: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={`block w-full h-full ${className}`}
    >
      <rect width="480" height="360" fill={PALETTE.ground} />
      <Layout index={layoutIndex(slug)} />
    </svg>
  );
}
