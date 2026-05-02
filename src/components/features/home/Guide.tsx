import React, { useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom'; // <-- Added import

const guideCards = [
    {
        icon: '❓',
        ar: 'أسئلة وأجوبة شاملة',
        en: 'Comprehensive Q&A',
        tr: 'Kapsamlı Soru & Cevap',
        descAr: 'إجابات مفصلة لكل الأسئلة الشائعة — من الوثائق المطلوبة إلى تكاليف الدراسة وكل ما يخطر ببالك.',
        descEn: 'Detailed answers to all common questions — from required documents to tuition costs and everything you need to know.',
        descTr: 'Tüm sık sorulan sorulara ayrıntılı yanıtlar — gerekli belgelerden öğrenim ücretlerine ve bilmeniz gereken her şeye kadar.',
        wide: true,
        link: '/faq', // <-- Added link
    },
    {
        icon: '🏠',
        ar: 'دليل السكن',
        en: 'Housing Guide',
        tr: 'Konut Rehberi',
        descAr: 'كل ما تحتاج معرفته عن السكن في إسطنبول — الأحياء والأسعار ونصائح التعاقد.',
        descEn: 'Everything about housing in Istanbul — neighborhoods, prices, and rental tips.',
        descTr: "İstanbul'da konut hakkında bilmeniz gereken her şey — semtler, fiyatlar ve kiralama ipuçları.",
        wide: false,
        link: '/about-istanbul', // <-- Added link
    },
    {
        icon: '🏛️',
        ar: 'دليل الجامعات',
        en: 'Universities Guide',
        tr: 'Üniversiteler Rehberi',
        descAr: 'مقارنة شاملة لأهم الجامعات التركية والتخصصات المتاحة ومتطلبات القبول.',
        descEn: 'Comprehensive comparison of Turkish universities, majors, and admission requirements.',
        descTr: 'Türk üniversitelerinin, bölümlerinin ve kabul gereksinimlerinin kapsamlı karşılaştırması.',
        wide: false,
        link: '/universities', // <-- Added link
    },
    {
        icon: '📋',
        ar: 'إجراءات الإقامة',
        en: 'Residence Procedures',
        tr: 'İkamet Prosedürleri',
        descAr: 'خطوات مفصلة للحصول على إقامة الطالب، الوثائق المطلوبة، والمواعيد.',
        descEn: 'Step-by-step guide for student residence, required documents, and appointments.',
        descTr: 'Öğrenci ikameti için adım adım rehber, gerekli belgeler ve randevular.',
        wide: false,
        link: '/guide', // <-- Added link
    },
    {
        icon: '☀️',
        ar: 'نصائح الحياة اليومية',
        en: 'Daily Life Tips',
        tr: 'Günlük Yaşam İpuçları',
        descAr: 'دليل عملي للحياة في إسطنبول — المواصلات والتسوق والخدمات الصحية.',
        descEn: 'A practical guide to Istanbul — transportation, shopping, and healthcare services.',
        descTr: "İstanbul'a pratik rehber — ulaşım, alışveriş ve sağlık hizmetleri.",
        wide: false,
        link: '/about-istanbul', // <-- Added link
    },
];

const guideText = {
    eyebrow: { ar: 'الدليل الطلابي', en: 'Student Guide', tr: 'Öğrenci Rehberi' },
    title: {
        ar: 'دليلك الشامل للدراسة\nوالحياة في تركيا',
        en: "Your Complete Guide to\nStudying & Living in Turkey",
        tr: "Türkiye'de Çalışma\nve Yaşam Rehberiniz",
    },
    desc: {
        ar: 'يوفر اتحادنا دليلًا شاملًا يغطي كل ما يحتاجه الطالب اليمني في رحلته داخل تركيا.',
        en: 'Our union provides a comprehensive guide covering everything a Yemeni student needs in Turkey.',
        tr: "Birliğimiz, Türkiye'deki her Yemenli öğrencinin ihtiyaç duyduğu her şeyi kapsayan kapsamlı bir rehber sunmaktadır.",
    },
} as const;

export const Guide = () => {
    const { language: lang } = useLanguage();
    const navigate = useNavigate(); // <-- Initialized useNavigate
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('guide-reveal-visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        const els = sectionRef.current?.querySelectorAll('.guide-reveal');
        els?.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const titleLines = guideText.title[lang].split('\n');

    return (
        <section
            id="guide"
            ref={sectionRef}
            className="relative overflow-hidden"
            style={{ background: 'var(--bg-1)' }}
        >
            {/* Subtle background texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--text) 1px, transparent 0)', backgroundSize: '32px 32px' }}
            />

            <div className="container section-pad relative z-10">
                {/* Section header */}
                <div className="guide-reveal text-center mb-12 sm:mb-16 max-w-xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-3 mb-5">
                        <span className="h-px w-8 bg-[var(--gold)]" />
                        <span className="text-[var(--gold)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                            {guideText.eyebrow[lang]}
                        </span>
                        <span className="h-px w-8 bg-[var(--gold)]" />
                    </div>

                    <h2 className="font-bold leading-tight mb-4" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}>
                        {titleLines[0]}
                        {titleLines[1] && (
                            <>
                                <br />
                                {titleLines[1]}
                            </>
                        )}
                    </h2>

                    <p className="text-[var(--text-2)] text-sm sm:text-base leading-relaxed max-w-md mx-auto">
                        {guideText.desc[lang]}
                    </p>
                </div>

                {/* Guide cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 px-4 sm:px-0">
                    {guideCards.map((card, index) => (
                        <div
                            key={card.ar}
                            className={`
                                guide-reveal group relative
                                ${card.wide ? 'sm:col-span-2 lg:col-span-2' : 'col-span-1'}
                            `}
                            style={{
                                transitionDelay: `${index * 80}ms`,
                                opacity: 0,
                                transform: 'translateY(24px)',
                            }}
                        >
                            <div
                                onClick={() => navigate(card.link)} // <-- Added onClick event
                                className="relative h-full p-6 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all duration-500 ease-out cursor-pointer overflow-hidden" // <-- Changed cursor-default to cursor-pointer
                                style={{
                                    background: 'var(--bg-1)',
                                    borderColor: 'var(--border)',
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget;
                                    el.style.borderColor = 'var(--border-red)';
                                    el.style.transform = 'translateY(-6px)';
                                    el.style.boxShadow = '0 20px 40px -12px rgba(122,28,28,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget;
                                    el.style.borderColor = 'var(--border)';
                                    el.style.transform = 'translateY(0)';
                                    el.style.boxShadow = 'none';
                                }}
                            >
                                {/* Hover glow effect */}
                                <div
                                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                    style={{ background: 'radial-gradient(circle, rgba(122,28,28,0.08) 0%, transparent 70%)' }}
                                />

                                {/* Top accent line */}
                                <div
                                    className="absolute top-0 left-6 right-6 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                                    style={{ background: 'var(--border-red)' }}
                                />

                                {/* Card content */}
                                <div className="relative z-10">
                                    {/* Icon with background */}
                                    <div
                                        className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-5 text-2xl sm:text-[1.75rem] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                                        style={{
                                            background: 'var(--bg-2)',
                                            border: '1px solid var(--border)',
                                        }}
                                    >
                                        {card.icon}
                                    </div>

                                    <h3 className="font-bold text-base sm:text-lg mb-2.5" style={{ color: 'var(--text)' }}>
                                        {card[lang]}
                                    </h3>

                                    <p className="text-xs sm:text-sm leading-[1.8] mb-6" style={{ color: 'var(--text-3)' }}>
                                        {lang === 'ar' ? card.descAr : lang === 'en' ? card.descEn : card.descTr}
                                    </p>

                                    {/* Action link */}
                                    <div className="flex items-center gap-2 group/link">
                                        <span className="text-xs font-semibold uppercase tracking-wider transition-colors duration-300" style={{ color: 'var(--text-2)' }}>
                                            {lang === 'ar' ? 'استكشف' : lang === 'en' ? 'Explore' : 'Keşfet'}
                                        </span>
                                        <svg
                                            className="w-4 h-4 transition-all duration-300 group-hover/link:translate-x-1"
                                            style={{ color: 'var(--border-red)' }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CSS for reveal animation */}
            <style>{`
                .guide-reveal-visible {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </section>
    );
};