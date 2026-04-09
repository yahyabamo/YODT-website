import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FinalCTAProps {
    onOpenModal: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenModal }) => {
    const navigate = useNavigate();

    return (
        <section
            id="cta-final"
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg-1) 50%, var(--bg-2) 100%)',
            }}
        >
            {/* Radial red glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(122,28,28,0.18) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Yemen pattern overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url(/assets/yemen-pattern.svg)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '100px 100px',
                    opacity: 0.04,
                    pointerEvents: 'none',
                }}
            />

            {/* Content */}
            <div
                className="reveal"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: 'var(--section-y) 5vw',
                    textAlign: 'center',
                    maxWidth: '680px',
                    margin: '0 auto',
                }}
            >
                {/* Icon */}
                <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🎓</div>

                {/* Title */}
                <h2
                    style={{
                        color: 'var(--text)',
                        fontWeight: 800,
                        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                        lineHeight: 1.35,
                        marginBottom: '16px',
                    }}
                >
                    <span className="ar-only">انضم اليوم وكن جزءًا من<br /><span style={{ color: 'var(--gold)' }}>مجتمع طلابي يصنع الفرق</span></span>
                    <span className="en-only">Join Today and Be Part of a<br /><span style={{ color: 'var(--gold)' }}>Student Community That Makes a Difference</span></span>
                </h2>

                {/* Subtitle */}
                <p style={{ color: 'var(--text-2)', fontSize: '0.97rem', lineHeight: 1.8, marginBottom: '36px' }}>
                    <span className="ar-only">استفد من دعم لا محدود، خصومات حصرية، وشبكة علاقات قوية تبدأ اليوم.</span>
                    <span className="en-only">Benefit from unlimited support, exclusive discounts, and a powerful network starting today.</span>
                </p>

                {/* CTA Button with pulse glow */}
                <button
                    onClick={() => navigate('/login')}
                    className="btn btn-primary cta-pulse"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '20px',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="ar-only">سجل واحصل على عضويتك </span>
                    <span className="en-only">Register Your Free Membership</span>
                </button>

                {/* Free note */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-3)', fontSize: '0.8rem', marginBottom: '36px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>

                </div>

                {/* Social proof stats */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                    {[
                        { num: '+100', labelAr: 'عضو نشط', labelEn: 'Active Members' },
                        { num: '+10', labelAr: 'شريك استراتيجي', labelEn: 'Strategic Partners' },
                        { num: '+20', labelAr: 'فعالية سنوياً', labelEn: 'Events Per Year' },
                    ].map((s) => (
                        <div key={s.labelAr} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--f-en)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--red-400)', lineHeight: 1 }}>{s.num}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '4px', fontFamily: 'var(--f-ar)' }}>
                                <span className="ar-only">{s.labelAr}</span>
                                <span className="en-only">{s.labelEn}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
