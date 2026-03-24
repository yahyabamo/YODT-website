import { useState, useEffect } from 'react';
import {
  ChevronLeft, Sparkles, BookOpen, Heart, MapPin, Calendar,
  Briefcase, Gift, Play, QrCode, Zap, Users, ArrowLeft, ArrowUpRight, GraduationCap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BottomNav } from '@/components/layout/BottomNav';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
// import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { QuickServicesSection } from '@/components/QuickServicesSection';
import ReelsShelf from '@/pages/home/ReelsShelf';



/**
 * Home Page - Institutional Dashboard Redesign
 */

interface Profile {
  id: string;
  total_points: number;
  full_name: string;
}

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [showSearch, setShowSearch] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, total_points, full_name')
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
      icon: Users, // Using Lucide Users icon
      label: language === 'ar' ? 'المجتمع' : 'Community',
      path: '/engagement/chat', // Path to your chat page
      gradient: 'from-blue-500/20 to-blue-500/5',
      iconColor: 'text-blue-500',
    },
    {
      icon: Calendar, // Using Lucide Calendar icon
      label: language === 'ar' ? 'النشاط الأسبوعي' : 'Weekly Activity',
      path: '/engagement/weekly-question', // Path to your weekly question page
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-500',
      badge: language === 'ar' ? 'جديد' : 'New',
    },
  ];

  const quickServices = [
    { label: language === 'ar' ? 'تطبيقات تركيا' : 'Turkey Apps', path: '/turkey-apps', icon: Briefcase, color: 'text-violet-500' },
    { label: language === 'ar' ? 'طاقم الاتحاد' : 'Corps', path: '/corps', icon: Users, color: 'text-rose-500' },
    { label: language === 'ar' ? 'الدليل' : 'Guide', path: '/guide', icon: '📋' },
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
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground/80 mb-1 tracking-wide uppercase">
                {getGreeting()}
              </p>
              <h1 className="text-h1 text-foreground font-bold tracking-tight">
                {getFirstName()}
              </h1>
            </div>

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

        {/* Section 5: Points Card */}
        {/* <section className="px-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="relative overflow-hidden rounded-3xl bg-foreground shadow-elevated group cursor-pointer" onClick={() => navigate('/points')}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative p-6 lg:p-8 flex items-center justify-between">
              <div>
                <p className="text-background/70 font-medium text-sm mb-1">{t('home.points.card.title')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-background">{profile.total_points}</span>
                  <span className="text-primary font-medium tracking-wide">{t('home.points')}</span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-full bg-background/10 backdrop-blur-sm flex items-center justify-center border border-background/20 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                {language === 'ar' ? (
                  <ArrowLeft className="w-5 h-5 text-background" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-background" />
                )}
              </div>
            </div>
          </div>
        </section> */}

        <QuickServicesSection />


        {/* Section 4: Quick Services
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="px-4 mb-4">
            <h2 className="text-h3 font-bold text-foreground tracking-tight">{t('home.services.title')}</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-5 snap-x">
            {quickServices.map((service, index) => (
              <button
                key={service.path}
                onClick={() => navigate(service.path)}
                className="snap-start flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-full bg-card border border-border/60 hover:border-primary/30 hover:bg-secondary/50 hover:shadow-sm transition-all group"
              >
                {typeof service.icon === 'string' ? (
                  <span className="text-xl group-hover:scale-110 transition-transform">{service.icon}</span>
                ) : (
                  <div className={`p-1.5 rounded-full bg-secondary group-hover:bg-background transition-colors`}>
                    <service.icon className={`w-4 h-4 ${service.color || 'text-muted-foreground'}`} />
                  </div>
                )}
                <span className="text-sm font-semibold text-foreground whitespace-nowrap">{service.label}</span>
              </button>
            ))}
            <div className="w-4 flex-shrink-0"></div>
          </div>
        </section> */}



        <ReelsShelf />



      </main>

      <BottomNav />
      {/* <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} /> */}
    </div>
  );
};

export default Home;