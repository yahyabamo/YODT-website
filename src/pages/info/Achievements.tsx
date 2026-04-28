import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { InfoHero } from '@/components/features/info/InfoHero';
import { fetchAchievements, InfoAchievement } from '@/service/infoCMS';
import { fetchHeroImages } from '@/service/heroImages';
import { useLanguage } from '@/context/LanguageContext';
import { pagesText, commonText, getField } from '@/i18n/pages';
import { useState, useEffect } from 'react';
import { AdSlot } from '@/components/ads/AdSlot';

function AchievementCard({ item, lang }: { item: InfoAchievement; lang: string }) {
  return (
    <div style={{
      background: 'var(--bg-1, #0d0f14)',
      border: '1px solid var(--border, rgba(255,255,255,0.07))',
      borderRadius: '16px', overflow: 'hidden',
      transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = '0 16px 32px rgba(0,0,0,0.3)';
        el.style.borderColor = 'rgba(200,168,75,0.2)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
        el.style.borderColor = 'var(--border)';
      }}
    >
      {/* Image */}
      {item.image_url && (
        <div style={{ width: '100%', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
          <img src={item.image_url} alt={getField(item, 'title', lang)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Icon + title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
            background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
          }}>
            {item.icon}
          </div>
          <div>
            <h3 style={{ color: 'var(--text, #f0ece4)', fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
              {getField(item, 'title', lang)}
            </h3>
            <span style={{ color: '#c8a84b', fontSize: '0.72rem', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              {item.achievement_date}
            </span>
          </div>
        </div>

        {getField(item, 'category', lang) && getField(item, 'category', lang) !== 'general' && (
          <span style={{
            display: 'inline-flex', width: 'fit-content',
            background: 'rgba(122,28,28,0.15)', border: '1px solid rgba(122,28,28,0.25)',
            color: '#c8a84b', padding: '3px 10px', borderRadius: '20px',
            fontSize: '0.7rem', fontWeight: 700,
          }}>
            {getField(item, 'category', lang)}
          </span>
        )}

        <p style={{
          color: 'var(--text-2, #b8b4ac)', fontSize: '0.84rem',
          lineHeight: 1.7, margin: 0,
        }}>
          {getField(item, 'description', lang)}
        </p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-2)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
          <div style={{ height: '14px', borderRadius: '6px', background: 'var(--bg-2)', width: '70%' }} />
          <div style={{ height: '10px', borderRadius: '6px', background: 'var(--bg-2)', width: '40%' }} />
        </div>
      </div>
      <div style={{ height: '60px', borderRadius: '8px', background: 'var(--bg-2)' }} />
    </div>
  );
}

export default function Achievements() {
  const { language: lang } = useLanguage();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<InfoAchievement[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements()
      .then(setAchievements)
      .catch(console.error)
      .finally(() => setLoading(false));
    fetchHeroImages('achievements')
      .then(rows => setHeroImages(rows.map(r => r.image_url)))
      .catch(console.error);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh' }}>

      {/* Hero — flush with navbar, no gap */}
      <InfoHero
        eyebrow={pagesText.achievements.heroEyebrow[lang]}
        title={pagesText.achievements.heroTitle[lang]}
        description={pagesText.achievements.heroDesc[lang]}
        gradient="linear-gradient(135deg, #07080b 0%, #100a1a 40%, #07080b 100%)"
        backgroundImages={heroImages}
      />

      {/* Return button */}
      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 0' }}>
        <AdSlot page="achievements" position="top" className="mb-6" />
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

      <section style={{ maxWidth: '1260px', margin: '0 auto', padding: '64px clamp(16px, 4vw, 40px) 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
          <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {pagesText.achievements.listTitle[lang]} ({loading ? '…' : achievements.length})
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : achievements.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {achievements.map(a => <AchievementCard key={a.id} item={a} lang={lang} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏆</div>
            <p style={{ fontSize: '0.95rem' }}>{commonText.noAchievements[lang]}</p>
          </div>
        )}
        <AdSlot page="achievements" position="bottom" className="mt-8" />
      </section>
    </div>
  );
}
