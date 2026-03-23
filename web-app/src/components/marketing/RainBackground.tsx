import React, { useEffect, useRef } from 'react';

const RainBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let drops: { x: number; y: number; speed: number; length: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDrops();
    };

    const initDrops = () => {
      drops = [];
      const count = Math.floor(window.innerWidth * 0.1);
      for (let i = 0; i < count; i++) {
        drops.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.5 + Math.random() * 1.5,
          length: 10 + Math.random() * 20,
          opacity: 0.1 + Math.random() * 0.2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.length);
        ctx.strokeStyle = `rgba(56, 189, 248, ${drop.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        drop.y += drop.speed;
        drop.x -= drop.speed * 0.2;
        if (drop.y > canvas.height) { drop.y = -drop.length; drop.x = Math.random() * canvas.width; }
        if (drop.x < 0) { drop.x = canvas.width; }
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
      className="fixed inset-0 z-[3] pointer-events-none opacity-60 mix-blend-screen"
      style={{
        width: '100%',
        height: '100%',
        maskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 70%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 70%)',
      }}
    />
  );
};

export default RainBackground;
