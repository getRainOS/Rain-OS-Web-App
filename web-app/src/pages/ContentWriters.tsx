import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, FileText, Search, Zap, TrendingUp, Star, Globe, Bot, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContentWriters() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'AEO Scoring',
      description: 'See exactly how ChatGPT, Perplexity, and Gemini read your content — and how likely they are to cite it in their answers.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Content Scoring',
      description: 'Get a clear readability score across four AI pillars: structure, authority, clarity, and answer-alignment.',
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: 'SEO + AEO Gap Analysis',
      description: 'Surface the gaps between what search engines and AI engines need — so you can fix both at once.',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'WordPress Integration',
      description: 'Score your posts directly in the WordPress editor. Optimize before you publish, not after.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Score History & Tracking',
      description: 'Track content performance over time. Know which rewrites moved the needle and by how much.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Results',
      description: 'Paste your content and get a full AI readability report in seconds — no waiting, no fluff.',
    },
  ];

  const benefits = [
    'Understand why AI engines skip your content',
    'Get cited more often in AI-generated answers',
    'Write once, optimize for search AND AI',
    'Score any blog post, landing page, or article',
    'Integrate directly with WordPress',
    'Track improvements across every revision',
  ];

  const audiences = [
    { label: 'Bloggers', icon: <FileText className="w-5 h-5" /> },
    { label: 'SEO Professionals', icon: <Search className="w-5 h-5" /> },
    { label: 'AEO Strategists', icon: <Bot className="w-5 h-5" /> },
    { label: 'Content Agencies', icon: <Globe className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen relative z-10 selection:bg-sky-500/30">
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center border-b border-white/10 ${isScrolled ? 'py-4' : 'py-6'}`}>
        <div className={`flex items-center justify-between px-8 transition-all duration-500 ${
          isScrolled
            ? 'w-full max-w-5xl py-3 rounded-full bg-midnight/60 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/40'
            : 'w-full max-w-7xl bg-transparent border-transparent'
        }`}>
          <div className="flex items-center gap-3">
            <a href="#/" className="flex items-center gap-2 group">
              <span className="font-bold text-3xl tracking-tighter text-white transition-all">
                r<span className="text-sky-400">ai</span>n
              </span>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
            <a href="#/" className="hover:text-white transition-colors">Home</a>
            <a href="#/#features" className="hover:text-white transition-colors">Features</a>
            <a href="#/#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="https://www.getrainos.com/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
            <a href="https://www.getrainos.com/wordpress-plugin" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WordPress Plugin</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login?mode=login')}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-sky-500 hover:bg-sky-400 text-white rounded-lg px-5 py-2 text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-40 pb-24 md:pt-52 md:pb-32 relative z-10 px-6 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.28) 0%, rgba(14,165,233,0.12) 35%, rgba(14,165,233,0.04) 60%, transparent 80%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[260px] pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.18) 0%, rgba(14,165,233,0.08) 50%, transparent 80%)', filter: 'blur(16px)' }} />

          <div className="max-w-5xl mx-auto flex flex-col gap-10 items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-bold text-sky-300 tracking-[0.2em] uppercase shadow-[0_0_16px_rgba(56,189,248,0.15)]">
                <span className="flex h-2 w-2 rounded-full bg-sky-400 mr-3 animate-pulse" />
                For Content Writers & SEO Professionals
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] text-white"
                style={{ letterSpacing: '-0.04em', fontFeatureSettings: '"cv11" on, "ss01" on, "calt" on' }}>
                Get Your Content{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-sky-200 to-sky-400">
                  Cited by AI
                </span>
              </h1>

              <p className="text-slate-400 text-lg md:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
                rain OS scores your blog posts, articles, and landing pages against the signals AI engines use to pick their sources — so your content gets cited, not skipped.
              </p>
            </motion.div>

            {/* Audience pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {audiences.map((a) => (
                <span key={a.label} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                  style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#7dd3fc' }}>
                  {a.icon}
                  {a.label}
                </span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-8 py-3.5 text-base font-bold shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 group"
              >
                Score your content free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="https://www.getrainos.com/wordpress-plugin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors underline underline-offset-4"
              >
                Get the WordPress plugin
              </a>
            </motion.div>
          </div>
        </section>

        {/* Problem / Value Prop Section */}
        <section className="py-24 px-6 relative">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center space-y-4 mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                SEO is no longer enough
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                When people ask ChatGPT or Perplexity a question, AI engines pick sources based on structure, authority, and clarity — not keyword density. Most content fails these checks invisibly.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  heading: 'The old way',
                  body: 'Write for Google. Chase keyword rankings. Hope traffic converts.',
                  muted: true,
                },
                {
                  heading: 'The shift',
                  body: 'AI engines answer questions directly. The sources they cite get the clicks — everything else gets skipped.',
                  muted: false,
                  highlight: true,
                },
                {
                  heading: 'The rain OS way',
                  body: 'Score your content against AI citation signals. Know exactly what to fix. Get cited more often.',
                  muted: false,
                },
              ].map((card, i) => (
                <motion.div
                  key={card.heading}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`rounded-2xl border p-6 space-y-3 ${
                    card.highlight
                      ? 'border-sky-400/40 bg-sky-500/5'
                      : card.muted
                      ? 'border-white/5 bg-white/3'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <h3 className={`text-base font-bold ${card.muted ? 'text-slate-500' : card.highlight ? 'text-sky-300' : 'text-white'}`}>
                    {card.heading}
                  </h3>
                  <p className={`text-sm leading-relaxed ${card.muted ? 'text-slate-600' : 'text-slate-400'}`}>
                    {card.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.06) 0%, transparent 70%)' }} />

          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center space-y-4 mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                Everything a content writer needs for AEO
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                One platform. From draft to cited.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-3 hover:border-sky-400/20 hover:bg-white/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits checklist */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/3 p-10 md:p-14">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                  >
                    <h2 className="text-3xl font-semibold text-white tracking-tight mb-3">
                      What you'll be able to do
                    </h2>
                    <p className="text-slate-400 leading-relaxed">
                      rain OS gives you a clear, actionable picture of how AI engines see your content — and what to change to get cited more.
                    </p>
                  </motion.div>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-6 py-3 text-sm font-bold shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 group"
                  >
                    Start for free
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                <ul className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <motion.li
                      key={benefit}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="flex items-start gap-3 text-slate-300 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Testimonial Band */}
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-sky-400 text-sky-400" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-light text-white leading-relaxed max-w-2xl mx-auto">
                "rain OS changed how I write. I used to guess at what AI engines want — now I know exactly what to fix before I hit publish."
              </blockquote>
              <p className="text-slate-500 text-sm mt-4">Content strategist & SEO consultant</p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-28 px-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />

          <div className="max-w-2xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
                Ready to get cited?
              </h2>
              <p className="text-slate-400 text-lg mt-4 leading-relaxed">
                Paste your first piece of content and see your AI readability score in seconds. Free to start.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl px-8 py-4 text-base font-bold shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 group"
              >
                Score your content free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-midnight py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-3xl tracking-tighter text-white">
              r<span className="text-sky-400">ai</span>n
            </span>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <a
              href="https://www.getrainos.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="https://www.getrainos.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a href="mailto:support@getrainos.com" className="hover:text-white transition-colors">
              Support
            </a>
          </div>

          <div className="text-right text-xs text-slate-600">
            © {new Date().getFullYear()} rain OS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
