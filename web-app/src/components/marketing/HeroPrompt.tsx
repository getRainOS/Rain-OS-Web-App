import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, Check, X, ArrowRight } from 'lucide-react';

// The hero: someone asks an AI a question, the answer lists a few businesses,
// then the card tilts and either your result pops out ("cited") or a note
// says you're missing. Example data: one scene per lane, each on a different engine.

const MONO: React.CSSProperties = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace" };

type Item = { name: string; why: string; source: string; you?: boolean };
type Scene = { engine: string; dot: string; prompt: string; intro: string; items: Item[]; found: boolean };

// One scene per lane, so every kind of visitor sees their own question.
const SCENES: Scene[] = [
  {
    // Local service business
    engine: 'ChatGPT', dot: '#10a37f',
    prompt: "Who's the best emergency plumber near Austin that's open right now?",
    intro: 'Here are well-reviewed plumbers in Austin with 24/7 service:',
    items: [
      { name: 'Lone Star Plumbing', why: '24/7 dispatch, 4.9★ from 800+ reviews', source: 'yelp.com' },
      { name: 'Your Business', why: 'Fast response and upfront pricing, licensed in Texas', source: 'yourbrand.com', you: true },
      { name: 'Radiant Plumbing', why: 'Same-day repairs across Travis County', source: 'angi.com' },
    ],
    found: true,
  },
  {
    // Online sellers
    engine: 'Google AI Overview', dot: '#7e7e7e',
    prompt: 'best eco-friendly yoga mat under $100',
    intro: 'Popular eco-friendly yoga mats under $100 include:',
    items: [
      { name: 'Jade Harmony Mat', why: 'Natural tree rubber, made in the USA', source: 'rei.com' },
      { name: 'Manduka eKO', why: 'Biodegradable, strong grip', source: 'outdoorgearlab.com' },
      { name: 'Liforme Travel Mat', why: 'Eco-polyurethane, alignment markers', source: 'reddit.com' },
    ],
    found: false,
  },
  {
    // Writers and marketers
    engine: 'Perplexity', dot: '#8d8d8d',
    prompt: 'How should a freelance designer price their first projects?',
    intro: 'Most guides suggest starting from a day rate, then moving to project pricing:',
    items: [
      { name: 'Pricing your design work: a beginner’s guide', why: 'Day-rate formula with worked examples', source: 'yourblog.com', you: true },
      { name: 'How much to charge as a freelancer', why: 'Survey of 2,000 freelancers', source: 'hubspot.com' },
      { name: 'Value-based pricing explained', why: 'When to stop charging by the hour', source: 'medium.com' },
    ],
    found: true,
  },
  {
    // Vibe coders
    engine: 'Claude', dot: '#d97757',
    prompt: "What's a good app for tracking habits with friends?",
    intro: 'A few social habit trackers people recommend:',
    items: [
      { name: 'Habitica', why: 'Turns habits into a game with parties', source: 'habitica.com' },
      { name: 'Streaks', why: 'Simple and private, iPhone only', source: 'macstories.net' },
      { name: 'Way of Life', why: 'Detailed trends and journaling', source: 'reddit.com' },
    ],
    found: false,
  },
  {
    // Developers
    engine: 'Google AI Mode', dot: '#737373',
    prompt: 'How do I add rate limiting to an Express API?',
    intro: 'The usual approach is middleware. Common options:',
    items: [
      { name: 'express-rate-limit', why: 'Drop-in middleware, memory or Redis store', source: 'npmjs.com' },
      { name: 'Your library’s docs', why: 'Sliding-window limits with one config line', source: 'docs.yourlib.dev', you: true },
      { name: 'Rate limiting guide', why: 'Token bucket vs fixed window', source: 'stackoverflow.com' },
    ],
    found: true,
  },
];

type Phase = 'typing' | 'thinking' | 'answer' | 'reveal';

