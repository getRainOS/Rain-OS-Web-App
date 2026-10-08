import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SOLUTIONS = [
  {
    label: 'Content Writers and Agencies',
    href: '/content-writers',
    desc: 'Blog posts, articles, marketing copy',
    color: '#38bdf8',
  },
  {
    label: 'Product Sellers',
    href: '/product-sellers',
    desc: 'Ecommerce, DTC, product pages',
    color: '#fb923c',
  },
  {
    label: 'Developers',
    href: '/developers',
    desc: 'Tech docs, READMEs, API references',
    color: '#34d399',
  },
  {
    label: 'Vibe Coders',
    href: '/vibe-coders',
    desc: 'Bolt, Lovable, Cursor, v0 builders',
    color: '#10b981',
  },
  {
    label: 'Local Businesses',
    href: '/local-business',
    desc: 'SEO + AEO for local & service businesses',
    color: '#fb7185',
  },
];

const MAIN_LINKS = [
  { label: 'AI Readability', href: '/ai-readability' },
  { label: 'Blog', href: '/blog' },
  { label: 'Docs', href: '/docs' },
  { label: 'WordPress Plugin', href: '/wordpress-plugin' },
  { label: 'Pricing', href: '/pricing' },
];

interface MarketingNavProps {
  onLoginClick?: () => void;
  onGetStartedClick?: () => void;
  light?: boolean;
}

