import React from 'react';

const partnersList = [
    { abbr: 'UNI', nameAr: 'جامعة إسطنبول', nameEn: 'Istanbul University' },
    { abbr: 'EDU', nameAr: 'مركز التعليم التقني', nameEn: 'Tech Education Center' },
    { abbr: 'MED', nameAr: 'المركز الطبي', nameEn: 'Medical Center' },
    { abbr: 'LAW', nameAr: 'استشارات قانونية', nameEn: 'Legal Consulting' },
    { abbr: 'TECH', nameAr: 'شركة تقنية', nameEn: 'Tech Company' },
    { abbr: 'REST', nameAr: 'سلسلة مطاعم', nameEn: 'Restaurant Chain' },
    { abbr: 'BANK', nameAr: 'خدمات مالية', nameEn: 'Financial Services' },
    { abbr: 'LANG', nameAr: 'مركز اللغات', nameEn: 'Language Center' },
    { abbr: 'PRINT', nameAr: 'خدمات طباعة', nameEn: 'Printing Services' },
    { abbr: 'BOOK', nameAr: 'دار نشر', nameEn: 'Publishing House' },
    { abbr: 'HLTH', nameAr: 'صيدلية', nameEn: 'Pharmacy' },
    { abbr: 'VISA', nameAr: 'خدمات التأشيرة', nameEn: 'Visa Services' },
];

const PartnerItem = ({ partner }: { partner: typeof partnersList[0] }) => (
    <div className="marquee-partner-item">
        <div className="marquee-abbr-box">{partner.abbr}</div>
        <span className="marquee-partner-name">
            <span className="ar-only">{partner.nameAr}</span>
            <span className="en-only">{partner.nameEn}</span>
        </span>
    </div>
);

export const Partners = () => {
    // Duplicate list for seamless infinite scroll
    const doubled = [...partnersList, ...partnersList];

    return (
        <section id="partners" className="section-bg-raised" style={{ padding: 'var(--section-y) 0' }}>
            {/* Section header */}
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px', padding: '0 5vw' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                    <span style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'var(--f-ui)' }}>
                        <span className="ar-only">شركاء النجاح</span>
                        <span className="en-only">Partners of Success</span>
                    </span>
                    <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                </div>
                <h2 className="heading-md" style={{ marginBottom: '10px' }}>
                    <span className="ar-only">شركاؤنا الاستراتيجيون</span>
                    <span className="en-only">Our Strategic Partners</span>
                </h2>
                <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto' }}>
                    <span className="ar-only">نفخر بشراكاتنا مع مؤسسات بارزة في إسطنبول تدعم الطلاب اليمنيين.</span>
                    <span className="en-only">Proud partners with prominent institutions in Istanbul supporting Yemeni students.</span>
                </p>
            </div>

            {/* Infinite marquee */}
            <div className="marquee-viewport">
                <div className="marquee-track" style={{ padding: '8px 0' }}>
                    {doubled.map((partner, i) => (
                        <PartnerItem key={`${partner.abbr}-${i}`} partner={partner} />
                    ))}
                </div>
            </div>
        </section>
    );
};
