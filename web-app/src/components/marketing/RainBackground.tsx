import { useEffect, useRef } from 'react';

// Faint white rain falling behind the page content. Each streak is a thin line
// with its own angle, length, speed and brightness, so the drops fall in
// different directions and at different paces. Decorative only. Reduced-motion visitors and phones get no rain.

const STREAK_COUNT = 14;

type Streak = { x: number; y: number; len: number; speed: number; alpha: number; slant: number };

function makeStreaks(width: number, height: number): Streak[] {
  let seed = 11;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: STREAK_COUNT }, () => ({
    x: rand() * width,
    y: rand() * height,
    len: 30 + rand() * 120,
    speed: 0.02 + rand() * 0.05,
    alpha: 0.02 + rand() * 0.025,
    slant: (rand() - 0.5) * 0.7,
  }));
}

export default function RainBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;

    let width = 0;
    let height = 0;
    let streaks: Streak[] = [];
    let visible = false;
    let raf = 0;
    let last = 0;

    function size() {
      const dpr = window.devicePixelRatio || 1;
      width = wrap!.clientWidth;
      height = wrap!.clientHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      streaks = makeStreaks(width, height);
    }

    function draw(t: number) {
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      ctx!.clearRect(0, 0, width, height);
      ctx!.lineWidth = 1;
      ctx!.lineCap = 'round';
      for (const s of streaks) {
        s.y += s.speed * dt;
        if (s.y - s.len > height) {
          s.y = -s.len;
          s.x = Math.random() * width;
        }
        ctx!.strokeStyle = `rgba(255,255,255,${s.alpha})`;
        ctx!.beginPath();
        ctx!.moveTo(s.x - s.slant * s.len, s.y - s.len);
        ctx!.lineTo(s.x, s.y);
        ctx!.stroke();
      }
    }

    function loop(t: number) {
      if (!visible) {
        raf = 0;
        last = 0;
        return;
      }
      draw(t);
      raf = requestAnimationFrame(loop);
    }

    size();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    observer.observe(wrap);
    window.addEventListener('resize', size);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', size);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