export default function HeroPrompt() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduce ? 'reveal' : 'typing');
  const [typed, setTyped] = useState(reduce ? SCENES[0].prompt.length : 0);
  const [shown, setShown] = useState(reduce ? 3 : 0);
  const s = SCENES[i];

  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      if (typed < s.prompt.length) t = setTimeout(() => setTyped(n => n + 1), 32);
      else t = setTimeout(() => setPhase('thinking'), 350);
    } else if (phase === 'thinking') {
      t = setTimeout(() => setPhase('answer'), 1000);
    } else if (phase === 'answer') {
      if (shown < s.items.length) t = setTimeout(() => setShown(n => n + 1), 380);
      else t = setTimeout(() => setPhase('reveal'), 500);
    } else {
      t = setTimeout(() => {
        setI(n => (n + 1) % SCENES.length);
        setTyped(0); setShown(0); setPhase('typing');
      }, 3600);
    }
    return () => clearTimeout(t);
  }, [phase, typed, shown, s, reduce]);

  const revealed = phase === 'reveal';

  return (
    <div className="relative mx-auto max-w-3xl" style={{ perspective: 1400 }}>
      <div className="pointer-events-none absolute -inset-10 rounded-[40px] blur-3xl opacity-60"
        style={{ background: 'radial-gradient(50% 50% at 50% 40%, rgba(255,255,255,0.22), transparent 70%)' }} />
      <motion.div
        className="relative rounded-2xl border border-white/10 bg-[#0b0b0c]/95 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] text-left"
        style={{ transformStyle: 'preserve-3d' }}
        animate={revealed && !reduce ? { rotateX: 9, rotateY: -7, y: -6 } : { rotateX: 0, rotateY: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 70, damping: 16 }}
      >
        {/* Top bar: which AI is answering */}
        <div className="flex items-center justify-between px-5 h-12 border-b border-white/[0.07]">
          <AnimatePresence mode="wait">
            <motion.div key={s.engine} className="flex items-center gap-2 text-[13px] text-neutral-200"
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
              <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
              {s.engine}
            </motion.div>
          </AnimatePresence>
          <span className="text-[10px] text-neutral-600" style={MONO}>EXAMPLE</span>
        </div>

        <div className="px-5 sm:px-7 py-6 min-h-[360px]" style={{ transformStyle: 'preserve-3d' }}>
          {/* The question */}
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-white/[0.07] px-4 py-2.5 text-[15px] text-white">
              {s.prompt.slice(0, typed)}
              {phase === 'typing' && <span className="inline-block w-[2px] h-[1em] bg-[#ffffff] align-[-2px] ml-0.5 animate-pulse" />}
            </div>
          </div>

          {/* The answer */}
          <div className="mt-6 flex gap-3" style={{ transformStyle: 'preserve-3d' }}>
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
            </div>
            <div className="flex-1 min-w-0" style={{ transformStyle: 'preserve-3d' }}>
              {phase === 'thinking' && (
                <div className="flex gap-1.5 pt-2.5" aria-label="Thinking">
                  {[0, 1, 2].map(d => (
                    <motion.span key={d} className="w-1.5 h-1.5 rounded-full bg-neutral-500"
                      animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }} />
                  ))}
                </div>
              )}
              {(phase === 'answer' || revealed) && (
                <>
                  <p className="text-[14px] text-neutral-300">{s.intro}</p>
                  <ol className="mt-3 space-y-2" style={{ transformStyle: 'preserve-3d' }}>
                    {s.items.slice(0, shown).map((it, k) => {
                      const pop = revealed && it.you;
                      return (
                        <motion.li
                          key={`${i}-${it.name}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{
                            opacity: revealed && !it.you ? (s.found ? 0.45 : 0.7) : 1,
                            y: 0,
                            z: pop && !reduce ? 70 : 0,
                            scale: pop ? 1.04 : 1,
                          }}
                          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                          className={`relative flex items-start gap-3 rounded-xl border px-3.5 py-3 ${pop ? 'border-[#ffffff] bg-[#0f1a26]' : 'border-white/[0.07] bg-white/[0.02]'}`}
                          style={pop ? { boxShadow: '0 24px 60px -12px rgba(255,255,255,0.55)' } : undefined}
                        >
                          <span className="text-[12px] text-neutral-500 pt-0.5 w-4" style={MONO}>{k + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[14.5px] text-white font-medium">{it.name}</div>
                            <div className="text-[13px] text-neutral-400 truncate">{it.why}</div>
                          </div>
                          <span className="text-[11px] text-neutral-500 pt-1 hidden sm:inline" style={MONO}>{it.source}</span>
                          {pop && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.6, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 18 }}
                              className="absolute -top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#ffffff] px-2.5 py-1 text-[11.5px] font-medium text-white shadow-lg"
                            >
                              <Check className="w-3 h-3" /> That's you · cited #{k + 1}
                            </motion.span>
                          )}
                        </motion.li>
                      );
                    })}
                  </ol>
                </>
              )}
            </div>
          </div>

          {/* Not in the answer */}
          <AnimatePresence>
            {revealed && !s.found && (
              <motion.div
                initial={{ opacity: 0, y: 14, z: 0 }} animate={{ opacity: 1, y: 0, z: reduce ? 0 : 50 }} exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.15 }}
                className="mt-5 flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-400/[0.08] px-4 py-3"
                style={{ boxShadow: '0 20px 50px -14px rgba(245,166,35,0.35)' }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/20">
                  <X className="w-3.5 h-3.5 text-amber-300" />
                </span>
                <div className="text-[14px] text-amber-100">
                  <strong className="font-medium">You're not in this answer.</strong>
                  <span className="text-amber-200/70"> rain OS shows you why, and what to fix.</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-300 ml-auto hidden sm:block" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Which scene is showing */}
      <div className="mt-6 flex justify-center gap-1.5" aria-hidden="true">
        {SCENES.map((_, k) => (
          <span key={k} className={`h-1 rounded-full transition-all duration-500 ${k === i ? 'w-6 bg-[#ffffff]' : 'w-1.5 bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}
