import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { InfoHero } from '@/components/features/info/InfoHero';
import { InfoCard } from '@/components/features/info/InfoCard';
import { fetchStudents, InfoStudent } from '@/service/infoCMS';
import { useLanguage } from '@/context/LanguageContext';
import { pagesText, commonText, getField } from '@/i18n/pages';

function Skeleton() {
  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '4/3', background: 'var(--bg-2)' }} />
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '16px', borderRadius: '8px', background: 'var(--bg-2)', width: '75%' }} />
        <div style={{ height: '12px', borderRadius: '8px', background: 'var(--bg-2)', width: '55%' }} />
      </div>
    </div>
  );
}

export default function Team() {
  const { language: lang } = useLanguage();
  const navigate = useNavigate();
  const [members, setMembers] = useState<InfoStudent[]>([]);
  const [loading, setLoading] = useState(true);

  // States for year filtering
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents()
      .then((data) => {
        const publishedMembers = data.filter(m => m.is_published).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        setMembers(publishedMembers);

        const years = Array.from(new Set(publishedMembers.map(m => m.academic_year).filter(Boolean))) as string[];
        const sortedYears = years.sort((a, b) => b.localeCompare(a));

        setAvailableYears(sortedYears);
        if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, []);

  const filteredMembers = members.filter(m => m.academic_year === selectedYear);

  return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', paddingTop: '72px' }}>
      {/* Return button */}
      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 0' }}>
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

      {/* Restored dictionary usage for i18n */}
      <InfoHero
        eyebrow={pagesText.students.heroEyebrow[lang]}
        title={pagesText.students.heroTitle[lang]}
        description={pagesText.students.heroDesc[lang]}
        gradient="linear-gradient(135deg, #07080b 0%, #1a0f00 40%, #07080b 100%)"
      />

      <section style={{ maxWidth: '1260px', margin: '0 auto', padding: '40px clamp(16px, 4vw, 40px) 80px' }}>

        {/* Year Selector Tabs */}
        {!loading && availableYears.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '48px', flexWrap: 'wrap' }}>
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: '8px 24px',
                  borderRadius: '30px',
                  border: `1px solid ${selectedYear === year ? '#c8a84b' : 'var(--border)'}`,
                  background: selectedYear === year ? '#c8a84b15' : 'transparent',
                  color: selectedYear === year ? '#c8a84b' : 'var(--text-2)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
          <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {pagesText.students.listTitle[lang]} ({loading ? '…' : filteredMembers.length})
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filteredMembers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {filteredMembers.map(m => (
              <InfoCard
                key={m.id}
                id={m.id!}
                name={getField(m, 'name', lang)}
                bio={" "}
                image_url={m.image_url}
                badge={m.academic_year}
                badgeColor="#7a1c1c"
                detailPath={undefined}
                extraInfo={getField(m, 'major', lang)}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>👥</div>
            {/* Restored dictionary usage for empty state */}
            <p style={{ fontSize: '0.95rem' }}>{commonText.noStudents[lang]}</p>
          </div>
        )}
      </section>
    </div>
  );
}