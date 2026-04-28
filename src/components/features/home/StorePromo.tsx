import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBag, ArrowLeft, ArrowRight, Tag, Star, Gift } from 'lucide-react';
import { useStoreProducts } from '@/hooks/store/useStoreProducts';
import { getField } from '@/i18n/pages';

const storePromoText = {
    eyebrow: { ar: 'متجر الاتحاد', en: 'Union Store', tr: 'Birlik Mağazası' },
    title: {
        ar: 'منتجات يمنية حصرية ',
        en: ' Yemeni Products',
        tr: ' Yemen Ürünleri'
    },
    desc: {
        ar: 'نوفر لك في متجر الاتحاد مجموعة مختارة من المنتجات الأساسية والهدايا التذكارية المصممة خصيصاً لتناسب احتياجات الطالب اليمني في إسطنبول بأسعار مميزة.',
        en: 'The Union Store provides a curated selection of essential products and souvenirs specifically designed for the Yemeni student in Istanbul at special prices.',
        tr: 'Birlik Mağazası, İstanbul\'daki Yemenli öğrenci için özel olarak tasarlanmış temel ürünler ve hediyelik eşyaların özenle seçilmiş bir koleksiyonunu özel fiyatlarla sunar.'
    },
    highlights: [
        {
            icon: <Tag size={20} />,
            ar: 'أسعار حصرية للطلاب',
            en: 'Exclusive Student Prices',
            tr: 'Öğrencilere Özel Fiyatlar'
        },
        {
            icon: <Star size={20} />,
            ar: 'منتجات عالية الجودة',
            en: 'High Quality Products',
            tr: 'Yüksek Kaliteli Ürünler'
        },
        {
            icon: <Gift size={20} />,
            ar: 'منتجات تعيد لك ذكريات الوطن',
            en: 'Products that bring back memories of the homeland',
            tr: 'vatan anılarını geri getiren ürünler'
        }
    ],
    cta: { ar: 'تصفح المتجر الآن', en: 'Explore Store Now', tr: 'Mağazayı Şimdi Keشfet' }
} as const;

