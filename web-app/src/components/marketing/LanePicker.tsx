import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SEEN_KEY = 'rain_os_seen_lane_picker';

interface Lane {
  id: string;
  label: string;
  desc: string;
  href: string | null; // null = already home (vibe coders) — dismiss only
}

const LANES: Lane[] = [
  { id: 'local_business', label: 'Local Service Business', desc: "Get found when customers ask AI who's nearby.", href: '/local-business' },
  { id: 'vibe_coders', label: 'Vibe Coders', desc: 'Built with Bolt, Lovable, Replit, v0, or similar — audit your app before launch.', href: null },
  { id: 'developers', label: 'Developers', desc: 'Technical docs, READMEs, and API references, scored for AI readability.', href: '/developers' },
  { id: 'product_sellers', label: 'Product Sellers', desc: 'Shopify, Wix, Etsy, Amazon listings — get found by AI shopping assistants.', href: '/product-sellers' },
  { id: 'general', label: 'Writers & Marketers', desc: 'Blog posts, newsletters, and landing pages built to get cited by AI.', href: '/content-writers' },
];

/**
 * First-visit entry overlay for the marketing homepage. Shown once per
 * browser (localStorage, not a timed auto-advance — see conversation:
 * a forced delay before real content renders is a bad look for an
 * AI-readability product's own homepage). Picking a lane routes straight
 * to that lane's landing page; dismissing just reveals the default
 * homepage underneath.
 */
export default function LanePicker() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (private mode etc.) — just skip the picker
    }
  }, []);

  // Lock background scroll while the overlay is open. Without this, the
  // homepage underneath (much taller than the viewport) is still
  // scrollable — on mobile a swipe inside the overlay can scroll the
  // hidden page behind it instead of the overlay's own card list, making
  // the lower cards feel unreachable/"off screen" even though they're
  // really just one proper swipe away.
  useEffect(() => {
    if (!visible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
  }

  function choose(lane: Lane) {
    markSeen();
    setVisible(false);
    if (lane.href) navigate(lane.href);
  }

  function dismiss() {
    markSeen();
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: '#000000', height: '100dvh' }}
        >
          {/* Minimal header — logo left, close right, same wordmark as the main nav */}
          <div className="flex items-center justify-between px-6 md:px-10 py-5 shrink-0">
            <span className="font-bold text-2xl tracking-tighter text-white">
              r<span className="text-sky-400">ai</span>n
            </span>
            <button
              onClick={dismiss}
              aria-label="Skip and browse the site"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Choose-your-lane body. justify-start + my-auto (not justify-center)
              on the overflow-y-auto parent — centering flex content that's taller
              than the viewport clips the top with no way to scroll to it; this
              still centers short content but lets tall content scroll from the top. */}
          {/* min-h-0 overrides the flex default of min-height:auto — without
              it, a flex child with overflow-y-auto can refuse to shrink to
              its allotted space and instead grow past the fixed parent's
              bottom edge, which (being position:fixed, not scrollable)
              makes that overflow genuinely unreachable rather than just
              scrolled-to. */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-start px-6 py-10 overflow-y-auto relative">
            <div className="m-auto flex flex-col items-center w-full">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white text-center max-w-2xl"
            >
              Choose where you fit.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative z-10 mt-4 text-base text-neutral-400 text-center max-w-md"
            >
              Rain OS scores content differently depending on what you're building. Pick one to see what we check for you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="relative z-10 mt-10 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {LANES.map((lane) => {
                return (
                  <button
                    key={lane.id}
                    onClick={() => choose(lane)}
                    className="group text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] transition-colors p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-base font-semibold text-white">{lane.label}</span>
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="mt-1.5 text-sm text-neutral-400 leading-relaxed">{lane.desc}</p>
                  </button>
                );
              })}
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              onClick={dismiss}
              className="relative z-10 mt-8 text-sm text-neutral-500 hover:text-white transition-colors"
            >
              Not sure yet — just show me the site
            </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
