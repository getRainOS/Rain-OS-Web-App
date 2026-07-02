import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface MarketingNavProps {
  onLoginClick?: () => void;
  onGetStartedClick?: () => void;
}

export default function MarketingNav({ onLoginClick, onGetStartedClick }: MarketingNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    if (onLoginClick) onLoginClick();
    else navigate('/login?mode=login');
  };

  const handleGetStarted = () => {
    if (onGetStartedClick) onGetStartedClick();
    else navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center border-b border-white/10 ${
        isScrolled ? 'py-4' : 'py-6'
      }`}
    >
      <div
        className={`flex items-center justify-between px-8 transition-all duration-500 ${
          isScrolled
            ? 'w-full max-w-5xl py-3 rounded-full bg-midnight/60 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/40'
            : 'w-full max-w-7xl bg-transparent border-transparent'
        }`}
      >
        <a href="/" className="font-bold text-3xl tracking-tighter text-white">
          r<span className="text-sky-400">ai</span>n
        </a>

        <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-white">
          <div
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button className="flex items-center gap-1.5 hover:text-white transition-colors py-1">
              Other Solutions
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  solutionsOpen ? 'rotate-180 text-sky-400' : ''
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
                  style={{
                    background: 'rgba(6,10,24,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(24px)',
                  }}
                >
                  <div className="p-1.5">
                    {SOLUTIONS.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        className="flex flex-col px-4 py-3 rounded-xl hover:bg-white/[0.05] transition-colors group"
                      >
                        <span className="text-white text-sm font-medium group-hover:text-sky-300 transition-colors">
                          {s.label}
                        </span>
                        <span className="text-slate-500 text-xs mt-0.5">{s.desc}</span>
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="/ai-readability" className="hover:text-white transition-colors">
            AI Readability
          </a>
          <a href="/blog" className="hover:text-white transition-colors">
            Blog
          </a>
          <a href="/docs" className="hover:text-white transition-colors">
            Docs
          </a>
          <a href="/wordpress-plugin" className="hover:text-white transition-colors">
            WordPress Plugin
          </a>
          <a href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogin}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block"
          >
            Login
          </button>
          <button
            onClick={handleGetStarted}
            className="bg-sky-500 hover:bg-sky-400 text-white rounded-lg px-5 py-2 text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}
