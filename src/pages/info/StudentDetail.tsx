import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fetchStudentById, InfoStudent } from '@/service/infoCMS';
import { useLanguage } from '@/context/LanguageContext';
import { commonText, getField } from '@/i18n/pages';

export default function StudentDetail() {
  const { language: lang } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<InfoStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchStudentById(id)
      .then(data => { if (!data) setError(true); else setStudent(data); })
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

  if (error || !student) return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', direction: 'rtl' }}>
      <div style={{ fontSize: '4rem' }}>⭐</div>
      <h2 style={{ color: 'var(--text, #f0ece4)' }}>{commonText.studentNotFound[lang]}</h2>
      <button onClick={() => navigate('/students')} style={{ padding: '10px 20px', borderRadius: '10px', background: '#7a1c1c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        {commonText.studentsList[lang]}
      </button>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', paddingTop: '72px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Return button */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 0' }}>
        <button
          onClick={() => navigate('/students')}
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
          <span>{commonText.returnToStudents[lang]}</span>
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px clamp(16px, 4vw, 40px) 80px' }}>
        {/* Profile header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '24px',
          marginBottom: '40px', flexWrap: 'wrap',
        }}>
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
            background: 'var(--bg-2)', border: '3px solid rgba(200,168,75,0.3)',
          }}>
            {student.image_url ? (
              <img src={student.image_url} alt={getField(student, 'name', lang)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', opacity: 0.4 }}>👤</div>
            )}
          </div>
          <div>
            <h1 style={{ color: 'var(--text, #f0ece4)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '8px' }}>
              {getField(student, 'name', lang)}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ background: '#7a1c1c', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                {student.major}
              </span>
              <span style={{ color: 'var(--text-2)', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                🎓 {student.university}
              </span>
              <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
                {commonText.academicYear[lang]} {student.academic_year}
              </span>
              {student.gpa && (
                <span style={{ color: '#c8a84b', fontSize: '0.8rem', fontWeight: 600 }}>
                  {commonText.gpa[lang]} {student.gpa}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
          <h2 style={{ color: '#c8a84b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            {commonText.cv[lang]}
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '0.93rem', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
            {getField(student, 'bio', lang)}
          </p>
        </div>

        {/* Achievement */}
        {getField(student, 'achievement', lang) && (
          <div style={{
            background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.2)',
            borderRadius: '16px', padding: '24px',
          }}>
            <h2 style={{ color: '#c8a84b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              🏆 {commonText.notableAchievement[lang]}
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.93rem', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
              {getField(student, 'achievement', lang)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
