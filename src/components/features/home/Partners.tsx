import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
    return <div className={`animate-pulse rounded-2xl bg-secondary ${className}`} style={{ height }} />;
}

// ─── Image Gallery ────────────────────────────────────────────
function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
    const [active, setActive] = useState(0);
    if (!images.length) return null;

    return (
        <div>
            <div className="relative flex h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-background p-2">
                <img
                    src={images[active]}
                    alt={alt}
                    className="block max-h-full max-w-full object-contain transition-opacity duration-300 ease-out"
                />
                {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                        {active + 1} / {images.length}
                    </div>
                )}
            </div>

            {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 p-1 transition-all duration-200 ${i === active ? 'border-primary bg-primary/5' : 'border-transparent bg-secondary hover:border-primary/40'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${alt} ${i + 1}`}
                                className="max-h-full max-w-full rounded-md object-contain"
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
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase();

    const content = (
        <>
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-white/90 px-4 py-4 text-center shadow-sm ring-1 ring-border/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg dark:bg-card/90">
                <div className="flex h-20 w-full items-center justify-center rounded-xl border border-border/60 bg-white p-3 shadow-sm dark:bg-background">
                    {partner.logo_url ? (
                        <img
                            src={partner.logo_url}
                            alt={name}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <span className="text-2xl font-black text-muted-foreground transition-colors duration-300 group-hover:text-primary">
                            {abbr}
                        </span>
                    )}
                </div>
                <span className="line-clamp-2 text-[11px] font-bold leading-tight text-foreground/90 transition-colors duration-300 group-hover:text-primary">
                    {name}
                </span>
            </div>
        </>
    );

    return partner.website ? (
        <a
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block h-full w-[150px] min-w-[150px]"
            aria-label={name}
        >
            {content}
        </a>
    ) : (
        <div className="group relative block h-full w-[150px] min-w-[150px]">{content}</div>
    );
}

// ─── Offer Card ───────────────────────────────────────────────
function OfferCard({
    offer,
    lang,
    onOpen,
    index,
}: {
    offer: HomepageOfferDisplay;
    lang: string;
    onOpen: (o: HomepageOfferDisplay) => void;
    index: number;
}) {
    const title = getField(offer, 'title', lang) || offer.title;
    const desc = getField(offer, 'description', lang);
    const target = getField(offer, 'target_audience', lang);
    const partnerName = getField(offer.partners, 'name', lang) || offer.partners?.name;
    const rtl = isRTL(lang);

    const allImages = offer.image_urls?.filter(Boolean) ?? (offer.image_url ? [offer.image_url] : []);
    const thumb = allImages[0];

    return (
        <article
            className="group flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-border bg-card transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
            onClick={() => onOpen(offer)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpen(offer)}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className="relative flex h-[170px] items-center justify-center overflow-hidden border-b border-border/50 bg-secondary sm:h-[200px]">
                {thumb ? (
                    <>
                        <img
                            src={thumb}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                        {allImages.length > 1 && (
                            <div className="absolute bottom-2.5 right-2.5 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                                +{allImages.length - 1} {t('more', lang)}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/70 transition-transform duration-500 group-hover:scale-110">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}

                <div className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-primary-foreground shadow-lg shadow-primary/20">
                    {t('offer', lang)}
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-sm sm:h-11 sm:w-11">
                        {offer.partners?.logo_url ? (
                            <img
                                src={offer.partners.logo_url}
                                alt={partnerName}
                                loading="lazy"
                                className="max-h-full max-w-full object-contain"
                            />
                        ) : (
                            <span className="text-sm font-black text-muted-foreground">{(partnerName || '?')[0]}</span>
                        )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
                        {partnerName}
                    </span>
                </div>

                <h3 className="text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
                    {title}
                </h3>

                {desc && (
                    <p className="line-clamp-2 flex-1 text-[12px] leading-relaxed text-muted-foreground sm:line-clamp-3 sm:text-[13px]">
                        {desc}
                    </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                    {target && (
                        <span className="inline-block rounded-md border border-accent/20 bg-accent/10 px-2.5 py-1 text-[10px] font-bold text-accent">
                            {target}
                        </span>
                    )}
                    {offer.partners?.city && (
                        <span className="inline-block rounded-md border border-border bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                            {offer.partners.city}
                        </span>
                    )}
                </div>

                <div className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent py-2.5 text-xs font-bold text-foreground transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    {t('details', lang)}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
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
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
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
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-6"
            style={{ direction: rtl ? 'rtl' : 'ltr' }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex max-h-[90vh] w-full max-w-[660px] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-300"
            >
                <div className="h-2 w-full bg-gradient-to-r from-background via-primary to-background" />

                <button
                    onClick={onClose}
                    aria-label={t('close', lang)}
                    className="absolute right-6 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-all hover:scale-110 hover:bg-background hover:text-foreground"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="overflow-y-auto p-6 sm:p-10">
                    <div className="mb-8 flex items-center gap-4 pr-10">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-secondary p-2">
                            {offer.partners?.logo_url ? (
                                <img
                                    src={offer.partners.logo_url}
                                    alt={partnerName}
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <span className="text-2xl font-black text-muted-foreground">{(partnerName || '?')[0]}</span>
                            )}
                        </div>
                        <div>
                            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {partnerName}
                            </span>
                            <h2 className="text-2xl font-bold leading-tight text-foreground">
                                {title}
                            </h2>
                        </div>
                    </div>

                    {allImages.length > 0 && (
                        <div className="mb-8">
                            <ImageGallery images={allImages} alt={title} />
                        </div>
                    )}

                    {desc && (
                        <div className="mb-8 rounded-2xl border border-border/50 border-l-[3px] border-l-primary bg-secondary/50 p-5 sm:p-6">
                            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {desc}
                            </p>
                        </div>
                    )}

                    {metaItems.length > 0 && (
                        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {metaItems.map(({ label, value }) => (
                                <div key={label} className="rounded-xl border border-border bg-background p-4">
                                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {label}
                                    </div>
                                    <div className="text-sm font-bold text-foreground">
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {offer.contact_link && (
                        <a
                            href={offer.contact_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:shadow-lg"
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
            .then(([p, o]) => {
                setPartners(p);
                setOffers(o);
            })
            .catch((err) => console.error('Partners/Offers fetch failed', err))
            .finally(() => setLoading(false));
    }, []);

    const handleClose = useCallback(() => setSelected(null), []);

    const marqueePartners = useMemo(() => {
        if (!partners.length) return [];
        return [...partners, ...partners];
    }, [partners]);

    return (
        <section id="partners" className="relative overflow-hidden bg-secondary/30 py-24">
            <div
                className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.02] dark:opacity-[0.04]"
                style={{
                    backgroundImage: 'url(/assets/yemen-pattern.svg)',
                    backgroundSize: '180px 180px',
                }}
            />

            <div className="relative z-10 mx-auto container px-6 lg:px-12">
                <div className="mb-16 flex animate-in flex-col items-center text-center slide-in-from-bottom-8 fade-in">
                    <div className="mb-4 flex items-center gap-3">
                        <span className="h-px w-8 bg-gradient-to-r from-primary to-transparent" />
                        <span className="text-sm font-bold tracking-wider text-primary uppercase">
                            {t('title', lang)}
                        </span>
                        <span className="h-px w-8 bg-gradient-to-l from-primary to-transparent" />
                    </div>
                    <h2 className="mb-4 text-4xl font-black text-foreground lg:text-5xl">
                        {t('title', lang)}
                    </h2>
                    <p className="mx-auto max-w-xl text-base text-muted-foreground">
                        {t('subtitle', lang)}
                    </p>
                </div>

                <div className="mb-20">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="h-1 w-6 rounded-full bg-primary" />
                            <span className="text-sm font-bold tracking-wider text-primary uppercase">
                                {t('eyebrow', lang)}
                            </span>
                        </div>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Shimmer key={i} height="360px" />
                            ))}
                        </div>
                    ) : offers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {offers.map((offer, i) => (
                                <OfferCard key={offer.id} offer={offer} lang={lang} onOpen={setSelected} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border-2 border-dashed border-border bg-background p-14 text-center text-sm text-muted-foreground">
                            {t('noOffers', lang)}
                        </div>
                    )}
                </div>

                <div>
                    <div className="mb-8 flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="h-1 w-6 rounded-full bg-accent" />
                            <span className="text-sm font-bold tracking-wider text-accent uppercase">
                                {t('partnersTitle', lang)}
                            </span>
                        </div>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="relative overflow-hidden rounded-[28px] border border-border bg-background/85 p-4 shadow-sm sm:p-6">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

                        {loading ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <Shimmer key={i} height="122px" className="rounded-2xl" />
                                ))}
                            </div>
                        ) : partners.length > 0 ? (
                            <div className="partners-marquee overflow-hidden">
                                <div className="partners-marquee-track flex w-max items-stretch gap-4 py-2">
                                    {marqueePartners.map((p, idx) => (
                                        <PartnerLogo key={`${p.id}-${idx}`} partner={p} lang={lang} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-sm text-muted-foreground">
                                {t('noPartners', lang)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selected && <OfferModal offer={selected} lang={lang} onClose={handleClose} />}

            <style>{`
                .partners-marquee-track {
                    animation: partners-marquee-left 34s linear infinite;
                }

                .partners-marquee:hover .partners-marquee-track {
                    animation-play-state: paused;
                }

                @keyframes partners-marquee-left {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .partners-marquee-track {
                        animation: none;
                    }
                }
            `}</style>
        </section>
    );
};

export default Partners;
