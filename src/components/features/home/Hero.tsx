import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { IPhoneMockup } from '@/components/hero/IPhoneMockup';

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
    const isRtl = lang === 'ar';

    return (
        <section id="hero" className="relative min-h-[95vh] flex items-center overflow-hidden bg-background pt-24 pb-16">

            {/* Soft Yemen Pattern Overlay */}
            <div
                className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-luminosity blur-[1px] pointer-events-none"
                style={{
                    backgroundImage: 'url(/assets/yemen-pattern.jpg)',
                    backgroundSize: '120px 120px',
                    backgroundRepeat: 'repeat'
                }}
            />

            {/* Glowing Orbs for Premium Feel */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/10 dark:bg-primary/20 blur-[100px] animate-pulse duration-1000" />
                <div className="absolute top-[60%] -left-[5%] w-[400px] h-[400px] rounded-full bg-accent/10 dark:bg-accent/20 blur-[80px]" />
            </div>

            <div className="container relative z-10 mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* ── Text Content ── */}
                <div className={`flex flex-col ${isRtl ? 'lg:order-2 text-start' : 'lg:order-1 text-start'}`}>

                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-bottom-4 duration-700 fade-in">
                        <span className="w-8 h-px bg-gradient-to-r from-primary to-transparent"></span>
                        <span className="text-sm font-semibold tracking-wider uppercase text-primary font-sans">
                            {t.eyebrow[lang]}
                        </span>
                        <span className="w-8 h-px bg-gradient-to-l from-primary to-transparent"></span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl lg:text-7xl font-display font-black text-foreground leading-[1.1] tracking-tight mb-6 animate-in slide-in-from-bottom-6 duration-700 delay-150 fade-in">
                        {t.titleLine1[lang]}
                        <br />
                        <span className="bg-gradient-to-br from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                            {t.titleHighlight[lang]}
                        </span>
                        {t.titleLine3[lang] && (
                            <>
                                <br />
                                {t.titleLine3[lang]}
                            </>
                        )}
                    </h1>

                    {/* Description */}
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-10 font-sans animate-in slide-in-from-bottom-6 duration-700 delay-300 fade-in">
                        {t.desc[lang]}
                    </p>

                    {/* CTA Actions */}
                    <div className="flex flex-wrap items-center gap-4 animate-in slide-in-from-bottom-6 duration-700 delay-500 fade-in">
                        <button
                            onClick={() => navigate('/login')}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-sans font-bold text-sm rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 ease-out"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {t.registerBtn[lang]}
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-10 mt-14 pt-8 border-t border-border/50 animate-in slide-in-from-bottom-6 duration-700 delay-700 fade-in">
                        {t.stats.map(s => (
                            <div key={s.num} className="flex flex-col">
                                <span className="font-display font-bold text-3xl text-foreground mb-1">
                                    {s.num}
                                </span>
                                <span className="font-sans text-sm text-muted-foreground font-medium">
                                    {s[lang]}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>

                {/* ── iPhone Mockup ── */}
                <div className={`flex justify-center items-center relative animate-in zoom-in-95 duration-1000 delay-500 fade-in ${isRtl ? 'lg:order-1' : 'lg:order-2'}`}>
                    <IPhoneMockup />
                </div>

            </div>
        </section>
    );
};
