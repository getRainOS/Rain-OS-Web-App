import React, { useEffect, useRef } from 'react';

const RainBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let drops: { x: number; y: number; speed: number; radius: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDrops();
    };

    // Sparse, slow-falling dots — not streak lines. Density is deliberately
    // low (one drop per ~90px of width) so they read as a quiet, dispersed
    // texture rather than a literal rainstorm.
    const initDrops = () => {
      drops = [];
      const count = Math.floor(window.innerWidth / 90);
      for (let i = 0; i < count; i++) {
        drops.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.15 + Math.random() * 0.25,
          radius: 1 + Math.random() * 1.5,
          opacity: 0.12 + Math.random() * 0.18,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity})`;
        ctx.fill();
        drop.y += drop.speed;
        if (drop.y > canvas.height) { drop.y = -4; drop.x = Math.random() * canvas.width; }
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[3] pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
      }}
    />
  );
};

export default RainBackground;
