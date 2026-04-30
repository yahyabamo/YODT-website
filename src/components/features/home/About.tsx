import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const pillars = [
    {
        icon: '🎓',
        ar: 'الدعم الأكاديمي',
        en: 'Academic Support',
        tr: 'Akademik Destek',
        descAr: 'توجيه في اختيار الجامعات وإجراءات القبول',
        descEn: 'Guidance on universities and admission procedures',
        descTr: 'Üniversite seçimi ve kabul prosedürleri konusunda rehberlik',
    },
    {
        icon: '🌐',
        ar: 'بناء المجتمع',
        en: 'Community Building',
        tr: 'Topluluk Oluşturma',
        descAr: 'بيئة اجتماعية داعمة تجمع الطلاب اليمنيين',
        descEn: 'A supportive social environment connecting students',
        descTr: 'Öğrencileri bir araya getiren destekleyici bir sosyal ortam',
    },
    {
        icon: '🧭',
        ar: 'التوجيه والمساعدة',
        en: 'Guidance & Assistance',
        tr: 'Rehberlik ve Yardım',
        descAr: 'المساعدة في الإقامة والحياة اليومية في تركيا',
        descEn: 'Assistance with residence and daily life in Turkey',
        descTr: "Türkiye'de ikamet ve günlük yaşam konusunda yardım",
    },
];

const stats = [
    { value: '+100', ar: 'عضو مسجل', en: 'Members', tr: 'Üye' },
    { value: '+10', ar: 'شريك', en: 'Partners', tr: 'Ortak' },
    { value: '+20', ar: 'فعالية سنوية', en: 'Annual Events', tr: 'Yıllık Etkinlik' },
    { value: '∞', ar: 'دعم مستمر', en: 'Ongoing Support', tr: 'Sürekli Destek' },
];

const aboutText = {
    eyebrow: { ar: 'من نحن', en: 'About Us', tr: 'Hakkımızda' },
    title: {
        ar: 'اتحاد يبني جسورًا بين الطلاب',
        en: 'Building Bridges Between Students',
        tr: 'Öğrenciler Arasında Köprüler İnşa Ediyoruz',
    },
    p1: {
        ar: 'تأسس اتحاد الطلاب اليمنيين في تركيا – فرع إسطنبول كمنظومة دعم شاملة للطلاب اليمنيين، نؤمن أن كل طالب يستحق بيئة داعمة تُعينه على النجاح الأكاديمي والاندماج الاجتماعي.',
        en: 'The Yemeni Students Union in Turkey – Istanbul Branch was founded as a comprehensive support system for Yemeni students. We believe every student deserves a supportive environment to succeed academically and socially.',
        tr: "Türkiye'deki Yemenli Öğrenciler Birliği – İstanbul Şubesi, Yemenli öğrenciler için kapsamlı bir destek sistemi olarak kurulmuştur.",
    },
    p2: {
        ar: 'نعمل على ربط الطلاب بالموارد اللازمة — من المعلومات الجامعية إلى الإجراءات القانونية والسكنية.',
        en: 'We connect students to essential resources — from university information to legal procedures and housing support.',
        tr: 'Öğrencileri gerekli kaynaklara bağlıyoruz — üniversite bilgilerinden yasal prosedürlere ve konut desteğine kadar.',
    },
    cardSubtitle: {
        ar: 'متواجدون دوماً لخدمتكم',
        en: 'Always here to serve you',
        tr: 'Her zaman hizmetinizdeyiz',
    },
} as const;

