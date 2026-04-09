import React from 'react';

export const About = () => {
    return (
        <section id="about" className="section-pad" style={{ background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
            {/* Full-section Yemen pattern overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url(/assets/yemen-pattern.svg)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '160px 160px',
                    opacity: 0.05,
                    pointerEvents: 'none',
                    color: '#c8943a',
                }}
            />
            {/* Top gradient blend from bg to bg-1 */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '80px',
                    background: 'linear-gradient(to bottom, var(--bg), transparent)',
                    pointerEvents: 'none',
                    zIndex: 1,
                }}
            />

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

                    {/* Left: Text */}
                    <div className="about-left reveal-left">
                        {/* Eyebrow */}
                        <div className="flex items-center gap-3 mb-5">
                            <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                            <span style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                <span className="ar-only">من نحن</span>
                                <span className="en-only">About Us</span>
                            </span>
                        </div>

                        <h2 className="heading-lg" style={{ marginBottom: '16px', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}>
                            <span className="ar-only">اتحاد يبني جسورًا<br />بين الطلاب</span>
                            <span className="en-only">Building Bridges<br />Between Students</span>
                        </h2>

                        <div style={{ height: '2px', width: '48px', background: 'var(--red-700)', borderRadius: '2px', marginBottom: '20px' }} />

                        <p style={{ fontSize: '0.97rem', color: 'var(--text-2)', lineHeight: '1.85', marginBottom: '16px' }}>
                            <span className="ar-only">
                                تأسس اتحاد الطلاب اليمنيين في تركيا – فرع إسطنبول كمنظومة دعم شاملة للطلاب اليمنيين، نؤمن أن كل طالب يستحق بيئة داعمة تُعينه على النجاح الأكاديمي والاندماج الاجتماعي.
                            </span>
                            <span className="en-only">
                                The Yemeni Students Union in Turkey – Istanbul Branch was founded as a comprehensive support system for Yemeni students. We believe every student deserves a supportive environment to succeed academically and socially.
                            </span>
                        </p>
                        <p style={{ fontSize: '0.97rem', color: 'var(--text-2)', lineHeight: '1.85', marginBottom: '32px' }}>
                            <span className="ar-only">
                                نعمل على ربط الطلاب بالموارد اللازمة — من المعلومات الجامعية إلى الإجراءات القانونية والسكنية.
                            </span>
                            <span className="en-only">
                                We connect students to essential resources — from university information to legal procedures and housing support.
                            </span>
                        </p>

                        {/* Pillar cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { icon: '🎓', ar: 'الدعم الأكاديمي', en: 'Academic Support', descAr: 'توجيه في اختيار الجامعات وإجراءات القبول', descEn: 'Guidance on universities and admission procedures' },
                                { icon: '🌐', ar: 'بناء المجتمع', en: 'Community Building', descAr: 'بيئة اجتماعية داعمة تجمع الطلاب اليمنيين', descEn: 'A supportive social environment connecting students' },
                                { icon: '🧭', ar: 'التوجيه والمساعدة', en: 'Guidance & Assistance', descAr: 'المساعدة في الإقامة والحياة اليومية في تركيا', descEn: 'Assistance with residence and daily life in Turkey' },
                            ].map((pillar) => (
                                <div
                                    key={pillar.ar}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '14px',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        background: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        transition: 'border-color 0.2s ease',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-red)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                >
                                    <span style={{ fontSize: '1.4rem', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>{pillar.icon}</span>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '3px' }}>
                                            <span className="ar-only">{pillar.ar}</span>
                                            <span className="en-only">{pillar.en}</span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
                                            <span className="ar-only">{pillar.descAr}</span>
                                            <span className="en-only">{pillar.descEn}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Stats card */}
                    <div className="about-right reveal-right">
                        <div
                            style={{
                                borderRadius: '20px',
                                background: 'var(--bg-2)',
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Card header */}
                            <div
                                style={{
                                    padding: '32px',
                                    background: 'linear-gradient(135deg, #3d0e0e 0%, #7a1c1c 100%)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Subtle pattern overlay in card header */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundImage: 'url(/assets/yemen-pattern.svg)',
                                        backgroundSize: '80px 80px',
                                        opacity: 0.05,
                                        pointerEvents: 'none',
                                    }}
                                />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.15)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                                        YÖDT
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                        <span className="ar-only">متواجدون دوماً لخدمتكم</span>
                                        <span className="en-only">Always here to serve you</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[
                                    { value: '+100', labelAr: 'عضو مسجل', labelEn: 'Members' },
                                    { value: '+10', labelAr: 'شريك', labelEn: 'Partners' },
                                    { value: '+20', labelAr: 'فعالية سنوية', labelEn: 'Annual Events' },
                                    { value: '∞', labelAr: 'دعم مستمر', labelEn: 'Ongoing Support' },
                                ].map((stat) => (
                                    <div
                                        key={stat.value}
                                        style={{
                                            padding: '18px 16px',
                                            borderRadius: '12px',
                                            background: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{stat.value}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '6px' }}>
                                            <span className="ar-only">{stat.labelAr}</span>
                                            <span className="en-only">{stat.labelEn}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom fact rows */}
                            <div style={{ padding: '0 24px 24px' }}>
                                {[
                                    { icon: '📍', labelAr: 'المقر الرئيسي', labelEn: 'Headquarters', valueAr: 'إسطنبول، تركيا', valueEn: 'Istanbul, Turkey' },
                                ].map((fact) => (
                                    <div
                                        key={fact.labelAr}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            background: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            fontSize: '0.82rem',
                                        }}
                                    >
                                        <span style={{ color: 'var(--text-3)' }}>
                                            {fact.icon}&nbsp;
                                            <span className="ar-only">{fact.labelAr}</span>
                                            <span className="en-only">{fact.labelEn}</span>
                                        </span>
                                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                                            <span className="ar-only">{fact.valueAr}</span>
                                            <span className="en-only">{fact.valueEn}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </section>
    );
};
