import { useEffect, useRef } from 'react';
import { ENGINE_ICONS } from './engineIcons';

// Rain falls from a soft edge across the top and lands on the AI tools rain OS
// checks. Each tool's drop is aimed at its logo, and the logo glows where it
// lands. Thin ambient streaks fall behind them. Scrolling lights the drops in
// turn. The layout is fixed, so every visit draws the same picture.

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
const AMBIENT_COUNT = 16;
const EDGE_Y = 0.04; // the cloud edge, as a share of the height

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

// Endpoints, one per engine: where each drop lands. Spread both sides, up and down.
const SPOTS = [
  { x: 0.6, y: 0.08 },
  { x: 0.37, y: 0.22 },
  { x: 0.62, y: 0.34 },
  { x: 0.38, y: 0.5 },
  { x: 0.6, y: 0.7 },
  { x: 0.4, y: 0.9 },
];

function isStill(): boolean {
  if (typeof window === 'undefined') return true;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = window.matchMedia('(max-width: 767px)').matches;
  return reduced || phone;
}

type Ambient = { x: number; y: number; len: number; speed: number; slant: number; alpha: number };

function makeAmbient(width: number, height: number): Ambient[] {
  let seed = 23;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: AMBIENT_COUNT }, () => ({
    x: rand() * width,
    y: rand() * height,
    len: 30 + rand() * 80,
    speed: 0.02 + rand() * 0.04,
    slant: (rand() - 0.5) * 0.5,
    alpha: 0.04 + rand() * 0.05,
  }));
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
    let last = 0;
    let ambient: Ambient[] = [];
    const still = isStill();

    // Each brand mark as a Path2D, built once.
    const icons = Object.fromEntries(
      Object.entries(ENGINE_ICONS).map(([key, icon]) => [key, { hex: icon.hex, path: new Path2D(icon.path) }]),
    );

    // Endpoints with a slow float around each spot. Still for reduced motion and
    // phones, so the layout is fixed there.
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
      ambient = makeAmbient(width, height);
    }

    function readProgress() {
      const rect = wrap!.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = vh + rect.height;
      progress = Math.min(1, Math.max(0, (vh - rect.top) / span));
    }

    function draw(t: number, dt: number) {
      ctx!.clearRect(0, 0, width, height);
      const edgeY = height * EDGE_Y;

      // The cloud edge: a soft line across the top that fades at both ends.
      const edge = ctx!.createLinearGradient(0, 0, width, 0);
      edge.addColorStop(0, 'rgba(255,255,255,0)');
      edge.addColorStop(0.5, `rgba(255,255,255,${0.12 + progress * 0.2})`);
      edge.addColorStop(1, 'rgba(255,255,255,0)');
      ctx!.strokeStyle = edge;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, edgeY);
      ctx!.lineTo(width, edgeY);
      ctx!.stroke();

      // Ambient rain: thin, faint streaks falling in the background.
      if (!still) {
        for (const a of ambient) {
          a.y += a.speed * dt;
          if (a.y - a.len > height) {
            a.y = edgeY - a.len;
            a.x = Math.random() * width;
          }
          ctx!.strokeStyle = `rgba(255,255,255,${a.alpha})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x - a.slant * a.len, a.y - a.len);
          ctx!.lineTo(a.x, a.y);
          ctx!.stroke();
        }
      }

      const ends = endpoints(t);
      ends.forEach((e, k) => {
        const start = (k / ends.length) * 0.8;
        const lit = Math.min(1, Math.max(0, (progress - start) / 0.2));

        // The drop: starts at the cloud edge, angled away from the centre, and
        // falls to this tool's logo. Each drop has its own pace.
        const sx = Math.min(width, Math.max(0, e.x + (e.x - width / 2) * 0.5));
        const period = 3200 + k * 380;
        const f = still ? 0.85 : ((t / period) + k * 0.37) % 1;
        const hx = sx + (e.x - sx) * f;
        const hy = edgeY + (e.y - edgeY) * f;
        const tailLen = 0.22;
        const tx = sx + (e.x - sx) * Math.max(0, f - tailLen);
        const ty = edgeY + (e.y - edgeY) * Math.max(0, f - tailLen);

        if (lit > 0.1) {
          const grad = ctx!.createLinearGradient(tx, ty, hx, hy);
          grad.addColorStop(0, 'rgba(255,255,255,0)');
          grad.addColorStop(1, `rgba(255,255,255,${0.15 + lit * 0.55})`);
          ctx!.strokeStyle = grad;
          ctx!.lineWidth = 1.2;
          ctx!.beginPath();
          ctx!.moveTo(tx, ty);
          ctx!.lineTo(hx, hy);
          ctx!.stroke();

          ctx!.save();
          ctx!.shadowColor = 'rgba(255,255,255,0.9)';
          ctx!.shadowBlur = 8;
          ctx!.fillStyle = `rgba(255,255,255,${lit * 0.9})`;
          ctx!.beginPath();
          ctx!.arc(hx, hy, 2, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();
        }

        // The landing: a ring on the logo, which brightens as the drop arrives.
        const landed = still ? 0 : Math.max(0, (f - 0.9) / 0.1);
        if (lit > 0.1 && landed > 0) {
          ctx!.strokeStyle = `rgba(255,255,255,${0.35 * landed * lit})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.arc(e.x, e.y, 4 + landed * 10, 0, Math.PI * 2);
          ctx!.stroke();
        }

        // The logo mark and its name.
        const icon = e.icon ? icons[e.icon] : undefined;
        ctx!.font = LABEL_FONT;
        ctx!.textBaseline = 'middle';
        const hasIcon = e.icon === 'chatgpt' || !!icon;
        const blockW = (hasIcon ? ICON_SIZE + 8 : 0) + ctx!.measureText(e.name).width;
        const onLeft = e.x < width / 2;
        const startX = onLeft ? e.x - 14 - blockW : e.x + 14;
        const glow = 0.45 + lit * 0.55 + landed * 0.3;
        if (e.icon === 'chatgpt') {
          drawBlossom(ctx!, startX + ICON_SIZE / 2, e.y, ICON_SIZE, glow);
        } else if (icon) {
          ctx!.save();
          ctx!.globalAlpha = glow;
          ctx!.translate(startX, e.y - ICON_SIZE / 2);
          ctx!.scale(ICON_SIZE / 24, ICON_SIZE / 24);
          ctx!.fillStyle = icon.hex;
          ctx!.fill(icon.path);
          ctx!.restore();
        }
        ctx!.fillStyle = `rgba(255,255,255,${0.35 + lit * 0.6})`;
        ctx!.fillText(e.name, startX + (hasIcon ? ICON_SIZE + 8 : 0), e.y);
      });
    }

    function loop(t: number) {
      if (!visible) {
        raf = 0;
        last = 0;
        return;
      }
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      readProgress();
      draw(t, dt);
      raf = requestAnimationFrame(loop);
    }

    function redraw() {
      size();
      readProgress();
      draw(0, 0);
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