export const About = () => {
    const { language: lang } = useLanguage();
    const titleLines = aboutText.title[lang].split('\n');

    // Reveal on scroll logic
    const sectionRef = useRef<HTMLElement>(null);
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.remove('opacity-0', 'translate-y-8');
                    e.target.classList.add('opacity-100', 'translate-y-0');
                    obs.unobserve(e.target);
                }
            }),
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        const els = sectionRef.current?.querySelectorAll('.scroll-reveal') ?? [];
        els.forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    return (
        <section
            id="about"
            ref={sectionRef}
            className="relative py-24 bg-secondary/40 overflow-hidden"
        >
            {/* Yemen pattern faint overlay */}
            <div
                className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: 'url(/assets/yemen-pattern.svg)',
                    backgroundSize: '160px 160px',
                    backgroundRepeat: 'repeat'
                }}
            />

            <div className="container relative z-10 mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                {/* ── Left: Text ── */}
                <div className="scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out flex flex-col">

                    {/* Eyebrow */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-px bg-gradient-to-r from-primary to-transparent"></span>
                        <span className="
  text-sm font-bold
  text-primary
  font-sans
">                            {aboutText.eyebrow[lang]}
                        </span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-display font-black text-foreground leading-[1.2] tracking-tight mb-6">
                        {titleLines[0]}
                        {titleLines[1] && (
                            <>
                                <br />
                                <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                                    {titleLines[1]}
                                </span>
                            </>
                        )}
                    </h2>

                    <div className="w-12 h-1 bg-primary rounded-full mb-8"></div>

                    <p className="text-muted-foreground font-sans text-base leading-relaxed mb-4">
                        {aboutText.p1[lang]}
                    </p>
                    <p className="text-muted-foreground font-sans text-base leading-relaxed mb-8">
                        {aboutText.p2[lang]}
                    </p>

                    {/* Pillar cards */}
                    <div className="flex flex-col gap-4">
                        {pillars.map((pillar) => (
                            <div
                                key={pillar.ar}
                                className="flex items-start gap-4 p-5 rounded-2xl bg-background border border-border/60 hover:border-primary/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out group"
                            >
                                <span className="text-2xl mt-1 shrink-0 group-hover:scale-110 transition-transform duration-300">{pillar.icon}</span>
                                <div>
                                    <p className="font-sans font-bold text-foreground text-[15px] mb-1">{pillar[lang]}</p>
                                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                                        {lang === 'ar' ? pillar.descAr : lang === 'en' ? pillar.descEn : pillar.descTr}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Stats card ── */}
                <div className="scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ease-out delay-150 order-first lg:order-last">
                    <div className="rounded-[24px] bg-card border border-border overflow-hidden shadow-xl shadow-foreground/5">

                        {/* Card header */}
                        <div className="p-8 bg-gradient-to-br from-primary/90 to-primary relative overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
                                style={{
                                    backgroundImage: 'url(/assets/yemen-pattern.svg)',
                                    backgroundSize: '80px 80px',
                                }}
                            />
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="font-display text-4xl font-black text-white tracking-tighter mb-2">YÖDT</div>
                                <p className="font-sans text-sm text-white/80 font-medium">{aboutText.cardSubtitle[lang]}</p>
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="p-6 grid grid-cols-2 gap-4">
                            {stats.map((stat) => (
                                <div key={stat.value} className="p-5 rounded-xl bg-secondary/50 border border-border/40 text-center hover:bg-secondary transition-colors duration-300">
                                    <div className="font-display text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                                    <div className="font-sans text-xs font-semibold text-muted-foreground">{stat[lang]}</div>
                                </div>
                            ))}
                        </div>

                        {/* HQ fact row */}
                        <div className="mx-6 mb-6 p-4 rounded-xl bg-secondary/50 border border-border/40 flex justify-between items-center text-sm">
                            <span className="font-sans text-muted-foreground font-medium flex items-center gap-2">
                                <span>📍</span>
                                {lang === 'ar' ? 'المقر الرئيسي' : lang === 'en' ? 'Headquarters' : 'Genel Merkez'}
                            </span>
                            <span className="font-sans font-bold text-foreground">
                                {lang === 'ar' ? 'إسطنبول، تركيا' : lang === 'en' ? 'Istanbul, Turkey' : 'İstanbul, Türkiye'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
