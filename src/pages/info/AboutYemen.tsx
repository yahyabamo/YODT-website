import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { InfoHero } from '@/components/features/info/InfoHero';
import { InfoCard } from '@/components/features/info/InfoCard';
import { ArticleCard } from '@/components/features/info/ArticleCard';
import { fetchIcons, fetchArticles, InfoIcon, InfoArticle } from '@/service/infoCMS';
import { fetchHeroImages } from '@/service/heroImages';
import { useLanguage } from '@/context/LanguageContext';
import { aboutYemenText, pagesText, commonText, getField } from '@/i18n/pages';
import { AdSlot } from '@/components/ads/AdSlot';

// ---------------------------------------------------------
// Reusable Components
// ---------------------------------------------------------

function SectionBlock({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{
      background: 'var(--bg-1, #0d0f14)',
      border: '1px solid var(--border, rgba(255,255,255,0.07))',
      borderRadius: '16px',
      padding: '28px 24px',
      transition: 'transform 0.3s ease, border-color 0.3s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200, 168, 75, 0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border, rgba(255,255,255,0.07))'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
          background: 'rgba(22,100,58,0.15)', border: '1px solid rgba(22,100,58,0.25)',
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

// Unified Skeleton taking aspect ratio to support both Cards and Articles
function Skeleton({ aspectRatio = '16/9' }: { aspectRatio?: string }) {
  return (
    <div style={{
      background: 'var(--bg-1)', border: '1px solid var(--border)',
      borderRadius: '16px', overflow: 'hidden',
    }}>
      <div style={{ aspectRatio, background: 'var(--bg-2)', animation: 'pulse 1.5s infinite' }} />
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '16px', borderRadius: '8px', background: 'var(--bg-2)', width: '80%' }} />
        <div style={{ height: '12px', borderRadius: '8px', background: 'var(--bg-2)', width: '60%' }} />
      </div>
    </div>
  );
}

function SectionDivider({ title, count }: { title: string, count?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
      <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, var(--border))' }} />
      <span style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase'
      }}>
        <Sparkles size={14} />
        {title} {count !== undefined && `(${count})`}
      </span>
      <div style={{ height: '1px', flex: 1, background: 'linear-gradient(270deg, transparent, var(--border))' }} />
    </div>
  );
}

// ---------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------

export default function AboutYemenCombined() {
  const { language: lang } = useLanguage();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<InfoArticle[]>([]);
  const [icons, setIcons] = useState<InfoIcon[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);

  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingIcons, setLoadingIcons] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch Articles
    fetchArticles('yemen')
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoadingArticles(false));

    // Fetch Icons
    fetchIcons()
      .then(setIcons)
      .catch(console.error)
      .finally(() => setLoadingIcons(false));

    // Fetch and combine hero images from both endpoints for a rich background
    Promise.all([fetchHeroImages('yemen'), fetchHeroImages('icons')])
      .then(([yemenRows, iconsRows]) => {
        const combined = [...yemenRows, ...iconsRows].map(r => r.image_url);
        // Shuffle or just slice to ensure we get a good mix
        setHeroImages(combined.slice(0, 8));
      })
      .catch(console.error);

  }, []);

  return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh' }}>

      {/* Unified Hero Section */}
      <InfoHero
        eyebrow={aboutYemenText.heroEyebrow[lang]}
        title={aboutYemenText.heroTitle[lang]}
        description={aboutYemenText.heroDesc[lang]}
        // Blended gradient representing both pages (Greenish to Golden darks)
        gradient="linear-gradient(135deg, #07080b 0%, #051a0c 40%, #12100a 100%)"
        backgroundImages={heroImages}
      />

      {/* Top Controls & Ad */}
      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 0' }}>
        <AdSlot page="AboutYemen" position="top" className="mb-6" />

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
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

      {/* Chapter 1: The Guide (Yemen Intro) */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '64px clamp(16px, 4vw, 40px) 40px' }}>
        <SectionDivider title={aboutYemenText.guideTitle[lang]} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {aboutYemenText.staticSections.map((section, idx) => (
            <SectionBlock key={idx} icon={section.icon} title={section.title[lang]} body={section.body[lang]} />
          ))}
        </div>
      </section>

      {/* Visual Separator */}
      <div style={{ maxWidth: '600px', margin: '0 auto', height: '1px', background: 'radial-gradient(circle, rgba(200,168,75,0.3) 0%, transparent 100%)' }} />

      {/* Chapter 2: The People (Icons) */}
      <section style={{ maxWidth: '1260px', margin: '0 auto', padding: '64px clamp(16px, 4vw, 40px) 40px' }}>
        <SectionDivider
          title={pagesText.icons.listTitle[lang]}
          count={loadingIcons ? undefined : icons.length}
        />

        {loadingIcons ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} aspectRatio="4/3" />)}
          </div>
        ) : icons.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {icons.map(ic => (
              <InfoCard
                key={ic.id}
                id={ic.id!}
                name={getField(ic, 'name', lang)}
                bio={getField(ic, 'bio', lang)}
                image_url={ic.image_url}
                badge={ic.field}
                badgeColor="#92400e"
                detailPath={`/icons/${ic.id}`}
                extraInfo={ic.birth_year ? `${commonText.bornIn[lang]} ${ic.birth_year}` : undefined}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏅</div>
            <p style={{ fontSize: '0.95rem' }}>{commonText.noIcons[lang]}</p>
          </div>
        )}
      </section>

      {/* Visual Separator */}
      <div style={{ maxWidth: '600px', margin: '0 auto', height: '1px', background: 'radial-gradient(circle, rgba(22,100,58,0.3) 0%, transparent 100%)' }} />

      {/* Chapter 3: Further Reading (Articles) */}
      <section style={{ maxWidth: '1260px', margin: '0 auto', padding: '64px clamp(16px, 4vw, 40px) 80px' }}>
        <SectionDivider title={aboutYemenText.articlesTitle[lang]} />

        {loadingArticles ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} aspectRatio="16/9" />)}
          </div>
        ) : articles.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {articles.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📰</div>
            <p style={{ fontSize: '0.9rem' }}>{commonText.noArticles[lang]}</p>
          </div>
        )}

        <AdSlot page="AboutYemen" position="bottom" className="mt-12" />
      </section>
    </div>
  );
}