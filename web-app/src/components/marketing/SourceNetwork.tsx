import { useEffect, useRef } from 'react';
import { ENGINE_ICONS } from './engineIcons';

// One rain drop falls down the middle of the section. As it passes each row,
// that AI tool's logo and name come down into place beneath it, one by one.
// Scrolling lights them in turn. The layout is fixed, so every visit draws the
// same picture. Phones and reduced-motion visitors see the names still.

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
const LABEL_FONT = '12px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const CYCLE_MS = 6000; // one drop, from the top to the bottom, then again
const LAND_SPAN = 0.06; // how much of the cycle a label takes to come down
const FALL_PX = 18; // how far above its place each label starts

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

// The silver drop from the brand mock-up: a teardrop with a metallic gradient and
// a soft highlight. The point faces up, so it reads as falling.
function drawSilverDrop(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  const g = ctx.createLinearGradient(x - 6, y - 6, x + 6, y + 6);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, '#c9ced6');
  g.addColorStop(0.6, '#8d95a1');
  g.addColorStop(1, '#e9edf2');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y - 9);
  ctx.bezierCurveTo(x + 5, y - 3, x + 5.5, y + 5, x, y + 5);
  ctx.bezierCurveTo(x - 5.5, y + 5, x - 5, y - 3, x, y - 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(x - 2, y - 1, 1.6, 2.6, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

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

    // Where each row sits: a single column, evenly spaced down the section.
    function rowY(k: number) {
      return height * (0.14 + (k / (ENGINES.length - 1)) * 0.72);
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, width, height);
      const cx = width / 2;
      // Position within the drop's cycle: 0 at the top, 1 at the bottom.
      const f = still ? 1 : (t % CYCLE_MS) / CYCLE_MS;
      // Let the labels fade back out just before the drop starts again.
      const fadeOut = still ? 1 : Math.min(1, Math.max(0, (1 - f) / 0.08));

      if (!still) {
        // The drop: a short streak with a bright head, falling down the middle.
        const head = f * height;
        const tail = Math.max(0, head - height * 0.12);
        const grad = ctx!.createLinearGradient(cx, tail, cx, head);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, 'rgba(255,255,255,0.7)');
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5;
        ctx!.lineCap = 'round';
        ctx!.beginPath();
        ctx!.moveTo(cx, tail);
        ctx!.lineTo(cx, head);
        ctx!.stroke();
        drawSilverDrop(ctx!, cx, head);
      }

      ENGINES.forEach((e, k) => {
        const y = rowY(k);
        // When the drop reaches this row, the label comes down into place.
        const arrive = still ? 1 : Math.min(1, Math.max(0, (f - y / height) / LAND_SPAN));
        // Ease the fall, so each label settles rather than stops dead.
        const ease = 1 - Math.pow(1 - arrive, 3);
        const drop = (1 - ease) * -FALL_PX;
        const lit = Math.min(1, Math.max(0, (progress - (k / ENGINES.length) * 0.8) / 0.2));
        const alpha = ease * fadeOut;
        if (alpha <= 0) return;

        // The logo mark and its name, centred on the column.
        const icon = e.icon ? icons[e.icon] : undefined;
        const hasIcon = e.icon === 'chatgpt' || !!icon;
        ctx!.font = LABEL_FONT;
        ctx!.textBaseline = 'middle';
        const nameW = ctx!.measureText(e.name).width;
        const blockW = (hasIcon ? ICON_SIZE + 8 : 0) + nameW;
        const startX = cx - blockW / 2;
        const ty = y + drop;
        const glow = (0.45 + lit * 0.55) * alpha;

        if (e.icon === 'chatgpt') {
          drawBlossom(ctx!, startX + ICON_SIZE / 2, ty, ICON_SIZE, glow);
        } else if (icon) {
          ctx!.save();
          ctx!.globalAlpha = glow;
          ctx!.translate(startX, ty - ICON_SIZE / 2);
          ctx!.scale(ICON_SIZE / 24, ICON_SIZE / 24);
          ctx!.fillStyle = icon.hex;
          ctx!.fill(icon.path);
          ctx!.restore();
        }
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = `rgba(255,255,255,${(0.35 + lit * 0.6) * alpha})`;
        ctx!.fillText(e.name, startX + (hasIcon ? ICON_SIZE + 8 : 0), ty);
      });
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
