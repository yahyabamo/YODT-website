import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getField } from '@/i18n/pages';
import {
    fetchHomepagePartners,
    fetchHomepageOffers,
    type HomepagePartnerDisplay,
    type HomepageOfferDisplay,
} from '@/service/homepageCMS';

// ─── Design Tokens ────────────────────────────────────────────
const T = {
    red: '#CE1126',
    redDeep: '#A50E1F',
    black: '#0A0A0A',
    ink: '#1C1C1C',
    charcoal: '#2E2E2E',
    mist: '#F5F5F3',
    smoke: '#EDECE9',
    silver: '#D8D6D0',
    ash: '#9A9690',
    white: '#FFFFFF',
    gold: '#C9A84C',

    r: { xs: 4, sm: 8, md: 14, lg: 20, xl: 32, pill: 9999 },

    sh: {
        card: '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.04)',
        hover: '0 8px 24px rgba(0,0,0,0.10), 0 24px 64px rgba(0,0,0,0.08)',
        modal: '0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)',
        logo: '0 2px 12px rgba(0,0,0,0.08)',
    },

    ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

// ─── i18n ─────────────────────────────────────────────────────
const txt = {
    eyebrow: { ar: 'عروض حصرية', en: 'Exclusive Offers', tr: 'Özel Teklifler' },
    title: { ar: 'شركاؤنا في النجاح', en: 'Our Partners in Success', tr: 'Başarı Ortaklarımız' },
    subtitle: { ar: 'نخبة من الشركاء الموثوقين يقدمون لكم أفضل العروض والخدمات', en: 'A select group of trusted partners offering you the best deals and services', tr: 'En iyi teklifleri ve hizmetleri sunan seçkin güvenilir ortaklar' },
    details: { ar: 'عرض التفاصيل', en: 'View Details', tr: 'Detayları Gör' },
    partnersTitle: { ar: 'شبكة الشركاء', en: 'Partner Network', tr: 'Ortak Ağı' },
    noOffers: { ar: 'لا توجد عروض متاحة حالياً', en: 'No offers available at this time', tr: 'Şu anda teklif bulunmamaktadır' },
    noPartners: { ar: 'لا يوجد شركاء مسجلون', en: 'No partners registered', tr: 'Kayıtlı ortak yok' },
    targetAudience: { ar: 'الفئة المستهدفة', en: 'Target Audience', tr: 'Hedef Kitle' },
    contactMethod: { ar: 'طريقة التواصل', en: 'Contact Method', tr: 'İletişim Yöntemi' },
    city: { ar: 'المدينة', en: 'City', tr: 'Şehir' },
    contactNow: { ar: 'تواصل معنا الآن', en: 'Get in Touch', tr: 'İletişime Geç' },
    close: { ar: 'إغلاق', en: 'Close', tr: 'Kapat' },
    photo: { ar: 'صورة', en: 'photo', tr: 'fotoğraf' },
    more: { ar: 'المزيد', en: 'more', tr: 'daha' },
    offer: { ar: 'عرض', en: 'Offer', tr: 'Teklif' },
} as const;

type Lang = 'ar' | 'en' | 'tr';
const t = (key: keyof typeof txt, lang: string): string =>
    txt[key]?.[lang as Lang] ?? txt[key]?.ar ?? '';

// ─── Utilities ────────────────────────────────────────────────
const isRTL = (lang: string) => lang === 'ar';

// ─── Shimmer Skeleton ─────────────────────────────────────────
function Shimmer({ style }: { style?: React.CSSProperties }) {
    return (
        <div style={{
            background: 'linear-gradient(90deg, #EBEBEB 25%, #F5F5F5 50%, #EBEBEB 75%)',
            backgroundSize: '400% 100%',
            animation: 'shimmerSlide 1.8s ease-in-out infinite',
            borderRadius: T.r.md,
            ...style,
        }} />
    );
}

// ─── Section Label ────────────────────────────────────────────
function SectionLabel({ children, color = T.red }: { children: React.ReactNode; color?: string }) {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ display: 'block', width: 28, height: 2, background: color, borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: color }}>
                {children}
            </span>
        </div>
    );
}

