import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fetchUniversityById, InfoUniversity } from '@/service/infoCMS';
import { useLanguage } from '@/context/LanguageContext';
import { commonText, pagesText, getField } from '@/i18n/pages';
import { AdSlot } from '@/components/ads/AdSlot';

export default function UniversityDetail() {
  const { language: lang } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [uni, setUni] = useState<InfoUniversity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchUniversityById(id)
      .then(data => { if (!data) setError(true); else setUni(data); })
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

  if (error || !uni) return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', direction: 'rtl' }}>
      <div style={{ fontSize: '4rem' }}>🎓</div>
      <h2 style={{ color: 'var(--text, #f0ece4)' }}>{commonText.universityNotFound[lang]}</h2>
      <button onClick={() => navigate('/universities')} style={{ padding: '10px 20px', borderRadius: '10px', background: '#7a1c1c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        {commonText.universitiesList[lang]}
      </button>
    </div>
  );

  const specialtiesList = uni.specialties ? uni.specialties.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', paddingTop: '72px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Return button */}
      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 0' }}>
        <AdSlot page="university_details" position="top" className="mb-6" />
        <button
          onClick={() => navigate('/universities')}
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
          <span>{commonText.returnToUniversities[lang]}</span>
        </button>
      </div>

      {/* Hero image */}
      {uni.image_url && (
        <div style={{ width: '100%', height: '320px', overflow: 'hidden', position: 'relative' }}>
          <img src={uni.image_url} alt={getField(uni, 'name', lang)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, var(--bg, #07080b))' }} />
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px clamp(16px, 4vw, 40px) 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ background: '#1d4ed8', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
              📍 {getField(uni, 'location', lang)}
            </span>
            {uni.established && (
              <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 600 }}>
                🏛️ {pagesText.universities.established[lang]} {uni.established}
              </span>
            )}
            {uni.student_count && (
              <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>
                👥 {uni.student_count} {commonText.studentWord[lang]}
              </span>
            )}
          </div>
          <h1 style={{ color: 'var(--text, #f0ece4)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.25 }}>
            {getField(uni, 'name', lang)}
          </h1>
        </div>

        {/* Description */}
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '28px', marginBottom: '24px',
        }}>
          <h2 style={{ color: '#c8a84b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            {commonText.aboutUniversity[lang]}
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.93rem', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
            {getField(uni, 'description', lang)}
          </p>
        </div>

        {/* Specialties */}
        {specialtiesList.length > 0 && (
          <div style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '28px', marginBottom: '24px',
          }}>
            <h2 style={{ color: '#c8a84b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              {commonText.availableSpecialties[lang]}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {specialtiesList.map(s => (
                <span key={s} style={{
                  background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.2)',
                  color: '#c8a84b', padding: '6px 14px', borderRadius: '20px',
                  fontSize: '0.8rem', fontWeight: 600,
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Website */}
        {uni.website_url && (
          <a
            href={uni.website_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '12px',
              background: '#7a1c1c', color: '#fff',
              fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(122,28,28,0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            🌐 {commonText.visitWebsite[lang]} ↗
          </a>
        )}
        <AdSlot page="university_details" position="bottom" className="mt-8" />
      </div>
    </div>
  );
}
