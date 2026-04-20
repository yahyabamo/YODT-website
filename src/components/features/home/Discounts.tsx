import React, { useState, useEffect } from 'react';
import { fetchDiscounts, type HomepageDiscount } from '@/service/homepageCMS';
import { useLanguage } from '@/context/LanguageContext';
import { getField } from '@/i18n/pages';

// ── Skeleton shimmer card ──────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{
            borderRadius: '16px',
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            padding: '24px',
        }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--border)', marginBottom: 14, animation: 'skeletonPulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 14, width: '40%', borderRadius: 6, background: 'var(--border)', marginBottom: 10, animation: 'skeletonPulse 1.4s ease-in-out 0.1s infinite' }} />
            <div style={{ height: 12, width: '80%', borderRadius: 6, background: 'var(--border)', marginBottom: 6, animation: 'skeletonPulse 1.4s ease-in-out 0.2s infinite' }} />
            <div style={{ height: 12, width: '60%', borderRadius: 6, background: 'var(--border)', animation: 'skeletonPulse 1.4s ease-in-out 0.3s infinite' }} />
        </div>
    );
}

const discountsText = {
    eyebrow: { ar: 'تخفيضات الأعضاء', en: 'Member Discounts', tr: 'Üye İndirimleri' },
    title: {
        ar: 'وفر أكثر مع بطاقة العضوية',
        en: 'Save More With Your Membership',
        tr: 'Üyelik Kartınla Daha Fazla Tasarruf Et',
    },
    desc: {
        ar: 'استمتع بخصومات حصرية من شركاء الاتحاد في إسطنبول.',
        en: 'Enjoy exclusive discounts from union partners across Istanbul.',
        tr: "İstanbul genelinde birlik ortaklarından özel indirimlerden yararlanın.",
    },
    partnerCTA: {
        ar: 'انضم لشبكة شركائنا وقدم خصومات للطلاب اليمنيين.',
        en: 'Join our partner network and offer discounts to Yemeni students.',
        tr: 'Ortak ağımıza katılın ve Yemenli öğrencilere indirim sunun.',
    },
    contactUs: { ar: 'تواصل معنا', en: 'Contact Us', tr: 'Bize Ulaşın' },
} as const;


export const Discounts = () => {
    const { language: lang } = useLanguage();
    const [categories, setCategories] = useState<HomepageDiscount[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        setFetchError(false);
        fetchDiscounts()
            .then(data => setCategories(data))
            .catch(err => {
                console.error('[Discounts] fetch ERROR:', err);
                setFetchError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <style>{`@keyframes skeletonPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
            <section id="discounts" style={{ background: 'var(--bg)' }}>
                <div className="container section-pad">
                    {/* Header */}
                    <div className="reveal" style={{ textAlign: 'center', marginBottom: '52px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                            <span style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                {discountsText.eyebrow[lang]}
                            </span>
                            <div style={{ height: '1px', width: '32px', background: 'var(--gold)' }} />
                        </div>

                        <h2 className="heading-lg" style={{ marginBottom: '12px', fontSize: 'clamp(1.4rem, 3vw, 1.9rem)' }}>
                            {discountsText.title[lang]}
                        </h2>
                        <p style={{ color: 'var(--text-2)', fontSize: '0.93rem', maxWidth: '480px', margin: '0 auto' }}>
                            {discountsText.desc[lang]}
                        </p>
                    </div>

                    {/* Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                        {loading
                            ? [0, 1, 2].map(i => <SkeletonCard key={i} />)
                            : categories.map((cat) => {
                                const catTitle = getField(cat, 'title', lang);
                                const catLabel = getField(cat, 'label', lang);
                                const catDesc = getField(cat, 'desc', lang);
                                return (
                                    <div
                                        key={cat.id}
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
                                            {catLabel}
                                        </span>

                                        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '8px' }}>
                                            {catTitle}
                                        </h3>

                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.7 }}>
                                            {catDesc}
                                        </p>
                                    </div>
                                );
                            })
                        }

                        {/* Partner CTA card — always shown */}
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
                                {discountsText.partnerCTA[lang]}
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
                                {discountsText.contactUs[lang]}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
