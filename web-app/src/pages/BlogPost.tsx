import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Link2 } from 'lucide-react';
import { getPostBySlug } from '../data/blogPosts';

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
          style={{
            background: '#0EA5E9',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
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
      {/* Hero image */}
      <div style={{
        width: '100%',
        height: 'clamp(240px, 35vw, 420px)',
        backgroundImage: `url(${post.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(2,4,16,0.3), rgba(2,4,16,0.85))',
        }} />
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '0 24px 80px',
        position: 'relative',
        top: '-80px',
      }}>
        {/* Back link */}
        <button
          onClick={() => navigate('/blog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'rgba(241,245,249,0.45)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '28px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(241,245,249,0.45)')}
        >
          <ArrowLeft size={14} />
          All posts
        </button>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#0EA5E9',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(14,165,233,0.1)',
            border: '1px solid rgba(14,165,233,0.2)',
          }}>
            {post.category}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'rgba(241,245,249,0.4)' }}>
            <Calendar size={13} />
            {post.date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'rgba(241,245,249,0.4)' }}>
            <Clock size={13} />
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '16px',
        }}>
          {post.title}
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'rgba(241,245,249,0.55)',
          lineHeight: 1.55,
          marginBottom: '36px',
        }}>
          {post.subtitle}
        </p>

        {/* Author */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '36px',
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0EA5E9, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            color: '#fff',
          }}>
            {post.author[0]}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{post.author}</div>
            <div style={{ fontSize: '12px', color: 'rgba(241,245,249,0.4)' }}>{post.authorRole}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button
              onClick={copyLink}
              title="Copy link"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(241,245,249,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(241,245,249,0.5)';
              }}
            >
              <Link2 size={14} />
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Share on X"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(241,245,249,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(241,245,249,0.5)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {paragraphs.map((para, i) => {
            if (para.startsWith('**') && para.endsWith('**')) {
              return (
                <h2 key={i} style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  marginTop: '12px',
                  marginBottom: '4px',
                }}>
                  {para.replace(/\*\*/g, '')}
                </h2>
              );
            }
            if (para.startsWith('- ')) {
              const items = para.split('\n').filter((l) => l.startsWith('- '));
              return (
                <ul key={i} style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map((item, j) => (
                    <li key={j} style={{
                      fontSize: '15px',
                      lineHeight: 1.7,
                      color: 'rgba(241,245,249,0.75)',
                    }}>
                      {item.replace('- ', '')}
                    </li>
                  ))}
                </ul>
              );
            }
            // Inline bold handling
            const parts = para.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={i} style={{
                fontSize: '15px',
                lineHeight: 1.75,
                color: 'rgba(241,245,249,0.75)',
              }}>
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} style={{ color: '#f1f5f9', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
