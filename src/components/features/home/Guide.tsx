import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

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

    const titleLines = guideText.title[lang].split('\n');

    return (
        <section id="guide" style={{ background: 'var(--bg-1)' }}>
            <div className="container section-pad">
                {/* Section header */}
                <div className="guide-intro reveal" style={{ maxWidth: '560px', margin: '0 auto 56px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                        <span style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            {guideText.eyebrow[lang]}
                        </span>
                        <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                    </div>

                    <h2 className="heading-lg" style={{ marginBottom: '14px', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)' }}>
                        {titleLines[0]}{titleLines[1] && <><br />{titleLines[1]}</>}
                    </h2>

                    <p style={{ color: 'var(--text-2)', fontSize: '0.93rem', lineHeight: 1.8 }}>
                        {guideText.desc[lang]}
                    </p>
                </div>

                {/* Guide cards grid */}
                <div
                    className="guide-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '16px',
                    }}
                >
                    {guideCards.map((card) => (
                        <div
                            key={card.ar}
                            className="reveal"
                            style={{
                                gridColumn: card.wide ? 'span 2' : 'span 1',
                                padding: '24px',
                                borderRadius: '16px',
                                background: 'var(--bg-1)',
                                border: '1px solid var(--border)',
                                cursor: 'default',
                                transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-red)';
                                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(122,28,28,0.12)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                            }}
                        >
                            {/* Card icon */}
                            <div style={{ fontSize: card.wide ? '2rem' : '1.75rem', marginBottom: '14px' }}>{card.icon}</div>
                            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '8px' }}>
                                {card[lang]}
                            </h3>
                            <p style={{ fontSize: '0.83rem', color: 'var(--text-3)', lineHeight: 1.7, margin: 0 }}>
                                {lang === 'ar' ? card.descAr : lang === 'en' ? card.descEn : card.descTr}
                            </p>

                            {/* Arrow indicator */}
                            <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'var(--text-3)', fontSize: '1rem', opacity: 0.5 }}>→</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
