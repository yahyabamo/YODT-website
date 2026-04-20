import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useLanguage } from '@/context/LanguageContext';

interface HeroProps {
    onOpenModal: () => void;
}

const heroContent = {
    eyebrow: {
        ar: 'اتحاد الطلاب اليمنيين · إسطنبول',
        en: 'Yemeni Students Union · Istanbul',
        tr: 'Yemenli Öğrenciler Birliği · İstanbul',
    },
    titleLine1: {
        ar: 'معًا نبني',
        en: 'Together We Build',
        tr: 'Birlikte İnşa Ediyoruz',
    },
    titleHighlight: {
        ar: 'مجتمعًا طلابيًا أقوى',
        en: 'A Stronger Community',
        tr: 'Daha Güçlü Bir Topluluk',
    },
    titleLine3: {
        ar: '',
        en: 'In Turkey',
        tr: "Türkiye'de",
    },
    desc: {
        ar: 'نحن اتحاد طلابي يمني في إسطنبول يهدف إلى دعم الطلاب اليمنيين في جميع مراحل حياتهم الأكاديمية والمعيشية في تركيا — من قبول الجامعة حتى التخرج وما بعده.',
        en: 'We are a Yemeni student union in Istanbul dedicated to supporting Yemeni students at every stage of their academic and daily life in Turkey — from university admission through graduation and beyond.',
        tr: "İstanbul'daki Yemenli öğrenci birliği olarak Türkiye'deki her akademik ve günlük yaşam aşamasında — üniversite kabulünden mezuniyete ve ötesine — Yemenli öğrencileri desteklemeye kendimizi adadık.",
    },
    registerBtn: {
        ar: 'سجل واحصل على عضويتك الآن',
        en: 'Register Your Free Membership',
        tr: 'Ücretsiz Üyeliğine Kayıt Ol',
    },
    stats: [
        { num: '+100', ar: 'عضو مسجل', en: 'Members', tr: 'Üye' },
        { num: '+10', ar: 'شريك استراتيجي', en: 'Partners', tr: 'Stratejik Ortak' },
    ],
} as const;

export const Hero: React.FC<HeroProps> = ({ onOpenModal }) => {
    const navigate = useNavigate();
    const { language: lang } = useLanguage();

    const t = heroContent;

    return (
        <>
            <section id="hero">
                <div className="hero-bg">
                    <div className="hero-grid"></div>
                    <div className="hero-orb orb-1"></div>
                    <div className="hero-orb orb-2"></div>
                    <div className="hero-orb orb-3"></div>
                </div>

                <div className="hero-content">
                    <div className="hero-left">
                        <div className="hero-eyebrow">
                            <div className="eyebrow-line"></div>
                            <span className="eyebrow-text">{t.eyebrow[lang]}</span>
                        </div>

                        <h1 className="hero-title">
                            {t.titleLine1[lang]}<br />
                            <span className="hero-title-highlight">{t.titleHighlight[lang]}</span>
                            {t.titleLine3[lang] && <><br />{t.titleLine3[lang]}</>}
                        </h1>

                        <p className="hero-desc">{t.desc[lang]}</p>

                        <div className="hero-actions">
                            <button className="btn btn-primary" onClick={() => navigate('/login')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span>{t.registerBtn[lang]}</span>
                            </button>
                        </div>

                        <div className="hero-stats">
                            {t.stats.map(s => (
                                <div key={s.num} className="hero-stat-item">
                                    <div className="hero-stat-num">{s.num}</div>
                                    <div className="hero-stat-label">{s[lang]}</div>
                                </div>
                            ))}
                        </div>
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
                    </div>
                </div>
            </section>
        </>
    );
};