export const StorePromo = () => {
    const { language: lang } = useLanguage();
    const navigate = useNavigate();
    const { data: products } = useStoreProducts();

    const displayedProducts = React.useMemo(() => {
        if (!products || products.length === 0) return [];
        return [...products].sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }).slice(0, 3);
    }, [products]);

    return (
        <section id="store-promo" className="relative py-20 overflow-hidden" style={{ background: 'var(--bg)' }}>
            {/* Background elements */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--gold) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="container relative z-10 mx-auto px-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Content Side */}
                    <div className="w-full lg:w-1/2 text-center lg:text-start reveal-left">
                        <div className="inline-flex items-center justify-center lg:justify-start gap-4 mb-6 w-full lg:w-auto">
                            <div className="w-12 h-[1px] bg-amber-500/50 hidden lg:block" />
                            <span className="text-amber-500 font-bold text-sm tracking-widest uppercase bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                                {storePromoText.eyebrow[lang]}
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-foreground leading-[1.3] mb-6">
                            {storePromoText.title[lang]}
                        </h2>

                        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                            {storePromoText.desc[lang]}
                        </p>

                        <div className="flex flex-col gap-4 mb-10">
                            {storePromoText.highlights.map((h, i) => (
                                <div key={i} className="flex items-center gap-4 text-foreground/90 font-medium bg-card/80 backdrop-blur-sm border border-border/60 p-4 rounded-2xl w-full sm:w-fit mx-auto lg:mx-0 shadow-sm transition-transform hover:-translate-y-1 hover:border-amber-500/30">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-primary/10 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
                                        {h.icon}
                                    </div>
                                    <span className="text-sm sm:text-base">{h[lang]}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/store?ref=public')}
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 group border border-primary/50"
                        >
                            <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
                            <span>{storePromoText.cta[lang]}</span>
                            {lang === 'ar' ? (
                                <ArrowLeft size={20} className="group-hover:-translate-x-1.5 transition-transform" />
                            ) : (
                                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                            )}
                        </button>
                    </div>

                    {/* Visual Side */}
                    <div className="w-full lg:w-1/2 reveal-right relative mt-10 lg:mt-0">
                        <div className="relative w-full max-w-lg mx-auto aspect-square sm:aspect-auto sm:min-h-[400px]">
                            {/* Decorative Frame */}
                            <div className="absolute inset-2 sm:inset-4 border-2 border-amber-500/20 rounded-[24px] sm:rounded-[40px] -rotate-3 sm:-rotate-6 transition-transform duration-700 group-hover:rotate-0" />
                            <div className="absolute inset-2 sm:inset-4 bg-gradient-to-br from-card to-background rounded-[24px] sm:rounded-[40px] border border-border/60 overflow-hidden shadow-2xl flex items-center justify-center p-3 sm:p-6">

                                {/* Abstract composition representing the store */}
                                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url(/assets/yemen-pattern.svg)', backgroundSize: '100px 100px' }} />

                                <div className="relative z-10 w-full h-full flex flex-col justify-between py-2 sm:py-0 gap-4 sm:gap-0">

                                    {displayedProducts.length > 0 ? (
                                        <>
                                            {/* Real Product 1 */}
                                            {displayedProducts[0] && (
                                                <div
                                                    onClick={() => navigate(`/store/${displayedProducts[0].id}`)}
                                                    className="w-full sm:w-[85%] bg-background/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border border-border/80 flex items-center gap-3 sm:gap-5 transform sm:-translate-y-2 sm:translate-x-4 sm:rotate-3 animate-float hover:scale-105 hover:border-primary/50 transition-transform cursor-pointer"
                                                >
                                                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-secondary/80 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center text-muted-foreground/40 border border-border/40 overflow-hidden">
                                                        {displayedProducts[0].thumbnail ? (
                                                            <img src={displayedProducts[0].thumbnail} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag size={24} className="sm:w-8 sm:h-8" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                                                        <div className="font-bold text-foreground text-sm sm:text-base line-clamp-1">{getField(displayedProducts[0], 'name', lang)}</div>
                                                        <div className="text-xs text-muted-foreground font-medium" dir="ltr">
                                                            {displayedProducts[0].price} {displayedProducts[0].currency}
                                                        </div>
                                                        {displayedProducts[0].is_featured && (
                                                            <span className="inline-block text-[10px] bg-amber-500/20 text-amber-600 font-bold px-2 py-0.5 rounded-full mt-1">
                                                                {lang === 'ar' ? 'مميز' : 'Featured'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Real Product 2 */}
                                            {displayedProducts[1] && (
                                                <div
                                                    onClick={() => navigate(`/store/${displayedProducts[1].id}`)}
                                                    className="w-full sm:w-[85%] bg-background/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border border-border/80 flex items-center gap-3 sm:gap-5 self-end transform sm:translate-y-2 sm:-translate-x-4 sm:-rotate-3 animate-float hover:scale-105 hover:border-primary/50 transition-transform cursor-pointer"
                                                    style={{ animationDelay: '2.5s' }}
                                                >
                                                    <div className="flex-1 space-y-0.5 sm:space-y-1 text-right min-w-0">
                                                        <div className="font-bold text-foreground text-sm sm:text-base line-clamp-1">{getField(displayedProducts[1], 'name', lang)}</div>
                                                        <div className="text-xs text-muted-foreground font-medium" dir="ltr">
                                                            {displayedProducts[1].price} {displayedProducts[1].currency}
                                                        </div>
                                                        {displayedProducts[1].is_featured && (
                                                            <span className="inline-block text-[10px] bg-amber-500/20 text-amber-600 font-bold px-2 py-0.5 rounded-full mt-1">
                                                                {lang === 'ar' ? 'مميز' : 'Featured'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-secondary/80 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center text-muted-foreground/40 border border-border/40 overflow-hidden">
                                                        {displayedProducts[1].thumbnail ? (
                                                            <img src={displayedProducts[1].thumbnail} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag size={24} className="sm:w-8 sm:h-8" />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {/* Mock Product Card 1 */}
                                            <div className="w-full sm:w-[85%] bg-background/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border border-border/80 flex items-center gap-3 sm:gap-5 transform sm:-translate-y-2 sm:translate-x-4 sm:rotate-3 animate-float hover:scale-105 transition-transform cursor-default">
                                                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-secondary/80 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center text-muted-foreground/40 border border-border/40">
                                                    <ShoppingBag size={24} className="sm:w-8 sm:h-8" />
                                                </div>
                                                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                                                    <div className="w-3/4 h-3 sm:h-3.5 bg-muted-foreground/20 rounded-full" />
                                                    <div className="w-1/2 h-2 sm:h-2.5 bg-muted-foreground/10 rounded-full" />
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="w-14 sm:w-16 h-3.5 sm:h-4 bg-primary/20 rounded-full" />
                                                        <div className="w-6 sm:w-8 h-3.5 sm:h-4 bg-amber-500/20 rounded-full" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mock Product Card 2 */}
                                            <div className="w-full sm:w-[85%] bg-background/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg border border-border/80 flex items-center gap-3 sm:gap-5 self-end transform sm:translate-y-2 sm:-translate-x-4 sm:-rotate-3 animate-float hover:scale-105 transition-transform cursor-default" style={{ animationDelay: '2s' }}>
                                                <div className="flex-1 space-y-2 sm:space-y-3 text-right min-w-0">
                                                    <div className="w-3/4 h-3 sm:h-3.5 bg-muted-foreground/20 rounded-full ml-auto" />
                                                    <div className="w-1/2 h-2 sm:h-2.5 bg-muted-foreground/10 rounded-full ml-auto" />
                                                    <div className="flex items-center justify-end gap-2 mt-2">
                                                        <div className="w-10 sm:w-12 h-3.5 sm:h-4 bg-primary/20 rounded-full" />
                                                    </div>
                                                </div>
                                                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-amber-500/5 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center text-amber-500/40 border border-amber-500/20">
                                                    <Gift size={24} className="sm:w-8 sm:h-8" />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Center badge */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-background to-secondary rounded-full shadow-[0_0_40px_rgba(0,0,0,0.1)] border-4 border-background flex items-center justify-center text-amber-500 z-20">
                                        <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                                        <ShoppingBag size={28} className="sm:w-10 sm:h-10 drop-shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(var(--tw-rotate)); }
                    50% { transform: translateY(-12px) rotate(var(--tw-rotate)); }
                }
                .animate-float {
                    animation: float 5s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
};
