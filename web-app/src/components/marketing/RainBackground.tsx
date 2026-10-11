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
      const count = Math.floor(window.innerWidth * 0.035);
      for (let i = 0; i < count; i++) {
        drops.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: 0.2 + Math.random() * 0.5,
          length: 14 + Math.random() * 26,
          opacity: 0.03 + Math.random() * 0.07,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 1, drop.y + drop.length);
        ctx.strokeStyle = `rgba(255, 255, 255, ${drop.opacity})`;
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
      className="fixed inset-0 z-[3] pointer-events-none opacity-70"
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
