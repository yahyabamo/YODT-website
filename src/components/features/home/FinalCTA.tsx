import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface FinalCTAProps {
    onOpenModal: () => void;
}

const ctaStats = [
    { num: '+100', ar: 'عضو نشط', en: 'Active Members', tr: 'Aktif Üye' },
    { num: '+10', ar: 'شريك استراتيجي', en: 'Strategic Partners', tr: 'Stratejik Ortak' },
    { num: '+20', ar: 'فعالية سنوياً', en: 'Events Per Year', tr: 'Yıllık Etkinlik' },
] as const;

const ctaText = {
    title: {
        ar: 'انضم اليوم وكن جزءًا من',
        en: 'Join Today and Be Part of a',
        tr: 'Bugün Katılın ve Parçası Olun',
    },
    titleHighlight: {
        ar: 'مجتمع طلابي يصنع الفرق',
        en: 'Student Community That Makes a Difference',
        tr: 'Fark Yaratan Bir Öğrenci Topluluğunun',
    },
    subtitle: {
        ar: 'استفد من دعم لا محدود، خصومات حصرية، وشبكة علاقات قوية تبدأ اليوم.',
        en: 'Benefit from unlimited support, exclusive discounts, and a powerful network starting today.',
        tr: 'Bugün itibaren sınırsız destek, özel indirimler ve güçlü bir ağdan yararlanın.',
    },
    registerBtn: {
        ar: 'سجل واحصل على عضويتك',
        en: 'Register Your Free Membership',
        tr: 'Ücretsiz Üyeliğine Kayıt Ol',
    },
} as const;

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenModal }) => {
    const navigate = useNavigate();
    const { language: lang } = useLanguage();

    return (
        <section id="cta-final" className="relative py-28 overflow-hidden bg-background">

            {/* Decorative radial glow */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full" />
            </div>

            {/* Subtle Yemen pattern */}
            <div
                className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: 'url(/assets/yemen-pattern.svg)',
                    backgroundSize: '140px 140px',
                    backgroundRepeat: 'repeat'
                }}
            />

            {/* Content */}
            <div className="container relative z-10 mx-auto px-6 text-center max-w-3xl animate-in slide-in-from-bottom-8 fade-in duration-1000">

                {/* Graduation icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 text-4xl mb-8 shadow-[0_0_30px_rgba(var(--primary),0.15)]">
                    🎓
                </div>

                {/* Title */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-foreground leading-[1.2] tracking-tight mb-6">
                    {ctaText.title[lang]}
                    <br />
                    <span className="bg-gradient-to-br from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                        {ctaText.titleHighlight[lang]}
                    </span>
                </h2>

                {/* Subtitle */}
                <p className="text-muted-foreground font-sans text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-12">
                    {ctaText.subtitle[lang]}
                </p>

                {/* CTA Button */}
                <div className="mb-16">
                    <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-primary text-primary-foreground font-sans font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1.5 transition-all duration-300 ease-out group"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform duration-300">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>{ctaText.registerBtn[lang]}</span>
                    </button>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap justify-center gap-10 sm:gap-16 pt-10 border-t border-border/50">
                    {ctaStats.map((s) => (
                        <div key={s.ar} className="text-center group">
                            <div className="font-display font-bold text-3xl sm:text-4xl text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                                {s.num}
                            </div>
                            <div className="font-sans text-xs sm:text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                                {s[lang]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
