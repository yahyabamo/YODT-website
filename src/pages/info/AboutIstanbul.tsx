import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { InfoHero } from '@/components/features/info/InfoHero';
import { ArticleCard } from '@/components/features/info/ArticleCard';
import { fetchArticles, InfoArticle } from '@/service/infoCMS';
import { fetchHeroImages } from '@/service/heroImages';
import { useLanguage } from '@/context/LanguageContext';
import { aboutIstanbulText, commonText, getField } from '@/i18n/pages';
import { AdSlot } from '@/components/ads/AdSlot';



function SectionBlock({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{
      background: 'var(--bg-1, #0d0f14)',
      border: '1px solid var(--border, rgba(255,255,255,0.07))',
      borderRadius: '16px', padding: '28px 24px',
      transition: 'border-color 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
          background: 'rgba(122,28,28,0.15)', border: '1px solid rgba(122,28,28,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{ color: 'var(--text, #f0ece4)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>
            {title}
          </h3>
          <p style={{
            color: 'var(--text-2, #b8b4ac)', fontSize: '0.88rem',
            lineHeight: 1.85, margin: 0, whiteSpace: 'pre-line',
          }}>
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{
      background: 'var(--bg-1, #0d0f14)', border: '1px solid var(--border)',
      borderRadius: '16px', overflow: 'hidden',
    }}>
      <div style={{ aspectRatio: '16/9', background: 'var(--bg-2, #131720)', animation: 'pulse 1.5s infinite' }} />
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '16px', borderRadius: '8px', background: 'var(--bg-2)', animation: 'pulse 1.5s infinite', width: '80%' }} />
        <div style={{ height: '12px', borderRadius: '8px', background: 'var(--bg-2)', animation: 'pulse 1.5s infinite', width: '60%' }} />
      </div>
    </div>
  );
}

export default function AboutIstanbul() {
  const { language: lang } = useLanguage();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<InfoArticle[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles('istanbul')
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
    fetchHeroImages('istanbul')
      .then(rows => setHeroImages(rows.map(r => r.image_url)))
      .catch(console.error);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh' }}>

      {/* Hero — flush with navbar, no gap */}
      <InfoHero
        eyebrow={aboutIstanbulText.heroEyebrow[lang]}
        title={aboutIstanbulText.heroTitle[lang]}
        description={aboutIstanbulText.heroDesc[lang]}
        gradient="linear-gradient(135deg, #07080b 0%, #1a0505 40%, #07080b 100%)"
        backgroundImages={heroImages}
      />

      {/* Return button */}
      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 0' }}>
        <AdSlot page="about_istanbul" position="top" className="mb-6" />
        <button
          onClick={() => navigate('/')}
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
          <span>{commonText.returnToHome[lang]}</span>
        </button>
      </div>

      {/* Static content */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '64px clamp(16px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
          <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {aboutIstanbulText.guideTitle[lang]}
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {aboutIstanbulText.staticSections.map((section, idx) => (
            <SectionBlock key={idx} icon={section.icon} title={section.title[lang]} body={section.body[lang]} />
          ))}
        </div>
      </section>

      {/* Dynamic articles */}
      <section style={{ maxWidth: '1260px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
          <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {aboutIstanbulText.articlesTitle[lang]}
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : articles.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {articles.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3, #706c66)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📰</div>
            <p style={{ fontSize: '0.9rem' }}>{commonText.noArticles[lang]}</p>
          </div>
        )}
        <AdSlot page="about_istanbul" position="bottom" className="mt-8" />
      </section>
    </div>
  );
}
