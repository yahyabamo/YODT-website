import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoArticle } from '@/service/infoCMS';

interface ArticleCardProps {
  article: InfoArticle;
}

const CATEGORY_LABELS: Record<string, { ar: string; color: string }> = {
  istanbul: { ar: 'إسطنبول', color: '#2563eb' },
  yemen: { ar: 'اليمن', color: '#16a34a' },
  general: { ar: 'عام', color: '#7a1c1c' },
};

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const navigate = useNavigate();
  const cat = CATEGORY_LABELS[article.category] ?? CATEGORY_LABELS.general;

  const formattedDate = article.created_at
    ? new Date(article.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div
      onClick={() => navigate(`/articles/${article.id}`)}
      style={{
        background: 'var(--bg-1, #0d0f14)',
        border: '1px solid var(--border, rgba(255,255,255,0.07))',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-6px)';
        el.style.boxShadow = '0 20px 40px rgba(0,0,0,0.35)';
        el.style.borderColor = 'rgba(200,168,75,0.25)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
        el.style.borderColor = 'var(--border, rgba(255,255,255,0.07))';
      }}
    >
      {/* Hero image */}
      <div style={{
        width: '100%', aspectRatio: '16/9', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1c2030, #252a3a)',
        position: 'relative', flexShrink: 0,
      }}>
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', opacity: 0.2,
          }}>
            📰
          </div>
        )}
        {/* Category badge */}
        <span style={{
          position: 'absolute', top: '12px', right: '12px',
          background: cat.color, color: '#fff',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '0.7rem', fontWeight: 700,
        }}>
          {cat.ar}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{
          color: 'var(--text, #f0ece4)', fontSize: '1rem',
          fontWeight: 700, lineHeight: 1.4, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </h3>

        <p style={{
          color: 'var(--text-2, #b8b4ac)', fontSize: '0.82rem',
          lineHeight: 1.65, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.excerpt}
        </p>

        <div style={{
          marginTop: 'auto', paddingTop: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {formattedDate && (
            <span style={{ color: 'var(--text-3, #706c66)', fontSize: '0.72rem' }}>
              {formattedDate}
            </span>
          )}
          {article.author && (
            <span style={{ color: '#c8a84b', fontSize: '0.72rem', fontWeight: 600 }}>
              {article.author}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
