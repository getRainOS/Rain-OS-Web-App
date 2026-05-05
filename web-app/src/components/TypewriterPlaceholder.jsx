import { useEffect, useRef } from 'react';

const PHRASES = [
  'Paste your landing page copy...',
  'Paste your latest blog post...',
  'Paste your product description...',
  'Paste your FAQ section...',
  'Paste your README or docs...',
  'Paste your homepage copy...',
];

const TYPE_SPEED = 50;
const DELETE_SPEED = 30;
const PAUSE_AFTER_TYPE = 2000;
const PAUSE_BEFORE_NEXT = 300;

export default function TypewriterPlaceholder({
  value,
  isFocused,
  padding = '12px 14px',
  fontSize = '14px',
  lineHeight = '1.6',
  color = 'rgba(255,255,255,0.35)',
  fontFamily = 'inherit',
  fontWeight = 'inherit',
  topOffset = 0,
}) {
  const overlayRef = useRef(null);
  const stateRef = useRef({
    phraseIndex: 0,
    charIndex: 0,
    deleting: false,
    timer: null,
  });

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const s = stateRef.current;

    function tick() {
      const phrase = PHRASES[s.phraseIndex];
      if (s.deleting) {
        s.charIndex--;
        overlay.textContent = phrase.slice(0, s.charIndex);
        if (s.charIndex === 0) {
          s.deleting = false;
          s.phraseIndex = (s.phraseIndex + 1) % PHRASES.length;
          s.timer = setTimeout(tick, PAUSE_BEFORE_NEXT);
        } else {
          s.timer = setTimeout(tick, DELETE_SPEED);
        }
      } else {
        s.charIndex++;
        overlay.textContent = phrase.slice(0, s.charIndex);
        if (s.charIndex === phrase.length) {
          s.deleting = true;
          s.timer = setTimeout(tick, PAUSE_AFTER_TYPE);
        } else {
          s.timer = setTimeout(tick, TYPE_SPEED);
        }
      }
    }

    s.phraseIndex = 0;
    s.charIndex = 0;
    s.deleting = false;
    overlay.textContent = '';
    s.timer = setTimeout(tick, PAUSE_BEFORE_NEXT);

    return () => clearTimeout(s.timer);
  }, []);

  const show = !value && !isFocused;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: topOffset,
        left: 0,
        right: 0,
        bottom: 0,
        padding,
        fontSize,
        lineHeight,
        fontFamily: 'inherit',
        fontWeight: 'inherit',
        color,
        pointerEvents: 'none',
        display: show ? 'block' : 'none',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        zIndex: 1,
        userSelect: 'none',
      }}
    />
  );
}
