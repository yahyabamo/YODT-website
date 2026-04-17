import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { InfoHero } from '@/components/features/info/InfoHero';
import { InfoCard } from '@/components/features/info/InfoCard';
import { fetchStudents, InfoStudent } from '@/service/infoCMS';

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

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<InfoStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents()
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, []);

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
          <span>العودة للرئيسية</span>
        </button>
      </div>

      <InfoHero
        eyebrow="طلابنا المتميزون"
        title="نخبة الطلاب اليمنيين في إسطنبول"
        description="تعرّف على الطلاب المتميزين الذين يمثلون خير سفراء لليمن في تركيا — إنجازاتهم وتخصصاتهم وقصص نجاحهم"
        gradient="linear-gradient(135deg, #07080b 0%, #1a0f00 40%, #07080b 100%)"
      />

      <section style={{ maxWidth: '1260px', margin: '0 auto', padding: '64px clamp(16px, 4vw, 40px) 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
          <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            الطلاب المتميزون ({loading ? '…' : students.length})
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : students.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {students.map(s => (
              <InfoCard
                key={s.id}
                id={s.id!}
                name={s.name}
                bio={s.bio}
                image_url={s.image_url}
                badge={s.major}
                badgeColor="#7a1c1c"
                detailPath={`/students/${s.id}`}
                extraInfo={`${s.university} · ${s.academic_year}`}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⭐</div>
            <p style={{ fontSize: '0.95rem' }}>سيتم إضافة الطلاب المتميزين قريباً</p>
          </div>
        )}
      </section>
    </div>
  );
}
