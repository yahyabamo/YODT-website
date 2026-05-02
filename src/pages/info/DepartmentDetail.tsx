import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fetchDepartmentById, InfoDepartment } from '@/service/infoCMS';
import { useLanguage } from '@/context/LanguageContext';
import { commonText, getField } from '@/i18n/pages';
import { AdSlot } from '@/components/ads/AdSlot';

export default function DepartmentDetail() {
    const { language: lang } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [dept, setDept] = useState<InfoDepartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchDepartmentById(id)
            .then(data => { if (!data) setError(true); else setDept(data); })
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

    if (error || !dept) return (
        <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', direction: 'rtl' }}>
            <div style={{ fontSize: '4rem' }}>📚</div>
            <h2 style={{ color: 'var(--text, #f0ece4)' }}>{lang === 'ar' ? 'التخصص غير موجود' : 'Department not found'}</h2>
            <button onClick={() => navigate('/universities')} style={{ padding: '10px 20px', borderRadius: '10px', background: '#7a1c1c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                {commonText.universitiesList[lang]}
            </button>
        </div>
    );

    const careerPathsList = dept.career_paths ? dept.career_paths.split(',').map(s => s.trim()).filter(Boolean) : [];

    return (
        <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', paddingTop: '72px' }}>
            <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 0' }}>
                <button
                    onClick={() => navigate('/universities')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '12px',
                        background: 'var(--bg-1, #0d0f14)', border: '1px solid var(--border)',
                        color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                >
                    <ArrowRight size={16} />
                    <span>{lang === 'ar' ? 'العودة للقائمة' : 'Back to list'}</span>
                </button>
            </div>

            {dept.image_url && (
                <div style={{ width: '100%', height: '320px', overflow: 'hidden', position: 'relative' }}>
                    <img src={dept.image_url} alt={getField(dept, 'name', lang)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, var(--bg, #07080b))' }} />
                </div>
            )}

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px clamp(16px, 4vw, 40px) 80px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        {dept.duration && (
                            <span style={{ background: '#059669', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
                                ⏳ {dept.duration}
                            </span>
                        )}
                    </div>
                    <h1 style={{ color: 'var(--text, #f0ece4)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.25 }}>
                        {getField(dept, 'name', lang)}
                    </h1>
                </div>

                <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
                    <h2 style={{ color: '#c8a84b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                        {lang === 'ar' ? 'عن التخصص' : 'About Department'}
                    </h2>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.93rem', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                        {getField(dept, 'description', lang)}
                    </p>
                </div>

                {careerPathsList.length > 0 && (
                    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
                        <h2 style={{ color: '#c8a84b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                            {lang === 'ar' ? 'المجالات المهنية' : 'Career Paths'}
                        </h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {careerPathsList.map(s => (
                                <span key={s} style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.2)', color: '#10b981', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <AdSlot page="university_details" position="bottom" className="mt-8" />

            </div>
        </div>
    );
}