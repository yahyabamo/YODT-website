import { useState, useEffect } from 'react';
import {
  ChevronLeft, Bot, GraduationCap, Stethoscope, Radio, Briefcase,
  TrendingUp, Clock, Sparkles, BookOpen, Heart, MapPin, Calendar,
  Sun, Moon, Sunrise, Sunset, ArrowUp, Gift, Zap, Play,
  QrCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/layout/BottomNav';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { useGenderContent } from '@/hooks/useGenderContent';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


/**
 * Home Page - "لوحة القيادة اليومية"
 * Daily dashboard with reason to return everyday
 */



interface Profile {
  id: string;
  total_points: number;
  full_name: string;
}





const Home = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isMale } = useGenderContent();
  const [showSearch, setShowSearch] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch profile when user is ready
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
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };
  // Prayer times (mock - will be dynamic based on city)
  // const prayerTimes = [
  //   { name: 'الفجر', time: '05:42', passed: true },
  //   { name: 'الظهر', time: '12:34', passed: true },
  //   { name: 'العصر', time: '15:28', passed: false, next: true },
  //   { name: 'المغرب', time: '17:52', passed: false },
  //   { name: 'العشاء', time: '19:12', passed: false },
  // ];

  // const nextPrayer = prayerTimes.find(p => p.next);

  // Core sections - 6 main pillars
  const coreSections = [
    {
      icon: Sparkles,
      label: 'الانشطة',
      path: '/home/activities',
      desc: 'تعلّم',
      gradient: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary',
    },
    /* { 
       icon: Stethoscope, 
       label: 'المستشفى', 
       path: '/medical-hub', 
       desc: 'صحتك',
       gradient: 'from-accent/20 to-accent/5',
       iconColor: 'text-accent',
       badge: 'جديد'
     },*/
    // {
    //   icon: BookOpen,
    //   label: 'القرآن',
    //   path: '/quran-life',
    //   desc: 'ذكر',
    //   gradient: 'from-emerald-500/20 to-emerald-500/5',
    //   iconColor: 'text-emerald-600',
    //   badge: null
    // },
    {
      icon: Play,
      label: 'المحتوى',
      path: '/home/reels',
      desc: 'ريلز',
      gradient: 'from-rose-500/20 to-rose-500/5',
      iconColor: 'text-rose-500',
    },
    {
      icon: QrCode,
      label: 'بطاقة العضوية',
      path: '/membership-card',
      desc: 'الاشتراكات',
      gradient: 'from-warning/20 to-warning/5',
      iconColor: 'text-warning',
      badge: null
    },
    {
      icon: Heart,
      label: 'الداعمون',
      path: '/partners',
      desc: 'خصومات',
      gradient: 'from-pink-500/20 to-pink-500/5',
      iconColor: 'text-pink-500',
      badge: 'خصومات حصرية'
    },
  ];

  // Quick services - More comprehensive
  const quickServices = [
    // { label: 'الأكاديمية', path: '/academy', icon: GraduationCap, color: 'text-primary' },
    { label: 'الشهادات', path: '/certificates', icon: '📜' },
    { label: 'خريطة', path: '/map', icon: MapPin, color: 'text-blue-500' },
    // { label: 'ترجمة', path: '/translate', icon: '🔤' },
    { label: 'فعاليات', path: '/events', icon: Calendar, color: 'text-orange-500' },
    { label: 'تطبيقات', path: '/turkey-apps', icon: '📱' },
    { label: 'وظائف', path: '/jobs', icon: Briefcase, color: 'text-violet-500' },
    { label: 'خصومات', path: '/discounts', icon: Gift, color: 'text-rose-500' },
    { label: 'تطوع', path: '/volunteers', icon: '🤝' },
    { label: 'الدليل', path: '/guide', icon: '📋' },
    { label: 'القرآن  ', path: '/quran-life', icon: BookOpen, color: 'text-emerald-600' },
  ];



  // Daily content
  const dailyQuote = {
    text: 'العلم نور والجهل ظلام، فاسعَ للنور دائماً',
    source: 'حكمة اليوم'
  };

  // Get current date in Arabic
  const formatHijriDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      calendar: 'islamic-umalqura'
    };
    return currentTime.toLocaleDateString('ar-SA', options);
  };

  const formatGregorianDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return currentTime.toLocaleDateString('ar-SA', options);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء النور';
    return 'مساء الخير';
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
        <p className="text-muted-foreground">لم يتم العثور على الملف الشخصي</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pb-24">
      {/* Sticky Header */}
      <header className="sticky-header">
        <div className="p-4 max-w-screen-xl mx-auto">
          <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-screen-xl mx-auto space-y-5">

        {/* Greeting & Date Section */}
        <section className="animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-small text-muted-foreground mb-1">{formatHijriDate()}</p>
              <p className="text-xs text-muted-foreground/60 mb-3">{formatGregorianDate()}</p>
              <h1 className="text-h1 text-foreground flex items-center gap-2">
                {getGreeting()}
                <span className="text-2xl">👋</span>
              </h1>
            </div>

            {/* Points Badge */}
            <button
              onClick={() => navigate('/points')}
              className="flex items-center gap-2 bg-gradient-to-r from-primary/15 to-primary/5 px-4 py-2 rounded-full hover:from-primary/20 hover:to-primary/10 transition-all group"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">{profile.total_points}</span>
              <ArrowUp className="w-3 h-3 text-primary/60 group-hover:translate-y-[-2px] transition-transform" />
            </button>
          </div>
        </section>


        {/* {AI Assistant - Premium
        <section className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <button
            onClick={() => setShowAI(true)}
            className="w-full p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-dashed border-primary/20 hover:border-primary/40 hover:from-primary/15 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 transition-all">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-right">
                <span className="flex items-center gap-2 text-h3 font-bold text-foreground">
                  المساعد الذكي
                  <Sparkles className="w-4 h-4 text-primary/60" />
                </span>
                <span className="text-small text-muted-foreground block mt-0.5">
                  {isMale ? 'كيف يمكنني مساعدتك اليوم؟' : 'كيف يمكنني مساعدتكِ اليوم؟'}
                </span>
              </div>
              <ChevronLeft className="w-5 h-5 text-primary/40 group-hover:text-primary/70 group-hover:-translate-x-1 transition-all" />
            </div>
          </button>
        </section>
        } */}

        {/* Core Sections Grid - Premium */}
        <section className="animate-slide-up" style={{ animationDelay: '0.08s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h2 font-bold text-foreground">الأقسام الرئيسية</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {coreSections.map((section, index) => (
              <button
                key={section.path}
                onClick={() => navigate(section.path)}
                className="group relative p-4 rounded-2xl bg-card border border-border/30 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center"
                style={{ animationDelay: `${0.1 + index * 0.02}s` }}
              >
                {section.badge && (
                  <span className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {section.badge}
                  </span>
                )}
                <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-300`}>
                  <section.icon className={`h-6 w-6 ${section.iconColor}`} />
                </div>
                <h3 className="text-sm font-bold text-foreground">{section.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{section.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Daily Quote Card */}
        <section className="animate-slide-up" style={{ animationDelay: '0.12s' }}>
          <Card className="border-0 bg-gradient-to-br from-secondary via-secondary/70 to-secondary/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="text-3xl">✨</div>
                <div className="flex-1">
                  <p className="text-small text-primary font-semibold mb-2">{dailyQuote.source}</p>
                  <p className="text-body text-foreground leading-relaxed font-medium">
                    "{dailyQuote.text}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Services */}
        <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-h3 font-bold text-foreground">خدمات سريعة</h2>
            <button onClick={() => navigate('/guide')} className="text-small text-primary font-medium">
              المزيد ←
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {quickServices.map((service) => (
              <button
                key={service.path}
                onClick={() => navigate(service.path)}
                className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-secondary/80 hover:bg-secondary transition-colors"
              >
                {typeof service.icon === 'string' ? (
                  <span className="text-lg">{service.icon}</span>
                ) : (
                  <service.icon className={`w-4 h-4 ${service.color || 'text-muted-foreground'}`} />
                )}
                <span className="text-small font-medium text-foreground whitespace-nowrap">{service.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Progress Card - Premium */}
        <section className="animate-slide-up" style={{ animationDelay: '0.18s' }}>
          <Card className="card-featured border-0 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3 font-bold text-primary-foreground"> نقاطك </h2>
                {/* <button
                  onClick={() => navigate('/points')}
                  className="text-sm text-primary-foreground/80 hover:text-primary-foreground flex items-center gap-1 transition-colors"
                >
                  التفاصيل
                  <ChevronLeft className="w-4 h-4" />
                </button> */}
              </div>

              {/* Progress Bar */}
              {/* <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  {/* <span className="text-small text-primary-foreground/80"> نقاطك</span>
                  <span className="text-small font-bold text-primary-foreground">{stats.weekProgress}%</span>
                </div>
                <Progress value={stats.weekProgress} className="h-2 bg-primary-foreground/20" />
              </div> */}

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* <div className="text-center bg-primary-foreground/15 rounded-xl py-2.5 px-1">
                  <p className="text-lg font-bold text-primary-foreground">{stats.points}</p>
                  <p className="text-[10px] text-primary-foreground/70">ترتيبك</p>
                </div> */}
                {/* <div className="text-center bg-primary-foreground/15 rounded-xl py-2.5 px-1">
                  <p className="text-lg font-bold text-primary-foreground">#{profile.total_points}</p>
                  <p className="text-[10px] text-primary-foreground/70">تفاعلاتك</p>
                </div> */}
                <div className="text-center bg-primary-foreground/15 rounded-xl py-2.5 px-1">
                  <p className="text-lg font-bold text-primary-foreground">{profile.total_points}</p>
                  <p className="text-[10px] text-primary-foreground/70">نقطة</p>
                </div>
                {/* <div className="text-center bg-primary-foreground/15 rounded-xl py-2.5 px-1">
                  <p className="text-lg font-bold text-primary-foreground">{stats.streak}🔥</p>
                  <p className="text-[10px] text-primary-foreground/70">أيام</p>
                </div> */}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Button */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* CTA Hidden */}
        </section>

      </main>

      <BottomNav />

      {/* AI Assistant Modal - Hidden */}

      {/* Global Search Modal */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );

};


export default Home;