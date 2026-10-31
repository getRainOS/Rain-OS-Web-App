import { useEffect, useRef } from 'react';

// A network drawing: one question on the left, many sites on the right, with
// lines from the question to the sites AI would cite. Scrolling lights the lines
// in turn. The layout is fixed, so every visit draws the same picture.

type Node = { x: number; y: number; r: number; phase: number; site: boolean };

const SITE_COUNT = 9;
const DOT_COUNT = 34;
const LINK_DISTANCE = 96; // px, between dots, for the faint background mesh

function makeNodes(): Node[] {
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const nodes: Node[] = [{ x: 0.1, y: 0.5, r: 4.5, phase: 0, site: false }];
  for (let i = 0; i < DOT_COUNT; i++) {
    nodes.push({
      x: 0.36 + rand() * 0.6,
      y: 0.06 + rand() * 0.88,
      r: 1 + rand() * 1.5,
      phase: rand() * Math.PI * 2,
      site: i < SITE_COUNT,
    });
  }
  return nodes;
}

const NODES = makeNodes();

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
      const pts = NODES.map(n => {
        const drift = still ? 0 : Math.sin(t * 0.0004 + n.phase) * 4;
        const drift2 = still ? 0 : Math.cos(t * 0.00032 + n.phase) * 3;
        return { x: n.x * width + drift, y: n.y * height + drift2, n };
      });

      // Faint mesh between nearby dots.
      ctx!.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          if (dx * dx + dy * dy < LINK_DISTANCE * LINK_DISTANCE) {
            ctx!.strokeStyle = 'rgba(255,255,255,0.07)';
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x, pts[i].y);
            ctx!.lineTo(pts[j].x, pts[j].y);
            ctx!.stroke();
          }
        }
      }

      // Lines from the question to each site. Each one lights up as the
      // visitor scrolls past its turn.
      const q = pts[0];
      const sites = pts.filter(p => p.n.site);
      sites.forEach((s, k) => {
        const start = (k / sites.length) * 0.8;
        const lit = Math.min(1, Math.max(0, (progress - start) / 0.2));
        ctx!.strokeStyle = `rgba(255,255,255,${0.1 + lit * 0.7})`;
        ctx!.lineWidth = 1 + lit;
        ctx!.beginPath();
        ctx!.moveTo(q.x, q.y);
        ctx!.lineTo(s.x, s.y);
        ctx!.stroke();

        // A light travels from the question out along each lit line, forever.
        if (!still && lit > 0.2) {
          const f = (t * 0.00014 + k / sites.length) % 1;
          const px = q.x + (s.x - q.x) * f;
          const py = q.y + (s.y - q.y) * f;
          ctx!.fillStyle = `rgba(255,255,255,${lit * 0.9})`;
          ctx!.beginPath();
          ctx!.arc(px, py, 2, 0, Math.PI * 2);
          ctx!.fill();
        }
      });

      for (const p of pts) {
        const lit = p.n.site ? Math.min(1, Math.max(0, progress * 1.2)) : 0;
        const breathe = !still && p.n.site ? Math.sin(t * 0.002 + p.n.phase) * 0.5 : 0;
        ctx!.fillStyle = `rgba(255,255,255,${p.n.site ? 0.45 + lit * 0.55 : 0.5})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, (p.n.site ? p.n.r + 1.5 : p.n.r) + breathe, 0, Math.PI * 2);
        ctx!.fill();
      }
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
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[340px] md:h-[440px] w-full">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0" />
    </div>
  );
}
