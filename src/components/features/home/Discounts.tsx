import React from 'react';
import { useNavigate } from 'react-router-dom';

const discountCategories = [
    {
        icon: '🍽️',
        titleAr: 'مطاعم ومقاهي',
        titleEn: 'Restaurants & Cafés',
        descAr: 'تخفيضات مستمرة في مطاعم ومقاهي متنوعة بإسطنبول لأعضاء الاتحاد.',
        descEn: 'Ongoing discounts at various restaurants and cafés in Istanbul for union members.',
        labelAr: 'خصومات مستمرة',
        labelEn: 'Ongoing Discounts',
    },
    {
        icon: '🎓',
        titleAr: 'دورات تعليمية',
        titleEn: 'Educational Courses',
        descAr: 'حصص لغة تركية، دورات مهنية وتقنية بأسعار مخفضة لأعضائنا المميزين.',
        descEn: 'Turkish language lessons, professional and technical courses at reduced prices for our members.',
        labelAr: 'عروض تعليمية',
        labelEn: 'Educational Offers',
    },
    {
        icon: '🛍️',
        titleAr: 'خدمات طلابية',
        titleEn: 'Student Services',
        descAr: 'طباعة، مستلزمات دراسية، خدمات ترجمة، وخدمات يومية بأسعار مخصصة.',
        descEn: 'Printing, study supplies, translation services, and daily services at member prices.',
        labelAr: 'خدمات متنوعة',
        labelEn: 'Various Services',
    },
];

export const Discounts = () => {
    const navigate = useNavigate();
    return (
        <section id="discounts" style={{ background: 'var(--bg)' }}>
            <div className="container section-pad">
                {/* Header */}
                <div className="reveal" style={{ textAlign: 'center', marginBottom: '52px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                        <span style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            <span className="ar-only">تخفيضات الأعضاء</span>
                            <span className="en-only">Member Discounts</span>
                        </span>
                        <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                    </div>

                    <h2 className="heading-lg" style={{ marginBottom: '12px', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)' }}>
                        <span className="ar-only">وفر أكثر مع بطاقة العضوية</span>
                        <span className="en-only">Save More With Your Membership</span>
                    </h2>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.93rem', maxWidth: '480px', margin: '0 auto' }}>
                        <span className="ar-only">استمتع بخصومات حصرية من شركاء الاتحاد في إسطنبول.</span>
                        <span className="en-only">Enjoy exclusive discounts from union partners across Istanbul.</span>
                    </p>
                </div>

                {/* Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    {discountCategories.map((cat) => (
                        <div
                            key={cat.titleAr}
                            className="reveal"
                            style={{
                                borderRadius: '16px',
                                background: 'var(--bg-1)',
                                border: '1px solid var(--border)',
                                padding: '24px',
                                transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                                cursor: 'default',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,148,58,0.35)';
                                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ fontSize: '2.2rem', marginBottom: '14px' }}>{cat.icon}</div>

                            {/* Label pill */}
                            <span style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                background: 'rgba(200,148,58,0.1)',
                                color: 'var(--gold)',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                marginBottom: '10px',
                            }}>
                                <span className="ar-only">{cat.labelAr}</span>
                                <span className="en-only">{cat.labelEn}</span>
                            </span>

                            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '8px' }}>
                                <span className="ar-only">{cat.titleAr}</span>
                                <span className="en-only">{cat.titleEn}</span>
                            </h3>

                            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.7 }}>
                                <span className="ar-only">{cat.descAr}</span>
                                <span className="en-only">{cat.descEn}</span>
                            </p>
                        </div>
                    ))}

                    {/* Partner CTA card */}
                    <div
                        className="reveal"
                        style={{
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(122,28,28,0.12), rgba(122,28,28,0.05))',
                            border: '1px solid var(--border-red)',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                    >
                        <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>🤝</div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '16px' }}>
                            <span className="ar-only">انضم لشبكة شركائنا وقدم خصومات للطلاب اليمنيين.</span>
                            <span className="en-only">Join our partner network and offer discounts to Yemeni students.</span>
                        </p>
                        <a
                            href="#"
                            style={{
                                display: 'inline-block',
                                padding: '9px 18px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-red)',
                                color: 'var(--red-400)',
                                fontSize: '0.83rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                transition: 'background 0.2s ease',
                                textDecoration: 'none',
                            }}
                        >
                            <span className="ar-only">تواصل معنا</span>
                            <span className="en-only">Contact Us</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
