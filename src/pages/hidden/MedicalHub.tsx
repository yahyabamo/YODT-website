import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, Users, Calendar, Play, Sparkles,
  Search, TrendingUp, Award, ChevronLeft, MessageCircle,
  Video, Phone, ArrowUp, Filter, Star, MapPin, Activity,
  Heart, Building2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import HospitalTabs from '@/components/hospital/HospitalTabs';
import DoctorCard from '@/components/hospital/DoctorCard';
import PostCard from '@/components/hospital/PostCard';
import { MedicalReelsContainer } from '@/components/hospital/MedicalReels';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  sub_specialty: string | null;
  profile_image_url: string | null;
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  consultation_count: number;
  experience_years: number | null;
  consultation_types: string[];
  city: { name_ar: string } | null;
  country: { name_ar: string } | null;
}

interface Post {
  id: string;
  content: string;
  post_type: string;
  image_url: string | null;
  video_url: string | null;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  created_at: string;
  doctor: {
    id: string;
    full_name: string;
    specialty: string;
    profile_image_url: string | null;
    is_verified: boolean;
  } | null;
}

// Quick specialties data
const specialties = [
  { id: 'general', name: 'طب عام', icon: '🩺', count: 15 },
  { id: 'pediatric', name: 'أطفال', icon: '👶', count: 12 },
  { id: 'dental', name: 'أسنان', icon: '🦷', count: 18 },
  { id: 'cardiology', name: 'قلب', icon: '❤️', count: 8 },
  { id: 'dermatology', name: 'جلدية', icon: '🧴', count: 10 },
  { id: 'psychology', name: 'نفسي', icon: '🧠', count: 6 },
  { id: 'orthopedics', name: 'عظام', icon: '🦴', count: 9 },
  { id: 'eyes', name: 'عيون', icon: '👁️', count: 7 }
];

const MedicalHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
    if (user) {
      fetchUserInteractions();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [doctorsRes, postsRes] = await Promise.all([
        supabase
          .from('doctors')
          .select(`*, city:cities(name_ar), country:countries(name_ar)`)
          .eq('is_verified', true)
          .order('rating', { ascending: false })
          .limit(10),
        supabase
          .from('medical_posts')
          .select(`*, doctor:doctors(id, full_name, specialty, profile_image_url, is_verified)`)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      const mappedDoctors = (doctorsRes.data || []).map(d => ({
        ...d,
        is_available: d.is_available ?? true,
        rating: d.rating ?? 0,
        consultation_count: d.consultation_count ?? 0,
        consultation_types: d.consultation_types || ['text']
      }));

      setDoctors(mappedDoctors.length > 0 ? mappedDoctors : getDemoDoctors());
      setPosts(postsRes.data?.length ? postsRes.data : getDemoPosts());
    } catch (error) {
      console.error('Error fetching data:', error);
      setDoctors(getDemoDoctors());
      setPosts(getDemoPosts());
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInteractions = async () => {
    if (!user) return;
    try {
      const [likesRes, savesRes] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('user_id', user.id),
        supabase.from('post_saves').select('post_id').eq('user_id', user.id)
      ]);
      if (likesRes.data) setLikedPosts(new Set(likesRes.data.map(l => l.post_id)));
      if (savesRes.data) setSavedPosts(new Set(savesRes.data.map(s => s.post_id)));
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const getDemoDoctors = (): Doctor[] => [
    {
      id: '1', full_name: 'أحمد الشرعبي', specialty: 'طب عام', sub_specialty: null,
      profile_image_url: null, is_verified: true, is_available: true, rating: 4.8,
      consultation_count: 234, experience_years: 15, consultation_types: ['text', 'voice', 'video'],
      city: { name_ar: 'إسطنبول' }, country: { name_ar: 'تركيا' }
    },
    {
      id: '2', full_name: 'سارة المقطري', specialty: 'أطفال', sub_specialty: 'حديثي الولادة',
      profile_image_url: null, is_verified: true, is_available: true, rating: 4.9,
      consultation_count: 189, experience_years: 10, consultation_types: ['text', 'video'],
      city: { name_ar: 'إسطنبول' }, country: { name_ar: 'تركيا' }
    },
    {
      id: '3', full_name: 'محمد الحيمي', specialty: 'قلب', sub_specialty: 'قسطرة القلب',
      profile_image_url: null, is_verified: true, is_available: false, rating: 4.7,
      consultation_count: 312, experience_years: 20, consultation_types: ['text'],
      city: { name_ar: 'أنقرة' }, country: { name_ar: 'تركيا' }
    },
    {
      id: '4', full_name: 'ليلى العنسي', specialty: 'أسنان', sub_specialty: 'تقويم',
      profile_image_url: null, is_verified: true, is_available: true, rating: 4.9,
      consultation_count: 156, experience_years: 8, consultation_types: ['text', 'video'],
      city: { name_ar: 'إسطنبول' }, country: { name_ar: 'تركيا' }
    }
  ];

  const getDemoPosts = (): Post[] => [
    {
      id: '1', content: 'نصيحة طبية: شرب الماء بكميات كافية يساعد على تحسين وظائف الجسم والحفاظ على صحة الكلى. ينصح بشرب 8 أكواب يومياً على الأقل.',
      post_type: 'tip', image_url: null, video_url: null, likes_count: 45, comments_count: 12, saves_count: 23,
      created_at: new Date().toISOString(),
      doctor: { id: '1', full_name: 'أحمد الشرعبي', specialty: 'طب عام', profile_image_url: null, is_verified: true }
    },
    {
      id: '2', content: 'ما هي أفضل الطرق للوقاية من نزلات البرد في فصل الشتاء؟ شاركونا تجاربكم وأسئلتكم.',
      post_type: 'discussion', image_url: null, video_url: null, likes_count: 32, comments_count: 28, saves_count: 8,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      doctor: { id: '2', full_name: 'سارة المقطري', specialty: 'أطفال', profile_image_url: null, is_verified: true }
    },
    {
      id: '3', content: 'توعية: السكري من النوع الثاني يمكن الوقاية منه بنسبة كبيرة من خلال نمط حياة صحي. النظام الغذائي المتوازن والرياضة المنتظمة هما أساس الوقاية.',
      post_type: 'awareness', image_url: null, video_url: null, likes_count: 89, comments_count: 15, saves_count: 56,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      doctor: { id: '3', full_name: 'محمد الحيمي', specialty: 'باطنة', profile_image_url: null, is_verified: true }
    }
  ];

  const handleLike = async (postId: string) => {
    if (!user) { toast.error('يجب تسجيل الدخول أولاً'); return; }
    const isLiked = likedPosts.has(postId);
    try {
      if (isLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
        setLikedPosts(prev => { const next = new Set(prev); next.delete(postId); return next; });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p));
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
        setLikedPosts(prev => new Set(prev).add(postId));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
      }
    } catch (error) { console.error('Error toggling like:', error); }
  };

  const handleSave = async (postId: string) => {
    if (!user) { toast.error('يجب تسجيل الدخول أولاً'); return; }
    const isSaved = savedPosts.has(postId);
    try {
      if (isSaved) {
        await supabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', user.id);
        setSavedPosts(prev => { const next = new Set(prev); next.delete(postId); return next; });
        toast.success('تم إزالة الحفظ');
      } else {
        await supabase.from('post_saves').insert({ post_id: postId, user_id: user.id });
        setSavedPosts(prev => new Set(prev).add(postId));
        toast.success('تم الحفظ');
      }
    } catch (error) { console.error('Error toggling save:', error); }
  };

  // Get available doctors
  const availableDoctors = doctors.filter(d => d.is_available);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="المستشفى الطلابي" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-5">
        {/* Premium Hero Banner */}
        <Card className="overflow-hidden border-0 shadow-elevated animate-fade-in">
          <div className="bg-gradient-to-br from-primary via-primary/95 to-accent/80 p-6 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Stethoscope className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">المستشفى الطلابي</h2>
                  <p className="text-sm opacity-90">Student Hospital</p>
                </div>
              </div>

              <p className="text-sm opacity-90 leading-relaxed mb-4">
                منصة طبية متكاملة تجمع الأطباء اليمنيين مع الطلاب لتقديم استشارات طبية موثوقة
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/20">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {availableDoctors.slice(0, 3).map((doc, i) => (
                    <Avatar key={doc.id} className="w-8 h-8 border-2 border-primary">
                      <AvatarFallback className="bg-white/20 text-white text-xs">
                        {doc.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-sm">{availableDoctors.length} طبيب متاح الآن</span>
                <Sparkles className="h-4 w-4 mr-auto" />
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <button
            onClick={() => navigate('/doctors-directory')}
            className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-2xl text-center hover:from-primary/15 transition-all group"
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/15 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">الأطباء</p>
            <p className="text-xs text-muted-foreground">{doctors.length}+ طبيب</p>
          </button>

          <button
            onClick={() => setActiveTab('reels')}
            className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 p-4 rounded-2xl text-center hover:from-rose-500/15 transition-all group"
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-rose-500/15 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Play className="h-6 w-6 text-rose-500" />
            </div>
            <p className="text-sm font-bold text-foreground">ريلز</p>
            <p className="text-xs text-muted-foreground">محتوى طبي</p>
          </button>

          <button
            onClick={() => navigate('/medical-congress')}
            className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 p-4 rounded-2xl text-center hover:from-violet-500/15 transition-all group"
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-violet-500/15 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calendar className="h-6 w-6 text-violet-500" />
            </div>
            <p className="text-sm font-bold text-foreground">المؤتمرات</p>
            <p className="text-xs text-muted-foreground">فعاليات</p>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2 animate-slide-up" style={{ animationDelay: '0.08s' }}>
          <div className="stat-card">
            <div className="stat-card-value text-primary">{doctors.length}+</div>
            <div className="stat-card-label">طبيب</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value text-emerald-600">{availableDoctors.length}</div>
            <div className="stat-card-label">متاح</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value text-violet-600">500+</div>
            <div className="stat-card-label">استشارة</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value text-amber-600">{posts.length}+</div>
            <div className="stat-card-label">منشور</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <HospitalTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Search */}
        <div className="relative animate-slide-up" style={{ animationDelay: '0.12s' }}>
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={activeTab === 'doctors' ? 'ابحث عن طبيب أو تخصص...' : 'ابحث في المنشورات...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-13 bg-secondary/80 border-0 rounded-xl text-base"
          />
        </div>

        {/* Content based on active tab */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            {/* Trending Banner */}
            <Card className="border-0 bg-gradient-to-l from-blue-500/10 to-cyan-500/10 shadow-xs">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">المحتوى الأكثر تفاعلاً</h3>
                  <p className="text-xs text-muted-foreground">نصائح وتوعية طبية من أطبائنا</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Posts Feed */}
            {posts.filter(p => p.content.includes(searchQuery) || p.doctor?.full_name.includes(searchQuery)).map(post => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPosts.has(post.id)}
                isSaved={savedPosts.has(post.id)}
                onLike={() => handleLike(post.id)}
                onSave={() => handleSave(post.id)}
              />
            ))}
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="space-y-5">
            {/* Specialty filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {['الكل', 'طب عام', 'أسنان', 'أطفال', 'قلب', 'نفسي', 'باطنة'].map((spec, idx) => (
                <Button
                  key={idx}
                  variant={idx === 0 ? 'default' : 'outline'}
                  size="sm"
                  className="shrink-0 rounded-full"
                >
                  {spec}
                </Button>
              ))}
            </div>

            {/* Available Now Section */}
            {availableDoctors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    متاحون الآن
                  </h3>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {availableDoctors.slice(0, 5).map(doctor => (
                    <button
                      key={doctor.id}
                      onClick={() => navigate(`/doctor/${doctor.id}`)}
                      className="flex-shrink-0 w-28 p-3 rounded-2xl bg-card border border-border/30 shadow-xs text-center hover:shadow-md transition-all"
                    >
                      <Avatar className="w-14 h-14 mx-auto mb-2 ring-2 ring-emerald-500/30">
                        <AvatarImage src={doctor.profile_image_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {doctor.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-bold text-foreground truncate">{doctor.full_name.split(' ')[0]}</p>
                      <p className="text-xs text-muted-foreground truncate">{doctor.specialty}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-medium">{doctor.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Featured doctors */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  أطباء مميزون
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/doctors-directory')} className="text-primary">
                  عرض الكل ←
                </Button>
              </div>
              <div className="space-y-3">
                {doctors.filter(d => d.full_name.includes(searchQuery) || d.specialty.includes(searchQuery)).slice(0, 4).map(doctor => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl" variant="outline" onClick={() => navigate('/doctors-directory')}>
              <Users className="w-5 h-5 ml-2" />
              عرض جميع الأطباء ({doctors.length})
            </Button>
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="space-y-4">
            {/* Category filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {[
                { label: 'الكل', emoji: '✨' },
                { label: 'توعية', emoji: '💡' },
                { label: 'أسنان', emoji: '🦷' },
                { label: 'تغذية', emoji: '🥗' },
                { label: 'نفسي', emoji: '🧠' },
                { label: 'أطفال', emoji: '👶' }
              ].map((cat, idx) => (
                <Button
                  key={idx}
                  variant={idx === 0 ? 'default' : 'outline'}
                  size="sm"
                  className="shrink-0 gap-1.5 rounded-full"
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Reels */}
            <MedicalReelsContainer
              posts={posts}
              likedPosts={likedPosts}
              savedPosts={savedPosts}
              onLike={handleLike}
              onSave={handleSave}
            />
          </div>
        )}

        {activeTab === 'congress' && (
          <div className="space-y-4">
            <Card className="border-0 bg-gradient-to-l from-violet-500/10 to-purple-500/10 shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">المؤتمرات والندوات الطبية</h3>
                    <p className="text-sm text-muted-foreground">سجل وشارك في الفعاليات القادمة</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => navigate('/medical-congress')}>
                  استعرض المؤتمرات
                  <ChevronLeft className="w-4 h-4 mr-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick congress preview */}
            <div className="text-center py-12 bg-secondary/30 rounded-2xl">
              <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-violet-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">المؤتمرات القادمة</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                اكتشف المؤتمرات والندوات وورش العمل الطبية واحصل على شهادات حضور
              </p>
              <Button onClick={() => navigate('/medical-congress')}>
                عرض الجدول الكامل
              </Button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-5 border border-amber-200/50 dark:border-amber-800/30">
          <p className="text-sm text-amber-700 dark:text-amber-400 text-center leading-relaxed">
            ⚠️ جميع المعلومات والاستشارات المقدمة للإرشاد فقط وليست بديلاً عن الفحص الطبي المباشر
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default MedicalHub;