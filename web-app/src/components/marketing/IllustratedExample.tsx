import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const MONO: React.CSSProperties = { fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace" };

// Illustrative before-and-after, one per lane. Every business name is invented,
// and the section says so on the page. Each drawing is a list of paths: strokes
// draw themselves in, and "solid" paths fill once the outline is done.
type Stroke = { d: string; solid?: boolean };

type LaneExample = {
  id: string;
  tab: string;
  question: string;
  before: string;
  after: string;
  afterNote: string;
  drawing: Stroke[];
};

const EXAMPLES: LaneExample[] = [
  {
    id: 'local_business',
    tab: 'Local business',
    question: "Who's the best emergency plumber near Austin that's open right now?",
    before: 'Here are well-reviewed plumbers in Austin with 24/7 service: Acme Plumbing, Sample Drain Co. and Riverside Pipe Works.',
    after: 'Here are well-reviewed plumbers in Austin with 24/7 service: Acme Plumbing, Example Plumbing Co. (licensed, 24/7 dispatch, same-day repairs) and Sample Drain Co.',
    afterNote: 'Licensing and 24/7 dispatch added to the first paragraph.',
    drawing: [
      { d: 'M20 176 H300' },
      { d: 'M86 58 Q88 36 110 36 Q132 36 134 58 Z', solid: true },
      { d: 'M80 58 H140' },
      { d: 'M94 72 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0' },
      { d: 'M78 176 L80 118 Q82 100 110 100 Q138 100 140 118 L142 176' },
      { d: 'M140 118 Q152 124 150 136' },
      { d: 'M146 130 L158 118 L164 124 L152 136 Z', solid: true },
      { d: 'M218 52 Q218 40 230 40 H266 Q278 40 278 52 V152 Q278 164 266 164 H230 Q218 164 218 152 Z' },
      { d: 'M220 64 H264 V86 H220 Z', solid: true },
      { d: 'M220 94 H264 V128 H220 Z', solid: true },
      { d: 'M226 104 H258 M226 112 H250' },
      { d: 'M190 62 q4 6 0 9 q-4 -3 0 -9 Z', solid: true },
    ],
  },
  {
    id: 'product_sellers',
    tab: 'Online sellers',
    question: "What's a good waterproof travel wallet under $80?",
    before: 'Popular options include several well-known brands. Look for RFID blocking, a slim profile and leather or nylon construction.',
    after: 'Example Co. makes a waterproof travel wallet for $69 with RFID blocking and a 5-year warranty, and it ships free within the US.',
    afterNote: 'Product details, price and shipping added to the product page as plain text.',
    drawing: [
      { d: 'M20 176 H300' },
      { d: 'M90 80 L160 52 L230 80 L160 108 Z', solid: true },
      { d: 'M90 80 V150 L160 178 V108' },
      { d: 'M230 80 V150 L160 178' },
      { d: 'M125 66 L195 94' },
      { d: 'M254 40 H300 Q306 40 306 46 V150 Q306 156 300 156 H254 Q248 156 248 150 V46 Q248 40 254 40 Z' },
      { d: 'M258 64 H296 V104 H258 Z', solid: true },
      { d: 'M258 118 H284 M258 130 H276' },
    ],
  },
  {
    id: 'general',
    tab: 'Writers & marketers',
    question: 'Which newsletter tool works best for a solo writer who wants simple pricing?',
    before: 'Many newsletter tools offer free plans and paid tiers. Compare features like templates, automation and analytics before choosing.',
    after: 'Example Letters is built for solo writers: one flat price, a free tier up to 500 subscribers, and a clear guide to publishing from your own domain.',
    afterNote: 'The answer names the product and its pricing from a comparison page that states both plainly.',
    drawing: [
      { d: 'M20 176 H300' },
      { d: 'M96 40 H230 Q238 40 238 48 V160 Q238 168 230 168 H96 Z', solid: true },
      { d: 'M110 40 V168' },
      { d: 'M130 70 H212 M130 90 H212 M130 110 H200 M130 130 H190' },
      { d: 'M250 150 L284 64 L292 68 L258 154 Z' },
      { d: 'M250 150 L246 162 L258 154 Z', solid: true },
      { d: 'M300 40 V54 M293 47 H307' },
    ],
  },
  {
    id: 'developers',
    tab: 'Developers',
    question: 'What is the best framework for a small API that runs on Cloudflare Workers?',
    before: 'Several frameworks run on Workers. Consider Hono, itty-router or plain fetch handlers, depending on how much routing and middleware you need.',
    after: 'Tinyroute uses Hono on Cloudflare Workers: about 14 KB, typed routes and middleware, with a quickstart at docs.example.dev.',
    afterNote: 'The project README states the stack, size and quickstart link in its first paragraph.',
    drawing: [
      { d: 'M20 176 H300' },
      { d: 'M90 50 H230 Q236 50 236 56 V132 H84 V56 Q84 50 90 50 Z' },
      { d: 'M70 132 H250 L244 146 H76 Z', solid: true },
      { d: 'M120 84 L104 100 L120 116' },
      { d: 'M140 112 L152 84' },
      { d: 'M200 84 L216 100 L200 116' },
      { d: 'M124 132 H206' },
    ],
  },
  {
    id: 'vibe_coders',
    tab: 'Vibe coders',
    question: "What's the easiest way to add a booking page to an app I built with AI?",
    before: 'You can add booking with a scheduling embed, a third-party calendar or a custom form. Each has trade-offs in cost and setup time.',
    after: 'Example Book adds a booking page to Lovable, Bolt and Replit apps in one step, with a free plan and a copy-paste embed.',
    afterNote: 'The answer names the tool and the platforms it works with, from its own docs page.',
    drawing: [
      { d: 'M20 176 H300' },
      { d: 'M40 50 H220 Q226 50 226 56 V150 Q226 156 220 156 H40 Q34 156 34 150 V56 Q34 50 40 50 Z' },
      { d: 'M34 72 H226' },
      { d: 'M46 61 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 Z', solid: true },
      { d: 'M56 61 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 Z', solid: true },
      { d: 'M52 88 H130 V118 H52 Z', solid: true },
      { d: 'M142 88 H208 V140 H142 Z' },
      { d: 'M52 128 H124' },
      { d: 'M262 70 V110 M242 90 H282' },
      { d: 'M278 122 V142 M268 132 H288' },
    ],
  },
];

// Draws each stroke in turn, then fills the solid shapes.
function Drawing({ strokes }: { strokes: Stroke[] }) {
  return (
    <motion.svg
      viewBox="0 0 320 200"
      className="mx-auto w-full max-w-sm text-white"
      role="img"
      aria-label="Illustration for this example"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {strokes.map((s, i) => (
        <motion.path
          key={i}
          d={s.d}
          fill={s.solid ? 'currentColor' : 'none'}
          variants={{
            hidden: { pathLength: 0, fillOpacity: 0, opacity: 1 },
            show: {
              pathLength: 1,
              fillOpacity: s.solid ? 0.9 : 0,
              transition: {
                pathLength: { duration: 0.8, delay: i * 0.12, ease: 'easeInOut' },
                fillOpacity: { duration: 0.5, delay: i * 0.12 + 0.6 },
              },
            },
          }}
        />
      ))}
    </motion.svg>
  );
}

function Card({ tone, label, note, answer }: { tone: 'before' | 'after'; label: string; note: string; answer: string }) {
  const named = tone === 'after';
  return (
    <div className={`rounded-xl border p-5 md:p-6 text-left ${named ? 'border-white/25 bg-white/[0.04]' : 'border-white/10 bg-[#0a0a0a]'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-400" style={MONO}>{label}</span>
        <span className={`text-[11px] ${named ? 'text-white' : 'text-neutral-500'}`} style={MONO}>{named ? 'Named' : 'Not named'}</span>
      </div>
      <p className="text-[14px] leading-relaxed text-neutral-300">{answer}</p>
      <p className="mt-4 text-[12px] text-neutral-500">{note}</p>
    </div>
  );
}

const ROTATE_MS = 9000;      // how long each lane stays on screen
const RESUME_AFTER_CLICK_MS = 30000; // a manual pick pauses rotation for a while

export default function IllustratedExample() {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [pausedUntil, setPausedUntil] = useState(0);
  const pauseTimer = useRef<number | undefined>(undefined);
  const ex = EXAMPLES[index];
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Rotate through the lanes on their own, unless paused or reduced motion is on.
  useEffect(() => {
    if (reduceMotion || hovering || Date.now() < pausedUntil) return;
    const t = window.setInterval(() => setIndex(i => (i + 1) % EXAMPLES.length), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [hovering, pausedUntil, reduceMotion, index]);

  useEffect(() => () => window.clearTimeout(pauseTimer.current), []);

  const pick = (i: number) => {
    setIndex(i);
    setPausedUntil(Date.now() + RESUME_AFTER_CLICK_MS);
    window.clearTimeout(pauseTimer.current);
    pauseTimer.current = window.setTimeout(() => setPausedUntil(0), RESUME_AFTER_CLICK_MS);
  };

  return (
    <section
      className="relative z-10 py-24 border-t border-white/[0.06]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500" style={MONO}>Example</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-white">What a before and after looks like</h2>
          <p className="mt-4 text-neutral-400 max-w-2xl mx-auto">
            The same question, before and after two fixes. Pick the lane that fits you.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Lane examples">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.id}
              role="tab"
              aria-selected={i === index}
              onClick={() => pick(i)}
              className={`h-9 px-4 rounded-full text-[13px] border transition-colors ${i === index ? 'bg-white text-black border-white' : 'border-white/15 text-neutral-300 hover:border-white/30'}`}
            >
              {e.tab}
            </button>
          ))}
        </div>

        <motion.div key={ex.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4 }}>
          <Drawing strokes={ex.drawing} />

          <div className="mt-6 text-center">
            <span className="inline-block rounded-md border border-white/10 bg-black px-4 py-2 text-[14px] text-neutral-200">{ex.question}</span>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card tone="before" label="Before" note="The business is not named." answer={ex.before} />
            <Card tone="after" label="After two fixes" note={ex.afterNote} answer={ex.after} />
          </div>
        </motion.div>

        <p className="mt-6 text-center text-[12px] text-neutral-500" style={MONO}>
          Illustrative examples. All business names are invented, and these are not customers or results. Real results vary and take time: checks run weekly, and changes to a page can take weeks to show up in AI answers.
        </p>
      </div>
    </section>
  );
}
