import { useState, useEffect } from 'react';
import {
  ChevronLeft, Sparkles, BookOpen, Calendar,
  Briefcase, Play, Zap, Users, ArrowLeft, ArrowUpRight, GraduationCap, Shield, ShoppingBag, MapPin, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useAuth } from '@/context/AuthContext';
import {
  canAccess,
  PERMISSION_ICONS,
  PERMISSION_LABELS,
  PERMISSION_PATHS,
  ALL_PERMISSIONS,
  type Permission,
} from '@/hooks/useRoleGuard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { QuickServicesSection } from '@/components/QuickServicesSection';
import ReelsShelf from '@/pages/home/ReelsShelf';
import { AdSlot } from '@/components/ads/AdSlot';
import { SuggestionBoxes } from '@/components/SuggestionBoxes';
import { fetchActivities } from '@/service/supabaseData'; // <-- Added import
import { cn } from '@/lib/utils'; // <-- Added import for dynamic classes

/**
 * Home Page - Institutional Dashboard Redesign
 */

interface Profile {
  id: string;
  total_points: number;
  full_name: string;
  job_title?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, profile: authProfile } = useAuth();
  const { language, t } = useLanguage();
  const [showSearch, setShowSearch] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // <-- Added state for the upcoming activity
  const [upcomingActivity, setUpcomingActivity] = useState<any | null>(null);

  // Derive which admin permissions the logged-in user has
  const adminPerms: Permission[] = ALL_PERMISSIONS.filter(p =>
    canAccess(authProfile, p)
  );
  // Only show shield for staff with explicit permissions (not full-access staff / admin)
  const role = authProfile?.role ?? 'user';
  const showShield = role === 'staff' && (authProfile?.permissions ?? []).length > 0;
  const shieldPerms: Permission[] = showShield ? adminPerms : [];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
    } else {
      fetchProfile();
      loadUpcomingActivity(); // <-- Fetch upcoming activity on load
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, total_points, full_name, job_title')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // <-- Added function to fetch the next upcoming activity
  const loadUpcomingActivity = async () => {
    try {
      const { data } = await fetchActivities({ pageSize: 50 });
      const now = new Date();

      // Filter for active events that are happening today or in the future
      const futureActivities = (data || []).filter((a: any) =>
        a.status === 'active' && new Date(a.event_date) >= now
      );

      // Sort to get the closest upcoming date first
      futureActivities.sort((a: any, b: any) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );

      if (futureActivities.length > 0) {
        setUpcomingActivity(futureActivities[0]);
      }
    } catch (error) {
      console.error('Error fetching upcoming activity:', error);
    }
  };

  const coreSections = [
    {
      icon: Sparkles,
      label: language === 'ar' ? 'الأنشطة' : 'Activities',
      path: '/home/activities',
      gradient: 'from-primary/20 to-primary/5',
      iconColor: 'col-primary',
    },
    {
      icon: Play,
      label: language === 'ar' ? 'المحتوى' : 'Reels',
      path: '/home/reels',
      gradient: 'from-rose-500/20 to-rose-500/5',
      iconColor: 'text-rose-500',
    },
    {
      icon: BookOpen,
      label: language === 'ar' ? 'بوصلة' : 'Busla',
      path: '/busla',
      gradient: 'from-warning/20 to-warning/5',
      iconColor: 'text-warning',
    },
    {
      icon: GraduationCap,
      label: language === 'ar' ? 'الأكاديمية' : 'Academy',
      path: '/academy',
      gradient: 'from-pink-500/20 to-pink-500/5',
      iconColor: 'text-pink-500',
      badge: language === 'ar' ? 'دورات' : 'Courses',
    },
    {
      icon: ShoppingBag,
      label: language === 'ar' ? 'المتجر' : 'Store',
      path: '/store?ref=home',
      gradient: 'from-indigo-500/20 to-indigo-500/5',
      iconColor: 'text-indigo-500',
      badge: language === 'ar' ? 'جديد' : 'New',
    },
    {
      icon: Users,
      label: language === 'ar' ? 'المجتمع' : 'Community',
      path: '/engagement/chat',
      gradient: 'from-blue-500/20 to-blue-500/5',
      iconColor: 'text-blue-500',
    },
    {
      icon: Calendar,
      label: language === 'ar' ? 'النشاط الأسبوعي' : 'Weekly Activity',
      path: '/engagement/weekly-question',
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-500',
      badge: language === 'ar' ? 'جديد' : 'New',
    },
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('home.greeting.morning');
    if (hour < 17) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
  };

  const getFirstName = () => {
    if (!profile?.full_name) return '';
    return profile.full_name.split(' ')[0];
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{language === 'ar' ? 'لم يتم العثور على الملف الشخصي' : 'Profile not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pb-24 font-display">
      <header className="sticky z-40 top-0 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="p-4 max-w-screen-xl mx-auto">
          <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto space-y-8 mt-6">

        {/* Section 1: Hero Welcome Area */}
        <section className="px-4 animate-fade-in relative overflow-hidden">
          <AdSlot page="home_tsx" position="top" className="mb-6" />
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground/80 mb-1 tracking-wide uppercase">
                {getGreeting()}
              </p>
              <div className="flex items-center gap-3">
                <h1 className="text-h1 text-foreground font-bold tracking-tight">
                  {getFirstName()}
                </h1>
                {role === 'staff' && profile.job_title && (
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                    {profile.job_title}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">

              {/* ── Admin Shortcut Shield ── */}
              {shieldPerms.length === 1 && (
                <button
                  onClick={() => navigate(PERMISSION_PATHS[shieldPerms[0]])}
                  title={`لوحة ${PERMISSION_LABELS[shieldPerms[0]]}`}
                  className="flex items-center gap-1.5 bg-[#8B1A2A]/10 border border-[#8B1A2A]/20 text-[#8B1A2A] px-3 py-2.5 rounded-2xl hover:bg-[#8B1A2A]/20 hover:border-[#8B1A2A]/40 transition-all group shadow-soft"
                >
                  <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold hidden sm:inline">{PERMISSION_LABELS[shieldPerms[0]]}</span>
                </button>
              )}

              {shieldPerms.length > 1 && (
                <button
                  onClick={() => navigate('/admin')}
                  title="لوحة الإدارة"
                  className="flex items-center gap-1.5 bg-[#8B1A2A]/10 border border-[#8B1A2A]/20 text-[#8B1A2A] px-3 py-2.5 rounded-2xl hover:bg-[#8B1A2A]/20 hover:border-[#8B1A2A]/40 transition-all group shadow-soft"
                >
                  <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold hidden sm:inline">
                    {shieldPerms.map(p => PERMISSION_ICONS[p]).join(' ')}
                  </span>
                </button>
              )}

              {/* ── Points pill ── */}
              <button
                onClick={() => navigate('/points')}
                className="flex items-center gap-2 bg-card border border-border/50 shadow-soft px-4 py-2.5 rounded-2xl hover:shadow-card hover:border-primary/30 transition-all group"
              >
                <div className="bg-primary/10 p-1.5 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col items-start -space-y-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('home.points')}</span>
                  <span className="text-base font-bold text-foreground">{profile.total_points}</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Main Features Grid */}
        <section className="px-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-h3 font-bold text-foreground tracking-tight">{t('home.sections.title')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {coreSections.map((section, index) => (
              <button
                key={section.path}
                onClick={() => navigate(section.path)}
                className="group relative p-5 rounded-3xl bg-card border border-border/40 shadow-xs hover:shadow-card hover:-translate-y-1 transition-all duration-300 text-right overflow-hidden flex flex-col items-start"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                {/* Decorative blob */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${section.gradient} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>

                {section.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider">
                    {section.badge}
                  </span>
                )}

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10`}>
                  <section.icon className={`h-7 w-7 ${section.iconColor === 'col-primary' ? 'text-primary' : section.iconColor}`} />
                </div>

                <h3 className="text-base font-bold text-foreground relative z-10 group-hover:text-primary transition-colors">{section.label}</h3>
                <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground font-medium relative z-10 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  {language === 'ar' ? 'استكشف' : 'Explore'}
                  {language === 'ar' ? <ChevronLeft className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3 rotate-180" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── NEW: Upcoming Activity Banner ── */}
        {upcomingActivity && (
          <section className="px-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3 font-bold text-foreground tracking-tight">
                {language === 'ar' ? 'النشاط القادم' : 'Upcoming Activity'}
              </h2>
              <button onClick={() => navigate('/home/activities')} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                {language === 'ar' ? 'عرض الكل' : 'View All'}
              </button>
            </div>

            <div className="group relative bg-card rounded-3xl border border-border/40 shadow-xs hover:shadow-card transition-all overflow-hidden flex flex-col sm:flex-row">

              {/* Image Left Side (or Top on Mobile) */}
              <div className="relative w-full sm:w-2/5 h-48 sm:h-auto bg-muted overflow-hidden flex-shrink-0">
                {upcomingActivity.image_url ? (
                  <img
                    src={upcomingActivity.image_url}
                    alt={upcomingActivity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="none"><rect width="400" height="300" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="%239ca3af" text-anchor="middle" dy=".3em">No Image</text></svg>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full gradient-primary/10 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-primary/30" />
                  </div>
                )}

                {/* Points Reward Floating Badge */}
                {upcomingActivity.points_reward > 0 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-yellow-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    +{upcomingActivity.points_reward} {language === 'ar' ? 'نقطة' : 'pts'}
                  </div>
                )}
              </div>

              {/* Content Right Side (or Bottom on Mobile) */}
              <div className="p-5 flex flex-col justify-between w-full sm:w-3/5">
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1">{upcomingActivity.title}</h3>
                  {upcomingActivity.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {upcomingActivity.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground font-medium mb-4">
                    {upcomingActivity.event_date && (
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{new Date(upcomingActivity.event_date).toLocaleDateString(language === 'ar' ? "ar-SA" : "en-US", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                    {upcomingActivity.location && (
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="line-clamp-1">{upcomingActivity.location}</span>
                      </div>
                    )}
                    {upcomingActivity.max_attendees > 0 && (
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1.5 rounded-lg">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>{upcomingActivity.max_attendees} {language === 'ar' ? 'مقعد' : 'Seats'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/home/activities')}
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                >
                  {language === 'ar' ? 'التفاصيل والحجز' : 'Details & Register'}
                  <ArrowLeft className={cn("w-4 h-4", language === 'en' && "rotate-180")} />
                </button>
              </div>
            </div>
          </section>
        )}
        {/* ── END Upcoming Activity Banner ── */}

        <QuickServicesSection />

        <ReelsShelf />

        <div className="px-4">
          <AdSlot page="home_tsx" position="bottom" className="mt-8" />
        </div>
      </main>

      <SuggestionBoxes page="home" className="mb-6" />
      <BottomNav />
    </div>
  );
};

export default Home;