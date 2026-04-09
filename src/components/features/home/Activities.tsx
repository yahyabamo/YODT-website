import React from 'react';

const programs = [
    {
        icon: '📖',
        tagAr: 'ثقافي',
        tagEn: 'Cultural',
        titleAr: 'الفعاليات الثقافية والأدبية',
        titleEn: 'Cultural & Literary Events',
        descAr: 'أمسيات شعرية ومعارض فنون وندوات فكرية تعزز الهوية الثقافية وتنمي مواهب الطلاب الأدبية.',
        descEn: 'Poetry evenings, art exhibitions, and intellectual seminars that promote cultural identity and nurture literary talents.',
        metaAr: 'قاعات المؤتمرات',
        metaEn: 'Conference Halls',
    },
    {
        icon: '🇾🇪',
        tagAr: 'وطني',
        tagEn: 'National',
        titleAr: 'المناسبات الوطنية',
        titleEn: 'National Occasions',
        descAr: 'إحياء الذكريات الوطنية وتعزيز روح الانتماء والترابط بين أبناء الجالية اليمنية في إسطنبول.',
        descEn: 'Commemorating national days and strengthening the sense of belonging and unity among the Yemeni community.',
        metaAr: 'سنوي',
        metaEn: 'Annual',
    },
    {
        icon: '🏅',
        tagAr: 'رياضي',
        tagEn: 'Sports',
        titleAr: 'الأنشطة الرياضية',
        titleEn: 'Sports Activities',
        descAr: 'بطولات كروية ومنافسات حركية تهدف لتعزيز اللياقة البدنية والروح الجماعية بين الطلاب.',
        descEn: 'Football tournaments and physical competitions aimed at boosting fitness and teamwork among students.',
        metaAr: 'شهري',
        metaEn: 'Monthly',
    },
    {
        icon: '🌙',
        tagAr: 'ديني',
        tagEn: 'Religious',
        titleAr: 'البرامج الدينية والاجتماعية',
        titleEn: 'Religious & Social Programs',
        descAr: 'لقاءات إيمانية وإفطارات جماعية تقوي الروابط الأخوية في المناسبات المباركة.',
        descEn: 'Faith gatherings and group Iftars that strengthen brotherly bonds during blessed occasions.',
        metaAr: 'في المناسبات',
        metaEn: 'Seasonal',
    },
];

export const Activities = () => {
    return (
        <section id="activities" style={{ background: 'var(--bg)' }}>
            <div className="container section-pad">
                {/* Section header */}
                <div className="reveal" style={{ textAlign: 'center', marginBottom: '52px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                        <span style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            <span className="ar-only">الأنشطة والفعاليات</span>
                            <span className="en-only">Activities & Events</span>
                        </span>
                        <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                    </div>

                    <h2 className="heading-lg" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '12px' }}>
                        <span className="ar-only">برامجنا ومبادراتنا</span>
                        <span className="en-only">Our Programs & Initiatives</span>
                    </h2>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.93rem', maxWidth: '520px', margin: '0 auto' }}>
                        <span className="ar-only">نوفر بيئة نشطة ومتنوعة تعزز الانتماء والتطور الفردي لكل طالب.</span>
                        <span className="en-only">We provide an active and diverse environment that enhances belonging and individual growth for every student.</span>
                    </p>
                </div>

                {/* Cards grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '18px',
                    }}
                >
                    {programs.map((prog) => (
                        <div
                            key={prog.titleAr}
                            className="reveal"
                            style={{
                                borderRadius: '16px',
                                background: 'var(--bg-1)',
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                                transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
                                cursor: 'default',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px) scale(1.015)';
                                (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-red)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
                                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                            }}
                        >
                            {/* Card image area */}
                            <div
                                style={{
                                    height: '110px',
                                    background: 'linear-gradient(135deg, var(--bg-3), var(--bg-4))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.6rem',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Subtle tint overlay */}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(122,28,28,0.08), transparent)' }} />
                                <span style={{ position: 'relative', zIndex: 1 }}>{prog.icon}</span>
                            </div>

                            {/* Card content */}
                            <div style={{ padding: '18px 20px' }}>
                                {/* Tag */}
                                <span
                                    style={{
                                        display: 'inline-block',
                                        padding: '3px 10px',
                                        borderRadius: '999px',
                                        background: 'rgba(122,28,28,0.12)',
                                        color: 'var(--red-400)',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        marginBottom: '10px',
                                    }}
                                >
                                    <span className="ar-only">{prog.tagAr}</span>
                                    <span className="en-only">{prog.tagEn}</span>
                                </span>

                                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '8px', lineHeight: 1.4 }}>
                                    <span className="ar-only">{prog.titleAr}</span>
                                    <span className="en-only">{prog.titleEn}</span>
                                </h3>

                                <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.7, marginBottom: '14px' }}>
                                    <span className="ar-only">{prog.descAr}</span>
                                    <span className="en-only">{prog.descEn}</span>
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                                    <span>📍</span>
                                    <span className="ar-only">{prog.metaAr}</span>
                                    <span className="en-only">{prog.metaEn}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
