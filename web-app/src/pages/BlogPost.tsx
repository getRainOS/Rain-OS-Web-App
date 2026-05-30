import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Link2, FileText } from 'lucide-react';
import { getPostBySlug } from '../data/blogPosts';
import MarketingNav from '@/components/marketing/MarketingNav';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = getPostBySlug(slug || '');

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: '#020410', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Post not found</h2>
        <button
          onClick={() => navigate('/blog')}
          className="text-white rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer"
          style={{ background: '#0EA5E9' }}
        >
          Back to blog
        </button>
      </div>
    );
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
  }

  const paragraphs = post.body.split('\n\n').filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: '#020410', color: '#f1f5f9' }}>
      <MarketingNav />

      {/* Hero */}
      <div style={{ padding: '140px 24px 60px', maxWidth: '760px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          All posts
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-4 block">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-6">
            {post.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        {/* Meta bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 mb-12 flex-wrap"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 px-3 py-1.5 rounded-md bg-sky-500/10 border border-sky-500/20">
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-sm text-slate-400">
            <Calendar size={14} />
            {post.date}
          </span>
          <span className="flex items-center gap-1 text-sm text-slate-400">
            <Clock size={14} />
            {post.readTime}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={copyLink}
              title="Copy link"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <Link2 size={14} />
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on X"
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all no-underline"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </motion.div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div
            className="w-full rounded-2xl bg-cover bg-center"
            style={{
              backgroundImage: `url(${post.image})`,
              height: 'clamp(200px, 30vw, 380px)',
            }}
          />
        </motion.div>

        {/* Author */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 py-4 border-y border-white/[0.06] mb-10"
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #0EA5E9, #a855f7)' }}>
            {post.author[0]}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{post.author}</div>
            <div className="text-xs text-slate-400">{post.authorRole}</div>
          </div>
        </motion.div>

        {/* Body */}
        <div className="flex flex-col gap-5">
          {paragraphs.map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**')) {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-xl font-semibold text-white mt-2 mb-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-sky-400" />
                    </div>
                    {para.replace(/\*\*/g, '')}
                  </h2>
                </motion.div>
              );
            }
            if (para.startsWith('- ')) {
              const items = para.split('\n').filter((l) => l.startsWith('- '));
              return (
                <motion.ul
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="pl-5 flex flex-col gap-2"
                >
                  {items.map((item, j) => (
                    <li key={j} className="text-[15px] leading-relaxed text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                      {item.replace('- ', '')}
                    </li>
                  ))}
                </motion.ul>
              );
            }
            // Inline bold handling
            const parts = para.split(/(\*\*.*?\*\*)/g);
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="text-[15px] leading-relaxed text-slate-400"
              >
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </motion.p>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 rounded-2xl border border-violet-400/20 bg-violet-500/[0.03] p-8 text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-3">
            Ready to see how AI-readable your content is?
          </h3>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto leading-relaxed">
            Run your first analysis free. No credit card. No setup. Just paste your content or enter a URL and see your score.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-white rounded-xl px-8 py-3.5 text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)',
              boxShadow: '0 8px 24px rgba(139,92,246,0.25)',
            }}
          >
            Scan my content free
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
