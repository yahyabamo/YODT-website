import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { fetchArticleById, InfoArticle } from '@/service/infoCMS';

const CATEGORY_LABELS: Record<string, { ar: string; color: string }> = {
  istanbul: { ar: 'إسطنبول', color: '#2563eb' },
  yemen: { ar: 'اليمن', color: '#16a34a' },
  general: { ar: 'عام', color: '#7a1c1c' },
};

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<InfoArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchArticleById(id)
      .then(data => {
        if (!data) setError(true);
        else setArticle(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #7a1c1c', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !article) return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', direction: 'rtl' }}>
      <div style={{ fontSize: '4rem' }}>📰</div>
      <h2 style={{ color: 'var(--text, #f0ece4)', fontSize: '1.25rem', fontWeight: 700 }}>لم يتم العثور على المقال</h2>
      <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: '10px', background: '#7a1c1c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        العودة
      </button>
    </div>
  );

  const cat = CATEGORY_LABELS[article.category] ?? CATEGORY_LABELS.general;
  const formattedDate = article.created_at
    ? new Date(article.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', paddingTop: '72px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Return button */}
      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 0' }}>
        <button
          onClick={() => {
            if (article.category === 'istanbul') navigate('/about-istanbul');
            else if (article.category === 'yemen') navigate('/about-yemen');
            else navigate('/');
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '12px',
            background: 'var(--bg-1, #0d0f14)', border: '1px solid var(--border)',
            color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)';
            (e.currentTarget as HTMLElement).style.color = '#c8a84b';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--bg-1)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-2)';
          }}
        >
          <ArrowRight size={16} />
          <span>العودة للمقالات</span>
        </button>
      </div>

      {/* Hero image */}
      {article.image_url && (
        <div style={{ width: '100%', height: '420px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={article.image_url}
            alt={article.title}
            style={{ width: '100%', height: '420px', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '200px',
            background: 'linear-gradient(transparent, var(--bg, #07080b))',
          }} />
        </div>
      )}

      {/* Article content */}
      <article style={{ maxWidth: '760px', margin: '0 auto', padding: '48px clamp(16px, 4vw, 40px) 80px' }}>
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {formattedDate && (
            <span style={{ color: 'var(--text-3, #706c66)', fontSize: '0.75rem' }}>
              📅 {formattedDate}
            </span>
          )}
          {article.author && (
            <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 600 }}>
              ✍ {article.author}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          color: 'var(--text, #f0ece4)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
          fontWeight: 800, lineHeight: 1.3, marginBottom: '20px',
        }}>
          {article.title}
        </h1>

        {/* Excerpt (lead) */}
        {article.excerpt && (
          <p style={{
            color: '#c8a84b', fontSize: '1.05rem', lineHeight: 1.75,
            fontWeight: 500, marginBottom: '32px',
            borderRight: '3px solid #c8a84b', paddingRight: '16px',
          }}>
            {article.excerpt}
          </p>
        )}

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', marginBottom: '32px' }} />

        {/* Full content */}
        <div style={{
          color: 'var(--text-2, #b8b4ac)', fontSize: '0.95rem',
          lineHeight: 1.9, whiteSpace: 'pre-line',
        }}>
          {article.content}
        </div>
      </article>
    </div>
  );
}
