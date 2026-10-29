import React from 'react';

// A simple line drawing for the illustrated example: a plumber with a wrench,
// and a phone showing an AI answer. Drawn in currentColor, so it takes the
// text color of its container.
export default function PlumberIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 200"
      role="img"
      aria-label="Illustration: a plumber with a wrench, next to a phone showing an AI answer"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ground */}
      <line x1="20" y1="176" x2="300" y2="176" strokeOpacity="0.25" />

      {/* plumber: cap, head, torso */}
      <path d="M86 58 Q88 36 110 36 Q132 36 134 58 Z" fill="currentColor" fillOpacity="0.9" />
      <line x1="80" y1="58" x2="140" y2="58" />
      <circle cx="110" cy="72" r="16" fill="#000" />
      <path d="M78 176 L80 118 Q82 100 110 100 Q138 100 140 118 L142 176" fill="#000" />
      <line x1="110" y1="100" x2="110" y2="176" strokeOpacity="0.4" />

      {/* arm holding a wrench */}
      <path d="M140 118 Q152 124 150 136" />
      <g transform="translate(152 128) rotate(-35)">
        <rect x="-4" y="-22" width="8" height="34" rx="3" fill="currentColor" fillOpacity="0.9" />
        <path d="M-7 -22 A7 7 0 0 1 7 -22 L4 -17 L-4 -17 Z" fill="currentColor" />
      </g>

      {/* phone with an answer on screen */}
      <rect x="206" y="40" width="72" height="124" rx="12" fill="#000" />
      <rect x="214" y="56" width="56" height="92" rx="4" strokeOpacity="0.5" strokeWidth={1.5} />
      <rect x="220" y="64" width="44" height="22" rx="8" fill="currentColor" fillOpacity="0.15" stroke="none" />
      <line x1="222" y1="78" x2="252" y2="78" strokeOpacity="0.6" strokeWidth={1.5} />
      <rect x="220" y="94" width="44" height="34" rx="8" fill="currentColor" fillOpacity="0.9" stroke="none" />
      <line x1="226" y1="104" x2="258" y2="104" stroke="#000" strokeWidth={2} />
      <line x1="226" y1="112" x2="250" y2="112" stroke="#000" strokeWidth={2} />
      <line x1="236" y1="150" x2="250" y2="150" strokeWidth={2} />

      {/* small drops, a light nod to the name */}
      <path d="M190 62 q4 6 0 9 q-4 -3 0 -9 Z" fill="currentColor" stroke="none" fillOpacity="0.6" />
      <path d="M296 90 q3 5 0 7 q-3 -2 0 -7 Z" fill="currentColor" stroke="none" fillOpacity="0.4" />
    </svg>
  );
}
