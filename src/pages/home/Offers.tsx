import { useState, useEffect } from 'react';
import { Gift, Percent, Calendar, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { fetchOffers } from '@/service/supabaseData';
import { toast } from 'sonner';
import { SmartTopBar } from '@/components/layout/SmartTopBar';


const HomeOffers = () => {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);


    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            const data = await fetchOffers();
            // Only keep active offers
            const activeOffers = (data || []).filter((o: any) => o.status === 'active');
            setOffers(activeOffers);
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
                        <p className="text-sm opacity-90 relative z-10">
                            استمتع بخصومات حصرية من شركاء الاتحاد الرائعين
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
                        offers.map((offer) => (
                            <Card key={offer.id} className="shadow-soft overflow-hidden group border-2 border-transparent hover:border-rose-100 transition-colors">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row h-full">
                                        {/* Image Area */}
                                        <div className="relative w-full sm:w-32 h-40 sm:h-auto bg-muted">
                                            {offer.image_url ? (
                                                <img
                                                    src={offer.image_url}
                                                    alt={offer.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="none"><rect width="200" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em">لا توجد صورة</text></svg>';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-rose-50 flex items-center justify-center">
                                                    <Percent className="h-10 w-10 text-rose-200" />
                                                </div>
                                            )}

                                            {/* Discount Badge on Mobile (top left) / Desktop (bottom right of image) */}
                                            {offer.discount_percentage > 0 && (
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

                                            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                                                {offer.expires_at ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>ينتهي: {new Date(offer.expires_at).toLocaleDateString("ar-SA")}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-secondary-foreground font-medium">ساري دائماً</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default HomeOffers;
