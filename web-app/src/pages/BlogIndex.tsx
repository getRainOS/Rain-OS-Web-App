import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, ChevronRight, BookOpen } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';
import MarketingNav from '@/components/marketing/MarketingNav';

export default function BlogIndex() {
  const navigate = useNavigate();

  const sortedPosts = [...BLOG_POSTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const featuredPost = sortedPosts[0];
  const remainingPosts = sortedPosts.slice(1);

  return (
    <div style={{ minHeight: '100vh', background: '#020410', color: '#f1f5f9' }}>
      <MarketingNav />

      {/* Hero */}
      <div style={{ padding: '140px 24px 60px', maxWidth: '760px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sky-400 font-bold tracking-wider text-xs uppercase mb-4 block">
            Founders Mode
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Notes on AI search, building in public, and why technology should serve everyone.
          </h1>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        {/* Featured post */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-sky-400" />
            </div>
            Latest post
          </h2>
          <FeaturedCard post={featuredPost} onClick={() => navigate(`/blog/${featuredPost.slug}`)} />
        </motion.div>

        {/* All posts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-violet-400" />
            </div>
            All posts
          </h2>
          <div className="space-y-4">
            {remainingPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <PostRow post={post} onClick={() => navigate(`/blog/${post.slug}`)} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeaturedCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div
          className="min-h-[200px] md:min-h-[280px] bg-cover bg-center"
          style={{ backgroundImage: `url(${post.image})` }}
        />
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-3">
            {post.category}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
            {post.title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            {post.subtitle}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {post.readTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostRow({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 flex items-center gap-5 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200"
    >
      <div
        className="w-20 h-20 rounded-lg bg-cover bg-center shrink-0 hidden sm:block"
        style={{ backgroundImage: `url(${post.image})` }}
      />
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 mb-2 block">
          {post.category}
        </span>
        <h3 className="text-base font-semibold text-white mb-1 leading-snug truncate">
          {post.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-2">
          {post.subtitle}
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {post.readTime}
          </span>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-600 shrink-0" />
    </div>
  );
}
