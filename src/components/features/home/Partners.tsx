import React, { useState, useEffect } from 'react';
import { fetchPartners, type HomepagePartner } from '@/service/homepageCMS';

// ── Skeleton item ──────────────────────────────────────────────────────────────
function SkeletonItem() {
    return (
        <div className="marquee-partner-item" style={{ opacity: 0.4 }}>
            <div className="marquee-abbr-box" style={{ background: 'rgba(201,151,74,0.1)' }}>···</div>
            <span className="marquee-partner-name" style={{ display: 'block', width: 80, height: 14, background: 'rgba(201,151,74,0.1)', borderRadius: 6 }} />
        </div>
    );
}

const PartnerItem = ({ partner, lang }: { partner: HomepagePartner; lang: string }) => {
    const name = lang === 'en' ? (partner.name_en || partner.name_ar)
        : lang === 'tr' ? (partner.name_tr || partner.name_ar)
        : partner.name_ar;

    const content = (
        <div className="marquee-partner-item">
            {partner.logo_url
                ? <img src={partner.logo_url} alt={partner.abbr} className="marquee-abbr-box"
                    style={{ objectFit: 'contain', padding: 4 }} />
                : <div className="marquee-abbr-box">{partner.abbr}</div>
            }
            <span className="marquee-partner-name">{name}</span>
        </div>
    );

    return partner.link
        ? <a href={partner.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>{content}</a>
        : content;
};

export const Partners = () => {
    const [partnersList, setPartnersList] = useState<HomepagePartner[]>([]);
    const [loading, setLoading] = useState(true);

    const lang = document.documentElement.getAttribute('lang') ?? 'ar';

    useEffect(() => {
        fetchPartners()
            .then(data => setPartnersList(data))
            .catch(err => console.error('Partners fetch failed', err))
            .finally(() => setLoading(false));
    }, []);

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
                        <span className="tr-only">Başarı Ortakları</span>
                    </span>
                    <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                </div>
                <h2 className="heading-md" style={{ marginBottom: '10px' }}>
                    <span className="ar-only">شركاؤنا الاستراتيجيون</span>
                    <span className="en-only">Our Strategic Partners</span>
                    <span className="tr-only">Stratejik Ortaklarımız</span>
                </h2>
                <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto' }}>
                    <span className="ar-only">نفخر بشراكاتنا مع مؤسسات بارزة في إسطنبول تدعم الطلاب اليمنيين.</span>
                    <span className="en-only">Proud partners with prominent institutions in Istanbul supporting Yemeni students.</span>
                    <span className="tr-only">Yemenli öğrencileri destekleyen İstanbul'daki önde gelen kurumlarla ortaklıklarımızla gurur duyuyoruz.</span>
                </p>
            </div>

            {/* Infinite marquee */}
            <div className="marquee-viewport">
                <div className="marquee-track" style={{ padding: '8px 0' }}>
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <SkeletonItem key={i} />)
                        : doubled.length > 0
                            ? doubled.map((partner, i) => (
                                <PartnerItem key={`${partner.id}-${i}`} partner={partner} lang={lang} />
                            ))
                            : <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '0 20px' }}>لا يوجد شركاء حالياً</p>
                    }
                </div>
            </div>
        </section>
    );
};
