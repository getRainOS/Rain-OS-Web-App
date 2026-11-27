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
  blurb: string;
  how: string;
  before: string;
  after: string;
  afterNote: string;
  drawing: Stroke[];
};

const EXAMPLES: LaneExample[] = [
  {
    id: 'local_business',
    tab: 'Local business',
    blurb: "Customers searching near you",
    how: "We check the questions people ask AI about your area and which of your pages it can read. Then we show you what's missing: hours, services, licensing and reviews.",
    question: "Who's the best dog groomer near Austin that takes walk-ins on Saturday?",
    before: 'Here are well-reviewed dog groomers in Austin with Saturday hours: Acme Pet Spa, Sample Paws Grooming and Riverside Pet Salon.',
    after: 'Here are well-reviewed dog groomers in Austin with Saturday walk-ins: Acme Pet Spa, Example Grooming Co. (licensed, walk-ins 9 to 4, 4.9 stars from 300 reviews) and Sample Paws Grooming.',
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
    blurb: "Products AI can quote accurately",
    how: "We check what AI can read about your products: price, shipping, returns and reviews. Then we show you the gaps so it can quote your details accurately.",
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
    blurb: "Articles AI can cite and link to",
    how: "We check your articles for the facts, headings and sources AI reads. Then we show you what to tighten so it can quote your writing and link back to you.",
    question: 'How do I stop procrastinating?',
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
    blurb: "Docs AI can explain correctly",
    how: "We check your README and docs for what the project does, its stack and a quickstart. Then we show you what AI can't find yet.",
    question: 'What is the best framework for a small API that runs on Cloudflare Workers?',
    before: 'Several frameworks run on Workers. Consider Routerlab, itty-router or plain fetch handlers, depending on how much routing and middleware you need.',
    after: 'Tinyroute uses Routerlab on Cloudflare Workers: about 14 KB, typed routes and middleware, with a quickstart at docs.example.dev.',
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
    blurb: "Apps AI can recommend",
    how: "We check whether AI can find what you built, the platforms it works with and your docs. Then we show you the gaps to close.",
    question: 'What are the best AI-powered e-commerce tools?',
    before: 'You can add booking with a scheduling embed, a third-party calendar or a custom form. Each has trade-offs in cost and setup time.',
    after: 'Example Book adds a booking page to no-code apps in one step, with a free plan and a copy-paste embed.',
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

// The flat palette from the blog covers and the site's illustrations.
const LINE = '#F4EFE4';
const FILLS = ['#D8432A', '#F59A1B', '#1F4FBF'];

// Draws each stroke in turn, then fills the solid shapes with flat colour.
function Drawing({ strokes }: { strokes: Stroke[] }) {
  return (
    <motion.svg
      viewBox="0 0 320 200"
      className="w-full max-w-md text-white"
      role="img"
      aria-label="Illustration for this example"
      fill="none"
      stroke={LINE}
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
          fill={s.solid ? FILLS[i % FILLS.length] : 'none'}
          variants={{
            hidden: { pathLength: 0, fillOpacity: 0, opacity: 1 },
            show: {
              pathLength: 1,
              fillOpacity: s.solid ? 1 : 0,
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


// The lanes we work with: a framed panel with the pills, the drawing, and how we work with the chosen lane.
export function LaneSection({ index, onPick }: { index: number; onPick: (i: number) => void }) {
  const ex = EXAMPLES[index];
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [chosen, setChosen] = useState(false); // once a visitor picks a lane, it stays put
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  // Run only while the section is on screen, so it starts when someone arrives.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // Move to the next lane every few seconds while on screen.
  useEffect(() => {
    if (reduce || !inView || chosen) return;
    const t = window.setInterval(() => onPick((index + 1) % EXAMPLES.length), 4000);
    return () => clearInterval(t);
  }, [reduce, inView, chosen, index, onPick]);
  return (
    <section ref={ref} className="relative z-10 pb-28 border-t border-white/[0.06]">
      <div className="h-28" aria-hidden />
      <div className="max-w-[1104px] mx-auto px-6 border-x border-dashed border-white/10">
        <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500 mb-4" style={MONO}>Who it's for</div>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">Users we work with</h2>
        <div className="mt-8 text-[13px] text-neutral-500">Choose one</div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">
          <ul role="tablist" aria-orientation="vertical" aria-label="Lanes we work with" className="border-t border-white/10">
            {EXAMPLES.map((e, i) => {
              const on = i === index;
              return (
                <li key={e.id}>
                  <button
                    role="tab"
                    aria-selected={on}
                    onClick={() => { setChosen(true); onPick(i); }}
                    className={`relative flex w-full flex-col border-b border-white/10 py-5 pl-5 pr-2 text-left transition-colors ${on ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    <span className={`absolute left-0 top-0 h-full w-px ${on ? 'bg-white' : 'bg-transparent'}`} />
                    <span className="text-[17px] font-medium">{e.tab}</span>
                    <span className="mt-1 text-[14px] text-neutral-500">{e.blurb}</span>
                  </button>
                  {on && (
                    <div className="px-5 pb-8 pt-2 lg:hidden">
                      <Drawing strokes={e.drawing} />
                      <p className="mt-4 text-[15px] leading-relaxed text-neutral-400">{e.how}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <motion.div key={ex.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4 }} className="hidden lg:block lg:pl-12">
            <Drawing strokes={ex.drawing} />
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-neutral-400">{ex.how}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// The Track block: its heading, and the sample question for the chosen lane, in a frame.
// Tracked weekly questions, three per lane, in the app's row format: status, past weekly
// results and the next check. Example data, labelled as illustrative above the cards.
type TrackRow = { q: string; status: string; tone: 'good' | 'bad' | 'warn'; history: boolean[] };
const TRACK_ROWS: TrackRow[][] = [
  [ // Local businesses
    { q: 'best dentist in Austin for Invisalign', status: 'Cited', tone: 'good', history: [false, true, true, true] },
    { q: 'emergency dentist near me open Sunday', status: 'Cited? confirming', tone: 'warn', history: [false, false, true, true] },
    { q: 'dentist in Austin that takes new patients', status: 'Not cited', tone: 'bad', history: [true, true, false, false] },
  ],
  [ // Online sellers
    { q: 'best waterproof travel wallet under $80', status: 'Cited', tone: 'good', history: [false, true, true, true] },
    { q: 'durable travel wallet with RFID blocking', status: 'Not cited', tone: 'bad', history: [true, false, false, false] },
    { q: 'travel wallet for a carry-on under $50', status: 'Cited? confirming', tone: 'warn', history: [false, false, true, true] },
  ],
  [ // Writers and marketers
    { q: 'best newsletter tool for a solo writer', status: 'Cited', tone: 'good', history: [false, true, true, true] },
    { q: 'how to price a paid newsletter', status: 'Not cited', tone: 'bad', history: [true, false, false, false] },
    { q: 'newsletter platform with a free tier', status: 'Cited? confirming', tone: 'warn', history: [false, false, true, true] },
  ],
  [ // Developers
    { q: 'best framework for a small API on Cloudflare Workers', status: 'Cited', tone: 'good', history: [false, true, true, true] },
    { q: 'lightweight router for Cloudflare Workers', status: 'Cited? confirming', tone: 'warn', history: [false, false, true, true] },
    { q: 'typed API framework for Node', status: 'Not cited', tone: 'bad', history: [true, true, false, false] },
  ],
  [ // Vibe coders
    { q: 'easiest way to add a booking page to an AI-built app', status: 'Not cited', tone: 'bad', history: [true, false, false, false] },
    { q: 'booking widget for a no-code app', status: 'Cited? confirming', tone: 'warn', history: [false, false, true, true] },
    { q: 'scheduling app to embed in an AI-built site', status: 'Cited', tone: 'good', history: [false, true, true, true] },
  ],
];
const TONE_TEXT = { good: 'text-white', bad: 'text-[#F87171]', warn: 'text-[#FBBF24]' } as const;

export function TrackExample({ index, inline = false }: { index: number; inline?: boolean }) {
  const rows = TRACK_ROWS[index];
  const inner = inline ? '' : 'max-w-[1104px] mx-auto px-6 border-x border-dashed border-white/10';
  return (
    <div className={inline ? 'mt-16 md:mt-20 mb-16 md:mb-20' : 'relative z-10 py-28 border-t border-white/[0.06]'}>
      <div className={inner}>
        <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500 mb-4" style={MONO}>Tracked weekly</div>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance">Track the questions that matter, every week</h2>
        <p className="mt-4 text-neutral-400 max-w-2xl">Re-check the questions your customers ask AI, and get an email when AI starts or stops citing you. Included with Pro and Business.</p>
        <div className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10 bg-[#0a0a0a]">
          {rows.map((r, n) => (
            <div key={`${index}-${n}`} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div className="min-w-0">
                <div className="text-[15px] text-white">{r.q}</div>
                <div className="mt-2 flex items-center gap-1.5" aria-label="Past weekly results">
                  {r.history.map((cited, d) => (
                    <span key={d} className={`h-2 w-2 rounded-full ${cited ? 'bg-white' : 'bg-white/20'}`} />
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-left md:text-right">
                <div className={`text-[13px] font-medium ${TONE_TEXT[r.tone]}`}>{r.status}</div>
                <div className="mt-1 text-[12px] text-neutral-500" style={MONO}>Next check Dec 3</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
