import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { InfoHero } from '@/components/features/info/InfoHero';
import { InfoCard } from '@/components/features/info/InfoCard';
import { fetchUniversities, fetchDepartments, InfoUniversity, InfoDepartment } from '@/service/infoCMS';
import { fetchHeroImages } from '@/service/heroImages';
import { useLanguage } from '@/context/LanguageContext';
import { pagesText, commonText, getField } from '@/i18n/pages';
import { AdSlot } from '@/components/ads/AdSlot';

function Skeleton() {
  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '4/3', background: 'var(--bg-2)' }} />
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '16px', borderRadius: '8px', background: 'var(--bg-2)', width: '80%' }} />
        <div style={{ height: '12px', borderRadius: '8px', background: 'var(--bg-2)', width: '60%' }} />
      </div>
    </div>
  );
}

export default function Universities() {
  const { language: lang } = useLanguage();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState<InfoUniversity[]>([]);
  const [departments, setDepartments] = useState<InfoDepartment[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchUniversities().then(setUniversities),
      fetchDepartments().then(setDepartments),
      fetchHeroImages('universities').then(rows => setHeroImages(rows.map(r => r.image_url)))
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh' }}>
      <InfoHero
        eyebrow={pagesText.universities.heroEyebrow[lang]}
        title={pagesText.universities.heroTitle[lang]}
        description={pagesText.universities.heroDesc[lang]}
        gradient="linear-gradient(135deg, #07080b 0%, #0b1020 40%, #07080b 100%)"
        backgroundImages={heroImages}
      />

      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 0' }}>
        <AdSlot page="universities" position="top" className="mb-6" />
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '12px',
            background: 'var(--bg-1, #0d0f14)', border: '1px solid var(--border)',
            color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          <ArrowRight size={16} />
          <span>{commonText.returnToHome[lang]}</span>
        </button>
      </div>

      {/* UNIVERSITIES SECTION */}
      <section style={{ maxWidth: '1260px', margin: '0 auto', padding: '64px clamp(16px, 4vw, 40px) 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
          <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {pagesText.universities.listTitle[lang]} ({loading ? '…' : universities.length})
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : universities.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {universities.map(u => (
              <InfoCard
                key={u.id} id={u.id!} name={getField(u, 'name', lang)}
                bio={getField(u, 'description', lang)} image_url={u.image_url}
                badge={getField(u, 'location', lang)} badgeColor="#1d4ed8"
                detailPath={`/universities/${u.id}`}
                extraInfo={u.established ? `${pagesText.universities.established[lang]} ${u.established}` : undefined}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* DEPARTMENTS SECTION */}
      <section style={{ maxWidth: '1260px', margin: '0 auto', padding: '20px clamp(16px, 4vw, 40px) 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
          <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {lang === 'ar' ? 'التخصصات' : 'Departments'} ({loading ? '…' : departments.length})
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : departments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {departments.map(d => (
              <InfoCard
                key={d.id} id={d.id!} name={getField(d, 'name', lang)}
                bio={getField(d, 'description', lang)} image_url={d.image_url}
                badge={d.duration ? `⏳ ${d.duration}` : undefined} badgeColor="#059669"
                detailPath={`/departments/${d.id}`}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
            <p style={{ fontSize: '0.95rem' }}>{lang === 'ar' ? 'لا توجد تخصصات مضافة بعد' : 'No departments added yet'}</p>
          </div>
        )}
        <AdSlot page="universities" position="bottom" className="mt-8" />
      </section>
    </div>
  );
}