// ─── Image Gallery ────────────────────────────────────────────
function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
    const [active, setActive] = useState(0);
    if (!images.length) return null;

    return (
        <div>
            {/* Main image: contain so nothing gets cropped */}
            <div style={{
                borderRadius: T.r.md,
                overflow: 'hidden',
                background: T.mist,
                border: `1px solid ${T.silver}`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 280,
            }}>
                <img
                    src={images[active]}
                    alt={alt}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                        transition: `opacity 0.3s ${T.ease}`,
                    }}
                />
                {images.length > 1 && (
                    <div style={{
                        position: 'absolute', bottom: 12, right: 12,
                        background: 'rgba(10,10,10,0.65)', color: T.white,
                        borderRadius: T.r.pill, padding: '3px 12px',
                        fontSize: 11, fontWeight: 600, backdropFilter: 'blur(4px)',
                    }}>
                        {active + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            style={{
                                border: `2px solid ${i === active ? T.red : 'transparent'}`,
                                borderRadius: T.r.sm,
                                background: T.mist,
                                padding: 3,
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: `border-color 0.2s ease`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 60,
                                height: 60,
                            }}
                        >
                            <img
                                src={img}
                                alt={`${alt} ${i + 1}`}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: T.r.xs, display: 'block' }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Partner Logo Card ────────────────────────────────────────
function PartnerLogo({ partner, lang }: { partner: HomepagePartnerDisplay; lang: string }) {
    const name = getField(partner, 'name', lang) || partner.name;
    const abbr = (partner.name_ar || partner.name || '?')
        .split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
    const [hovered, setHovered] = useState(false);

    return (
        <a
            href={partner.website || undefined}
            target={partner.website ? '_blank' : undefined}
            rel={partner.website ? 'noopener noreferrer' : undefined}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                padding: '28px 16px 20px',
                borderRadius: T.r.lg,
                background: T.white,
                border: `1.5px solid ${hovered ? T.red : T.silver}`,
                boxShadow: hovered ? T.sh.hover : T.sh.card,
                transition: `all 0.3s ${T.ease}`,
                transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden',
                cursor: partner.website ? 'pointer' : 'default',
            }}
        >
            {/* Top accent bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: T.red,
                transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left center',
                transition: `transform 0.35s ${T.ease}`,
                borderRadius: '0 0 2px 2px',
            }} />

            {/* Logo container — proper sizing, no crop */}
            <div style={{
                width: 96,
                height: 96,
                borderRadius: T.r.md,
                background: T.mist,
                border: `1px solid ${T.smoke}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: hovered ? T.sh.logo : 'none',
                transition: `box-shadow 0.3s ease`,
                padding: 12,
            }}>
                {partner.logo_url ? (
                    <img
                        src={partner.logo_url}
                        alt={name}
                        loading="lazy"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block',
                            filter: hovered ? 'grayscale(0) opacity(1)' : 'grayscale(0.4) opacity(0.75)',
                            transition: `filter 0.35s ease`,
                        }}
                    />
                ) : (
                    <span style={{
                        fontWeight: 900,
                        fontSize: 22,
                        color: hovered ? T.red : T.charcoal,
                        letterSpacing: '0.02em',
                        transition: `color 0.3s ease`,
                    }}>
                        {abbr}
                    </span>
                )}
            </div>

            {/* Name */}
            <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: hovered ? T.red : T.charcoal,
                textAlign: 'center',
                lineHeight: 1.4,
                transition: `color 0.3s ease`,
                maxWidth: '100%',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
            }}>
                {name}
            </span>
        </a>
    );
}

// ─── Offer Card ───────────────────────────────────────────────
function OfferCard({
    offer, lang, onOpen, index,
}: { offer: HomepageOfferDisplay; lang: string; onOpen: (o: HomepageOfferDisplay) => void; index: number }) {
    const title = getField(offer, 'title', lang) || offer.title;
    const desc = getField(offer, 'description', lang);
    const target = getField(offer, 'target_audience', lang);
    const partnerName = getField(offer.partners, 'name', lang) || offer.partners?.name;
    const [hovered, setHovered] = useState(false);
    const rtl = isRTL(lang);

    const allImages = offer.image_urls?.filter(Boolean) ?? (offer.image_url ? [offer.image_url] : []);
    const thumb = allImages[0];

    return (
        <article
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onOpen(offer)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpen(offer)}
            style={{
                borderRadius: T.r.lg,
                background: T.white,
                boxShadow: hovered ? T.sh.hover : T.sh.card,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: `all 0.35s ${T.ease}`,
                transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
                border: `1.5px solid ${hovered ? T.red : T.silver}`,
                overflow: 'hidden',
                animationDelay: `${index * 80}ms`,
                animation: 'fadeUp 0.5s ease forwards',
                opacity: 0,
                direction: rtl ? 'rtl' : 'ltr',
            }}
        >
            {/* Image area — proper contain with padding so images aren't cropped */}
            <div style={{
                height: 200,
                background: T.mist,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: thumb ? 0 : 24,
                position: 'relative',
                borderBottom: `1px solid ${T.smoke}`,
            }}>
                {thumb ? (
                    <>
                        <img
                            src={thumb}
                            alt={title}
                            style={{
                                /* Contain prevents zooming/cropping regardless of aspect ratio */
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                padding: '12px',
                                display: 'block',
                                transition: `transform 0.5s ${T.ease}`,
                                transform: hovered ? 'scale(1.04)' : 'scale(1)',
                            }}
                        />
                        {allImages.length > 1 && (
                            <div style={{
                                position: 'absolute', bottom: 10,
                                [rtl ? 'left' : 'right']: 10,
                                background: 'rgba(10,10,10,0.65)',
                                color: T.white,
                                borderRadius: T.r.pill,
                                padding: '3px 10px',
                                fontSize: 10,
                                fontWeight: 700,
                                backdropFilter: 'blur(4px)',
                                letterSpacing: '0.04em',
                            }}>
                                +{allImages.length - 1} {t('more', lang)}
                            </div>
                        )}
                    </>
                ) : (
                    /* No image placeholder */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: T.silver }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}

                {/* Offer badge */}
                <div style={{
                    position: 'absolute', top: 12,
                    [rtl ? 'right' : 'left']: 12,
                    background: T.red,
                    color: T.white,
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: T.r.pill,
                }}>
                    {t('offer', lang)}
                </div>
            </div>

            {/* Card body */}
            <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>

                {/* Partner row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 44, height: 44,
                        borderRadius: T.r.sm,
                        background: T.mist,
                        border: `1px solid ${T.smoke}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0, padding: 6,
                    }}>
                        {offer.partners?.logo_url ? (
                            <img
                                src={offer.partners.logo_url}
                                alt={partnerName}
                                loading="lazy"
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                            />
                        ) : (
                            <span style={{ fontSize: 14, fontWeight: 800, color: T.charcoal }}>
                                {(partnerName || '?')[0]}
                            </span>
                        )}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.ash, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {partnerName}
                    </span>
                </div>

                {/* Title */}
                <h3 style={{ margin: 0, fontSize: 17, lineHeight: 1.4, color: T.ink, fontWeight: 800, letterSpacing: '-0.01em' }}>
                    {title}
                </h3>

                {/* Description */}
                {desc && (
                    <p style={{
                        margin: 0, fontSize: 13, lineHeight: 1.75, color: T.ash, flex: 1,
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                        {desc}
                    </p>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {target && (
                        <span style={{
                            fontSize: 10, padding: '5px 12px', borderRadius: T.r.pill,
                            background: '#FFF7E6', color: '#A0722A',
                            fontWeight: 700, letterSpacing: '0.04em',
                            border: '1px solid #F0D99A',
                        }}>
                            {target}
                        </span>
                    )}
                    {offer.partners?.city && (
                        <span style={{
                            fontSize: 10, padding: '5px 12px', borderRadius: T.r.pill,
                            background: T.mist, color: T.ash, fontWeight: 600,
                            border: `1px solid ${T.smoke}`,
                        }}>
                            {offer.partners.city}
                        </span>
                    )}
                </div>

                {/* CTA */}
                <button
                    onClick={(e) => { e.stopPropagation(); onOpen(offer); }}
                    style={{
                        border: 'none', borderRadius: T.r.sm,
                        padding: '13px 20px',
                        background: hovered ? T.red : T.ink,
                        color: T.white,
                        fontSize: 12, fontWeight: 700,
                        cursor: 'pointer',
                        transition: `background 0.3s ease`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        letterSpacing: '0.04em',
                        marginTop: 4,
                    }}
                >
                    {t('details', lang)}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d={rtl ? 'M19 12H5M12 19l-7-7 7-7' : 'M5 12h14M12 5l7 7-7 7'} />
                    </svg>
                </button>
            </div>
        </article>
    );
}

// ─── Offer Modal ──────────────────────────────────────────────
function OfferModal({ offer, lang, onClose }: { offer: HomepageOfferDisplay; lang: string; onClose: () => void }) {
    const title = getField(offer, 'title', lang) || offer.title;
    const desc = getField(offer, 'description', lang) || offer.description;
    const target = getField(offer, 'target_audience', lang);
    const method = getField(offer, 'contact_method', lang);
    const partnerName = getField(offer.partners, 'name', lang) || offer.partners?.name;
    const allImages = offer.image_urls?.filter(Boolean) ?? (offer.image_url ? [offer.image_url] : []);
    const rtl = isRTL(lang);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
    }, [onClose]);

    const metaItems = [
        target && { label: t('targetAudience', lang), value: target },
        method && { label: t('contactMethod', lang), value: method },
        offer.partners?.city && { label: t('city', lang), value: offer.partners.city },
    ].filter(Boolean) as { label: string; value: string }[];

    return (
        <div
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(5,5,5,0.75)',
                backdropFilter: 'blur(10px)',
                zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px 16px',
                animation: 'fadeIn 0.25s ease',
                direction: rtl ? 'rtl' : 'ltr',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 'min(660px, 100%)',
                    background: T.white,
                    borderRadius: T.r.xl,
                    boxShadow: T.sh.modal,
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative',
                    animation: 'slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
            >
                {/* Header strip */}
                <div style={{
                    height: 8,
                    background: `linear-gradient(90deg, ${T.black} 0%, ${T.red} 60%, ${T.black} 100%)`,
                }} />

                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label={t('close', lang)}
                    style={{
                        position: 'sticky',
                        top: 16,
                        [rtl ? 'left' : 'right']: 0,
                        float: rtl ? 'left' : 'right',
                        margin: rtl ? '16px 0 -48px 16px' : '16px 16px -48px 0',
                        border: 'none',
                        background: T.mist,
                        color: T.charcoal,
                        borderRadius: '50%',
                        width: 36, height: 36,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.smoke)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = T.mist)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Content */}
                <div style={{ padding: '32px 36px 36px' }}>

                    {/* Partner identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                        <div style={{
                            width: 64, height: 64,
                            borderRadius: T.r.md,
                            background: T.mist,
                            border: `1.5px solid ${T.silver}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', flexShrink: 0, padding: 8,
                        }}>
                            {offer.partners?.logo_url ? (
                                <img
                                    src={offer.partners.logo_url}
                                    alt={partnerName}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                                />
                            ) : (
                                <span style={{ fontWeight: 900, fontSize: 20, color: T.charcoal }}>{(partnerName || '?')[0]}</span>
                            )}
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: 11, color: T.ash, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                                {partnerName}
                            </span>
                            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: T.ink, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                                {title}
                            </h2>
                        </div>
                    </div>

                    {/* Gallery */}
                    {allImages.length > 0 && (
                        <div style={{ marginBottom: 28 }}>
                            <ImageGallery images={allImages} alt={title} />
                        </div>
                    )}

                    {/* Description */}
                    {desc && (
                        <div style={{
                            padding: '20px 24px',
                            borderRadius: T.r.md,
                            background: T.mist,
                            border: `1px solid ${T.smoke}`,
                            marginBottom: 28,
                            borderLeft: `3px solid ${T.red}`,
                        }}>
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: T.charcoal }}>
                                {desc}
                            </p>
                        </div>
                    )}

                    {/* Meta */}
                    {metaItems.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${Math.min(metaItems.length, 3)}, 1fr)`,
                            gap: 12,
                            marginBottom: 28,
                        }}>
                            {metaItems.map(({ label, value }) => (
                                <div key={label} style={{
                                    padding: '16px 18px',
                                    borderRadius: T.r.md,
                                    border: `1px solid ${T.smoke}`,
                                    background: T.white,
                                }}>
                                    <div style={{ fontSize: 10, color: T.ash, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                                        {label}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    {offer.contact_link && (
                        <a
                            href={offer.contact_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                padding: '16px 24px',
                                borderRadius: T.r.md,
                                background: T.red,
                                color: T.white,
                                textDecoration: 'none',
                                fontSize: 13, fontWeight: 700,
                                letterSpacing: '0.04em',
                                transition: `background 0.25s ease`,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = T.redDeep)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = T.red)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.22 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            {t('contactNow', lang)}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Partners Section ────────────────────────────────────
export const Partners = () => {
    const { language: lang } = useLanguage();
    const [partners, setPartners] = useState<HomepagePartnerDisplay[]>([]);
    const [offers, setOffers] = useState<HomepageOfferDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<HomepageOfferDisplay | null>(null);
    const rtl = isRTL(lang);

    useEffect(() => {
        Promise.all([fetchHomepagePartners(), fetchHomepageOffers()])
            .then(([p, o]) => { setPartners(p); setOffers(o); })
            .catch((err) => console.error('Partners/Offers fetch failed', err))
            .finally(() => setLoading(false));
    }, []);

    const handleClose = useCallback(() => setSelected(null), []);

    return (
        <section
            id="partners"
            dir={rtl ? 'rtl' : 'ltr'}
            style={{
                padding: '96px 0 80px',
                background: T.white,
                position: 'relative',
                overflow: 'hidden',
                fontFamily: rtl
                    ? '"Noto Kufi Arabic", "Cairo", "Tajawal", sans-serif'
                    : '"DM Sans", "Plus Jakarta Sans", system-ui, sans-serif',
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Cairo:wght@400;600;700;800;900&display=swap');

                @keyframes shimmerSlide {
                    0%   { background-position: 200% 0 }
                    100% { background-position: -200% 0 }
                }
                @keyframes fadeIn {
                    from { opacity: 0 }
                    to   { opacity: 1 }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(32px) scale(0.97) }
                    to   { opacity: 1; transform: translateY(0)    scale(1)    }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px) }
                    to   { opacity: 1; transform: translateY(0) }
                }
                @keyframes drawLine {
                    from { transform: scaleX(0) }
                    to   { transform: scaleX(1) }
                }

                #partners *:focus-visible {
                    outline: 2px solid ${T.red};
                    outline-offset: 3px;
                    border-radius: 4px;
                }
            `}</style>

            {/* ── Subtle background texture ── */}
            {/* ── Pattern background (from v1) ── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.03,
                pointerEvents: 'none',
                zIndex: 0,
                backgroundImage: `
        linear-gradient(30deg, #000 12%, transparent 12.5%, transparent 87%, #000 87.5%, #000),
        linear-gradient(150deg, #000 12%, transparent 12.5%, transparent 87%, #000 87.5%, #000)
    `,
                backgroundSize: '80px 140px',
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto' }}>

                {/* ═══ SECTION HEADER ═══ */}
                <div style={{ textAlign: 'center', marginBottom: 72, padding: '0 24px' }}>
                    {/* Yemen flag micro-bar */}
                    <div style={{
                        display: 'inline-flex',
                        height: 4, width: 54,
                        borderRadius: 2, overflow: 'hidden', marginBottom: 28, gap: 1,
                    }}>
                        <div style={{ flex: 1, background: T.red }} />
                        <div style={{ flex: 1, background: T.white, border: `1px solid ${T.silver}` }} />
                        <div style={{ flex: 1, background: T.black }} />
                    </div>

                    <h2 style={{
                        margin: '0 0 18px',
                        fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                        lineHeight: 1.15,
                        color: T.ink,
                        fontWeight: 900,
                        letterSpacing: '-0.025em',
                    }}>
                        {t('title', lang)}
                    </h2>
                    <p style={{
                        color: T.ash,
                        fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                        maxWidth: 540,
                        margin: '0 auto',
                        lineHeight: 1.8,
                        fontWeight: 400,
                    }}>
                        {t('subtitle', lang)}
                    </p>
                </div>

                {/* ═══ OFFERS ═══ */}
                <div style={{ padding: '0 24px', marginBottom: 72 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, gap: 16 }}>
                        <SectionLabel color={T.red}>{t('eyebrow', lang)}</SectionLabel>
                        <div style={{ flex: 1, height: 1, background: T.smoke }} />
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Shimmer key={i} style={{ height: 400, borderRadius: T.r.lg }} />
                            ))}
                        </div>
                    ) : offers.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                            {offers.map((offer, i) => (
                                <OfferCard key={offer.id} offer={offer} lang={lang} onOpen={setSelected} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            border: `2px dashed ${T.silver}`,
                            borderRadius: T.r.lg,
                            padding: '56px 24px',
                            textAlign: 'center',
                            color: T.ash,
                            background: T.mist,
                            fontSize: 14,
                        }}>
                            {t('noOffers', lang)}
                        </div>
                    )}
                </div>

                {/* ═══ PARTNERS GRID ═══ */}
                <div style={{ padding: '0 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, gap: 16 }}>
                        <SectionLabel color={T.gold}>{t('partnersTitle', lang)}</SectionLabel>
                        <div style={{ flex: 1, height: 1, background: T.smoke }} />
                    </div>

                    <div style={{
                        background: T.mist,
                        border: `1px solid ${T.smoke}`,
                        borderRadius: T.r.xl,
                        padding: '32px 28px',
                    }}>
                        {loading ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <Shimmer key={i} style={{ height: 150, borderRadius: T.r.lg }} />
                                ))}
                            </div>
                        ) : partners.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
                                {partners.map((p) => (
                                    <PartnerLogo key={p.id} partner={p} lang={lang} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 24px', color: T.ash, fontSize: 14 }}>
                                {t('noPartners', lang)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ MODAL ═══ */}
            {selected && <OfferModal offer={selected} lang={lang} onClose={handleClose} />}
        </section>
    );
};