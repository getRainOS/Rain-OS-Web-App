import { motion, useReducedMotion } from 'framer-motion';

// A real screenshot of the app's screen, shown large and sharp. It fades up as it
// scrolls into view, then drifts slowly, and sits on a soft colour glow so it
// reads at the same weight as the rest of the page.
const view = { once: true, amount: 0.3 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function AppShot({ src, alt, accent }: { src: string; alt: string; accent: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-6 rounded-[32px] opacity-60 blur-2xl"
        style={{ background: `radial-gradient(60% 60% at 50% 40%, ${accent}, transparent 70%)` }}
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-xl border border-white/15 bg-[#0a0a0a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1.025, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
        <motion.img
          src={src}
          alt={alt}
          width={1146}
          height={560}
          loading="lazy"
          className="block h-auto w-full"
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={view}
          transition={{ duration: 1, ease: EASE }}
        />
        </motion.div>
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-1/3"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, mixBlendMode: 'screen' }}
            initial={{ left: '-40%' }}
            whileInView={{ left: ['-40%', '110%'] }}
            viewport={view}
            transition={{ duration: 3.2, delay: 0.8, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  );
}
