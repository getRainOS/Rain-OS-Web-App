import { useEffect, useRef } from 'react';

// One question on the left, lines out to the AI tools rain OS checks, each
// marked by its name at the end of the line. Scrolling lights the lines in
// turn; a bright point travels along each lit line, forever. The layout is
// fixed, so every visit draws the same picture.

const ENGINES = ['ChatGPT', 'Google AI Overviews', 'Google AI Mode', 'Gemini', 'Perplexity', 'Claude'];

const LABEL_FONT = '12px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

function isStill(): boolean {
  if (typeof window === 'undefined') return true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = window.matchMedia('(max-width: 767px)').matches;
  return reduced || phone;
}

export default function SourceNetwork() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let progress = 0; // 0 to 1: how far the visitor has scrolled through the section
    let visible = false;
    let raf = 0;
    const still = isStill();

    // Endpoints: spread down the right side, one per engine.
    function endpoints() {
      return ENGINES.map((name, k) => ({
        name,
        x: width * 0.6,
        y: height * (0.12 + (k / (ENGINES.length - 1)) * 0.76),
      }));
    }

    function size() {
      const dpr = window.devicePixelRatio || 1;
      width = wrap!.clientWidth;
      height = wrap!.clientHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function readProgress() {
      const rect = wrap!.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = vh + rect.height;
      progress = Math.min(1, Math.max(0, (vh - rect.top) / span));
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, width, height);
      const q = { x: width * 0.06, y: height * 0.5 };
      const ends = endpoints();

      ends.forEach((e, k) => {
        const start = (k / ends.length) * 0.8;
        const lit = Math.min(1, Math.max(0, (progress - start) / 0.2));

        ctx!.strokeStyle = `rgba(255,255,255,${0.12 + lit * 0.7})`;
        ctx!.lineWidth = 1 + lit;
        ctx!.beginPath();
        ctx!.moveTo(q.x, q.y);
        ctx!.lineTo(e.x, e.y);
        ctx!.stroke();

        // A light travels from the question out along each lit line, forever.
        if (!still && lit > 0.2) {
          const f = (t * 0.00014 + k / ends.length) % 1;
          ctx!.fillStyle = `rgba(255,255,255,${lit * 0.9})`;
          ctx!.beginPath();
          ctx!.arc(q.x + (e.x - q.x) * f, q.y + (e.y - q.y) * f, 2, 0, Math.PI * 2);
          ctx!.fill();
        }

        // The endpoint dot and its name.
        const breathe = !still ? Math.sin(t * 0.002 + k) * 0.5 : 0;
        ctx!.fillStyle = `rgba(255,255,255,${0.45 + lit * 0.55})`;
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, 3 + breathe, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.font = LABEL_FONT;
        ctx!.fillStyle = `rgba(255,255,255,${0.35 + lit * 0.6})`;
        ctx!.textBaseline = 'middle';
        ctx!.fillText(e.name, e.x + 14, e.y);
      });

      // The question.
      ctx!.fillStyle = '#ffffff';
      ctx!.beginPath();
      ctx!.arc(q.x, q.y, 4.5, 0, Math.PI * 2);
      ctx!.fill();
    }

    function loop(t: number) {
      if (!visible) {
        raf = 0;
        return;
      }
      readProgress();
      draw(t);
      raf = requestAnimationFrame(loop);
    }

    function redraw() {
      size();
      readProgress();
      draw(0);
    }

    redraw();
    if (still) return;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    observer.observe(wrap);

    function onResize() {
      redraw();
    }
    function onScroll() {
      readProgress();
    }
    window.addEventListener('resize', onResize);
    // Capture, so scrolling inside <body> (where this site scrolls) reaches us.
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[340px] md:h-[440px] w-full">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0" />
    </div>
  );
}