export default function MarketingNav({ onLoginClick, onGetStartedClick, light }: MarketingNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const filteredSolutions = SOLUTIONS.filter((s) => {
    if (location.pathname === s.href) return false;
    if (location.pathname === '/' && s.href === '/vibe-coders') return false;
    return true;
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogin = () => {
    setMobileOpen(false);
    if (onLoginClick) onLoginClick();
    else navigate('/login?mode=login');
  };

  const handleGetStarted = () => {
    setMobileOpen(false);
    if (onGetStartedClick) onGetStartedClick();
    else navigate('/login');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center border-b ${
          light ? 'border-neutral-200' : 'border-white/10'
        } ${isScrolled ? 'py-3 md:py-4' : 'py-4 md:py-6'}`}
      >
        <div
          className={`flex items-center justify-between px-4 md:px-8 transition-all duration-500 ${
            isScrolled
              ? light
                ? 'w-full max-w-5xl py-2 md:py-3 rounded-2xl md:rounded-full bg-white/90 backdrop-blur-2xl border border-neutral-200 shadow-sm'
                : 'w-full max-w-5xl py-2 md:py-3 rounded-2xl md:rounded-full bg-[#040714]/80 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/40'
              : 'w-full max-w-7xl bg-transparent border-transparent'
          }`}
        >
          <a href="/" className={`font-bold text-2xl md:text-3xl tracking-tighter shrink-0 ${light ? 'text-neutral-900' : 'text-white'}`}>
            r<span className={light ? 'text-neutral-500' : 'text-sky-400'}>ai</span>n
          </a>

          {/* Desktop nav */}
          <nav className={`hidden md:flex items-center gap-8 lg:gap-10 text-sm font-medium ${light ? 'text-neutral-900' : 'text-white'}`}>
            <div
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button className={`flex items-center gap-1.5 transition-colors py-1 ${light ? 'hover:text-black' : 'hover:text-white'}`}>
                Solutions
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    solutionsOpen ? (light ? 'rotate-180 text-neutral-900' : 'rotate-180 text-sky-400') : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {solutionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 rounded-2xl overflow-hidden"
                    style={light ? {
                      background: '#ffffff',
                      border: '1px solid #e5e5e5',
                      boxShadow: '0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.02)',
                    } : {
                      background: 'rgba(6,10,24,0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(24px)',
                    }}
                  >
                    <div className="p-1.5">
                      {filteredSolutions.map((s) => (
                        <a
                          key={s.label}
                          href={s.href}
                          className={`flex flex-col px-4 py-3 rounded-xl transition-colors group ${light ? 'hover:bg-neutral-100' : 'hover:bg-white/[0.05]'}`}
                        >
                          <span className={`text-sm font-medium transition-colors ${light ? 'text-neutral-900 group-hover:text-black' : 'text-white group-hover:text-sky-300'}`}>
                            {s.label}
                          </span>
                          <span className={`text-xs mt-0.5 ${light ? 'text-neutral-500' : 'text-slate-500'}`}>{s.desc}</span>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {MAIN_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`transition-colors ${light ? 'hover:text-black' : 'hover:text-white'}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={handleLogin}
              className={`text-sm font-medium transition-colors hidden sm:block ${light ? 'text-neutral-500 hover:text-black' : 'text-slate-400 hover:text-white'}`}
            >
              Login
            </button>
            <button
              onClick={handleGetStarted}
              className={light
                ? 'bg-black hover:bg-neutral-800 text-white rounded-lg px-4 md:px-5 py-2 text-sm font-semibold transition-all hover:scale-105 active:scale-95'
                : 'bg-sky-500 hover:bg-sky-400 text-white rounded-lg px-4 md:px-5 py-2 text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95'}
            >
              Get started
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className={`md:hidden p-2 transition-colors ${light ? 'text-neutral-900 hover:text-black' : 'text-white hover:text-sky-400'}`}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-[85vw] max-w-[340px] flex flex-col"
              style={light ? {
                background: '#ffffff',
                borderLeft: '1px solid #e5e5e5',
              } : {
                background: '#040714',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile menu header */}
              <div className={`flex items-center justify-between px-5 py-4 border-b ${light ? 'border-neutral-200' : 'border-white/[0.06]'}`}>
                <span className={`font-bold text-xl tracking-tighter ${light ? 'text-neutral-900' : 'text-white'}`}>
                  r<span className={light ? 'text-neutral-500' : 'text-sky-400'}>ai</span>n
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className={`p-2 transition-colors ${light ? 'text-neutral-500 hover:text-black' : 'text-slate-400 hover:text-white'}`}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile nav links */}
              <div className="flex-1 overflow-y-auto py-4">
                {/* Solutions section */}
                <div className="px-5 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${light ? 'text-neutral-500' : 'text-slate-500'}`}>
                    Solutions
                  </span>
                </div>
                {filteredSolutions.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-5 py-3 transition-colors ${light ? 'hover:bg-neutral-100' : 'hover:bg-white/[0.03]'}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: light ? '#000' : s.color }}
                    />
                    <div>
                      <div className={`text-sm font-medium ${light ? 'text-neutral-900' : 'text-white'}`}>{s.label}</div>
                      <div className={`text-xs ${light ? 'text-neutral-500' : 'text-slate-500'}`}>{s.desc}</div>
                    </div>
                  </a>
                ))}

                {/* Divider */}
                <div className={`mx-5 my-3 border-t ${light ? 'border-neutral-200' : 'border-white/[0.06]'}`} />

                {/* Main links */}
                <div className="px-5 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${light ? 'text-neutral-500' : 'text-slate-500'}`}>
                    Pages
                  </span>
                </div>
                {MAIN_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-5 py-3 text-sm font-medium transition-colors ${light ? 'text-neutral-900 hover:text-black hover:bg-neutral-100' : 'text-white hover:text-sky-400 hover:bg-white/[0.03]'}`}
                  >
                    {link.label}
                  </a>
                ))}

                {/* Divider */}
                <div className={`mx-5 my-3 border-t ${light ? 'border-neutral-200' : 'border-white/[0.06]'}`} />

                {/* Auth links */}
                <button
                  onClick={handleLogin}
                  className={`flex items-center px-5 py-3 text-sm font-medium transition-colors w-full text-left ${light ? 'text-neutral-500 hover:text-black hover:bg-neutral-100' : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
                >
                  Login
                </button>
                <button
                  onClick={handleGetStarted}
                  className={light
                    ? 'mx-5 mt-2 bg-black hover:bg-neutral-800 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-95'
                    : 'mx-5 mt-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-5 py-3 text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all active:scale-95'}
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
