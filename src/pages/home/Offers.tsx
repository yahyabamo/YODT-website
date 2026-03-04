import { useState, useEffect } from 'react';
import { Gift, Percent, Calendar, Store, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { fetchOffers } from '@/service/supabaseData';
import { toast } from 'sonner';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


const HomeOffers = () => {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [openImage, setOpenImage] = useState<string | null>(null);


    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            const data = await fetchOffers();
            const validOffers = (data || []).filter((o: any) => o.status === 'active' || o.status === 'inactive');
            validOffers.sort((a: any, b: any) => {
                if (a.status === 'active' && b.status !== 'active') return -1;
                if (a.status !== 'active' && b.status === 'active') return 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            setOffers(validOffers);
        } catch (error) {
            console.error('Error fetching offers:', error);
            toast.error('حدث خطأ في تحميل العروض');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <header className="sticky-header">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>
            <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
                {/* Hero Section */}
                <Card className="shadow-card overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 text-white relative">
                        <Gift className="absolute top-4 left-4 h-24 w-24 text-white/10 -rotate-12" />
                        <h2 className="text-xl font-bold mb-2 relative z-10">عروض صُممت لك</h2>
                        <p className="text-sm text-white opacity-90 relative z-10">
                            استمتع بخصومات حصرية من شركاء الاتحاد
                        </p>
                    </div>
                </Card>

                {/* Offers List */}
                <div className="grid gap-4">
                    {offers.length === 0 ? (
                        <Card className="shadow-soft">
                            <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
                                <Gift className="h-12 w-12 mb-3 opacity-50" />
                                <p>لا توجد عروض قوية حالياً</p>
                            </CardContent>
                        </Card>
                    ) : (
                        offers.map((offer) => {
                            const isInactive = offer.status === 'inactive';
                            return (
                                <Card key={offer.id} className={cn("shadow-soft overflow-hidden group border-2 border-transparent transition-colors", !isInactive && "hover:border-rose-100", isInactive && "opacity-60 grayscale-[0.8] blur-[0.3px] hover:grayscale-0 hover:blur-0 transition-all")}>
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row h-full">
                                            {/* Image Area */}
                                            <div className="relative w-full sm:w-[150px] shrink-0 h-40 sm:h-auto bg-muted">
                                                {offer.image_url ? (
                                                    <img
                                                        src={offer.image_url}
                                                        alt={offer.title}
                                                        className={cn("w-full h-full object-cover transition-transform duration-500", !isInactive && "group-hover:scale-105 cursor-pointer", isInactive && "grayscale")}
                                                        onClick={() => !isInactive && setOpenImage(offer.image_url)}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="none"><rect width="200" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em">لا توجد صورة</text></svg>';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-rose-50 flex items-center justify-center">
                                                        <Percent className="h-10 w-10 text-rose-200" />
                                                    </div>
                                                )}

                                                {/* Inactive Badge */}
                                                {isInactive && (
                                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-900/10 text-red-800 border border-red-900/20 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm">
                                                        مؤرشف
                                                    </div>
                                                )}

                                                {/* Discount Badge on Mobile (top left) / Desktop (bottom right of image) */}
                                                {offer.discount_percentage > 0 && !isInactive && (
                                                    <div className="absolute top-2 left-2 sm:top-auto sm:bottom-2 sm:right-2 sm:left-auto bg-rose-500 text-white px-2.5 py-1 rounded-lg text-sm font-bold shadow-md flex items-center gap-1">
                                                        <Percent className="h-3.5 w-3.5" />
                                                        {offer.discount_percentage}%
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    {offer.partners && (
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mb-1.5">
                                                            <Store className="h-3 w-3" />
                                                            {offer.partners.name}
                                                        </div>
                                                    )}
                                                    <h3 className="font-bold text-base text-foreground mb-1 leading-tight">{offer.title}</h3>
                                                    {offer.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                            {offer.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="mt-3 pt-3 flex flex-col gap-3 border-t border-border/50">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        {offer.expires_at ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                <span>ينتهي: {new Date(offer.expires_at).toLocaleDateString("ar-SA")}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-secondary-foreground font-medium">ساري دائماً</span>
                                                        )}
                                                    </div>

                                                    {/* {isInactive ? (
                                                        <Button disabled={true} className="w-full bg-[#f3f4f6] text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#6b7280] border-none opacity-100 font-bold cursor-not-allowed">
                                                            انتهى وقت العرض
                                                        </Button>
                                                    ) : (
                                                        <Button className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold shadow-sm transition-all active:scale-[0.98]">
                                                            استفد من العرض
                                                        </Button>
                                                    )} */}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            <BottomNav />

            {/* Lightbox Modal */}
            {openImage && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200 cursor-zoom-out"
                    onClick={() => setOpenImage(null)}
                >
                    <div className="relative max-w-4xl w-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setOpenImage(null)}
                            className="absolute -top-14 right-0 md:-right-12 p-2 text-white/80 hover:text-white transition-colors rounded-full bg-black/40 hover:bg-black/60 focus:outline-none"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={openImage}
                            alt="تكبير الصورة"
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeOffers;
