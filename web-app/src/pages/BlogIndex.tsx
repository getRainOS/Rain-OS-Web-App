import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, ChevronRight } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';

export default function BlogIndex() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#020410', color: '#f1f5f9' }}>
      {/* Hero */}
      <div style={{
        position: 'relative',
        padding: '120px 24px 64px',
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '32px',
            left: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'rgba(241,245,249,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(241,245,249,0.5)')}
        >
          <ArrowLeft size={14} />
          Back to home
        </button>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: '16px',
        }}>
          <span style={{ color: '#0EA5E9' }}>Founders</span> Mode
        </h1>
        <p style={{
          fontSize: '17px',
          color: 'rgba(241,245,249,0.55)',
          maxWidth: '560px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Raw notes on AI search, building in public, and why technology should serve everyone.
        </p>
      </div>

      {/* Post grid */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px 80px',
        display: 'grid',
        gap: '28px',
      }}>
        {/* Featured post */}
        <FeaturedCard post={BLOG_POSTS[0]} onClick={() => navigate(`/blog/${BLOG_POSTS[0].slug}`)} />

        {/* Remaining posts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {BLOG_POSTS.slice(1).map((post) => (
            <PostCard key={post.slug} post={post} onClick={() => navigate(`/blog/${post.slug}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        backgroundImage: `url(${post.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '280px',
      }} />
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#0EA5E9',
          marginBottom: '10px',
        }}>
          {post.category}
        </span>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          lineHeight: 1.25,
          marginBottom: '10px',
          letterSpacing: '-0.02em',
        }}>
          {post.title}
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'rgba(241,245,249,0.5)',
          lineHeight: 1.6,
          marginBottom: '16px',
        }}>
          {post.subtitle}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'rgba(241,245,249,0.35)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            {post.date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            {post.readTime}
          </span>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderRadius: '14px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        height: '180px',
        backgroundImage: `url(${post.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div style={{ padding: '20px' }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#0EA5E9',
        }}>
          {post.category}
        </span>
        <h3 style={{
          fontSize: '17px',
          fontWeight: 700,
          lineHeight: 1.3,
          marginTop: '8px',
          marginBottom: '8px',
          letterSpacing: '-0.01em',
        }}>
          {post.title}
        </h3>
        <p style={{
          fontSize: '13px',
          color: 'rgba(241,245,249,0.45)',
          lineHeight: 1.5,
          marginBottom: '14px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {post.subtitle}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'rgba(241,245,249,0.3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Calendar size={11} />
              {post.date}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={11} />
              {post.readTime}
            </span>
          </div>
          <ChevronRight size={14} style={{ color: 'rgba(241,245,249,0.25)' }} />
        </div>
      </div>
    </div>
  );
}
