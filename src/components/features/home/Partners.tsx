import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getField } from '@/i18n/pages';
import {
    fetchHomepagePartners,
    fetchHomepageOffers,
    type HomepagePartnerDisplay,
    type HomepageOfferDisplay,
} from '@/service/homepageCMS';

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

const isRTL = (lang: string) => lang === 'ar';

// ─── Shimmer Skeleton ─────────────────────────────────────────
function Shimmer({ className = '', height = '150px' }: { className?: string; height?: string | number }) {
    return <div className={`bg-secondary animate-pulse rounded-2xl ${className}`} style={{ height }} />;
}

// ─── Image Gallery ────────────────────────────────────────────
function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
    const [active, setActive] = useState(0);
    if (!images.length) return null;

    return (
        <div>
            {/* Main image */}
            <div className="relative h-[280px] rounded-2xl overflow-hidden bg-background border border-border flex items-center justify-center p-2">
                <img
                    src={images[active]}
                    alt={alt}
                    className="max-w-full max-h-full object-contain block transition-opacity duration-300 ease-out"
                />
                {images.length > 1 && (
                    <div className="absolute bottom-3 inset-inline-end-3 bg-black/65 text-white rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur-md">
                        {active + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`shrink-0 w-16 h-16 rounded-xl flex items-center justify-center p-1 cursor-pointer transition-all duration-200 border-2 ${i === active ? 'border-primary bg-primary/5' : 'border-transparent bg-secondary hover:border-primary/40'}`}
                        >
                            <img
                                src={img}
                                alt={`${alt} ${i + 1}`}
                                className="max-w-full max-h-full object-contain rounded-md"
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

    return (
        <a
            href={partner.website || undefined}
            target={partner.website ? '_blank' : undefined}
            rel={partner.website ? 'noopener noreferrer' : undefined}
            className="group flex flex-col items-center gap-4 px-4 py-6 rounded-2xl bg-card border border-border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 relative overflow-hidden"
            style={{ cursor: partner.website ? 'pointer' : 'default' }}
        >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />

            {/* Logo container */}
            <div className="w-24 h-24 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center overflow-hidden p-3 transition-all duration-300 group-hover:bg-background group-hover:shadow-md">
                {partner.logo_url ? (
                    <img
                        src={partner.logo_url}
                        alt={name}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain filter grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 ease-out"
                    />
                ) : (
                    <span className="font-sans font-black text-2xl text-muted-foreground group-hover:text-primary transition-colors duration-300">
                        {abbr}
                    </span>
                )}
            </div>

            {/* Name */}
            <span className="font-sans text-xs font-bold text-foreground text-center line-clamp-2 leading-relaxed group-hover:text-primary transition-colors duration-300">
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
    const rtl = isRTL(lang);

    const allImages = offer.image_urls?.filter(Boolean) ?? (offer.image_url ? [offer.image_url] : []);
    const thumb = allImages[0];

    return (
        <article
            className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40 animate-in slide-in-from-bottom-8 fade-in"
            onClick={() => onOpen(offer)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpen(offer)}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Image area */}
            <div className="h-[200px] bg-secondary flex items-center justify-center overflow-hidden relative border-b border-border/50">
                {thumb ? (
                    <>
                        <img
                            src={thumb}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        {allImages.length > 1 && (
                            <div className="absolute bottom-2.5 inset-inline-end-2.5 bg-black/65 text-white rounded-full px-2.5 py-1 text-[10px] font-sans font-bold backdrop-blur-md">
                                +{allImages.length - 1} {t('more', lang)}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-60 group-hover:scale-110 transition-transform duration-500">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}

                {/* Offer badge */}
                <div className="absolute top-3 inset-inline-start-3 bg-primary text-primary-foreground font-sans text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                    {t('offer', lang)}
                </div>
            </div>

            {/* Card body */}
            <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Partner row */}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden shrink-0 p-1.5 shadow-sm">
                        {offer.partners?.logo_url ? (
                            <img
                                src={offer.partners.logo_url}
                                alt={partnerName}
                                loading="lazy"
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <span className="font-sans font-black text-sm text-muted-foreground">
                                {(partnerName || '?')[0]}
                            </span>
                        )}
                    </div>
                    <span className="font-sans text-[11px] font-bold text-muted-foreground tracking-wider uppercase">
                        {partnerName}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-sans font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {title}
                </h3>

                {/* Description */}
                {desc && (
                    <p className="font-sans text-[13px] text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                        {desc}
                    </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {target && (
                        <span className="inline-block px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 rounded-md font-sans text-[10px] font-bold">
                            {target}
                        </span>
                    )}
                    {offer.partners?.city && (
                        <span className="inline-block px-2.5 py-1 bg-secondary text-muted-foreground border border-border rounded-md font-sans text-[10px] font-bold">
                            {offer.partners.city}
                        </span>
                    )}
                </div>

                {/* CTA */}
                <div className="mt-2 w-full py-2.5 rounded-xl border border-border bg-transparent text-foreground font-sans text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all duration-300">
                    {t('details', lang)}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                        <path d={rtl ? 'M19 12H5M12 19l-7-7 7-7' : 'M5 12h14M12 5l7 7-7 7'} />
                    </svg>
                </div>
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
            className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            style={{ direction: rtl ? 'rtl' : 'ltr' }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[660px] max-h-[90vh] bg-card border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300"
            >
                {/* Header strip */}
                <div className="h-2 w-full bg-gradient-to-r from-background via-primary to-background" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label={t('close', lang)}
                    className="absolute top-6 inset-inline-end-6 w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background hover:scale-110 transition-all z-10"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 sm:p-10">

                    {/* Partner identity */}
                    <div className="flex items-center gap-4 mb-8 pr-10">
                        <div className="w-16 h-16 rounded-2xl bg-secondary border border-border/60 flex items-center justify-center shrink-0 p-2">
                            {offer.partners?.logo_url ? (
                                <img
                                    src={offer.partners.logo_url}
                                    alt={partnerName}
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <span className="font-sans font-black text-2xl text-muted-foreground">{(partnerName || '?')[0]}</span>
                            )}
                        </div>
                        <div>
                            <span className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                {partnerName}
                            </span>
                            <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
                                {title}
                            </h2>
                        </div>
                    </div>

                    {/* Gallery */}
                    {allImages.length > 0 && (
                        <div className="mb-8">
                            <ImageGallery images={allImages} alt={title} />
                        </div>
                    )}

                    {/* Description */}
                    {desc && (
                        <div className="p-5 sm:p-6 rounded-2xl bg-secondary/50 border border-border/50 border-inline-start-[3px] border-inline-start-primary mb-8">
                            <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
                                {desc}
                            </p>
                        </div>
                    )}

                    {/* Meta */}
                    {metaItems.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                            {metaItems.map(({ label, value }) => (
                                <div key={label} className="p-4 rounded-xl border border-border bg-background">
                                    <div className="font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                        {label}
                                    </div>
                                    <div className="font-sans text-sm font-bold text-foreground">
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
                            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-sans text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

    useEffect(() => {
        Promise.all([fetchHomepagePartners(), fetchHomepageOffers()])
            .then(([p, o]) => { setPartners(p); setOffers(o); })
            .catch((err) => console.error('Partners/Offers fetch failed', err))
            .finally(() => setLoading(false));
    }, []);

    const handleClose = useCallback(() => setSelected(null), []);

    return (
        <section id="partners" className="relative py-24 bg-secondary/30 overflow-hidden">
            
            {/* Soft Yemen Pattern Overlay */}
            <div 
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: 'url(/assets/yemen-pattern.svg)',
                    backgroundSize: '180px 180px',
                }}
            />

            <div className="container relative z-10 mx-auto px-6 lg:px-12">

                {/* ═══ SECTION HEADER ═══ */}
                <div className="flex flex-col items-center text-center mb-16 animate-in slide-in-from-bottom-8 fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-px bg-gradient-to-r from-primary to-transparent"></span>
                        <span className="text-sm font-bold tracking-wider uppercase text-primary font-sans">
                            {t('title', lang)}
                        </span>
                        <span className="w-8 h-px bg-gradient-to-l from-primary to-transparent"></span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-display font-black text-foreground mb-4">
                        {t('title', lang)}
                    </h2>
                    <p className="text-muted-foreground font-sans text-base max-w-xl mx-auto">
                        {t('subtitle', lang)}
                    </p>
                </div>

                {/* ═══ OFFERS ═══ */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-1 bg-primary rounded-full"></span>
                            <span className="font-sans text-sm font-bold uppercase text-primary tracking-wider">
                                {t('eyebrow', lang)}
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-border"></div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Shimmer key={i} height="400px" />
                            ))}
                        </div>
                    ) : offers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {offers.map((offer, i) => (
                                <OfferCard key={offer.id} offer={offer} lang={lang} onOpen={setSelected} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-border rounded-2xl p-14 text-center text-muted-foreground font-sans text-sm bg-background">
                            {t('noOffers', lang)}
                        </div>
                    )}
                </div>

                {/* ═══ PARTNERS GRID ═══ */}
                <div>
                    <div className="flex items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-1 bg-accent rounded-full"></span>
                            <span className="font-sans text-sm font-bold uppercase text-accent tracking-wider">
                                {t('partnersTitle', lang)}
                            </span>
                        </div>
                        <div className="flex-1 h-px bg-border"></div>
                    </div>

                    <div className="bg-background border border-border rounded-[24px] p-8 sm:p-10 shadow-sm">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <Shimmer key={i} height="120px" className="rounded-2xl" />
                                ))}
                            </div>
                        ) : partners.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                                {partners.map((p) => (
                                    <PartnerLogo key={p.id} partner={p} lang={lang} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-12 text-muted-foreground text-sm font-sans">
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
