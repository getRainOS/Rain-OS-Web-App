import { useEffect, useRef } from 'react';
import { ENGINE_ICONS } from './engineIcons';

// One question on the left, lines out to the AI tools rain OS checks, each
// marked by its brand mark and name at the end of the line. Scrolling lights the lines in
// turn; a bright point travels along each lit line, forever. The layout is
// fixed, so every visit draws the same picture.

// `icon` keys into ENGINE_ICONS, or 'chatgpt' for the blossom drawn below.
const ENGINES: { name: string; icon?: string }[] = [
  { name: 'ChatGPT', icon: 'chatgpt' },
  { name: 'Google AI Overviews', icon: 'google' },
  { name: 'Google AI Mode', icon: 'google' },
  { name: 'Gemini', icon: 'gemini' },
  { name: 'Perplexity', icon: 'perplexity' },
  { name: 'Claude', icon: 'claude' },
];

const ICON_SIZE = 16;

// The ChatGPT blossom, drawn as six loops around a centre. Drawn rather than
// traced, so it stays crisp at this size.
function drawBlossom(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.11;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.2, size * 0.42, (i * Math.PI) / 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

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

    // Each brand mark as a Path2D, built once.
    const icons = Object.fromEntries(
      Object.entries(ENGINE_ICONS).map(([key, icon]) => [key, { hex: icon.hex, path: new Path2D(icon.path) }]),
    );

    // Endpoints: spread down the right side, one per engine.
    // Each endpoint sits at its own place, so the lines leave the question at
    // different angles and reach different lengths.
    const SPOTS = [
      { x: 0.6, y: 0.08 },
      { x: 0.37, y: 0.22 },
      { x: 0.62, y: 0.34 },
      { x: 0.38, y: 0.5 },
      { x: 0.6, y: 0.7 },
      { x: 0.4, y: 0.9 },
    ];
    // Each endpoint, with a slow float around its spot. Still for reduced motion
    // and phones, so the layout is fixed there.
    function endpoints(t: number) {
      return ENGINES.map((engine, k) => {
        const dx = still ? 0 : Math.sin(t * 0.0008 + k * 1.7) * 10;
        const dy = still ? 0 : Math.cos(t * 0.0006 + k * 2.3) * 8;
        return {
          ...engine,
          x: width * SPOTS[k].x + dx,
          y: height * SPOTS[k].y + dy,
        };
      });
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
      const q = { x: width * 0.5, y: height * 0.5 };
      const ends = endpoints(t);

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

        // The brand mark, in its own colour, then the name.
        // Labels open toward the side their endpoint is on: right of the dot on
        // the right, left of it on the left.
        ctx!.font = LABEL_FONT;
        ctx!.textBaseline = 'middle';
        const icon = e.icon ? icons[e.icon] : undefined;
        const hasIcon = !!icon;
        const blockW = (hasIcon ? ICON_SIZE + 8 : 0) + ctx!.measureText(e.name).width;
        const onLeft = e.x < q.x;
        const startX = onLeft ? e.x - 14 - blockW : e.x + 14;
        if (e.icon === 'chatgpt') {
          drawBlossom(ctx!, startX + ICON_SIZE / 2, e.y, ICON_SIZE, 0.45 + lit * 0.55);
        } else if (icon) {
          ctx!.save();
          ctx!.globalAlpha = 0.45 + lit * 0.55;
          ctx!.translate(startX, e.y - ICON_SIZE / 2);
          ctx!.scale(ICON_SIZE / 24, ICON_SIZE / 24);
          ctx!.fillStyle = icon.hex;
          ctx!.fill(icon.path);
          ctx!.restore();
        }
        ctx!.fillStyle = `rgba(255,255,255,${0.35 + lit * 0.6})`;
        ctx!.fillText(e.name, startX + (hasIcon ? ICON_SIZE + 8 : 0), e.y);
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
      <ul className="sr-only">
        {ENGINES.map(e => <li key={e.name}>{e.name}</li>)}
      </ul>
    </div>
  );
}
