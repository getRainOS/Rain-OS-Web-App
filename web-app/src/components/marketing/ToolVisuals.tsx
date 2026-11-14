import { motion, useReducedMotion } from 'framer-motion';

// A real screenshot of the app's screen for each tool. It fades up as it scrolls
// into view and then drifts slowly, so the page feels alive without changing what
// the picture shows.
const view = { once: true, amount: 0.3 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function AppShot({ src, alt }: { src: string; alt: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
      <motion.img
        src={src}
        alt={alt}
        width={1366}
        height={900}
        loading="lazy"
        className="block h-auto w-full"
        initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={view}
        transition={{ duration: 0.9, ease: EASE }}
      />
    </div>
  );
}
