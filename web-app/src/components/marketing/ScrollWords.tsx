import { useEffect, useRef } from 'react';

// A headline whose words come into focus one by one as the visitor scrolls.
// Each word starts faded and blurred. Reduced-motion visitors get the full
// text at once.

export default function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const rootRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = Array.from(root.querySelectorAll<HTMLSpanElement>('[data-word]'));

    function update() {
      const rect = root!.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the heading enters the bottom of the screen, 1 once it reaches
      // the upper third.
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.67 + rect.height)));
      words.forEach((el, i) => {
        const start = (i / words.length) * 0.7;
        const o = Math.min(1, Math.max(0, (p - start) / 0.3));
        el.style.opacity = String(0.15 + 0.85 * o);
        el.style.filter = `blur(${((1 - o) * 4).toFixed(2)}px)`;
      });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [text]);

  const words = text.split(' ');
  return (
    <h2 ref={rootRef} className={className}>
      {words.map((w, i) => (
        <span key={i} data-word className="inline-block transition-[filter] duration-150" style={{ opacity: 1 }}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h2>
  );
}
