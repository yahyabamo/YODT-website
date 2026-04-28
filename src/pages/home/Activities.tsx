import { useState, useEffect } from 'react';
import { Sparkles, Calendar, MapPin, Users, Star, ArrowLeft, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { fetchActivities, fetchUserRegistrations, registerForActivity } from '@/service/supabaseData';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';


interface TrackPageState {
    track: any;
    userId: string | null;
    loading: boolean;
    currentPage: number;
    totalPages: number;
    bookmarkedPages: Set<number>;
    noteInput: string;
    savingNote: boolean;
    showAllNotes: boolean;
    showSearch: boolean;
    searchQuery: string;

    chatInput: string;
    sendingMsg: boolean;
}

const HomeActivities = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [registeredActivities, setRegisteredActivities] = useState<Set<string>>(new Set());
    const [openImage, setOpenImage] = useState<string | null>(null);
    const [registeringId, setRegisteringId] = useState<string | null>(null);
    const [state, setState] = useState<TrackPageState>({
        track: null,
        userId: null,
        loading: true,
        currentPage: 1,
        totalPages: 0,
        bookmarkedPages: new Set(),
        noteInput: '',
        savingNote: false,
        showAllNotes: false,
        showSearch: false,
        searchQuery: '',
        chatInput: '',
        sendingMsg: false,
    });
    const updateState = useCallback((updates: Partial<TrackPageState>) => {
        setState((prev) => ({ ...prev, ...updates }));

    }, []);



    useEffect(() => {
        loadActivities();
    }, [user]);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const { data } = await fetchActivities({ pageSize: 50 });
            // Only keep active and inactive (hide draft/etc if any)
            const validData = (data || []).filter((a: any) => a.status === 'active' || a.status === 'inactive');
            // Sort active to top, inactive to bottom
            validData.sort((a: any, b: any) => {
                if (a.status === 'active' && b.status !== 'active') return -1;
                if (a.status !== 'active' && b.status === 'active') return 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            setActivities(validData);

            if (user) {
                const regIds = await fetchUserRegistrations(user.id);
                setRegisteredActivities(new Set(regIds));
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            toast.error('حدث خطأ في تحميل الأنشطة');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (activityId: string) => {
        if (!user) {
            toast.error('يرجى تسجيل الدخول للحجز');
            return;
        }

        setRegisteringId(activityId);
        try {
            await registerForActivity(activityId, user.id);
            setRegisteredActivities(prev => new Set(prev).add(activityId));
            toast.success('تم الحجز بنجاح ✅');
        } catch (error: any) {
            if (error?.code === '23505' || error?.message?.includes('duplicate key')) { // Unique violation
                setRegisteredActivities(prev => new Set(prev).add(activityId));
                toast.success('لقد قمت بالحجز مسبقاً ✅');
            } else {
                console.error('Registration error:', error);
                toast.error('حدث خطأ أثناء الحجز');
            }
        } finally {
            setRegisteringId(null);
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
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => updateState({ showSearch: true })} />

                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/home')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowRight className="h-5 w-5 text-slate-700" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-900 flex-1 text-center px-4 line-clamp-1">
                            {'الأنشطة'}
                        </h1>

                    </div>
                </div>
            </header>
            <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
                <AdSlot page="activities" position="top" />
                {/* Hero Section */}
                <Card className="shadow-card overflow-hidden">
                    <div className="gradient-primary p-6 text-white">
                        <h2 className="text-xl font-bold mb-2">أنشطة وتجارب فريدة</h2>
                        <p className="text-sm opacity-90">
                            اكتشف أحدث الفعاليات والأنشطة القادمة وانضم إلينا
                        </p>
                    </div>
                </Card>

                {/* Activities List */}
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <Card className="shadow-soft">
                            <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
                                <Sparkles className="h-12 w-12 mb-3 opacity-50" />
                                <p>لا توجد أنشطة نشطة حالياً</p>
                            </CardContent>
                        </Card>
                    ) : (
                        activities.map((activity) => {
                            const isInactive = activity.status === 'inactive';
                            return (
                                <Card key={activity.id} className={cn("shadow-soft overflow-hidden group", isInactive && "opacity-60 grayscale-[0.8] blur-[0.3px] hover:grayscale-0 hover:blur-0 transition-all")}>
                                    <CardContent className="p-0">
                                        {/* Image Header with Fallback */}
                                        <div className="relative w-full h-48 bg-muted overflow-hidden">
                                            {activity.image_url ? (
                                                <img
                                                    src={activity.image_url}
                                                    alt={activity.title}
                                                    className={cn("w-full h-full object-cover transition-transform duration-500", !isInactive && "group-hover:scale-105 cursor-pointer", isInactive && "grayscale")}
                                                    onClick={() => !isInactive && setOpenImage(activity.image_url)}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none"><rect width="400" height="300" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="%239ca3af" text-anchor="middle" dy=".3em">لا توجد صورة</text></svg>';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full gradient-primary/10 flex items-center justify-center">
                                                    <Sparkles className="h-12 w-12 text-primary/30" />
                                                </div>
                                            )}

                                            {/* Inactive Badge */}
                                            {isInactive && (
                                                <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-900/10 text-red-800 border border-red-900/20 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                                    مؤرشف
                                                </div>
                                            )}
                                            {/* Points Badge */}
                                            {activity.points_reward > 0 && !isInactive && (
                                                <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-yellow-600 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                                                    <Star className="h-3.5 w-3.5 fill-current" />
                                                    +{activity.points_reward} نقطة
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 space-y-3">
                                            <h3 className="font-bold text-lg text-foreground">{activity.title}</h3>

                                            {activity.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {activity.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground font-medium">
                                                {activity.event_date && (
                                                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                                                        <Calendar className="h-3.5 w-3.5 text-primary" />
                                                        <span>{new Date(activity.event_date).toLocaleDateString("ar-SA")}</span>
                                                    </div>
                                                )}
                                                {activity.location && (
                                                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                                        <span>{activity.location}</span>
                                                    </div>
                                                )}
                                                {activity.max_attendees > 0 && (
                                                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                                                        <Users className="h-3.5 w-3.5 text-primary" />
                                                        <span>{activity.max_attendees} مقعد</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-3">
                                                {isInactive ? (
                                                    <Button disabled={true} className="w-full bg-[#f3f4f6] text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#6b7280] border-none opacity-100 font-bold cursor-not-allowed">
                                                        انتهى وقت التسجيل
                                                    </Button>
                                                ) : registeredActivities.has(activity.id) ? (
                                                    <Button disabled className="w-full bg-green-600/10 text-green-600 hover:bg-green-600/10 hover:text-green-600 border-none opacity-100 font-bold">
                                                        تم الحجز ✅
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleRegister(activity.id)}
                                                        disabled={registeringId === activity.id}
                                                        className="w-full gradient-primary text-white font-bold shadow-sm transition-all active:scale-[0.98]"
                                                    >
                                                        {registeringId === activity.id ? 'جاري الحجز...' : 'احجز مقعدك الآن'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
            <div className="px-4 pb-4 max-w-lg mx-auto">
                <AdSlot page="offers" position="bottom" />
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

export default HomeActivities;
