import React, { useEffect, useRef } from 'react';

interface Beam {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  bright: boolean;
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

    const beamCount = 38;
    const beams: Beam[] = [];
    for (let i = 0; i < beamCount; i++) {
      const bright = Math.random() < 0.2;
      beams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: bright ? 80 + Math.random() * 120 : 40 + Math.random() * 80,
        speed: bright ? 0.3 + Math.random() * 0.4 : 0.4 + Math.random() * 0.7,
        opacity: bright ? 0.5 + Math.random() * 0.4 : 0.15 + Math.random() * 0.35,
        bright,
      });
    }
    beamsRef.current = beams;

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fadeStartHeight = canvas.height * 0.75;

      beamsRef.current.forEach((beam) => {
        beam.y += beam.speed;
        if (beam.y > canvas.height) {
          beam.y = -beam.length;
          beam.x = Math.random() * canvas.width;
          beam.speed = beam.bright ? 0.3 + Math.random() * 0.4 : 0.4 + Math.random() * 0.7;
          beam.length = beam.bright ? 80 + Math.random() * 120 : 40 + Math.random() * 80;
        }

        let globalFade = 1;
        const beamBottom = beam.y + beam.length;
        if (beamBottom > fadeStartHeight) {
          globalFade = Math.max(0, 1 - (beamBottom - fadeStartHeight) / (canvas.height - fadeStartHeight));
        }

        const gradient = ctx.createLinearGradient(beam.x, beam.y, beam.x, beamBottom);
        const tipOpacity = beam.opacity * globalFade;

        if (beam.bright) {
          gradient.addColorStop(0, `rgba(186, 230, 253, 0)`);
          gradient.addColorStop(0.4, `rgba(125, 211, 252, ${tipOpacity * 0.6})`);
          gradient.addColorStop(1, `rgba(56, 189, 248, ${tipOpacity})`);
        } else {
          gradient.addColorStop(0, `rgba(186, 230, 253, 0)`);
          gradient.addColorStop(1, `rgba(186, 230, 253, ${tipOpacity})`);
        }

        ctx.beginPath();
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(beam.x, beamBottom);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = beam.bright ? 1.8 : 1.0;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (beam.bright && globalFade > 0.3) {
          ctx.beginPath();
          const glowGrad = ctx.createRadialGradient(beam.x, beamBottom, 0, beam.x, beamBottom, 8);
          glowGrad.addColorStop(0, `rgba(56, 189, 248, ${tipOpacity * 0.6})`);
          glowGrad.addColorStop(1, `rgba(56, 189, 248, 0)`);
          ctx.fillStyle = glowGrad;
          ctx.arc(beam.x, beamBottom, 8, 0, Math.PI * 2);
          ctx.fill();
        }
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
