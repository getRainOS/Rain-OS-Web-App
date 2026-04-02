import React, { useEffect, useRef } from 'react';

interface Beam {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

export const RainfallBeams: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    const beamCount = 70;
    const beams: Beam[] = [];
    for (let i = 0; i < beamCount; i++) {
      beams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: 40 + Math.random() * 80,
        speed: 1.5 + Math.random() * 2.5,
        opacity: 0.1 + Math.random() * 0.3,
      });
    }
    beamsRef.current = beams;

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fadeStartHeight = canvas.height * 0.7;

      beamsRef.current.forEach((beam) => {
        beam.y += beam.speed;
        if (beam.y > canvas.height) {
          beam.y = -beam.length;
          beam.x = Math.random() * canvas.width;
          beam.speed = 1.5 + Math.random() * 2.5;
          beam.length = 40 + Math.random() * 80;
        }

        let globalFade = 1;
        const beamBottom = beam.y + beam.length;
        if (beamBottom > fadeStartHeight) {
          globalFade = Math.max(0, 1 - (beamBottom - fadeStartHeight) / (canvas.height - fadeStartHeight));
        }

        const gradient = ctx.createLinearGradient(beam.x, beam.y, beam.x, beamBottom);
        const tipOpacity = 0.4 * globalFade;
        gradient.addColorStop(1, `rgba(186, 230, 253, ${tipOpacity})`);
        gradient.addColorStop(0, `rgba(186, 230, 253, 0)`);

        ctx.beginPath();
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(beam.x, beamBottom);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};
